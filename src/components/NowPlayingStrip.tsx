"use client";

import { useEffect, useState } from "react";
import type { TrackPayload } from "@/lib/now-playing";

const POLL_MS = 30_000;

function Equaliser() {
  return (
    <span className="now-playing-eq" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

export function NowPlayingStrip({ initial }: { initial: TrackPayload | null }) {
  const [track, setTrack] = useState(initial);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function poll() {
      try {
        const res = await fetch("/api/now-playing", { cache: "no-store" });
        if (cancelled) return;
        if (res.status === 204) {
          setTrack(null);
          return;
        }
        if (!res.ok) return;
        const data = (await res.json()) as TrackPayload;
        if (!cancelled) setTrack(data);
      } catch {
        // Keep the last good payload so a blip does not collapse the layout.
      }
    }

    function schedule() {
      clearTimeout(timer);
      if (document.visibilityState !== "visible") return;
      timer = setTimeout(() => {
        void poll().then(() => {
          if (!cancelled) schedule();
        });
      }, POLL_MS);
    }

    function onVisibility() {
      if (document.visibilityState === "visible") {
        void poll().then(() => {
          if (!cancelled) schedule();
        });
      } else {
        clearTimeout(timer);
      }
    }

    document.addEventListener("visibilitychange", onVisibility);
    if (document.visibilityState === "visible") {
      void poll().then(() => {
        if (!cancelled) schedule();
      });
    }

    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  if (!track) return null;

  return (
    <aside
      className="mb-10 ml-auto w-fit max-w-full sm:mb-12"
      aria-label={track.live ? "Now playing" : "Last played"}
    >
      <div className="flex max-w-[22rem] items-start gap-2.5 sm:max-w-[28rem]">
        {track.coverUrl ? (
          // External Last.fm / iTunes hosts vary, so a plain img is used on purpose.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={track.coverUrl}
            alt=""
            width={44}
            height={44}
            className="size-11 shrink-0 rounded-[2px] object-cover object-top"
          />
        ) : null}
        <div className="min-w-0">
          <p className="text-[13px] leading-5 text-ink">
            <span className="font-medium">{track.title}</span>
            <span className="text-muted"> · {track.artist}</span>
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] leading-5 text-muted">
            {track.live ? (
              <>
                <Equaliser />
                <span className="inline-flex rounded-full border border-mint/60 px-2 py-px text-[11px] leading-5 text-mint">
                  live
                </span>
              </>
            ) : (
              <span>Last played · {track.playedAgo}</span>
            )}
            {track.listenUrl ? (
              <a
                href={track.listenUrl}
                target="_blank"
                rel="noreferrer"
                className="text-ink underline decoration-line underline-offset-4 hover:text-gold hover:decoration-gold"
              >
                listen
              </a>
            ) : null}
          </p>
        </div>
      </div>
    </aside>
  );
}
