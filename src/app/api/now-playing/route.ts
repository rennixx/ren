import { getNowPlaying } from "@/lib/get-now-playing";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE = { "Cache-Control": "private, no-store" };

export async function GET() {
  try {
    const payload = await getNowPlaying();
    return Response.json(payload, { headers: NO_STORE });
  } catch {
    return Response.json(
      { status: "unknown", serverNow: Date.now() },
      { headers: NO_STORE },
    );
  }
}
