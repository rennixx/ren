import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { TrackPayload } from "./now-playing";
import {
  applyNowPlayingUpdate,
  END_GRACE_MS,
  initialDisplayState,
  LIVE_TO_LAST_NULLS,
  projectedEndMs,
} from "./now-playing-state";

const SNAP = Date.parse("2026-11-26T20:37:26.419Z");
const NOW = SNAP + 120_000;

function live(overrides: Partial<TrackPayload> = {}): TrackPayload {
  return {
    status: "live",
    live: true,
    title: "Renegade",
    artist: "JAY-Z",
    coverUrl: "https://example.com/cover.jpg",
    listenUrl: "https://open.spotify.com/track/5ASZFbCod633wLragmPYTj",
    playedAgo: null,
    progressMs: 124_953,
    durationMs: 336_133,
    isPlaying: true,
    snapshotAt: SNAP,
    serverNow: NOW,
    ...overrides,
  };
}

function last(overrides: Partial<TrackPayload> = {}): TrackPayload {
  return {
    status: "last",
    live: false,
    title: "Ambition For Cash",
    artist: "Key Glock",
    coverUrl: "https://example.com/ambition.jpg",
    listenUrl: "https://open.spotify.com/track/1tkipCYkIgti8f1tqjfcWe",
    playedAgo: "3m ago",
    progressMs: null,
    durationMs: 143_480,
    isPlaying: false,
    snapshotAt: null,
    serverNow: NOW + 10_000,
    ...overrides,
  };
}

describe("applyNowPlayingUpdate", () => {
  it("starts from a live payload", () => {
    const state = initialDisplayState(live());
    assert.equal(state.track?.title, "Renegade");
    assert.equal(state.confirmedNulls, 0);
  });

  it("does not demote to last played after a single confirmed null", () => {
    const state = applyNowPlayingUpdate(
      initialDisplayState(live()),
      { type: "payload", payload: last() },
      NOW + 10_000,
    );
    assert.equal(state.track?.title, "Renegade");
    assert.equal(state.track?.status, "live");
    assert.equal(state.confirmedNulls, 1);
  });

  it("demotes to last played after two consecutive confirmed nulls", () => {
    let state = initialDisplayState(live());
    const t1 = last({ serverNow: NOW + 10_000 });
    const t2 = last({ serverNow: NOW + 20_000 });
    state = applyNowPlayingUpdate(state, { type: "payload", payload: t1 }, NOW + 10_000);
    state = applyNowPlayingUpdate(state, { type: "payload", payload: t2 }, NOW + 20_000);
    assert.equal(LIVE_TO_LAST_NULLS, 2);
    assert.equal(state.track?.title, "Ambition For Cash");
    assert.equal(state.track?.status, "last");
    assert.equal(state.confirmedNulls, 0);
  });

  it("never downgrades on a network error", () => {
    const started = initialDisplayState(live());
    const state = applyNowPlayingUpdate(started, { type: "error" }, NOW + 10_000);
    assert.deepEqual(state, started);
  });

  it("never downgrades on an unknown payload", () => {
    const started = initialDisplayState(live());
    const state = applyNowPlayingUpdate(
      started,
      { type: "payload", payload: { status: "unknown", serverNow: NOW + 10_000 } },
      NOW + 10_000,
    );
    assert.equal(state.track?.title, "Renegade");
    assert.equal(state.track?.status, "live");
    assert.equal(state.confirmedNulls, 0);
  });

  it("ignores an older (out-of-order or stale cache) payload", () => {
    const started = initialDisplayState(live({ serverNow: NOW }));
    const staleLast = last({ serverNow: NOW - 60_000 });
    const state = applyNowPlayingUpdate(started, { type: "payload", payload: staleLast }, NOW + 1_000);
    assert.equal(state.track?.title, "Renegade");
    assert.equal(state.confirmedNulls, 0);
  });

  it("switches last to live immediately", () => {
    const started = initialDisplayState(last({ serverNow: NOW - 5_000 }));
    const state = applyNowPlayingUpdate(
      started,
      { type: "payload", payload: live({ serverNow: NOW }) },
      NOW,
    );
    assert.equal(state.track?.title, "Renegade");
    assert.equal(state.track?.status, "live");
    assert.equal(state.confirmedNulls, 0);
  });

  it("demotes after the projected end plus grace when a single null arrives", () => {
    const track = live({ progressMs: 300_000, durationMs: 336_133, snapshotAt: SNAP, serverNow: SNAP });
    const end = projectedEndMs(track);
    assert.equal(end, SNAP + (336_133 - 300_000) + END_GRACE_MS);
    const state = applyNowPlayingUpdate(
      initialDisplayState(track),
      { type: "payload", payload: last({ serverNow: end! }) },
      end!,
    );
    assert.equal(state.track?.status, "last");
    assert.equal(state.track?.title, "Ambition For Cash");
  });

  it("does not demote on one null before the projected end", () => {
    const track = live({ progressMs: 10_000, durationMs: 336_133, snapshotAt: SNAP, serverNow: SNAP });
    const early = SNAP + 20_000;
    const state = applyNowPlayingUpdate(
      initialDisplayState(track),
      { type: "payload", payload: last({ serverNow: early }) },
      early,
    );
    assert.equal(state.track?.title, "Renegade");
    assert.equal(state.confirmedNulls, 1);
  });

  it("keeps a paused track as current", () => {
    const paused = live({ status: "paused", isPlaying: false, serverNow: NOW });
    const state = initialDisplayState(paused);
    assert.equal(state.track?.status, "paused");
    assert.equal(state.track?.live, true);
  });

  it("resets the null count when live returns after one miss", () => {
    let state = initialDisplayState(live({ serverNow: NOW }));
    state = applyNowPlayingUpdate(
      state,
      { type: "payload", payload: last({ serverNow: NOW + 10_000 }) },
      NOW + 10_000,
    );
    assert.equal(state.confirmedNulls, 1);
    state = applyNowPlayingUpdate(
      state,
      { type: "payload", payload: live({ serverNow: NOW + 20_000, progressMs: 140_000 }) },
      NOW + 20_000,
    );
    assert.equal(state.track?.status, "live");
    assert.equal(state.confirmedNulls, 0);
  });
});
