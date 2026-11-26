import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatPlayedAgo,
  hasProgress,
  itunesArtworkUrl,
  parseCurrentStream,
  parseRecentStreams,
  parseTrack,
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
      live: true,
      title: "Life Is Good (feat. Drake)",
      artist: "Future, Drake",
      coverUrl: COVER,
      listenUrl: "https://open.spotify.com/track/1K5KBOgreBi5fkEHunNZvC",
      playedAgo: null,
      progressMs: 83000,
      durationMs: 237000,
      isPlaying: true,
      fetchedAt: Date.parse("2026-11-26T17:59:30.000Z"),
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
