import sql from "@/app/api/utils/sql";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";
  const page = searchParams.get("page") || 1;
  const genre = searchParams.get("genre") || "";
  const year = searchParams.get("year") || "";
  const sortBy = searchParams.get("sortBy") || "popularity.desc";
  const sessionId = searchParams.get("sessionId") || "";

  let url = "";

  if (query) {
    url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`;
    if (year) url += `&year=${year}`;

    if (sessionId && query.trim()) {
      try {
        await sql`INSERT INTO search_history (session_id, query) VALUES (${sessionId}, ${query.trim()})`;
      } catch (e) {
        /* ignore */
      }
    }
  } else {
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&page=${page}&sort_by=${sortBy}&include_adult=false`;
    if (genre) url += `&with_genres=${genre}`;
    if (year) url += `&year=${year}`;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return Response.json(
        { error: "Search failed" },
        { status: response.status },
      );
    }
    const data = await response.json();

    if (sessionId && query.trim() && data.total_results !== undefined) {
      try {
        await sql`
          UPDATE search_history SET results_count = ${data.total_results}
          WHERE id = (SELECT MAX(id) FROM search_history WHERE session_id = ${sessionId} AND query = ${query.trim()})
        `;
      } catch (e) {
        /* ignore */
      }
    }

    return Response.json(data);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
