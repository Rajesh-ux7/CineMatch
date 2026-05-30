export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || 1;
  const timeWindow = searchParams.get("timeWindow") || "week";

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/trending/movie/${timeWindow}?api_key=${process.env.TMDB_API_KEY}&page=${page}`,
    );
    if (!response.ok) {
      return Response.json(
        { error: "Failed to fetch trending movies" },
        { status: response.status },
      );
    }
    const data = await response.json();
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
