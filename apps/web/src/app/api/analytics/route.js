import sql from "@/app/api/utils/sql";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  if (!sessionId)
    return Response.json({ error: "Session ID required" }, { status: 400 });

  try {
    const [
      genreStats,
      searchStats,
      ratingStats,
      watchlistCount,
      favoritesCount,
      recentlyViewed,
      totalSearches,
    ] = await Promise.all([
      sql`SELECT genre_name, view_count FROM genre_stats WHERE session_id = ${sessionId} ORDER BY view_count DESC LIMIT 10`,
      sql`SELECT query, results_count, searched_at FROM search_history WHERE session_id = ${sessionId} ORDER BY searched_at DESC LIMIT 20`,
      sql`SELECT rating, COUNT(*) as count FROM movie_ratings WHERE session_id = ${sessionId} GROUP BY rating ORDER BY rating`,
      sql`SELECT COUNT(*) as count FROM watchlist WHERE session_id = ${sessionId}`,
      sql`SELECT COUNT(*) as count FROM favorites WHERE session_id = ${sessionId}`,
      sql`SELECT COUNT(*) as count FROM recently_viewed WHERE session_id = ${sessionId}`,
      sql`SELECT COUNT(*) as count FROM search_history WHERE session_id = ${sessionId}`,
    ]);

    const ratingDist = [1, 2, 3, 4, 5].map((r) => {
      const half = ratingStats.find((s) => parseFloat(s.rating) === r - 0.5);
      const full = ratingStats.find((s) => parseFloat(s.rating) === r);
      return {
        rating: r,
        count: parseInt(half?.count || 0) + parseInt(full?.count || 0),
      };
    });

    return Response.json({
      genreStats,
      searchStats,
      ratingDistribution: ratingDist,
      watchlistCount: parseInt(watchlistCount[0]?.count || 0),
      favoritesCount: parseInt(favoritesCount[0]?.count || 0),
      moviesViewed: parseInt(recentlyViewed[0]?.count || 0),
      totalSearches: parseInt(totalSearches[0]?.count || 0),
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
