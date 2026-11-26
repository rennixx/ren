export type PlaybackStatus = "live" | "paused" | "last" | "unknown";

export type TrackPayload = {
  status: "live" | "paused" | "last";
  live: boolean;
  title: string;
  artist: string;
  coverUrl: string | null;
  listenUrl: string;
  playedAgo: string | null;
  progressMs: number | null;
  durationMs: number | null;
  isPlaying: boolean;
  snapshotAt: number | null;
  serverNow: number;
};

export type UnknownPayload = {
  status: "unknown";
  serverNow: number;
};

export type NowPlayingPayload = TrackPayload | UnknownPayload;

/** A paused current-stream snapshot older than this is treated as last played. */
export const PAUSED_MAX_AGE_MS = 10 * 60 * 1000;

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

export function hasProgress(
  track: Pick<TrackPayload, "live" | "progressMs" | "durationMs">,
): boolean {
  return (
    track.live &&
    track.progressMs != null &&
    Number.isFinite(track.progressMs) &&
    track.durationMs != null &&
    track.durationMs > 0
  );
}

/** Snapshots this far past the end of the track are treated as stale. */
export const STALE_AFTER_MS = 5_000;

/** Ignore receivedAt-serverNow offsets larger than this; they are cache age, not clock skew. */
const SKEW_MAX_MS = 2_000;

export type ProgressPosition = {
  positionMs: number;
  ratio: number | null;
  stale: boolean;
};

function estimateSkew(receivedAt: number, serverNow: number): number {
  const offset = receivedAt - serverNow;
  // A large offset is almost always the age of a cached response, not clock skew.
  if (!Number.isFinite(offset) || Math.abs(offset) > SKEW_MAX_MS) return 0;
  return offset;
}

/**
 * Reconstruct the playhead from a stats.fm progress snapshot.
 *
 * stats.fm's `progressMs` is taken at `snapshotAt` and is not a live playhead;
 * it often stays unchanged across polls until stats.fm refreshes it. The true
 * position is `progressMs + (now - snapshotAt)`. Pause and seek can therefore
 * lag until the next snapshot.
 *
 * `serverNow` is the server clock when the payload was built. Clock skew is
 * applied only when the payload looks fresh, so cache age is not mistaken
 * for skew. If the projected position is past the end while stats.fm still
 * reports isPlaying, the bar is clamped at the end and the track stays live.
 */
export function playbackPosition(
  track: Pick<
    TrackPayload,
    "live" | "progressMs" | "durationMs" | "isPlaying" | "snapshotAt" | "serverNow"
  >,
  clientNow: number,
  receivedAt: number = clientNow,
): ProgressPosition | null {
  if (!hasProgress(track) || track.progressMs == null || track.durationMs == null) {
    return null;
  }

  const durationMs = track.durationMs;
  let positionMs = track.progressMs;

  if (track.isPlaying) {
    const snapshotAt = track.snapshotAt ?? track.serverNow;
    const adjustedNow = clientNow - estimateSkew(receivedAt, track.serverNow);
    positionMs = track.progressMs + Math.max(0, adjustedNow - snapshotAt);
  }

  if (positionMs > durationMs + STALE_AFTER_MS) {
    return { positionMs: durationMs, ratio: 1, stale: true };
  }

  positionMs = Math.min(durationMs, Math.max(0, positionMs));
  return { positionMs, ratio: positionMs / durationMs, stale: false };
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
  "status" | "live" | "playedAgo" | "progressMs" | "isPlaying" | "snapshotAt" | "serverNow"
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

  // stats.fm `date` is when this progressMs snapshot was taken, not "now".
  const snapshotAt = (() => {
    if (item.date == null) return null;
    const t = new Date(item.date as string | number).getTime();
    return Number.isFinite(t) ? t : null;
  })();

  const isPlaying = item.isPlaying !== false;
  return {
    ...parsed,
    status: isPlaying ? "live" : "paused",
    live: true,
    playedAgo: null,
    progressMs,
    isPlaying,
    snapshotAt,
    serverNow: nowMs,
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
    status: "last",
    live: false,
    playedAgo,
    progressMs: null,
    isPlaying: false,
    snapshotAt: null,
    serverNow: nowMs,
  };
}

export type StatsFmFetch = { ok: true; data: unknown } | { ok: false };

/**
 * Decide what to show from a /streams/current result and a /streams/recent result.
 *
 * A current-stream error is "unknown", never last-played: falling back to recent
 * on a failed live lookup is what made the strip flip while a track was playing.
 * A successful current response with `item: null` is a confirmed idle state.
 */
export function resolveNowPlaying(
  currentFetch: StatsFmFetch,
  recentFetch: StatsFmFetch,
  nowMs: number,
): NowPlayingPayload {
  if (!currentFetch.ok) {
    return { status: "unknown", serverNow: nowMs };
  }

  const current = parseCurrentStream(currentFetch.data, nowMs);
  if (current) {
    if (current.status === "paused") {
      const age = nowMs - (current.snapshotAt ?? current.serverNow);
      if (age <= PAUSED_MAX_AGE_MS) return current;
    } else {
      return current;
    }
  }

  if (!recentFetch.ok) {
    return { status: "unknown", serverNow: nowMs };
  }
  const recent = parseRecentStreams(recentFetch.data, nowMs);
  if (recent) return recent;
  return { status: "unknown", serverNow: nowMs };
}
