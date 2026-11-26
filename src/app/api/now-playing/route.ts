import { getNowPlaying } from "@/lib/get-now-playing";

export const revalidate = 8;

export async function GET() {
  try {
    const track = await getNowPlaying();
    if (!track) {
      return new Response(null, { status: 204 });
    }
    return Response.json(track, {
      headers: {
        "Cache-Control": "public, s-maxage=8, stale-while-revalidate=2",
      },
    });
  } catch {
    return new Response(null, { status: 204 });
  }
}
