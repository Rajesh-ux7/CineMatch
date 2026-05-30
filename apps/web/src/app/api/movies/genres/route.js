export async function GET() {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.TMDB_API_KEY}`,
    );
    if (!response.ok) {
      return Response.json(
        { error: "Failed to fetch genres" },
        { status: response.status },
      );
    }
    const data = await response.json();
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
