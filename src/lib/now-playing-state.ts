import { type NowPlayingPayload, type TrackPayload } from "@/lib/now-playing";

/** Consecutive confirmed "not playing" payloads required to leave a live/paused track. */
export const LIVE_TO_LAST_NULLS = 2;

/** Extra wait after the projected end of a track before a single null can demote it. */
export const END_GRACE_MS = 15_000;

export type DisplayState = {
  track: TrackPayload | null;
  appliedServerNow: number;
  confirmedNulls: number;
};

export type IncomingUpdate =
  | { type: "payload"; payload: NowPlayingPayload }
  | { type: "error" };

export function initialDisplayState(payload: NowPlayingPayload | null): DisplayState {
  if (!payload || payload.status === "unknown" || !isTrack(payload)) {
    return { track: null, appliedServerNow: payload?.serverNow ?? 0, confirmedNulls: 0 };
  }
  return { track: payload, appliedServerNow: payload.serverNow, confirmedNulls: 0 };
}

export function isTrack(payload: NowPlayingPayload): payload is TrackPayload {
  return payload.status !== "unknown" && typeof (payload as TrackPayload).title === "string";
}

/**
 * Projected end of the current play, plus a grace period.
 * stats.fm's `date` is the implied start of the play, so the end is start + duration.
 * Used only together with a confirmed null, never on its own.
 */
export function projectedEndMs(track: TrackPayload): number | null {
  if (track.durationMs == null || track.durationMs <= 0) {
    return null;
  }
  const start =
    track.snapshotAt ??
    (track.progressMs != null ? track.serverNow - track.progressMs : track.serverNow);
  return start + track.durationMs + END_GRACE_MS;
}

export function applyNowPlayingUpdate(
  state: DisplayState,
  incoming: IncomingUpdate,
  nowMs: number,
): DisplayState {
  if (incoming.type === "error") {
    return state;
  }

  const payload = incoming.payload;
  if (payload.serverNow < state.appliedServerNow) {
    return state;
  }

  if (payload.status === "unknown") {
    return { ...state, appliedServerNow: payload.serverNow };
  }

  if (payload.status === "live" || payload.status === "paused") {
    return { track: payload, appliedServerNow: payload.serverNow, confirmedNulls: 0 };
  }

  // Confirmed last-played (or empty last).
  return demoteIfAllowed(state, payload, nowMs);
}

function demoteIfAllowed(
  state: DisplayState,
  last: TrackPayload,
  nowMs: number,
): DisplayState {
  const current = state.track;
  const holding = current && (current.status === "live" || current.status === "paused");
  if (!holding) {
    return { track: last, appliedServerNow: last.serverNow, confirmedNulls: 0 };
  }

  const confirmedNulls = state.confirmedNulls + 1;
  const ended = projectedEndMs(current) != null && nowMs >= projectedEndMs(current)!;
  if (confirmedNulls >= LIVE_TO_LAST_NULLS || ended) {
    return { track: last, appliedServerNow: last.serverNow, confirmedNulls: 0 };
  }

  return { ...state, appliedServerNow: last.serverNow, confirmedNulls };
}
