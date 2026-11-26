import {
  itunesArtworkUrl,
  parseRecentTracks,
  type TrackPayload,
} from "@/lib/now-playing";

const LASTFM_ENDPOINT = "https://ws.audioscrobbler.com/2.0/";
const ITUNES_ENDPOINT = "https://itunes.apple.com/search";

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

export async function getNowPlaying(): Promise<TrackPayload | null> {
  const apiKey = process.env.LASTFM_API_KEY;
  const user = process.env.LASTFM_USER;
  if (!apiKey || !user) return null;

  const params = new URLSearchParams({
    method: "user.getRecentTracks",
    user,
    api_key: apiKey,
    format: "json",
    limit: "1",
  });

  try {
    const res = await fetch(`${LASTFM_ENDPOINT}?${params.toString()}`, {
      next: { revalidate: 20 },
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    const track = parseRecentTracks(data);
    if (!track) return null;
    if (!track.coverUrl) {
      track.coverUrl = await lookupItunesArtwork(track.artist, track.title);
    }
    return track;
  } catch {
    return null;
  }
}
