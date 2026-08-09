// Pure zoom/pan math for the Comic viewer (Epic 5 / Story 5.1 / FR-16).
//
// The ComicViewer component measures the strip's intrinsic + displayed sizes
// and feeds them here; the below functions are DOM-agnostic and unit-tested
// (zoom.test.ts). The interaction contract (EXPERIENCE.md §Comic Presentation):
//   fit (default) → toggle zoom → free zoom (pinch / Ctrl+wheel / +/−) →
//   drag/arrow pan confined to strip bounds → Reset/0/Esc.
//
// Conventions
//  · `level` is the zoom applied on top of CSS fit (1 = fit; >1 zoomed). CSS
//    lays the strip at `width:100%` (= displayed fit width); `transform:
//    scale(level) translate(...)` enlarges on top of that — `transform` does
//    not change layout box, so the stage stays fit-sized and clips overflow.
//  · Pan offsets are screen px relative to the centered strip; the allowed
//    range keeps BOTH edges within the view (no overpan into chrome).

export const ZOOM_MIN = 1; // fit — the resting state (no transform beyond CSS)
export const ZOOM_MAX = 5; // upper sanity bound (still readable lettering)
export const ZOOM_STEP = 0.25; // on-screen +/− and keyboard +/− step (×fit)
export const PAN_KEY_STEP = 40; // arrow-key pan nudge (CSS px)
export const AUTO_HIDE_MS = 2500; // inactivity auto-hide for the controls (≈2.5s)
export const ZOOM_TRANSITION_MS = 150; // CSS transform transition (discrete zooms)

/** snap to 2 decimals to avoid float drift across repeated wheel/tap zooms. */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Clamp `value` into the inclusive [min, max] range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Snap a zoom level into the [ZOOM_MIN, ZOOM_MAX] range. */
export function clampLevel(level: number): number {
  return round2(clamp(level, ZOOM_MIN, ZOOM_MAX));
}

/** Zoom in (+) or out (−) by ZOOM_STEP, clamped. `sign` = +1 | −1. */
export function zoomByStep(level: number, sign: number): number {
  return clampLevel(level + ZOOM_STEP * Math.sign(sign));
}

/**
 * Clamp a centered-origin pan offset so both strip edges stay inside the view.
 * @param pos    current offset along one axis (screen px, centered origin)
 * @param scaled the strip's displayed size along that axis at the current zoom
 * @param view   the viewer (stage) size along that axis
 * @returns clamped offset in [−overflow/2, +overflow/2] (0 when it fits)
 */
export function clampPanCentered(pos: number, scaled: number, view: number): number {
  const overflow = Math.max(0, scaled - view); // how far past the view
  return clamp(pos, -overflow / 2, overflow / 2);
}

/**
 * The zoom level that renders the strip at its NATURAL (1:1) size, given the
 * CSS fit width. CSS `width:100%` lays the strip at `containerWidth`; to
 * display `naturalWidth` px we scale by `naturalWidth / containerWidth`.
 * Clamped to [ZOOM_MIN, ZOOM_MAX] so a strip already fitting at/above 1:1
 * stays at fit (no over-shrink — a positive zoom to read lettering, never a
 * shrink toward the toggle).
 */
export function levelForFullView(containerWidth: number, naturalWidth: number): number {
  if (containerWidth <= 0 || naturalWidth <= 0) return ZOOM_MIN;
  const full = naturalWidth / containerWidth;
  return full <= ZOOM_MIN ? ZOOM_MIN : clampLevel(full);
}

/** Is the viewer at fit (resting)? */
export function isFit(level: number): boolean {
  return round2(level) <= ZOOM_MIN;
}

/** Toggle between fit (1) and the 1:1 full-view level (or back to fit). */
export function toggleFullView(level: number, fullLevel: number): number {
  return isFit(level) ? fullLevel : ZOOM_MIN;
}

/**
 * Correct a pan offset so a focal point stays under the same screen position
 * after a zoom change (zoom grows toward the cursor / pinch centre). Pure.
 * @param oldLevel prior zoom
 * @param newLevel next zoom
 * @param pos      current centered-origin pan offset (screen px)
 * @param focal    focal offset from the strip centre (screen px)
 * @returns the new centered-origin pan offset that keeps `focal` pinned
 */
export function zoomCenter(oldLevel: number, newLevel: number, pos: number, focal: number): number {
  if (oldLevel === 0) return pos; // guard (never in practice)
  return pos * (newLevel / oldLevel) + focal * (1 - newLevel / oldLevel);
}