// Pure zoom/pan reducer for ComicViewer (Epic 5 / Story 5.1, follow-up fix).
//
// Extracted from the component so the state-transition contract is unit-tested
// (comic-viewer-state.test.ts) without pulling React/jsdom. The component feeds
// it increments/absolutes; this module owns the clamp math (delegated to zoom.ts).
//
// Two gesture modes drive it:
//   · PAN   — the component sends INCREMENTAL deltas (since the last move), so
//     `s.tx + dx` accumulates to true 1:1 finger tracking (no compounding).
//   · SET   — the pinch path sends the ABSOLUTE next state, computed from the
//     gesture-start snapshot (startLevel/startTx/startTy + focal), so a pinch
//     anchors to where the fingers began — no drift across pointermoves.

import {
  ZOOM_MIN,
  clampLevel,
  clampPanCentered,
  isFit,
  levelForFullView,
  toggleFullView,
  zoomByStep,
  zoomCenter,
} from '../site/zoom';

export interface ViewerState {
  level: number; // 1 = fit; >1 = zoomed (×fit)
  tx: number; // pan offset, screen px, centred origin
  ty: number;
  stageW: number; // measured stage (viewport) px
  stageH: number;
  naturalW: number; // strip intrinsic px (after img load)
}

export type Action =
  | { type: 'SET_STAGE'; w: number; h: number }
  | { type: 'SET_NATURAL'; w: number }
  | { type: 'SET'; level: number; tx: number; ty: number } // absolute (pinch)
  | { type: 'ZOOM_TO'; target: number; focal?: { x: number; y: number } }
  | { type: 'ZOOM_STEP'; sign: number; focal?: { x: number; y: number } }
  | { type: 'PAN'; dx: number; dy: number } // incremental deltas (drag/arrows)
  | { type: 'TOGGLE_FULL' }
  | { type: 'RESET' };

export const initialState: ViewerState = {
  level: ZOOM_MIN,
  tx: 0,
  ty: 0,
  stageW: 1,
  stageH: 1,
  naturalW: 0,
};

export function viewerReducer(s: ViewerState, a: Action): ViewerState {
  switch (a.type) {
    case 'SET_STAGE': {
      if (a.w === s.stageW && a.h === s.stageH) return s;
      const scaledX = a.w * s.level;
      const scaledY = a.h * s.level;
      return {
        ...s,
        stageW: a.w,
        stageH: a.h,
        tx: clampPanCentered(s.tx, scaledX, a.w),
        ty: clampPanCentered(s.ty, scaledY, a.h),
      };
    }
    case 'SET_NATURAL':
      return s.naturalW === a.w ? s : { ...s, naturalW: a.w };
    case 'SET': {
      // absolute (pinch). Component pre-clamps; re-clamp defensively + recentre at fit.
      const z2 = clampLevel(a.level);
      if (z2 === ZOOM_MIN) return { ...s, level: z2, tx: 0, ty: 0 };
      return { ...s, level: z2, tx: a.tx, ty: a.ty };
    }
    case 'ZOOM_TO': {
      const z2 = clampLevel(a.target);
      const fx = a.focal?.x ?? 0;
      const fy = a.focal?.y ?? 0;
      const scaledX = s.stageW * z2;
      const scaledY = s.stageH * z2;
      const ntx = clampPanCentered(zoomCenter(s.level, z2, s.tx, fx), scaledX, s.stageW);
      const nty = clampPanCentered(zoomCenter(s.level, z2, s.ty, fy), scaledY, s.stageH);
      if (z2 === ZOOM_MIN) return { ...s, level: z2, tx: 0, ty: 0 };
      return { ...s, level: z2, tx: ntx, ty: nty };
    }
    case 'ZOOM_STEP':
      return viewerReducer(s, {
        type: 'ZOOM_TO',
        target: zoomByStep(s.level, a.sign),
        focal: a.focal,
      });
    case 'PAN': {
      if (isFit(s.level)) return s; // nothing to pan at fit
      const scaledX = s.stageW * s.level;
      const scaledY = s.stageH * s.level;
      return {
        ...s,
        tx: clampPanCentered(s.tx + a.dx, scaledX, s.stageW),
        ty: clampPanCentered(s.ty + a.dy, scaledY, s.stageH),
      };
    }
    case 'TOGGLE_FULL': {
      const full = levelForFullView(s.stageW, s.naturalW);
      return { ...s, level: toggleFullView(s.level, full), tx: 0, ty: 0 };
    }
    case 'RESET':
      return { ...s, level: ZOOM_MIN, tx: 0, ty: 0 };
    default:
      return s;
  }
}