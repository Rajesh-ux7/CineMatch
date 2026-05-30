export async function GET(request, { params: { id } }) {
  try {
    const [recRes, simRes, movieRes] = await Promise.all([
      fetch(
        `https://api.themoviedb.org/3/movie/${id}/recommendations?api_key=${process.env.TMDB_API_KEY}&page=1`,
      ),
      fetch(
        `https://api.themoviedb.org/3/movie/${id}/similar?api_key=${process.env.TMDB_API_KEY}&page=1`,
      ),
      fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}&append_to_response=keywords`,
      ),
    ]);

    const [recs, similar, sourceMovie] = await Promise.all([
      recRes.json(),
      simRes.json(),
      movieRes.json(),
    ]);

    const sourceGenreIds = sourceMovie.genres?.map((g) => g.id) || [];
    const allMovies = [...(recs.results || []), ...(similar.results || [])];
    const seen = new Set();
    const unique = [];

    for (const m of allMovies) {
      if (!seen.has(m.id) && m.id !== parseInt(id) && m.poster_path) {
        seen.add(m.id);
        const genreOverlap = (m.genre_ids || []).filter((g) =>
          sourceGenreIds.includes(g),
        ).length;
        const genreScore =
          sourceGenreIds.length > 0 ? genreOverlap / sourceGenreIds.length : 0;
        const popularityScore = Math.min((m.popularity || 0) / 500, 1);
        const ratingScore = (m.vote_average || 0) / 10;
        const similarityScore = Math.round(
          (genreScore * 0.5 + popularityScore * 0.25 + ratingScore * 0.25) *
            100,
        );
        unique.push({
          ...m,
          similarity_score: similarityScore,
          genre_overlap: genreOverlap,
        });
      }
    }

    unique.sort((a, b) => b.similarity_score - a.similarity_score);

    return Response.json({
      results: unique.slice(0, 20),
      source_movie: {
        id: sourceMovie.id,
        title: sourceMovie.title,
        genres: sourceMovie.genres,
      },
      total_results: unique.length,
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
