export const MARQUEE_SPEED_PX_PER_SEC = 35;
export const MARQUEE_PAUSE_MS = 1500;
export const MARQUEE_OVERFLOW_EPSILON_PX = 1;
export const MARQUEE_GAP_EM = 2.75;

export type MarqueeTiming = {
  travelMs: number;
  pauseMs: number;
  durationMs: number;
  startHoldEnd: number;
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

/** Distance of one loop: the first copy plus the gap before the duplicate. */
export function marqueeCycleWidth(textWidth: number, gapPx: number): number {
  if (!Number.isFinite(textWidth) || !Number.isFinite(gapPx) || textWidth <= 0) {
    return 0;
  }
  return textWidth + Math.max(0, gapPx);
}

export function gapPxFromEm(fontSizePx: number, gapEm: number = MARQUEE_GAP_EM): number {
  if (!Number.isFinite(fontSizePx) || fontSizePx <= 0 || !Number.isFinite(gapEm) || gapEm < 0) {
    return 0;
  }
  return fontSizePx * gapEm;
}

export function marqueeTiming(
  cycleWidthPx: number,
  speedPxPerSec: number = MARQUEE_SPEED_PX_PER_SEC,
  pauseMs: number = MARQUEE_PAUSE_MS,
): MarqueeTiming {
  const speed = speedPxPerSec > 0 ? speedPxPerSec : MARQUEE_SPEED_PX_PER_SEC;
  const pause = Math.max(0, pauseMs);
  const travelMs = cycleWidthPx > 0 ? (cycleWidthPx / speed) * 1000 : 0;
  const durationMs = travelMs + pause;
  if (durationMs <= 0) {
    return { travelMs, pauseMs: pause, durationMs: 0, startHoldEnd: 0 };
  }
  return {
    travelMs,
    pauseMs: pause,
    durationMs,
    startHoldEnd: pause / durationMs,
  };
}

/** One-direction loop: hold at the start, then translate by exactly one cycle. */
export function marqueeKeyframes(name: string, cycleWidthPx: number, timing: MarqueeTiming): string {
  const dist = `${cycleWidthPx.toFixed(2)}px`;
  if (timing.pauseMs <= 0 || timing.startHoldEnd <= 0) {
    return `@keyframes ${name} { 0% { transform: translateX(0); } 100% { transform: translateX(-${dist}); } }`;
  }
  const holdStart = (timing.startHoldEnd * 100).toFixed(3);
  return `@keyframes ${name} { 0%, ${holdStart}% { transform: translateX(0); } 100% { transform: translateX(-${dist}); } }`;
}
