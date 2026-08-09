// Unit tests for the ComicViewer reducer — the state-transition contract
// (Epic 5 / 5.1 follow-up: the wonky-zoom fix). Pure; no React, no jsdom.
//
// Pins the two gesture invariants the component relies on, which were the
// root cause of the "wonky / zooms too fast / no control" report:
//   · PAN takes INCREMENTAL deltas → 1:1 finger tracking (the old component bug
//     fed cumulative deltas into the additive reducer → compound runaway).
//   · SET applies an ABSOLUTE snapshot → a pinch anchors to gesture-start, so
//     the focal correction can't drift across pointermoves.

import { describe, it, expect } from 'vitest';
import { viewerReducer, initialState, type ViewerState } from './comic-viewer-state';

// A stage where the strip (640px natural) fits at container width 320 → 1:1 is 2×.
const stage640: ViewerState = { ...initialState, stageW: 320, stageH: 240, naturalW: 640 };

const zoomed = (over: Partial<ViewerState> = {}): ViewerState => ({
  ...stage640,
  level: 2,
  tx: 0,
  ty: 0,
  ...over,
});

describe('viewerReducer — PAN (incremental deltas → true 1:1 tracking)', () => {
  it('adds each delta to the running offset (compound-free accumulation)', () => {
    let s = zoomed(); // level 2, tx 0
    s = viewerReducer(s, { type: 'PAN', dx: 10, dy: 0 });
    expect(s.tx).toBe(10);
    s = viewerReducer(s, { type: 'PAN', dx: 10, dy: 0 }); // another +10
    expect(s.tx).toBe(20);
    s = viewerReducer(s, { type: 'PAN', dx: -5, dy: 0 });
    expect(s.tx).toBe(15);
  });
  it('clamps to the strip bounds (no overpan)', () => {
    // level 2, stage 320 → scaled 640, overflow 320, half = 160
    let s = zoomed();
    s = viewerReducer(s, { type: 'PAN', dx: 999, dy: 0 });
    expect(s.tx).toBe(160); // right edge flush
    s = viewerReducer(s, { type: 'PAN', dx: -999, dy: 0 });
    expect(s.tx).toBe(-160); // left edge flush
  });
  it('ignores pan at fit (the strip exactly fills the view)', () => {
    let s = stage640; // level 1
    s = viewerReducer(s, { type: 'PAN', dx: 50, dy: 50 });
    expect(s.tx).toBe(0);
    expect(s.ty).toBe(0);
  });
});

describe('viewerReducer — SET (absolute snapshot → pinch anchors to start)', () => {
  it('applies an absolute level/tx/ty verbatim (no compounding)', () => {
    const s = viewerReducer(zoomed({ tx: 40, ty: 10 }), {
      type: 'SET',
      level: 3,
      tx: 77,
      ty: -9,
    });
    expect(s).toEqual({ ...zoomed(), level: 3, tx: 77, ty: -9 });
  });
  it('recentres to fit when SET to level 1 (pinch-out past fit)', () => {
    const s = viewerReducer(zoomed({ tx: 100, ty: -50 }), {
      type: 'SET',
      level: 1,
      tx: 100,
      ty: -50,
    });
    expect(s.level).toBe(1);
    expect(s.tx).toBe(0);
    expect(s.ty).toBe(0);
  });
  it('references the SAME start snapshot across moves (the pinch contract)', () => {
    // simulate 3 consecutive pinch moves all anchored to startLevel=1, startTx=0,
    // focal=80 — each SET is computed from the start, so the tx tracks the ratio,
    // not the previous move's tx.
    let s = stage640; // start: level 1, tx 0
    s = viewerReducer(s, { type: 'SET', level: 1.5, tx: -40, ty: 0 });
    expect(s.tx).toBe(-40);
    s = viewerReducer(s, { type: 'SET', level: 1.9, tx: -72, ty: 0 });
    expect(s.tx).toBe(-72); // not -40 + extra
    s = viewerReducer(s, { type: 'SET', level: 1.5, tx: -40, ty: 0 });
    expect(s.tx).toBe(-40);
  });
});

describe('viewerReducer — ZOOM_STEP / ZOOM_TO / TOGGLE / RESET', () => {
  it('ZOOM_STEP in/out and floors at fit (never sub-fit)', () => {
    let s = stage640;
    s = viewerReducer(s, { type: 'ZOOM_STEP', sign: +1 });
    expect(s.level).toBe(1.25);
    s = viewerReducer(s, { type: 'ZOOM_STEP', sign: -1 });
    expect(s.level).toBe(1);
    s = viewerReducer(s, { type: 'ZOOM_STEP', sign: -1 }); // below fit
    expect(s.level).toBe(1);
  });
  it('ZOOM_TO recentres on the focal point, clamped to bounds', () => {
    // zoom 1→2 with focal x=80: zoomCenter(1,2,0,80) = -80, clamped by stage 320 / level 2…
    const s = viewerReducer(stage640, { type: 'ZOOM_TO', target: 2, focal: { x: 80, y: 0 } });
    expect(s.level).toBe(2);
    expect(s.tx).toBe(-80);
  });
  it('TOGGLE_FULL goes fit → 1:1 (640/320 = 2×) and back', () => {
    let s = stage640;
    s = viewerReducer(s, { type: 'TOGGLE_FULL' });
    expect(s.level).toBe(2);
    s = viewerReducer(s, { type: 'TOGGLE_FULL' });
    expect(s.level).toBe(1);
  });
  it('RESET returns to fit + recentred', () => {
    const s = viewerReducer(zoomed({ tx: 120, ty: -50 }), { type: 'RESET' });
    expect(s).toEqual({ ...zoomed(), level: 1, tx: 0, ty: 0 });
  });
});