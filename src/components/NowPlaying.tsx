import { getNowPlaying } from "@/lib/get-now-playing";
import { NowPlayingStrip } from "@/components/NowPlayingStrip";

export async function NowPlaying() {
  const initial = await getNowPlaying();
  return <NowPlayingStrip initial={initial} />;
}
