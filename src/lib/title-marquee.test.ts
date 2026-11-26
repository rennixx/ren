import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MARQUEE_PAUSE_MS,
  MARQUEE_SPEED_PX_PER_SEC,
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

describe("marqueeTiming", () => {
  it("uses ~35 px/s travel and a 1.75s pause at each end", () => {
    const overflow = 140;
    const timing = marqueeTiming(overflow);
    const expectedTravel = (overflow / MARQUEE_SPEED_PX_PER_SEC) * 1000;
    assert.equal(timing.travelMs, expectedTravel);
    assert.equal(timing.pauseMs, MARQUEE_PAUSE_MS);
    assert.equal(timing.durationMs, 2 * expectedTravel + 2 * MARQUEE_PAUSE_MS);
    assert.ok(expectedTravel / overflow === 1000 / 35);
    assert.ok(MARQUEE_SPEED_PX_PER_SEC >= 30 && MARQUEE_SPEED_PX_PER_SEC <= 40);
    assert.ok(MARQUEE_PAUSE_MS >= 1500 && MARQUEE_PAUSE_MS <= 2000);
  });

  it("places hold stops so the title rests at each end before reversing", () => {
    const timing = marqueeTiming(140);
    assert.equal(timing.startHoldEnd, timing.pauseMs / timing.durationMs);
    assert.equal(timing.endHoldStart, (timing.pauseMs + timing.travelMs) / timing.durationMs);
    assert.equal(timing.endHoldEnd, (2 * timing.pauseMs + timing.travelMs) / timing.durationMs);
    assert.ok(timing.startHoldEnd < timing.endHoldStart);
    assert.ok(timing.endHoldStart < timing.endHoldEnd);
    assert.ok(timing.endHoldEnd < 1);
  });

  it("does not schedule travel when the title fits", () => {
    const timing = marqueeTiming(0);
    assert.equal(timing.travelMs, 0);
    assert.equal(timing.durationMs, 2 * MARQUEE_PAUSE_MS);
  });
});

describe("marqueeKeyframes", () => {
  it("ping-pongs by the measured overflow and holds at both ends", () => {
    const timing = marqueeTiming(87.5);
    const css = marqueeKeyframes("np-title-0", 87.5, timing);
    // 87.5px at 35 px/s = 2.5s travel; 1.75s pauses → 8.5s cycle (20.588 / 50 / 70.588).
    assert.equal(
      css,
      "@keyframes np-title-0 { 0%, 20.588% { transform: translateX(0); } 50.000%, 70.588% { transform: translateX(-87.50px); } 100% { transform: translateX(0); } }",
    );
    assert.equal(timing.durationMs, 8500);
  });
});
