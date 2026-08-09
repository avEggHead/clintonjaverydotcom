// Unit tests for the Comic viewer zoom/pan math (Epic 5 / Story 5.1 / FR-16).
// Pure functions — no DOM, no jsdom (mirrors head-meta/validate test style).
// The interaction contract this pins: fit (1) ≳ free zoom ≲ ZOOM_MAX; pan
// confined to strip bounds (no overpan); 1:1 toggle; focal stays under cursor;
// ≈2.5s auto-hide. (Interaction gesture wiring is the component's manual smoke.)

import { describe, it, expect } from 'vitest';
import {
  clamp,
  clampLevel,
  zoomByStep,
  clampPanCentered,
  levelForFullView,
  isFit,
  toggleFullView,
  zoomCenter,
  ZOOM_MIN,
  ZOOM_MAX,
  ZOOM_STEP,
  PAN_KEY_STEP,
  AUTO_HIDE_MS,
} from './zoom';

describe('zoom math — constants & clamp', () => {
  it('fit is level 1 (the resting default)', () => {
    expect(ZOOM_MIN).toBe(1);
    expect(isFit(1)).toBe(true);
    expect(isFit(1.24)).toBe(false);
  });
  it('AUTO_HIDE_MS ≈ 2.5s (controls auto-hide, FR-16)', () => {
    expect(AUTO_HIDE_MS).toBe(2500);
  });
  it('PAN_KEY_STEP is a positive nudge (arrow-key pan)', () => {
    expect(PAN_KEY_STEP).toBe(40);
  });
  it('clamp keeps a value inside [min,max]', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
    expect(clamp(7, -3, -1)).toBe(-1);
  });
  it('clampLevel snaps to [ZOOM_MIN, ZOOM_MAX] and rounds 2dp', () => {
    expect(clampLevel(0)).toBe(ZOOM_MIN);
    expect(clampLevel(ZOOM_MAX + 3)).toBe(ZOOM_MAX);
    expect(clampLevel(1.2367)).toBe(1.24);
  });
});

describe('zoom math — step zoom (+/− and keyboard)', () => {
  it('zooms in by ZOOM_STEP', () => {
    expect(zoomByStep(1, +1)).toBe(1.25);
    expect(zoomByStep(1.25, +1)).toBe(1.5);
  });
  it('zooms out by ZOOM_STEP and floors at fit (never below 1)', () => {
    expect(zoomByStep(1.5, -1)).toBe(1.25);
    expect(zoomByStep(1.25, -1)).toBe(ZOOM_MIN); // never sub-fit
    expect(zoomByStep(ZOOM_MIN, -1)).toBe(ZOOM_MIN);
  });
  it('caps at ZOOM_MAX', () => {
    expect(zoomByStep(ZOOM_MAX, +1)).toBe(ZOOM_MAX);
  });
  it('ZOOM_STEP + ZOOM_MAX keep readable range (0.25 ≤, ≤5)', () => {
    expect(ZOOM_STEP).toBe(0.25);
    expect(ZOOM_MAX).toBe(5);
  });
});

describe('zoom math — 1:1 full-view level', () => {
  it('returns >1 when the strip is wider than the container (zoom-to-natural)', () => {
    expect(levelForFullView(320, 640)).toBe(2);
    expect(levelForFullView(400, 1000)).toBe(2.5);
  });
  it('stays at fit when already at/above 1:1 (no shrink on toggle)', () => {
    expect(levelForFullView(640, 320)).toBe(ZOOM_MIN); // container wider → 1:1 < fit; clamp up
    expect(levelForFullView(320, 320)).toBe(ZOOM_MIN);
  });
  it('is DOM-safe on zero sizes', () => {
    expect(levelForFullView(0, 100)).toBe(ZOOM_MIN);
    expect(levelForFullView(100, 0)).toBe(ZOOM_MIN);
  });
});

describe('zoom math — fit ↔ full toggle', () => {
  it('from fit toggles to the full-view level', () => {
    expect(toggleFullView(ZOOM_MIN, 2)).toBe(2);
  });
  it('from anywhere above fit toggles back to fit (single tap/click reset)', () => {
    expect(toggleFullView(2, 2)).toBe(ZOOM_MIN);
    expect(toggleFullView(1.5, 2)).toBe(ZOOM_MIN);
  });
});

describe('zoom math — pan bounded to strip (no overpan into chrome)', () => {
  it('a 1:1 fit strip has no pan range (strip = view)', () => {
    expect(clampPanCentered(0, 320, 320)).toBe(0);
    expect(clampPanCentered(20, 320, 320)).toBe(0); // brute nudge reset
  });
  it('a zoomed strip clamps to ±overflow/2 (both edges stay in view)', () => {
    const view = 320;
    const scaled = 640; // 2× zoom → overflow = 320, half = 160
    expect(clampPanCentered(0, scaled, view)).toBe(0);
    expect(clampPanCentered(100, scaled, view)).toBe(100); // within range
    expect(clampPanCentered(200, scaled, view)).toBe(160); // clamp right
    expect(clampPanCentered(-200, scaled, view)).toBe(-160); // clamp left
  });
  it('negative overflow impossible: a smaller-than-view strip centres (0)', () => {
    expect(clampPanCentered(50, 200, 320)).toBe(0); // strip under view → recentre
    expect(clampPanCentered(50, 320, 320)).toBe(0);
  });
});

describe('zoom math — focal-centre correction (cursor stays under pointer)', () => {
  it('keeps the focal point pinned when zooming in', () => {
    // focal = 80 (cursor right of centre), pos = 0, 1×→2× about the cursor.
    const pos2 = zoomCenter(1, 2, 0, 80);
    // pos2 = 0*(2) + 80*(1 - 2) = -80 → the strip shifts left so the world
    // point under the cursor stays put (geometric check: w=(80-0)/1=80;
    // after z=2: pos2 + 2·80 = 80 → pos2 = -80).
    expect(pos2).toBe(-80);
  });
  it('round-trips back to centre when zooming out about the same focal', () => {
    // Take the zoomed state from above (pos=-80, focal=80) and zoom 2×→1×.
    const pos2 = zoomCenter(2, 1, -80, 80);
    // -80*(0.5) + 80*(1 - 0.5) = -40 + 40 = 0 → recentred, as fit should be.
    expect(pos2).toBe(0);
  });
  it('keeps the focal point pinned on a partial zoom-out', () => {
    // pos=-160, focal=80, 2×→1× → -160*(0.5)+80*0.5 = -80+40 = -40.
    expect(zoomCenter(2, 1, -160, 80)).toBe(-40);
  });
  it('no zoom change → offset unchanged', () => {
    expect(zoomCenter(2, 2, 47, -12)).toBe(47);
  });
  it('guard against old=0 returns the offset rather than NaN', () => {
    expect(zoomCenter(0, 2, 30, 5)).toBe(30);
  });
});