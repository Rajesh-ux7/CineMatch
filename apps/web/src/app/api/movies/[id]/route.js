import sql from "@/app/api/utils/sql";

export async function GET(request, { params: { id } }) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId") || "";

  try {
    const [movieRes, creditsRes, videosRes] = await Promise.all([
      fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}&append_to_response=keywords`,
      ),
      fetch(
        `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${process.env.TMDB_API_KEY}`,
      ),
      fetch(
        `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${process.env.TMDB_API_KEY}`,
      ),
    ]);

    if (!movieRes.ok) {
      return Response.json({ error: "Movie not found" }, { status: 404 });
    }

    const [movie, credits, videos] = await Promise.all([
      movieRes.json(),
      creditsRes.json(),
      videosRes.json(),
    ]);

    if (sessionId && movie.id) {
      const genres = movie.genres?.map((g) => g.name).join(", ") || "";
      try {
        await sql`
          INSERT INTO recently_viewed (session_id, movie_id, movie_title, movie_poster, movie_year, movie_rating, genres)
          VALUES (${sessionId}, ${movie.id}, ${movie.title}, ${movie.poster_path || null}, ${movie.release_date?.substring(0, 4) || ""}, ${movie.vote_average || null}, ${genres})
          ON CONFLICT (session_id, movie_id) DO UPDATE SET viewed_at = NOW()
        `;
        for (const genre of movie.genres || []) {
          await sql`
            INSERT INTO genre_stats (session_id, genre_name, view_count)
            VALUES (${sessionId}, ${genre.name}, 1)
            ON CONFLICT (session_id, genre_name) DO UPDATE SET view_count = genre_stats.view_count + 1, last_viewed = NOW()
          `;
        }
      } catch (e) {
        /* ignore tracking errors */
      }
    }

    return Response.json({ movie, credits, videos });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
