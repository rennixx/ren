export type TrackPayload = {
  live: boolean;
  title: string;
  artist: string;
  coverUrl: string | null;
  listenUrl: string;
  playedAgo: string | null;
};

const LASTFM_STAR = "2a96cbd8b46e442fc41c2b86b821562f";

type ImageEntry = {
  size?: string;
  "#text"?: string;
};

const IMAGE_RANK: Record<string, number> = {
  small: 1,
  medium: 2,
  large: 3,
  extralarge: 4,
  mega: 5,
};

export function isLastFmPlaceholder(url: string): boolean {
  return url.includes(LASTFM_STAR);
}

export function itunesArtworkUrl(url100: string): string {
  return url100.replace(/100x100bb(\.[a-z]+)$/i, "600x600bb$1");
}

export function formatPlayedAgo(utsSeconds: number, nowMs = Date.now()): string {
  const diff = Math.max(0, Math.floor(nowMs / 1000 - utsSeconds));
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(utsSeconds * 1000).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function textOf(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object" && "#text" in value) {
    const text = (value as { "#text"?: unknown })["#text"];
    if (typeof text === "string") return text.trim();
  }
  return "";
}

function asTracks(track: unknown): Record<string, unknown>[] {
  if (Array.isArray(track)) {
    return track.filter((item): item is Record<string, unknown> => {
      return Boolean(item) && typeof item === "object";
    });
  }
  if (track && typeof track === "object") return [track as Record<string, unknown>];
  return [];
}

export function largestImage(images: unknown): string | null {
  if (!Array.isArray(images)) {
    const single = textOf(images);
    if (single && !isLastFmPlaceholder(single)) return single;
    return null;
  }

  let best: { url: string; rank: number } | null = null;
  for (const [index, entry] of (images as ImageEntry[]).entries()) {
    const url = typeof entry?.["#text"] === "string" ? entry["#text"].trim() : "";
    if (!url || isLastFmPlaceholder(url)) continue;
    const rank = (entry.size && IMAGE_RANK[entry.size]) || index + 1;
    if (!best || rank >= best.rank) best = { url, rank };
  }
  return best?.url ?? null;
}

function isNowPlaying(track: Record<string, unknown>): boolean {
  const attr = track["@attr"];
  if (!attr || typeof attr !== "object") return false;
  const flag = (attr as { nowplaying?: unknown }).nowplaying;
  return flag === "true" || flag === true;
}

export function parseRecentTracks(data: unknown, nowMs = Date.now()): TrackPayload | null {
  if (!data || typeof data !== "object") return null;
  const root = data as { recenttracks?: { track?: unknown }; error?: unknown };
  if (root.error) return null;

  const tracks = asTracks(root.recenttracks?.track);
  const track = tracks[0];
  if (!track) return null;

  const title = textOf(track.name);
  const artist = textOf(track.artist);
  if (!title || !artist) return null;

  const live = isNowPlaying(track);
  let playedAgo: string | null = null;
  if (!live) {
    const date = track.date;
    const uts =
      date && typeof date === "object" && "uts" in date
        ? Number((date as { uts?: unknown }).uts)
        : NaN;
    if (Number.isFinite(uts)) playedAgo = formatPlayedAgo(uts, nowMs);
    else playedAgo = "recently";
  }

  const listenUrl = textOf(track.url);

  return {
    live,
    title,
    artist,
    coverUrl: largestImage(track.image),
    listenUrl,
    playedAgo,
  };
}
