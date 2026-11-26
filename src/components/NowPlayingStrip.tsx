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
      className="mb-8 ml-auto w-fit max-w-[65vw] min-[481px]:mb-10 min-[481px]:max-w-[22rem] sm:mb-12 sm:max-w-[28rem]"
      aria-label={track.live ? "Now playing" : "Last played"}
    >
      <div className="flex items-start gap-2 min-[481px]:gap-2.5">
        {track.coverUrl ? (
          // External Last.fm / iTunes hosts vary, so a plain img is used on purpose.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={track.coverUrl}
            alt=""
            width={44}
            height={44}
            className="size-8 shrink-0 rounded-[2px] object-cover object-top min-[481px]:size-11"
          />
        ) : null}
        <div className="min-w-0">
          <p
            className="truncate text-[12px] leading-4 text-ink min-[481px]:text-[13px] min-[481px]:leading-5"
            title={`${track.title} · ${track.artist}`}
          >
            <span className="font-medium">{track.title}</span>
            <span className="hidden text-muted min-[481px]:inline"> · {track.artist}</span>
          </p>
          <p className="mt-0.5 flex flex-nowrap items-center gap-x-2 text-[11px] leading-4 text-muted min-[481px]:mt-1 min-[481px]:gap-x-2.5 min-[481px]:text-[12px] min-[481px]:leading-5">
            {track.live ? (
              <>
                <Equaliser />
                <span className="inline-flex rounded-full border border-mint/60 px-1.5 py-px text-[10px] leading-4 text-mint min-[481px]:px-2 min-[481px]:text-[11px] min-[481px]:leading-5">
                  live
                </span>
              </>
            ) : (
              <span className="whitespace-nowrap">Last played · {track.playedAgo}</span>
            )}
            {track.listenUrl ? (
              <a
                href={track.listenUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-ink underline decoration-line underline-offset-4 hover:text-gold hover:decoration-gold"
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
