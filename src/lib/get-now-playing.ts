import {
  itunesArtworkUrl,
  parseCurrentStream,
  parseRecentStreams,
  type TrackPayload,
} from "@/lib/now-playing";

const STATS_FM_ENDPOINT = "https://api.stats.fm/api/v1";
const ITUNES_ENDPOINT = "https://itunes.apple.com/search";
const USER_PATTERN = /^[A-Za-z0-9._-]+$/;

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

async function statsFmGet(path: string): Promise<unknown | null> {
  const res = await fetch(`${STATS_FM_ENDPOINT}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 20 },
  });
  if (!res.ok) return null;
  return res.json();
}

async function withCover(track: TrackPayload): Promise<TrackPayload> {
  if (!track.coverUrl) {
    track.coverUrl = await lookupItunesArtwork(track.artist, track.title);
  }
  return track;
}

export function statsFmUser(): string | null {
  const user = (process.env.STATSFM_USER || "iicyren").trim();
  if (!user || !USER_PATTERN.test(user)) return null;
  return user;
}

export async function getNowPlaying(): Promise<TrackPayload | null> {
  const user = statsFmUser();
  if (!user) return null;

  try {
    const current = parseCurrentStream(await statsFmGet(`/users/${user}/streams/current`));
    if (current) return withCover(current);

    const recent = parseRecentStreams(
      await statsFmGet(`/users/${user}/streams/recent?limit=1`),
    );
    if (!recent) return null;
    return withCover(recent);
  } catch {
    return null;
  }
}
