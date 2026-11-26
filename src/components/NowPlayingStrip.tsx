"use client";

import { useEffect, useId, useMemo, useState, useSyncExternalStore } from "react";
import { hasProgress, resolvePlayback, type NowPlayingPayload, type ProgressAnchor, type TrackPayload } from "@/lib/now-playing";
import { applyNowPlayingUpdate, initialDisplayState } from "@/lib/now-playing-state";

const POLL_MS = 10_000;
const BAR_COUNT = 5;
const SCALE_MIN = 0.27;
const SCALE_MAX = 1;
const BAR_COLORS = ["gold", "mint", "gold", "gold", "mint"] as const;

function hashSeed(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type BarMotion = {
  name: string;
  duration: string;
  delay: string;
  keyframes: string;
  rest: number;
  color: (typeof BAR_COLORS)[number];
};

function motionForTrack(seed: string, prefix: string): BarMotion[] {
  const rand = mulberry32(hashSeed(seed));
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const start = SCALE_MIN + rand() * 0.35;
    const mid = [0, 1, 2].map(() => SCALE_MIN + rand() * (SCALE_MAX - SCALE_MIN));
    const scales = [start, ...mid, start];
    const steps = ["0%", "25%", "50%", "75%", "100%"]
      .map((pct, j) => `${pct} { transform: scaleY(${scales[j]!.toFixed(3)}); }`)
      .join(" ");
    const name = `${prefix}-${i}`;
    const duration = 0.85 + rand() * 0.95;
    const delay = -(rand() * duration);
    return {
      name,
      duration: `${duration.toFixed(3)}s`,
      delay: `${delay.toFixed(3)}s`,
      keyframes: `@keyframes ${name} { ${steps} }`,
      rest: SCALE_MIN + rand() * 0.18,
      color: BAR_COLORS[i]!,
    };
  });
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

function subscribeNow(onChange: () => void) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }
  const id = window.setInterval(onChange, 250);
  return () => window.clearInterval(id);
}

function subscribeIdle() {
  return () => {};
}

function useProgressRatio(
  track: TrackPayload | null,
  receivedAt: number | null,
  anchor: ProgressAnchor | null,
): number | null {
  const playing = Boolean(track && hasProgress(track) && track.isPlaying);
  const serverNow = track?.serverNow ?? 0;
  const now = useSyncExternalStore(
    playing ? subscribeNow : subscribeIdle,
    () => Date.now(),
    () => serverNow,
  );
  if (!track) return null;
  return resolvePlayback(track, now, receivedAt ?? now, anchor).position?.ratio ?? null;
}

function ProgressHairline({ ratio }: { ratio: number }) {
  const pct = Math.round(ratio * 1000) / 10;
  return (
    <div
      className="mt-1 h-0.5 w-full overflow-hidden rounded-full bg-line"
      aria-hidden="true"
      data-progress={String(pct)}
    >
      <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
    </div>
  );
}

function Equaliser({ seed, playing }: { seed: string; playing: boolean }) {
  const prefix = `np-eq-${useId().replace(/:/g, "")}`;
  const reduced = useReducedMotion();
  const bars = useMemo(() => motionForTrack(seed, prefix), [seed, prefix]);
  const animate = playing && !reduced;

  return (
    <span className="now-playing-eq" aria-hidden="true">
      <style>{bars.map((bar) => bar.keyframes).join("\n")}</style>
      {bars.map((bar) => (
        <i
          key={bar.name}
          className={bar.color === "mint" ? "is-mint" : undefined}
          style={
            animate
              ? {
                  animationName: bar.name,
                  animationDuration: bar.duration,
                  animationDelay: bar.delay,
                  animationTimingFunction: "ease-in-out",
                  animationIterationCount: "infinite",
                }
              : { transform: `scaleY(${bar.rest.toFixed(3)})`, animation: "none" }
          }
        />
      ))}
    </span>
  );
}

export function NowPlayingStrip({ initial }: { initial: NowPlayingPayload | null }) {
  const [state, setState] = useState(() => initialDisplayState(initial));
  const [receivedAt, setReceivedAt] = useState<number | null>(null);
  const [anchor, setAnchor] = useState<ProgressAnchor | null>(null);
  const track = state.track;

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function poll() {
      try {
        const res = await fetch("/api/now-playing", { cache: "no-store" });
        if (cancelled) return;
        if (!res.ok) {
          setState((prev) => applyNowPlayingUpdate(prev, { type: "error" }, Date.now()));
          return;
        }
        const data = (await res.json()) as NowPlayingPayload;
        if (cancelled) return;
        const now = Date.now();
        setState((prev) => applyNowPlayingUpdate(prev, { type: "payload", payload: data }, now));
        if (data.status !== "unknown") {
          setReceivedAt(now);
          if (data.status === "live" || data.status === "paused") {
            setAnchor((prev) => resolvePlayback(data, now, now, prev).anchor);
          } else {
            setAnchor(null);
          }
        }
      } catch {
        setState((prev) => applyNowPlayingUpdate(prev, { type: "error" }, Date.now()));
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

  const ratio = useProgressRatio(track, receivedAt, anchor);

  if (!track) return null;

  const seed = track.listenUrl ?? `${track.title}|${track.artist}`;

  return (
    <aside
      className="mb-8 ml-auto w-fit max-w-[65vw] min-[481px]:mb-10 min-[481px]:max-w-[22rem] sm:mb-12 sm:max-w-[28rem]"
      aria-label={track.live ? "Now playing" : "Last played"}
    >
      <div className="flex items-start gap-2 min-[481px]:gap-2.5">
        {track.coverUrl ? (
          // External stats.fm / iTunes / Spotify hosts vary, so a plain img is used on purpose.
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
          {ratio != null ? <ProgressHairline ratio={ratio} /> : null}
          <p className="mt-0.5 flex flex-nowrap items-center gap-x-2 text-[11px] leading-4 text-muted min-[481px]:mt-1 min-[481px]:gap-x-2.5 min-[481px]:text-[12px] min-[481px]:leading-5">
            {track.live ? (
              <Equaliser seed={seed} playing={track.isPlaying} />
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
