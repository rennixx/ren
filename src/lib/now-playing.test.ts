import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatPlayedAgo,
  isLastFmPlaceholder,
  itunesArtworkUrl,
  largestImage,
  parseRecentTracks,
} from "./now-playing";

const STAR = "https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png";
const COVER = "https://lastfm.freetls.fastly.net/i/u/300x300/realcover.jpg";
const NOW = Date.parse("2026-11-26T18:00:00Z");

function images(overrides: { extra?: string; star?: boolean } = {}) {
  const extra = overrides.star ? STAR : (overrides.extra ?? COVER);
  return [
    { size: "small", "#text": extra.replace("300x300", "34s") },
    { size: "medium", "#text": extra.replace("300x300", "64s") },
    { size: "large", "#text": extra.replace("300x300", "174s") },
    { size: "extralarge", "#text": extra },
  ];
}

function livePayload(extra?: Record<string, unknown>) {
  return {
    recenttracks: {
      track: [
        {
          artist: { "#text": "Future" },
          name: "Life Is Good (feat. Drake)",
          url: "https://www.last.fm/music/Future/_/Life+Is+Good+(feat.+Drake)",
          image: images(),
          "@attr": { nowplaying: "true" },
          ...extra,
        },
      ],
    },
  };
}

describe("parseRecentTracks", () => {
  it("parses a now-playing track", () => {
    const track = parseRecentTracks(livePayload(), NOW);
    assert.deepEqual(track, {
      live: true,
      title: "Life Is Good (feat. Drake)",
      artist: "Future",
      coverUrl: COVER,
      listenUrl: "https://www.last.fm/music/Future/_/Life+Is+Good+(feat.+Drake)",
      playedAgo: null,
    });
  });

  it("parses last played with a relative time", () => {
    const twoHoursAgo = Math.floor(NOW / 1000) - 2 * 3600;
    const data = {
      recenttracks: {
        track: [
          {
            artist: { mbid: "abc", "#text": "Future, Drake" },
            name: "Life Is Good (feat. Drake)",
            url: "https://www.last.fm/music/Future/_/Life+Is+Good+(feat.+Drake)",
            image: images(),
            date: { uts: String(twoHoursAgo), "#text": "26 Nov 2026, 16:00" },
          },
        ],
      },
    };
    const track = parseRecentTracks(data, NOW);
    assert.equal(track?.live, false);
    assert.equal(track?.playedAgo, "2h ago");
    assert.equal(track?.artist, "Future, Drake");
  });

  it("accepts a single track object instead of an array", () => {
    const data = {
      recenttracks: {
        track: {
          artist: "Future",
          name: "Life Is Good (feat. Drake)",
          url: "https://example.com/track",
          image: images(),
          "@attr": { nowplaying: true },
        },
      },
    };
    const track = parseRecentTracks(data, NOW);
    assert.equal(track?.live, true);
    assert.equal(track?.artist, "Future");
    assert.equal(track?.listenUrl, "https://example.com/track");
  });

  it("returns null cover when art is missing", () => {
    const track = parseRecentTracks(livePayload({ image: [] }), NOW);
    assert.equal(track?.coverUrl, null);
    assert.equal(track?.title, "Life Is Good (feat. Drake)");
  });

  it("treats the Last.fm star placeholder as missing art", () => {
    const track = parseRecentTracks(livePayload({ image: images({ star: true }) }), NOW);
    assert.equal(track?.coverUrl, null);
  });

  it("returns null for an empty response", () => {
    assert.equal(parseRecentTracks(undefined, NOW), null);
    assert.equal(parseRecentTracks({}, NOW), null);
    assert.equal(parseRecentTracks({ recenttracks: { track: [] } }, NOW), null);
    assert.equal(parseRecentTracks({ error: 6, message: "User not found" }, NOW), null);
  });

  it("returns null when title or artist is missing", () => {
    assert.equal(
      parseRecentTracks(
        { recenttracks: { track: [{ name: "Only title", artist: "", image: [] }] } },
        NOW,
      ),
      null,
    );
    assert.equal(
      parseRecentTracks(
        { recenttracks: { track: [{ artist: "Only artist", image: [] }] } },
        NOW,
      ),
      null,
    );
  });
});

describe("largestImage", () => {
  it("picks the highest size and skips placeholders", () => {
    assert.equal(largestImage(images()), COVER);
    assert.equal(largestImage(images({ star: true })), null);
    assert.equal(
      largestImage([
        { size: "small", "#text": STAR },
        { size: "mega", "#text": "https://cdn.example/mega.jpg" },
      ]),
      "https://cdn.example/mega.jpg",
    );
  });
});

describe("helpers", () => {
  it("detects the Last.fm placeholder", () => {
    assert.equal(isLastFmPlaceholder(STAR), true);
    assert.equal(isLastFmPlaceholder(COVER), false);
  });

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
