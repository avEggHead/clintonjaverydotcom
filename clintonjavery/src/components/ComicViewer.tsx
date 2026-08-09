// ComicViewer — the Epic 5 / Story 5.1 / FR-16 zoom & pan surface.
//
// A dark `bg-ink-surface` stage presenting a single finished Strip `<img>`
// (edge-to-edge, no rounded mask on the artwork — DESIGN.md). The interaction
// contract (EXPERIENCE.md §Comic Presentation, simplified per author feedback):
//   • fit (default) — strip scaled to container width; tall strips scroll with
//     the page (the stage grows to the strip; `transform` doesn't change the
//     layout box, so at fit there is nothing to clip).
//   • toggle — single tap (touch) / single click (pointer) / the on-screen
//     Zoom button flips fit ↔ 100% (1:1). A debounce coalesces a fast double.
//   • free zoom — pinch (touch) / `Ctrl+wheel` (pointer) / keyboard +/−.
//     Bare wheel keeps the page scrolling (resolved decision).
//   • pan — drag (touch or pointer) or arrow keys, confined to the strip
//     bounds (no overpan into chrome). Drag tracks the finger 1:1.
//   • reset — the on-screen Fit button (when zoomed), `0`, or `Esc`.
//   • chrome — a single bottom-right Zoom/Fit toggle; reveal on hover (pointer) /
//     tap / focus, auto-hide after ~2.5s; stays keyboard-focusable & in-tab-order
//     while visually hidden (never `display:none`).
//   • focus never traps — Tab moves past the viewer.
//   • reduced motion — zoom transitions are instant (no ≤150ms allowance).
//
// The state-transition contract (PAN incremental / SET absolute) is the pure,
// unit-tested `./comic-viewer-state.ts`; the pan/zoom math is `src/site/zoom.ts`.
// The gesture wiring here is the manual smoke (no render test, AR-11 style).
// Tailwind v4 + @theme tokens only (AD-6).

import {
  useEffect,
  useReducer,
  useRef,
  useState,
  type KeyboardEvent as ReactKbd,
  type PointerEvent as ReactPointer,
  type WheelEvent as ReactWheel,
} from 'react';
import { stripRetrySrc } from '../pages/postPage-utils';
import {
  AUTO_HIDE_MS,
  PAN_KEY_STEP,
  clampLevel,
  clampPanCentered,
  isFit,
  levelForFullView,
  zoomCenter,
} from '../site/zoom';
import { initialState, viewerReducer } from './comic-viewer-state';

/* -------------------- helpers ------------------------------------------- */

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

function distBetween(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-mint';

/* -------------------- component ----------------------------------------- */

/** gesture-start snapshot for a pinch (anchored so the focal point can't drift). */
interface PinchStart {
  startDist: number;
  startLevel: number;
  startTx: number;
  startTy: number;
  focal: { x: number; y: number };
}

export default function ComicViewer({ image, alt }: { image: string; alt: string }) {
  const [view, dispatch] = useReducer(viewerReducer, initialState);
  const [showControls, setShowControls] = useState(true);
  const [animate, setAnimate] = useState(true);
  const [failed, setFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const reduced = useReducedMotion();

  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // pointer / gesture bookkeeping (refs — no re-render needed)
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const pinch = useRef<PinchStart | null>(null);
  const lastTap = useRef<number>(0);
  const hideTimer = useRef<number | null>(null);
  const hovering = useRef(false);
  // fresh reads of view in gesture handlers
  const viewRef = useRef(view);
  viewRef.current = view;

  /* --- stage size (ResizeObserver) --- */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      dispatch({ type: 'SET_STAGE', w: Math.round(r.width), h: Math.round(r.height) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* --- controls auto-hide (~2.5s of inactivity, never while hovering/focused) --- */
  const pokeControls = () => {
    setShowControls(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      hideTimer.current = null;
      if (!hovering.current && stageRef.current && !stageRef.current.contains(document.activeElement)) {
        setShowControls(false);
      }
    }, AUTO_HIDE_MS);
  };

  useEffect(() => {
    pokeControls(); // reveal on mount, then schedule the first auto-hide
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, []);

  /* --- focal offset of a pointer relative to the stage centre (screen px) --- */
  const focalOf = (clientX: number, clientY: number) => {
    const el = stageRef.current;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return { x: clientX - (r.left + r.width / 2), y: clientY - (r.top + r.height / 2) };
  };

  /* --- tap/click toggle: coalesce a fast double into a single toggle.
       fit → 1:1 zooms TOWARD the tapped point (focal), so the spot your finger/
       cursor lands on stays under it; zoomed → fit (focal irrelevant). --- */
  const handleTap = (e: ReactPointer<HTMLDivElement>) => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      lastTap.current = 0; // 2nd of a double → ignore (no flip-flop)
      return;
    }
    lastTap.current = now;
    setAnimate(true);
    if (isFit(viewRef.current.level)) {
      const full = levelForFullView(viewRef.current.stageW, viewRef.current.naturalW);
      dispatch({ type: 'ZOOM_TO', target: full, focal: focalOf(e.clientX, e.clientY) });
    } else {
      dispatch({ type: 'RESET' });
    }
  };

  /* --- pinch: apply an ABSOLUTE next state anchored to the gesture start, so
       the focal point stays pinned across every pointermove (no compounding). --- */
  const applyPinch = () => {
    if (!pinch.current || pointers.current.size < 2) return;
    const [p1, p2] = [...pointers.current.values()];
    const newDist = distBetween(p1, p2);
    const ratio = pinch.current.startDist > 0 ? newDist / pinch.current.startDist : 1;
    const z2 = clampLevel(pinch.current.startLevel * ratio);
    const { stageW, stageH } = viewRef.current;
    const ntx = clampPanCentered(
      zoomCenter(pinch.current.startLevel, z2, pinch.current.startTx, pinch.current.focal.x),
      stageW * z2,
      stageW,
    );
    const nty = clampPanCentered(
      zoomCenter(pinch.current.startLevel, z2, pinch.current.startTy, pinch.current.focal.y),
      stageH * z2,
      stageH,
    );
    dispatch({ type: 'SET', level: z2, tx: ntx, ty: nty });
  };

  /* --- pointer (unified touch + mouse) gestures --- */
  const onPointerDown = (e: ReactPointer<HTMLDivElement>) => {
    // a tap on a control button is NOT a strip tap — don't start a drag/toggle.
    if ((e.target as HTMLElement).closest('button')) {
      pokeControls();
      return;
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      // begin pinch — snapshot the gesture start (level/pan/focal) to anchor on.
      const [p1, p2] = [...pointers.current.values()];
      const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      pinch.current = {
        startDist: distBetween(p1, p2),
        startLevel: viewRef.current.level,
        startTx: viewRef.current.tx,
        startTy: viewRef.current.ty,
        focal: focalOf(mid.x, mid.y),
      };
      drag.current = null; // a second finger cancels any in-flight drag
      setAnimate(false); // follow the fingers exactly
      lastTap.current = 0;
    } else if (pointers.current.size === 1) {
      drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
      (e.target as Element).setPointerCapture?.(e.pointerId);
    }
    pokeControls();
  };

  const onPointerMove = (e: ReactPointer<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) {
      pokeControls(); // bare hover/mouse move → reveal chrome, no gesture
      return;
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pinch.current && pointers.current.size >= 2) {
      applyPinch();
      return;
    }

    if (drag.current && drag.current.id === e.pointerId) {
      // INCREMENTAL deltas since the last move → true 1:1 finger tracking.
      const dx = e.clientX - drag.current.x;
      const dy = e.clientY - drag.current.y;
      drag.current.x = e.clientX;
      drag.current.y = e.clientY;
      if (Math.hypot(dx, dy) > 4) drag.current.moved = true;
      if (!isFit(viewRef.current.level)) {
        setAnimate(false); // drag without a laggy transition
        dispatch({ type: 'PAN', dx, dy });
      }
    }
  };

  const onPointerUp = (e: ReactPointer<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (drag.current && drag.current.id === e.pointerId) {
      const wasMove = drag.current.moved;
      drag.current = null;
      // a fast tiny-up (no drag, no pinch) = tap → toggle fit↔1:1 toward the spot
      if (!wasMove && !pinch.current) handleTap(e);
    }
    if (pointers.current.size < 2) pinch.current = null;
    setAnimate(true);
    pokeControls();
  };

  const onPointerEnter = () => {
    hovering.current = true;
    pokeControls();
  };
  const onPointerLeave = () => {
    hovering.current = false;
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (!stageRef.current?.contains(document.activeElement)) setShowControls(false);
    }, AUTO_HIDE_MS);
  };

  /* --- wheel: Ctrl/Cmd+wheel zooms; bare wheel keeps the page scrolling --- */
  const onWheel = (e: ReactWheel<HTMLDivElement>) => {
    if (!(e.ctrlKey || e.metaKey)) return; // let the page scroll
    e.preventDefault();
    pokeControls();
    setAnimate(true);
    dispatch({ type: 'ZOOM_STEP', sign: -Math.sign(e.deltaY), focal: focalOf(e.clientX, e.clientY) });
  };

  /* --- keyboard: + / − / 0 / Esc / arrows (Tab passes through — never traps) --- */
  const onKeyDown = (e: ReactKbd<HTMLDivElement>) => {
    const k = e.key;
    pokeControls();
    setAnimate(true);
    const z = !isFit(viewRef.current.level);
    if (k === '+' || k === '=' || k === 'Add') {
      e.preventDefault();
      dispatch({ type: 'ZOOM_STEP', sign: +1 });
    } else if (k === '-' || k === '_' || k === 'Subtract') {
      e.preventDefault();
      dispatch({ type: 'ZOOM_STEP', sign: -1 });
    } else if (k === '0' || k === 'Escape') {
      e.preventDefault();
      dispatch({ type: 'RESET' }); // Esc resets + exits zoom → fit
    } else if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowUp' || k === 'ArrowDown') {
      if (!z) return; // at fit the page scrolls normally
      e.preventDefault();
      const dx = k === 'ArrowLeft' ? -PAN_KEY_STEP : k === 'ArrowRight' ? PAN_KEY_STEP : 0;
      const dy = k === 'ArrowUp' ? -PAN_KEY_STEP : k === 'ArrowDown' ? PAN_KEY_STEP : 0;
      dispatch({ type: 'PAN', dx, dy });
    }
  };

  /* --- the single on-screen control: Zoom when fit, Fit when zoomed --- */
  const toggle = () => {
    setAnimate(true);
    dispatch({ type: 'TOGGLE_FULL' });
    pokeControls();
  };

  const zoomed = !isFit(view.level);
  const transitionCls = reduced || !animate ? 'transition-none' : 'transition-transform duration-150 motion-reduce:transition-none';
  const hidden = !showControls;

  return (
    <div className="bg-ink-surface">
      <div
        ref={stageRef}
        role="region"
        aria-label="Comic strip — zoom and pan: tap or the Zoom button to zoom, arrow keys to pan, 0 or Escape to reset"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onWheel={onWheel}
        onKeyDown={onKeyDown}
        onFocus={pokeControls}
        onBlur={() => {
          if (!hovering.current) setShowControls(false);
        }}
        className={`relative overflow-hidden outline-none select-none ${
          zoomed ? 'touch-none' : 'touch-pan-y'
        }`}
        style={{ cursor: zoomed ? 'grab' : 'zoom-in' }}
      >
        <img
          ref={imgRef}
          src={stripRetrySrc(image, retryKey)}
          alt={alt}
          loading="eager"
          draggable={false}
          onError={() => setFailed(true)}
          onLoad={(e) => {
            const n = (e.currentTarget as HTMLImageElement).naturalWidth;
            dispatch({ type: 'SET_NATURAL', w: n });
            setFailed(false);
          }}
          className={`block h-auto w-full select-none [will-change:transform] ${transitionCls} ${
            failed ? 'sr-only' : ''
          }`}
          style={{
            transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.level})`,
            transformOrigin: 'center center',
          }}
        />

        {failed && (
          <div
            role="alert"
            className="absolute inset-0 flex min-h-[40vh] flex-col items-center justify-center gap-5 px-6 py-16 text-center"
          >
            <p className="font-body text-lg text-on-ink">Couldn&apos;t load the strip. Refresh?</p>
            <button
              type="button"
              onClick={() => {
                setFailed(false);
                setRetryKey((k) => k + 1);
              }}
              className="inline-flex min-h-[44px] items-center rounded-md border border-on-ink/50 px-5 font-body text-base text-on-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Retry
            </button>
          </div>
        )}

        {/* chrome — a single bottom-right Zoom/Fit toggle. Hidden =
            opacity-0 + pointer-events-none (never display:none), so it stays in
            the tab order and reveals again on focus (WCAG AA). ≥44px target. */}
        <div
          className={`absolute right-2.5 bottom-2.5 rounded-full transition-opacity duration-150 motion-reduce:transition-none ${
            hidden ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          <button
            type="button"
            onClick={toggle}
            aria-label={zoomed ? 'Reset to fit' : 'Zoom in to 100%'}
            className={`flex h-11 items-center gap-1.5 rounded-full px-4 font-mono text-[11px] tracking-wide ring-1 ring-on-ink/20 backdrop-blur-sm ${focusRing} ${
              zoomed
                ? 'bg-accent-mint text-ink-surface ring-0 font-semibold'
                : 'bg-ink-surface/60 text-on-ink'
            }`}
          >
            <span aria-hidden className="text-sm leading-none">
              {zoomed ? '✕' : '＋'}
            </span>
            {zoomed ? 'Fit' : 'Zoom'}
          </button>
        </div>
      </div>
    </div>
  );
}