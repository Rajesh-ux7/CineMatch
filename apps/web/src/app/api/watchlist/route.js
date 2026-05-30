import sql from "@/app/api/utils/sql";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  if (!sessionId)
    return Response.json({ error: "Session ID required" }, { status: 400 });

  try {
    const items =
      await sql`SELECT * FROM watchlist WHERE session_id = ${sessionId} ORDER BY added_at DESC`;
    return Response.json({ items });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const {
      sessionId,
      movieId,
      movieTitle,
      moviePoster,
      movieYear,
      movieRating,
    } = await request.json();
    if (!sessionId || !movieId)
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );

    await sql`
      INSERT INTO watchlist (session_id, movie_id, movie_title, movie_poster, movie_year, movie_rating)
      VALUES (${sessionId}, ${movieId}, ${movieTitle}, ${moviePoster || null}, ${movieYear || null}, ${movieRating || null})
      ON CONFLICT (session_id, movie_id) DO NOTHING
    `;
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  const movieId = searchParams.get("movieId");
  if (!sessionId || !movieId)
    return Response.json({ error: "Missing required fields" }, { status: 400 });

  try {
    await sql`DELETE FROM watchlist WHERE session_id = ${sessionId} AND movie_id = ${parseInt(movieId)}`;
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
