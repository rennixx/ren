export type TrackPayload = {
  live: boolean;
  title: string;
  artist: string;
  coverUrl: string | null;
  listenUrl: string;
  playedAgo: string | null;
  progressMs: number | null;
  durationMs: number | null;
  isPlaying: boolean;
  fetchedAt: number;
};

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

export function hasProgress(track: TrackPayload): boolean {
  return (
    track.live &&
    track.progressMs != null &&
    Number.isFinite(track.progressMs) &&
    track.durationMs != null &&
    track.durationMs > 0
  );
}

function textOf(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function artistNames(artists: unknown): string {
  if (!Array.isArray(artists)) return "";
  return artists
    .map((artist) => textOf(asRecord(artist)?.name))
    .filter(Boolean)
    .join(", ");
}

function coverFromTrack(track: Record<string, unknown>): string | null {
  const albums = track.albums;
  if (!Array.isArray(albums) || albums.length === 0) return null;
  const image = textOf(asRecord(albums[0])?.image);
  return image || null;
}

function spotifyId(track: Record<string, unknown>): string | null {
  const ids = asRecord(track.externalIds)?.spotify;
  if (!Array.isArray(ids)) return null;
  const id = ids.find((value) => typeof value === "string" && value.trim());
  return typeof id === "string" ? id.trim() : null;
}

function listenUrlFor(track: Record<string, unknown>): string {
  const id = spotifyId(track);
  if (id) return `https://open.spotify.com/track/${id}`;
  if (track.id != null && String(track.id).length > 0) {
    return `https://stats.fm/track/${track.id}`;
  }
  return "";
}

function durationOf(track: Record<string, unknown>): number | null {
  const value = Number(track.durationMs);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function parseTrack(track: unknown): Omit<
  TrackPayload,
  "live" | "playedAgo" | "progressMs" | "isPlaying" | "fetchedAt"
> | null {
  const rec = asRecord(track);
  if (!rec) return null;
  const title = textOf(rec.name);
  const artist = artistNames(rec.artists);
  if (!title || !artist) return null;
  return {
    title,
    artist,
    coverUrl: coverFromTrack(rec),
    listenUrl: listenUrlFor(rec),
    durationMs: durationOf(rec),
  };
}

export function parseCurrentStream(data: unknown, nowMs = Date.now()): TrackPayload | null {
  const root = asRecord(data);
  if (!root) return null;
  const item = asRecord(root.item);
  if (!item) return null;
  const parsed = parseTrack(item.track);
  if (!parsed) return null;

  const progressRaw = item.progressMs;
  const progressMs =
    progressRaw == null || progressRaw === ""
      ? null
      : Number.isFinite(Number(progressRaw))
        ? Math.max(0, Number(progressRaw))
        : null;

  const fetchedAt = (() => {
    if (item.date == null) return nowMs;
    const t = new Date(item.date as string | number).getTime();
    return Number.isFinite(t) ? t : nowMs;
  })();

  return {
    ...parsed,
    live: true,
    playedAgo: null,
    progressMs,
    isPlaying: item.isPlaying !== false,
    fetchedAt,
  };
}

export function parseRecentStreams(data: unknown, nowMs = Date.now()): TrackPayload | null {
  const root = asRecord(data);
  if (!root) return null;
  const items = Array.isArray(root.items) ? root.items : [];
  const item = asRecord(items[0]);
  if (!item) return null;
  const parsed = parseTrack(item.track);
  if (!parsed) return null;

  let playedAgo = "recently";
  if (item.endTime != null) {
    const t = new Date(item.endTime as string | number).getTime();
    if (Number.isFinite(t)) playedAgo = formatPlayedAgo(Math.floor(t / 1000), nowMs);
  }

  return {
    ...parsed,
    live: false,
    playedAgo,
    progressMs: null,
    isPlaying: false,
    fetchedAt: nowMs,
  };
}
