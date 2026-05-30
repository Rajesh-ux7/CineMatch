import sql from "@/app/api/utils/sql";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  const limit = parseInt(searchParams.get("limit") || "20");
  if (!sessionId)
    return Response.json({ error: "Session ID required" }, { status: 400 });

  try {
    const items = await sql`
      SELECT * FROM recently_viewed WHERE session_id = ${sessionId}
      ORDER BY viewed_at DESC LIMIT ${limit}
    `;
    return Response.json({ items });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
