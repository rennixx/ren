export const MARQUEE_SPEED_PX_PER_SEC = 35;
export const MARQUEE_PAUSE_MS = 1750;
export const MARQUEE_OVERFLOW_EPSILON_PX = 1;

export type MarqueeTiming = {
  travelMs: number;
  pauseMs: number;
  durationMs: number;
  startHoldEnd: number;
  endHoldStart: number;
  endHoldEnd: number;
};

/** Full-text width minus the visible viewport. Values within the epsilon count as a fit. */
export function measureTitleOverflow(
  scrollWidth: number,
  clientWidth: number,
  epsilonPx: number = MARQUEE_OVERFLOW_EPSILON_PX,
): number {
  if (!Number.isFinite(scrollWidth) || !Number.isFinite(clientWidth) || !Number.isFinite(epsilonPx)) {
    return 0;
  }
  const overflow = scrollWidth - Math.max(0, clientWidth);
  return overflow > epsilonPx ? overflow : 0;
}

export function shouldScrollTitle(overflowPx: number, reducedMotion: boolean): boolean {
  return overflowPx > 0 && !reducedMotion;
}

export function marqueeTiming(
  overflowPx: number,
  speedPxPerSec: number = MARQUEE_SPEED_PX_PER_SEC,
  pauseMs: number = MARQUEE_PAUSE_MS,
): MarqueeTiming {
  const speed = speedPxPerSec > 0 ? speedPxPerSec : MARQUEE_SPEED_PX_PER_SEC;
  const pause = Math.max(0, pauseMs);
  const travelMs = overflowPx > 0 ? (overflowPx / speed) * 1000 : 0;
  const durationMs = 2 * travelMs + 2 * pause;
  if (durationMs <= 0) {
    return {
      travelMs,
      pauseMs: pause,
      durationMs: 0,
      startHoldEnd: 0,
      endHoldStart: 0.5,
      endHoldEnd: 0.5,
    };
  }
  return {
    travelMs,
    pauseMs: pause,
    durationMs,
    startHoldEnd: pause / durationMs,
    endHoldStart: (pause + travelMs) / durationMs,
    endHoldEnd: (2 * pause + travelMs) / durationMs,
  };
}

export function marqueeKeyframes(name: string, overflowPx: number, timing: MarqueeTiming): string {
  const dist = `${overflowPx.toFixed(2)}px`;
  const holdStart = (timing.startHoldEnd * 100).toFixed(3);
  const holdEndFrom = (timing.endHoldStart * 100).toFixed(3);
  const holdEndTo = (timing.endHoldEnd * 100).toFixed(3);
  return `@keyframes ${name} { 0%, ${holdStart}% { transform: translateX(0); } ${holdEndFrom}%, ${holdEndTo}% { transform: translateX(-${dist}); } 100% { transform: translateX(0); } }`;
}
