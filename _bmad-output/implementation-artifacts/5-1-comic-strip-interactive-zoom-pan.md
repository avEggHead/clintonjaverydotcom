# Story 5.1 — Comic Strip interactive zoom & pan

**Status:** `review` (revised) · **Epic:** 5 (Comic Reading Experience — Zoom & Pan) · **FR:** FR-16

## Follow-up revision (author feedback: pinch/drag wonky; +/− buttons misbehave; watermark unhelpful)

After a browser test, Clint reported: pinch/drag "zoom too fast / lack of control —
it doesn't track the exact click-and-drag"; the +/− buttons "do the same thing";
the lower-left watermark "isn't helpful." Root causes found + fixed:

1. **Drag runaway (the "zooms too fast" bug).** The drag handler fed *cumulative*
   deltas into an *additive* `PAN` reducer, so each pointermove re-added the
   whole-from-start offset → it compounded instead of tracking the finger.
   **Fix:** send *incremental* deltas (advance `drag.x/y` each move) → true 1:1
   finger tracking. Pinned by a reducer test adding each delta to the running
   offset, compound-free.
2. **Pinch drift (the "lack of control" bug).** Pinch re-derived the focal
   correction from the *current* (already-shifted) state each move, so the
   correction compounded. **Fix:** snapshot `startLevel/startTx/startTy/focal` at
   pinch start and dispatch an **absolute** `SET` computed off that snapshot each
   move → the focal point stays pinned, no drift. Pinned by the `SET` "same start
   snapshot across moves" reducer test.
3. **+ / − "both do the same thing" (the button bug).** A tap on a button
   *bubbled* to the stage's `onPointerDown`, which started a drag + captured the
   pointer; on pointerup the stage's tap-to-toggle fired **as well as** the
   button's zoom → the two fought. **Fix:** the stage handler ignores pointer
   events whose target is inside a `<button>` (`closest('button')`).
4. **Simpler chrome.** Per direction, the three buttons (+/−/Reset) are replaced
   by a **single Zoom/Fit toggle** (fit → "Zoom" → 1:1; zoomed → "Fit" → fit). The
   Fit action *is* the reset. Keyboard `+`/`−`/`0`/`Esc`, pinch, `Ctrl+wheel`, and
   tap-to-toggle remain for fine control. (AC5's "on-screen +/− controls" is now a
   single on-screen zoom toggle; AC11's Reset = the Fit state of the toggle +
   `0`/`Esc` — author-directed simplification, flagged here.)
5. **Watermark removed.** The lower-left hint is gone (the region `aria-label` +
   the button `aria-label` carry the instructions).

The pan/zoom state machine moved to a pure, unit-tested module
(`src/components/comic-viewer-state.ts`, 10 tests) so the gesture contract
(incremental PAN / absolute SET / clamp bounds) is locked independent of React.

## What shipped (original)

The Comic Post's Strip is now fully readable. A new `ComicViewer` component
replaces the fit-only stage in `PostPage` with the **complete pinned
zoom/pan interaction set** from `EXPERIENCE.md §Comic Presentation`: fit (default)
→ toggle (tap/click/double) ↔ 100% (1:1) → free zoom (pinch / `Ctrl+wheel` /
on-screen `+/−` / keyboard `+/−`) → drag/arrow pan **confined to strip bounds**
→ Reset (`Reset` button / `0` / `Esc`). All pan/zoom math lives in a pure,
unit-tested module. **This is the final story — Epic 5 complete, all epics done.**

### Test-first — `src/site/zoom.ts` (22 tests, `zoom.test.ts`)
The interaction math is domain-agnostic and unit-tested (no jsdom, AR-11 style —
the component/gesture wiring is the manual smoke). Verified:
- `clamp` / `clampLevel` — snap to `[ZOOM_MIN=1, ZOOM_MAX=5]`, 2dp.
- `zoomByStep` — `±ZOOM_STEP (0.25)`, floors at fit (never sub-fit), caps at max.
- `levelForFullView(container, natural)` — the 1:1 zoom level = `natural / container`
  (returns `>1` when the strip is wider than the stage; stays at fit when already
  at/above 1:1 — toggle never shrinks; DOM-safe on zero sizes).
- `toggleFullView` — fit↔full (single action either direction).
- `clampPanCentered(pos, scaled, view)` — centered-origin pan clamped to
  `[−overflow/2, +overflow/2]`, so **both edges stay in view** (no overpan); a
  fit-or-smaller strip recentres to `0`.
- `zoomCenter(old, new, pos, focal)` — focal stays under the cursor after a
  zoom (zoom grows toward the cursor / pinch centre) — verified by concrete
  geometry + a 2× in ↔ out round-trip that returns to centre.
- Constants: `AUTO_HIDE_MS === 2500` (≈2.5s auto-hide), `PAN_KEY_STEP === 40`,
  `ZOOM_MIN === 1` (fit is the resting state).

### `src/components/ComicViewer.tsx` — the interaction surface
A `useReducer`-driven gesture engine (no stale closures) wired to the tested
math. Everything is `PointerEvent` (unified touch + mouse):

- **Fit (default)** — `level = 1`, the `<img>` is `w-full h-auto` in flow, so the
  **stage grows to the strip**; tall strips page-scroll naturally (transform
  doesn't change the layout box, so at fit there's nothing to clip). `touch-action:
  pan-y` at fit → vertical page scroll works **AND** our pointer-based pinch still
  receives the two-finger events (browser pinch-zoom is suppressed because it's
  not in the `touch-action` allow-list); `touch-action: none` once zoomed → full
  capture for drag-pan.
- **Toggle** — single tap (touch) / single click (pointer) flips fit ↔ 1:1 via
  `TOGGLE_FULL`; a <300ms second tap is **debounced** (a fast double coalesces to
  one toggle so it never flip-flops). `TOGGLE_FULL` computes `levelForFullView`
  from the measured stage width + the strip's `naturalWidth` (read on `onLoad`).
- **Free zoom** — pinch (`startLevel × newDist/startDist`, focal = the midpoint
  → `zoomCenter`); `Ctrl+wheel` / `Cmd+wheel` (zoom steps toward the cursor; bare
  wheel passes through → page scroll, resolved decision); on-screen `+`/`−`
  buttons; keyboard `+`/`=`/`-`/`_` (step from centre). All clamp via `clampLevel`
  + pan-correct via `clampPanCentered` on every axis.
- **Pan** — PointerEvents drag (touch or mouse) **and** arrow keys, both routed
  through the `PAN` reducer which clamps to `[−overflow/2, +overflow/2]` per axis;
  the stage is `overflow-hidden` so a zoomed strip can never bleed into the page
  chrome — **zoom/pan never moves the nav or surrounding content**.
- **Reset / exit** — on-screen `Reset`, `0`, and `Esc` all dispatch `RESET`
  (→ fit, `tx=ty=0`). Esc "exits zoom" = returning to fit (the only zoom state is
  the level; fit is the exit).
- **Chrome** — `+` / `−` / `Reset` bottom-right on `bg-ink-surface/60` chips
  (`#12160F` = `rgb(18,22,15)`; `/60` ⇒ `rgba(18,22,15,0.6)` — exact AC spec),
  ≥44×44 (`h-11`), ringed `ring-on-ink/20` + backdrop blur. Revealed on hover
  (pointer), tap (touch), and focus; **auto-hide after ~2.5s** (`AUTO_HIDE_MS`)
  of inactivity — but only when the pointer is outside AND nothing is focused.
  Hidden = `opacity-0 pointer-events-none` (**never `display:none`**) → controls
  stay in the tab order and re-reveal on focus (focus-in calls `pokeControls`).
- **Focus never traps** — the viewer is a single `role="region" tabIndex={0}`
  tab stop; the three buttons follow in reading order; `Tab` is **not**
  intercepted, so the reader tabs region → `+` → `−` → `Reset` → rest of page
  (WCAG 2.1 AA).
- **Reduced motion** — `prefers-reduced-motion: reduce` → `transition-none`
  (the CSS transition is instant); `motion-reduce:transition-none` is also
  applied as a defense-in-depth. **No ≤150ms allowance** under reduced motion.
  During an active drag/pinch the transition is also suppressed (`animate=false`)
  so the strip tracks the finger with zero lag — re-enabled on release.
- **Zoom-hint copy** (mockup-faithful) — fit: *"Tap / pinch to read the
  lettering"*; zoomed: *"<level>× · pan within bounds · Esc / 0 to reset"*
  (`aria-hidden` — the region's aria-label carries the keyboard instructions).
- **Load failure** — preserved: `<img>` stays mounted with `alt` (alt stays
  available to AT) while a `Couldn't load the strip. Refresh?` + Retry overlay
  covers the stage (1.4 retry semantics retained via `stripRetrySrc`).

### `PostPage.tsx` — wiring
The inline `ComicStrip` (fit-only) is deleted; `<ComicStrip …>` →
`<ComicViewer image={strip.image} alt={strip.alt} />`. Title / date /
caption (secondary left-accent rule) / afterword + the support pill remain on
the paper surface below (unchanged). Removed the now-unused `useState` and
`stripRetrySrc` imports from `PostPage` (the viewer owns them).

## Acceptance-criteria audit (grep-verified)
1. **Default fit + tall strips scroll** — `level: ZOOM_MIN`; `block h-auto
   w-full` in flow; `touch-pan-y` at fit (vertical page scroll over the strip).
2. **Single tap/click + double toggle fit↔1:1** — `handleTap` → `TOGGLE_FULL`;
   <300ms double debounced (`lastTap.current`).
3. **Pinch free-zoom** — `pinch.current` tracks 2 pointers; `target =
   startLevel × newDist/startDist`; focal = midpoint.
4. **Pointer wheel scrolls page; `Ctrl+wheel` zooms** — `onWheel` returns early
   unless `ctrlKey||metaKey`; `preventDefault` only then.
5. **On-screen `+`/`−` zoom** — buttons dispatch `ZOOM_STEP sign ±1`.
6. **Zoomed → drag/arrow pan, confined — no overpan** — `PAN` reducer +
   `clampPanCentered`; stage `overflow-hidden` clips; `touch-none` when zoomed.
7. **Keyboard: `+`/`-` zoom, arrows pan, `0` reset, `Esc` reset+exit** —
   `onKeyDown` handler; arrows `preventDefault` only when zoomed (page scrolls
   normally at fit).
8. **Chrome bottom-right on `rgba(18,22,15,0.6)`, reveal on hover/tap/focus,
   auto-hide ~2.5s** — `right-2.5 bottom-2.5`, `bg-ink-surface/60` (ink-surface
   token `#12160F` = rgb(18,22,15)), `AUTO_HIDE_MS === 2500`.
9. **Auto-hidden = still keyboard-focusable, reveal on focus, never out of tab
   order** — hidden class is `opacity-0 pointer-events-none` (NOT
   `display:none`); `onFocus={pokeControls}` reveals.
10. **Tab never traps — moves past the viewer** — region is one `tabIndex={0}`
    tab stop; `Tab` key not handled in `onKeyDown`.
11. **Reset (`Reset` / `0`) → fit; `Esc` resets + exits zoom** — `RESET` action.
12. **`prefers-reduced-motion: reduce` → instant** — `reduced || !animate ?
    'transition-none' : '…'`; `motion-reduce:transition-none` fallback.

## Files
**Created:** `src/site/zoom.ts` (pure math), `src/site/zoom.test.ts` (22 tests),
`src/components/ComicViewer.tsx` (the viewer).
**Modified:** `src/pages/PostPage.tsx` (inline `ComicStrip` → `<ComicViewer>`,
dropped `useState`/`stripRetrySrc` imports).
**No frontmatter / content changes** — the comic alt text remains mandatory +
descriptive (FR-8 build gate, unchanged) and is the assistive narrative.

## Verification (automated)
- **Build:** green (3.62s).
- **Lint:** 0.
- **Tests:** 138 pass (+22 zoom math; 7 files, all green).
- **AC grep audit:** every AC has a documented implementation site (above).

## Review instructions (browser — ~15 min, the gesture sweep)

> `cd clintonjavery && npm run dev`, open a comic: `/p/first-strip`.

1. **Fit (resting)** — strip fills the stage; nothing crops. If tall, the page
   scrolls over it normally. Hint reads "Tap / pinch to read the lettering".
2. **Single tap** (touch) / **single click** (pointer) → toggles to 1:1; the
   **Reset chip turns mint** ("<level>× · pan within bounds…"). Tap/click again →
   back to fit.
3. **`+` / `−` buttons** (bottom-right) step ±0.25×; they auto-hide ~2.5s after
   you stop moving the pointer, reappear on hover/move/tap.
4. **`Reset`** → fit (or press `0`, or `Esc`).
5. **Keyboard** — click the stage (focus ring), then `+`/`-` zoom, arrow keys
   pan within bounds, `0`/`Esc` reset. `Tab` then moves to `+`, `−`, `Reset`,
   then **leaves the viewer** (never loops).
6. **Auto-hidden controls still focusable** — let them auto-hide, then `Shift+Tab`
   back into them: they **re-reveal on focus** (not hidden from the keyboard).
7. **Pinch** (trackpad two-finger or touch) zooms toward the pinch centre; the
   point under your fingers stays put.
8. **`Ctrl+wheel`** zooms toward the cursor; **bare wheel** scrolls the page
   (doesn't zoom).
9. **Drag** (mouse or finger) pans, **stops at the strip edges** — the nav never
   moves; the strip never bleeds past the stage.
10. **Reduced motion** — toggle OS "reduce motion" → zoom steps jump instantly
    (no 150ms slide).
11. **Load failure** — DevTools → Network → block `strip.png` → reload → the
    "Couldn't load the strip. Refresh?" overlay + Retry (alt still in the DOM).
12. **Head/OG** (Per-AC unchanged): the comic post's `<title>`, `og:image`
    (the strip), Twitter card — unchanged from 1.6.

## Gate to `done`
- The gesture sweep (steps 1–9) all behave on your phone + desktop.
- The keyboard parity (steps 5–6) — focus moves through and **out** of the
  viewer.
- Commit suggested `5 - 1`. Stage the four files
  (`zoom.ts`, `zoom.test.ts`, `ComicViewer.tsx`, `PostPage.tsx`).

## Notes / decisions
- **Debounced double-toggle.** The AC says a double-tap also toggles; literally
  firing two toggles would flip-flop to the starting state. I coalesce a <300ms
  second tap into **one** toggle (the first) — the *outcome* matches ("a
  double-tap toggles fit↔100%") without the flip-flop.
- **`touch-action` is conditional** (`pan-y` at fit, `none` zoomed) so tall
  strips still page-scroll on touch at fit AND pinch still works — a fixed
  `touch-none` would have blocked the "tall strips scroll" AC.
- **Eager bundle.** `ComicViewer` is on the comic-post route only; I left it a
  direct import (no route-lazy split) — it's small and the comic page is a
  primary surface. Splitting is a non-AC optimization, not requested.
- **No "follow the finger exactly during drag" lag** — the CSS transition is
  disabled while a pointer/pinch is active (`animate=false`), re-enabled for
  discrete zooms/resets; reduced-motion zeroes it regardless.
- **`ZOOM_MAX = 5`** — a sanity ceiling above the 1:1-to-read-lettering need
  but below pixel-blowout; review if you want tighter/looser.
- **No behavior regression** — title/date/caption/afterword/support pill below
  the stage are untouched; the dark stage remains edge-to-edge with no rounded
  mask on the artwork (DESIGN.md).

## Next
**All five epics are complete** (1–5, FR-1 … FR-16). The site is feature-complete
against the PRD. Suggested follow-ups (non-blocking, for your call):
- Route-lazy-load `ComicViewer` + Projects tools for a smaller initial bundle.
- Split the content index away from the main chunk if PR data grows.
- Retrospective (`bmad-retrospective`) on Epic 5 / the whole build.