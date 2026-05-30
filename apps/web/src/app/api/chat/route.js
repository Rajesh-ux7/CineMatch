export async function POST(request) {
  try {
    const { messages, currentMovie } = await request.json();

    const systemPrompt = `You are CineAssistant, an expert AI movie guide for CineMatch AI — a premium movie recommendation platform.

You have deep knowledge of:
- Films across all eras, genres, and cultures
- Directors, actors, cinematographers, and screenwriters
- Movie themes, narrative techniques, and cinematic history
- How to match movies to user moods and preferences

${currentMovie ? `The user is currently viewing: "${currentMovie.title}" (${currentMovie.year}). Genres: ${currentMovie.genres}. Overview: ${currentMovie.overview}` : ""}

Your personality:
- Knowledgeable but approachable — like a passionate film buff friend
- Give specific, confident recommendations with brief explanations
- Keep responses concise (2-4 sentences max) unless asked for more detail
- Use film terminology naturally (cinematography, mise-en-scène, etc.)
- Always recommend at least 2-3 specific movies when asked

Format:
- Use plain text only, no markdown headers
- Bold movie titles by wrapping them in **double asterisks**
- Keep responses conversational and engaging`;

    const response = await fetch("/integrations/google-gemini-2-5-flash/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
    });

    if (!response.ok) {
      return Response.json(
        { error: "AI service unavailable" },
        { status: 500 },
      );
    }

    const data = await response.json();
    const content =
      data.choices?.[0]?.message?.content ||
      "Sorry, I could not generate a response.";
    return Response.json({ message: content });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
