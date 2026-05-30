import sql from "@/app/api/utils/sql";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  const movieId = searchParams.get("movieId");
  if (!sessionId)
    return Response.json({ error: "Session ID required" }, { status: 400 });

  try {
    if (movieId) {
      const rows =
        await sql`SELECT * FROM movie_ratings WHERE session_id = ${sessionId} AND movie_id = ${parseInt(movieId)}`;
      return Response.json({ rating: rows[0] || null });
    }
    const rows =
      await sql`SELECT * FROM movie_ratings WHERE session_id = ${sessionId} ORDER BY rated_at DESC`;
    return Response.json({ ratings: rows });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { sessionId, movieId, movieTitle, rating } = await request.json();
    if (!sessionId || !movieId || !rating)
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );

    await sql`
      INSERT INTO movie_ratings (session_id, movie_id, movie_title, rating)
      VALUES (${sessionId}, ${movieId}, ${movieTitle}, ${rating})
      ON CONFLICT (session_id, movie_id) DO UPDATE SET rating = ${rating}, rated_at = NOW()
    `;
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
