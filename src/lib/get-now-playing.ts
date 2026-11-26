import {
  itunesArtworkUrl,
  resolveNowPlaying,
  type NowPlayingPayload,
  type StatsFmFetch,
  type TrackPayload,
} from "@/lib/now-playing";

const STATS_FM_ENDPOINT = "https://api.stats.fm/api/v1";
const ITUNES_ENDPOINT = "https://itunes.apple.com/search";
const USER_PATTERN = /^[A-Za-z0-9._-]+$/;
const STATS_FM_TIMEOUT_MS = 4_000;

async function lookupItunesArtwork(artist: string, title: string): Promise<string | null> {
  const url = `${ITUNES_ENDPOINT}?term=${encodeURIComponent(`${artist} ${title}`)}&entity=song&limit=5`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      results?: { trackName?: string; artistName?: string; artworkUrl100?: string }[];
    };
    const results = data.results ?? [];
    if (results.length === 0) return null;

    const needleTitle = title.toLowerCase().split("(")[0].trim();
    const needleArtist = artist.toLowerCase().split(",")[0].trim();
    const match =
      results.find((item) => {
        const trackName = item.trackName?.toLowerCase() ?? "";
        const artistName = item.artistName?.toLowerCase() ?? "";
        return trackName.includes(needleTitle) && artistName.includes(needleArtist);
      }) ?? results[0];

    const art = match.artworkUrl100;
    if (!art) return null;
    return itunesArtworkUrl(art);
  } catch {
    return null;
  }
}

async function statsFmGetOnce(path: string): Promise<StatsFmFetch> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), STATS_FM_TIMEOUT_MS);
  try {
    const res = await fetch(`${STATS_FM_ENDPOINT}${path}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) return { ok: false };
    return { ok: true, data: await res.json() };
  } catch {
    return { ok: false };
  } finally {
    clearTimeout(timer);
  }
}

/** One retry on timeout, HTTP error, or network failure. Never throws. */
async function statsFmGet(path: string): Promise<StatsFmFetch> {
  const first = await statsFmGetOnce(path);
  if (first.ok) return first;
  return statsFmGetOnce(path);
}

async function withCover(payload: NowPlayingPayload): Promise<NowPlayingPayload> {
  if (payload.status === "unknown" || payload.coverUrl) return payload;
  payload.coverUrl = await lookupItunesArtwork(payload.artist, payload.title);
  return payload;
}

export function statsFmUser(): string | null {
  const user = (process.env.STATSFM_USER || "iicyren").trim();
  if (!user || !USER_PATTERN.test(user)) return null;
  return user;
}

export async function getNowPlaying(): Promise<NowPlayingPayload> {
  const user = statsFmUser();
  const nowMs = Date.now();
  if (!user) return { status: "unknown", serverNow: nowMs };

  try {
    const currentPath = `/users/${user}/streams/current`;
    const recentPath = `/users/${user}/streams/recent?limit=1`;
    const [currentFetch, recentFetch] = await Promise.all([
      statsFmGet(currentPath),
      statsFmGet(recentPath),
    ]);
    return withCover(resolveNowPlaying(currentFetch, recentFetch, nowMs));
  } catch {
    return { status: "unknown", serverNow: nowMs };
  }
}

export type { TrackPayload, NowPlayingPayload };
