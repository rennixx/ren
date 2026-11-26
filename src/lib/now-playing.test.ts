import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatPlayedAgo,
  hasProgress,
  itunesArtworkUrl,
  parseCurrentStream,
  parseRecentStreams,
  parseTrack,
  playbackPosition,
  resolveNowPlaying,
  resolvePlayback,
  BAR_CAP_RATIO,
  impliedStartedAt,
} from "./now-playing";

const NOW = Date.parse("2026-11-26T18:00:00Z");
const COVER =
  "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/64/ce/3f/64ce3f2a-b523-8f83-46fc-ef70b6ea48ff/886448469704.jpg/768x768bb.jpg";

const lifeIsGoodTrack = {
  albums: [{ id: 1, image: COVER, name: "High Off Life" }],
  artists: [
    { id: 2, name: "Future" },
    { id: 3, name: "Drake" },
  ],
  durationMs: 237000,
  explicit: true,
  externalIds: { spotify: ["1K5KBOgreBi5fkEHunNZvC"], appleMusic: ["123"] },
  id: 4242,
  name: "Life Is Good (feat. Drake)",
};

describe("parseCurrentStream", () => {
  it("parses a now-playing track with progress", () => {
    const track = parseCurrentStream(
      {
        item: {
          date: "2026-11-26T17:59:30.000Z",
          isPlaying: true,
          progressMs: 83000,
          deviceName: "ren's phone",
          platform: "SPOTIFY",
          track: lifeIsGoodTrack,
        },
      },
      NOW,
    );
    assert.deepEqual(track, {
      status: "live",
      live: true,
      title: "Life Is Good (feat. Drake)",
      artist: "Future, Drake",
      coverUrl: COVER,
      listenUrl: "https://open.spotify.com/track/1K5KBOgreBi5fkEHunNZvC",
      playedAgo: null,
      progressMs: 83000,
      durationMs: 237000,
      isPlaying: true,
      snapshotAt: Date.parse("2026-11-26T17:59:30.000Z"),
      serverNow: NOW,
    });
    assert.equal(hasProgress(track!), true);
  });

  it("returns null when nothing is playing", () => {
    assert.equal(parseCurrentStream({ item: null }, NOW), null);
    assert.equal(parseCurrentStream({}, NOW), null);
    assert.equal(parseCurrentStream(undefined, NOW), null);
  });

  it("treats a current item without progress as live without a bar", () => {
    const track = parseCurrentStream(
      {
        item: {
          isPlaying: true,
          platform: "SPOTIFY",
          track: { ...lifeIsGoodTrack, durationMs: 237000 },
        },
      },
      NOW,
    );
    assert.equal(track?.live, true);
    assert.equal(track?.progressMs, null);
    assert.equal(hasProgress(track!), false);
  });
});

describe("parseRecentStreams", () => {
  it("parses the most recent stream and a relative time", () => {
    const twoHoursAgo = new Date(NOW - 2 * 3600 * 1000).toISOString();
    const track = parseRecentStreams(
      {
        items: [
          {
            platform: "SPOTIFY",
            endTime: twoHoursAgo,
            durationMs: 237000,
            track: lifeIsGoodTrack,
          },
        ],
      },
      NOW,
    );
    assert.equal(track?.status, "last");
    assert.equal(track?.live, false);
    assert.equal(track?.playedAgo, "2h ago");
    assert.equal(track?.title, "Life Is Good (feat. Drake)");
    assert.equal(track?.artist, "Future, Drake");
    assert.equal(track?.listenUrl, "https://open.spotify.com/track/1K5KBOgreBi5fkEHunNZvC");
    assert.equal(track?.progressMs, null);
  });

  it("returns null for an empty response", () => {
    assert.equal(parseRecentStreams({ items: [] }, NOW), null);
    assert.equal(parseRecentStreams({}, NOW), null);
  });
});

describe("parseTrack", () => {
  it("returns null cover when art is missing", () => {
    const parsed = parseTrack({
      ...lifeIsGoodTrack,
      albums: [{ id: 1, name: "High Off Life", image: "" }],
    });
    assert.equal(parsed?.coverUrl, null);
    assert.equal(parsed?.title, "Life Is Good (feat. Drake)");
  });

  it("falls back to a stats.fm track link without a Spotify id", () => {
    const parsed = parseTrack({
      ...lifeIsGoodTrack,
      externalIds: { spotify: [], appleMusic: [] },
    });
    assert.equal(parsed?.listenUrl, "https://stats.fm/track/4242");
  });

  it("returns null when title or artist is missing", () => {
    assert.equal(parseTrack({ ...lifeIsGoodTrack, name: "" }), null);
    assert.equal(parseTrack({ ...lifeIsGoodTrack, artists: [] }), null);
  });
});

describe("helpers", () => {
  it("upgrades iTunes artwork to 600px", () => {
    assert.equal(
      itunesArtworkUrl(
        "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/aa/bb/cc/file.jpg/100x100bb.jpg",
      ),
      "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/aa/bb/cc/file.jpg/600x600bb.jpg",
    );
  });

  it("formats relative times", () => {
    const nowSec = Math.floor(NOW / 1000);
    assert.equal(formatPlayedAgo(nowSec - 10, NOW), "just now");
    assert.equal(formatPlayedAgo(nowSec - 12 * 60, NOW), "12m ago");
    assert.equal(formatPlayedAgo(nowSec - 2 * 3600, NOW), "2h ago");
    assert.equal(formatPlayedAgo(nowSec - 3 * 86400, NOW), "3d ago");
  });
});


describe("playbackPosition", () => {
  // Recorded from stats.fm /streams/current for iicyren on 2026-11-26
  // while "Enter Sandman - Remastered 2021" played on iPhone.
  const DATE = Date.parse("2026-11-26T20:50:09.278Z");
  const DURATION = 331_560;
  const TITLE = "Enter Sandman - Remastered 2021";

  const samples = [
    {
      label: "first sight, progress fresh",
      at: Date.parse("2026-11-26T20:51:58.648Z"),
      progressMs: 109_243,
    },
    {
      label: "progress still frozen 21s later",
      at: Date.parse("2026-11-26T20:52:19.628Z"),
      progressMs: 109_243,
    },
    {
      label: "stats.fm refresh, progress jumped ~32s",
      at: Date.parse("2026-11-26T20:52:30.556Z"),
      progressMs: 141_125,
    },
    {
      label: "refresh at 52%",
      at: Date.parse("2026-11-26T20:53:02.506Z"),
      progressMs: 173_089,
    },
    {
      // Ren reported the real song was about 50% at 23:53 Asia/Baghdad (20:53Z).
      // At 20:53:02Z the date-as-start model is 52.2%; the old
      // progressMs+(now-date) model was already 104.5% (bar at the end).
      label: "ren calibration ~23:53 Baghdad",
      at: Date.parse("2026-11-26T20:53:43.730Z"),
      progressMs: 205_058,
    },
    {
      label: "later refresh",
      at: Date.parse("2026-11-26T20:54:38.650Z"),
      progressMs: 269_222,
    },
  ] as const;

  function track(progressMs: number, at: number) {
    return {
      live: true as const,
      title: TITLE,
      artist: "Metallica",
      listenUrl: "https://open.spotify.com/track/3DwQ7AH3xGD9h65ezslm6q",
      progressMs,
      durationMs: DURATION,
      isPlaying: true,
      snapshotAt: DATE,
      serverNow: at,
    };
  }

  it("treats stats.fm date as the implied start, not the snapshot time", () => {
    const first = samples[0];
    const start = impliedStartedAt(first.progressMs, first.at, DATE);
    assert.equal(start, DATE);
    // date + progressMs equals the fetch time (within 200ms) when progress is fresh.
    assert.ok(Math.abs(DATE + first.progressMs - first.at) < 200);
  });

  it("matches recorded samples: now-date, not progress+(now-date)", () => {
    for (const sample of samples) {
      const pos = playbackPosition(track(sample.progressMs, sample.at), sample.at, sample.at);
      const expected = sample.at - DATE;
      assert.ok(pos, sample.label);
      assert.ok(
        Math.abs((pos!.positionMs) - expected) < 2 || pos!.capped,
        `${sample.label}: got ${pos!.positionMs} expected ${expected}`,
      );
      const oldModel = sample.progressMs + (sample.at - DATE);
      // The previous model was about 2x ahead and already past 100% by the 52% sample.
      if (sample.label.includes("52%") || sample.label.includes("calibration")) {
        assert.ok(oldModel / DURATION > 1, sample.label);
        assert.ok((pos!.ratio ?? 0) < 0.8, sample.label);
      }
    }
    // At Ren's 23:53 report, the new model is ~halfway-to-2/3, not finished.
    const cal = samples.find((s) => s.label.includes("calibration"))!;
    const pos = playbackPosition(track(cal.progressMs, cal.at), cal.at, cal.at)!;
    assert.ok(pos.ratio! > 0.45 && pos.ratio! < 0.75);
    assert.equal(pos.capped, false);
    assert.ok(cal.progressMs / DURATION + (cal.at - DATE) / DURATION > 1);
  });

  it("interpolates from date while progressMs is frozen between refreshes", () => {
    const frozen = samples[1];
    const pos = playbackPosition(track(frozen.progressMs, frozen.at), frozen.at, frozen.at)!;
    const elapsed = frozen.at - DATE;
    assert.equal(Math.round(pos.positionMs), elapsed);
    // Using the frozen progress alone would lag; adding (now-date) to it would lead.
    assert.ok(frozen.progressMs < pos.positionMs);
    assert.ok(frozen.progressMs + (frozen.at - DATE) > pos.positionMs * 1.5);
  });

  it("keeps a stable start when progressMs later catches up", () => {
    const first = samples[0];
    const refresh = samples[2];
    const a1 = resolvePlayback(track(first.progressMs, first.at), first.at, first.at, null);
    const a2 = resolvePlayback(
      track(refresh.progressMs, refresh.at),
      refresh.at,
      refresh.at,
      a1.anchor,
    );
    assert.equal(a2.anchor?.startedAt, DATE);
    assert.equal(Math.round(a2.position!.positionMs), refresh.at - DATE);
  });

  it("does not jump backward by more than 2s unless the jump looks like a seek", () => {
    const at = DATE + 120_000;
    const prev = resolvePlayback(track(120_000, at), at, at, null);
    // A slightly earlier progress (4s) must not rewind the bar.
    const slip = resolvePlayback(
      track(116_000, at + 50),
      at + 50,
      at + 50,
      prev.anchor,
    );
    assert.equal(slip.anchor?.startedAt, prev.anchor?.startedAt);
    // A 20s seek backward is accepted.
    const seekAt = at + 1_000;
    const seek = resolvePlayback(track(100_000, seekAt), seekAt, seekAt, prev.anchor);
    assert.ok(Math.abs(seek.position!.positionMs - 100_000) < 50);
  });

  it("does not advance when paused", () => {
    const at = DATE + 60_000;
    const pos = playbackPosition(
      { ...track(87_479, at), isPlaying: false, progressMs: 87_479 },
      at,
      at,
    );
    assert.equal(pos?.positionMs, 87_479);
    assert.equal(pos?.capped, false);
  });

  it("caps the bar at 97% so it cannot finish before the track changes", () => {
    const at = DATE + DURATION + 5_000;
    const pos = playbackPosition(track(DURATION - 1_000, at), at, at)!;
    assert.equal(pos.ratio, BAR_CAP_RATIO);
    assert.equal(pos.capped, true);
    assert.ok(pos.positionMs <= DURATION * BAR_CAP_RATIO + 0.001);
    assert.ok(pos.ratio! < 1);
  });

  it("falls back to receivedAt - progressMs when snapshotAt is missing", () => {
    const receivedAt = DATE + 109_243;
    const clientNow = receivedAt + 8_000;
    const pos = playbackPosition(
      { ...track(109_243, receivedAt), snapshotAt: null, serverNow: receivedAt },
      clientNow,
      receivedAt,
    );
    assert.equal(pos?.positionMs, 109_243 + 8_000);
  });

  it("returns null without a usable progress or duration", () => {
    const at = DATE + 1_000;
    const base = track(109_243, at);
    assert.equal(playbackPosition({ ...base, live: false }, at, at), null);
    assert.equal(playbackPosition({ ...base, progressMs: null }, at, at), null);
    assert.equal(playbackPosition({ ...base, durationMs: 0 }, at, at), null);
  });

  it("still corrects small clock skew and ignores cache age", () => {
    const at = DATE + 109_243;
    const receivedAt = at + 250;
    const clientNow = receivedAt + 10_000;
    const pos = playbackPosition(track(109_243, at), clientNow, receivedAt)!;
    // skew 250ms: adjusted now = clientNow - 250, position = that - DATE = 109_243 + 10_000
    assert.equal(Math.round(pos.positionMs), 109_243 + 10_000);

    const cachedReceived = at + 20_000;
    const cached = playbackPosition(track(109_243, at), cachedReceived, cachedReceived)!;
    // 20s cache age is not skew; date is still the start, so position is now - date.
    assert.equal(Math.round(cached.positionMs), cachedReceived - DATE);
  });
});


describe("parseCurrentStream paused", () => {
  it("marks a current item with isPlaying false as paused, not last played", () => {
    const track = parseCurrentStream(
      {
        item: {
          date: "2026-11-26T17:59:30.000Z",
          isPlaying: false,
          progressMs: 83000,
          track: lifeIsGoodTrack,
        },
      },
      NOW,
    );
    assert.equal(track?.status, "paused");
    assert.equal(track?.live, true);
    assert.equal(track?.isPlaying, false);
  });
});

describe("resolveNowPlaying", () => {
  const liveBody = {
    item: {
      date: "2026-11-26T17:59:30.000Z",
      isPlaying: true,
      progressMs: 83000,
      track: lifeIsGoodTrack,
    },
  };
  const recentBody = {
    items: [
      {
        platform: "SPOTIFY",
        endTime: new Date(NOW - 3 * 60 * 1000).toISOString(),
        track: { ...lifeIsGoodTrack, name: "Ambition For Cash", artists: [{ name: "Key Glock" }] },
      },
    ],
  };

  it("returns the live track when current succeeds", () => {
    const payload = resolveNowPlaying({ ok: true, data: liveBody }, { ok: true, data: recentBody }, NOW);
    assert.equal(payload.status, "live");
    assert.equal("title" in payload && payload.title, "Life Is Good (feat. Drake)");
  });

  it("returns unknown on a current-stream error, never last played", () => {
    const payload = resolveNowPlaying({ ok: false }, { ok: true, data: recentBody }, NOW);
    assert.deepEqual(payload, { status: "unknown", serverNow: NOW });
  });

  it("returns last played only when current is a confirmed empty item", () => {
    const payload = resolveNowPlaying({ ok: true, data: { item: null } }, { ok: true, data: recentBody }, NOW);
    assert.equal(payload.status, "last");
    assert.equal("title" in payload && payload.title, "Ambition For Cash");
  });

  it("keeps a recent pause as current, not last played", () => {
    const paused = {
      item: {
        date: "2026-11-26T17:55:00.000Z",
        isPlaying: false,
        progressMs: 40000,
        track: lifeIsGoodTrack,
      },
    };
    const payload = resolveNowPlaying({ ok: true, data: paused }, { ok: true, data: recentBody }, NOW);
    assert.equal(payload.status, "paused");
    assert.equal("title" in payload && payload.title, "Life Is Good (feat. Drake)");
  });

  it("treats a pause older than 10 minutes as last played", () => {
    const paused = {
      item: {
        date: "2026-11-26T17:40:00.000Z",
        isPlaying: false,
        progressMs: 40000,
        track: lifeIsGoodTrack,
      },
    };
    const payload = resolveNowPlaying({ ok: true, data: paused }, { ok: true, data: recentBody }, NOW);
    assert.equal(payload.status, "last");
    assert.equal("title" in payload && payload.title, "Ambition For Cash");
  });
});
