import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MARQUEE_GAP_EM,
  MARQUEE_PAUSE_MS,
  MARQUEE_SPEED_PX_PER_SEC,
  gapPxFromEm,
  marqueeCycleWidth,
  marqueeKeyframes,
  marqueeTiming,
  measureTitleOverflow,
  shouldScrollTitle,
} from "./title-marquee";

describe("measureTitleOverflow", () => {
  it("returns 0 when the title fits", () => {
    assert.equal(measureTitleOverflow(180, 200), 0);
    assert.equal(measureTitleOverflow(200, 200), 0);
  });

  it("returns 0 when the overflow is only sub-pixel noise", () => {
    assert.equal(measureTitleOverflow(200.4, 200), 0);
    assert.equal(measureTitleOverflow(201, 200), 0);
    assert.equal(measureTitleOverflow(201.5, 200), 1.5);
  });

  it("returns the overflow in pixels when the title is too long", () => {
    assert.equal(measureTitleOverflow(320, 200), 120);
  });

  it("treats a missing or invalid box as no overflow", () => {
    assert.equal(measureTitleOverflow(Number.NaN, 200), 0);
    assert.equal(measureTitleOverflow(320, Number.NaN), 0);
    assert.equal(measureTitleOverflow(320, -40), 320);
  });
});

describe("shouldScrollTitle", () => {
  it("scrolls only when the title overflows and motion is allowed", () => {
    assert.equal(shouldScrollTitle(120, false), true);
    assert.equal(shouldScrollTitle(0, false), false);
    assert.equal(shouldScrollTitle(120, true), false);
    assert.equal(shouldScrollTitle(0, true), false);
  });
});

describe("marqueeCycleWidth", () => {
  it("adds the gap to the text width", () => {
    assert.equal(marqueeCycleWidth(406, 35.75), 441.75);
    assert.equal(gapPxFromEm(13), 13 * MARQUEE_GAP_EM);
    assert.ok(MARQUEE_GAP_EM >= 2.5 && MARQUEE_GAP_EM <= 3);
  });

  it("returns 0 without a usable text width", () => {
    assert.equal(marqueeCycleWidth(0, 35), 0);
    assert.equal(marqueeCycleWidth(Number.NaN, 35), 0);
    assert.equal(marqueeCycleWidth(406, Number.NaN), 0);
    assert.equal(marqueeCycleWidth(406, -8), 406);
  });
});

describe("marqueeTiming", () => {
  it("uses ~35 px/s travel and a 1.5s pause at the start of each cycle", () => {
    const cycle = 350;
    const timing = marqueeTiming(cycle);
    const expectedTravel = (cycle / MARQUEE_SPEED_PX_PER_SEC) * 1000;
    assert.equal(timing.travelMs, expectedTravel);
    assert.equal(timing.pauseMs, MARQUEE_PAUSE_MS);
    assert.equal(timing.durationMs, expectedTravel + MARQUEE_PAUSE_MS);
    assert.equal(timing.startHoldEnd, MARQUEE_PAUSE_MS / timing.durationMs);
    assert.ok(MARQUEE_SPEED_PX_PER_SEC >= 30 && MARQUEE_SPEED_PX_PER_SEC <= 40);
    assert.ok(MARQUEE_PAUSE_MS >= 1500 && MARQUEE_PAUSE_MS <= 2000);
  });

  it("does not schedule travel when the cycle width is 0", () => {
    const timing = marqueeTiming(0);
    assert.equal(timing.travelMs, 0);
    assert.equal(timing.durationMs, MARQUEE_PAUSE_MS);
    assert.equal(timing.startHoldEnd, 1);
  });
});

describe("marqueeKeyframes", () => {
  it("loops one cycle left and holds only at the start, never reversing", () => {
    const cycle = 350;
    const timing = marqueeTiming(cycle);
    const css = marqueeKeyframes("np-title-0", cycle, timing);
    // 350px at 35 px/s = 10s travel; 1.5s start pause → 11.5s cycle (13.043%).
    assert.equal(
      css,
      "@keyframes np-title-0 { 0%, 13.043% { transform: translateX(0); } 100% { transform: translateX(-350.00px); } }",
    );
    assert.equal(timing.durationMs, 11500);
    assert.doesNotMatch(css, /translateX\(0\)\}.*100%/);
    assert.equal((css.match(/translateX/g) ?? []).length, 2);
  });

  it("omits the start hold when the pause is 0", () => {
    const timing = marqueeTiming(175, 35, 0);
    assert.equal(
      marqueeKeyframes("np-title-0", 175, timing),
      "@keyframes np-title-0 { 0% { transform: translateX(0); } 100% { transform: translateX(-175.00px); } }",
    );
  });
});
