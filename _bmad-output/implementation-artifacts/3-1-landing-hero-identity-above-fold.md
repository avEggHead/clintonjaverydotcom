# Story 3.1 — Landing hero renders the identity above the fold

**Status:** `review` · **Epic:** 3 (Landing — Identity & Funnel) · **FR:** FR-1

## What shipped

Replaced the Epic-1 `LandingPlaceholder` with a real `src/pages/Landing.tsx`: a
full-bleed dark `ink-surface` hero (**≥92vh** per UX-DR-3) carrying the site's
identity above the fold — no separate About page.

**Hero composition** (from the key-screen mock `mockups/key-landing-hero.html`;
spine wins on conflict; mock is the visual reference):
- **Eyebrow** — mono, `text-accent-mint`: `Writing · Comics · Projects`
- **Identity one-liner** — Fraunces (`--text-display-lg` 56px desktop /
  `--text-display-lg-mobile` 40px mobile), tight leading/tracking, `text-on-ink`:
  **"I draw funny strips, write essays, and *build things*."** — the "build
  things" is an `<em>` in italic mint (the single dark-panel accent beat).
- **Lede** — Inter `text-body-lg` / `leading-prose`, `text-ink-variant`:
  "A personal publishing studio for gag-a-day comics and the occasional
  technical essay — plus the small tools I build along the way. New here every week."
- **CTA row** — exactly ONE `button-primary` (`bg-primary-strong text-on-primary`)
  → `/p` ("Read the latest →"); one `button-ghost` (`border-ink-variant`,
  `text-on-ink`) → `/projects` ("Explore Projects"). Only one primary, per AC2.

**The hero photograph is a sourced asset, not built yet.** The brief specifies
"action-oriented photography of Clint programming and talking to people" (brainstorm
§2 / brief §1) — an asset still to be **sourced/commissioned** (brief §6.4).
Until it exists, the photo layer renders the key-screen mock's placeholder
treatment (an ambient `bg-linear-to-br from-primary/25 via-ink-surface to-ink-surface`
gradient over the dark stage). `identity.ts` gained a `HERO_PHOTO: string | null`
slot — set it to a slash-root path (e.g. `/images/clint-at-desk.jpg`) and the
hero drops in an eager, `fetchPriority="high"` `<img>` (object-cover, opacity 40%)
that becomes the **LCP element**. The slot mirrors the established `DEFAULT_OG_IMAGE`
"swap-later" pattern.

### AC mapping
- **AC1** (hero ≥92vh, identity + CTA inside first viewport at 320px): full-bleed
  `ink-surface`, `min-h-[92vh]`, identity block `justify-center` so eyebrow/h1/CTA
  sit in the visible region above the fold. **Browser-check** at 320px.
- **AC2** (hero is LCP, no CLS above on initial render): the hero reserves ≥92vh,
  TopNav is sticky with stable height; the placeholder gradient adds zero async
  layout, the future `<img>` is absolute `inset-0` cover → no reflow. With the
  gradient (no `<img>` yet) the `<h1>` is the LCP; once `HERO_PHOTO` is set, that
  eager `<img>` is the LCP. **Lighthouse** at review.
- **AC3** (exactly one `button-primary` → Feed, never >1 primary above fold):
  verified — 1× `bg-primary-strong` (→ `/p`); the Projects CTA is a `button-ghost`
  (border, not fill).

### Design tokens added (AD-3, 1:1 with DESIGN.md)
`styles.css` `@theme` was missing the mobile display ramp; added:
`--text-display-lg-mobile: 40px` and `--leading-display-mobile: 1.08` (matching
DESIGN.md `typography.display-lg-mobile`), enabling `text-display-lg-mobile` /
`leading-display-mobile` responsive utilities. No design string duplicated.

## Files

**Created:** `src/pages/Landing.tsx`
**Modified:** `src/App.tsx` (import + route `/` → `Landing`), `src/site/identity.ts`
(+`HERO_PHOTO` slot), `src/styles.css` (+2 mobile display tokens)
**Deleted:** `src/pages/LandingPlaceholder.tsx` (no longer a placeholder)

## Verification (automated)
- **Build:** green (1.80s). `fetchPriority="high"` compiled (React 19 JSX types).
- **Lint:** 0.
- **Tests:** 110 pass. (No component render tests — project policy AR-11; the hero
  is presentational Tailwind, logic-only test surface unaffected.)
- **Contrast gate:** the build-time contrast plugin passed — `text-on-ink`
  (#F4F2EC) on `ink-surface` (#12160F) and `accent-mint` (#6DF49A) on `ink-surface`
  both clear AA on the dark panel.
- **AC grep:** 1× `bg-primary-strong` (→`/p`); 1× `border-ink-variant` ghost (→
  `/projects`); mint only on eyebrow + em (both dark-panel); zero dangling
  `LandingPlaceholder` refs.

## Review instructions (browser — ~5 min)

> `cd clintonjavery && npm run dev`, open `http://localhost:5173` (the `/` route).

### A. Above-the-fold identity (the core AC1 — check at multiple widths)
1. **Desktop (≥1280px):** dark full-bleed hero ~92vh tall. Mint eyebrow
   "Writing · Comics · Projects", Fraunces identity "I draw funny strips, write
   essays, and *build things*." (the "build things" in mint italic), lede below,
   then the two CTAs. **All four elements visible without scrolling.**
2. **Tablet (768–1024px):** same content above the fold.
3. **Mobile 320px** (DevTools responsive, iPhone SE): the identity block is
   centered; eyebrow + h1 + lede + both CTAs fit inside the first viewport
   (TopNav is sticky above). If any CTA dips below the fold at 320px, tell me and
   I'll trim vertical padding/lede — this is the AC1-critical check.
4. **360px wide:** comfortable.

### B. One primary CTA only (AC3)
- Visually one green filled button ("Read the latest →") + one outline button
  ("Explore Projects"). Click the primary → `/p` (Feed) client-side (scrolls to
  top per Story 2.2's ScrollToTop). Click the ghost → `/projects`.

### C. Mint discipline (AC4)
- Mint appears only on the eyebrow + "build things" — both on the dark hero. No
  mint fill anywhere on paper surfaces.

### D. LCP & no CLS (AC2)
- DevTools → Lighthouse → Performance on `/`. Hero (h1 now; the `<img>` once
  sourced) is the LCP; **0 layout-shift entries above it**. (Hard to fully measure
  until the photo lands, but the gradient path produces zero CLS.)

### E. Head metadata (unchanged behavior)
- DevTools `<head>`: title = "Clinton J Avery – Software Engineer & Creator"
  (the `kind:'home'` head carried over from the placeholder). og:image still
  `/assets/bg-space.jpg` (separate concern from the hero photo).

## Note on the photo (the one thing still to source)
The hero photo is the front-door brand image and doesn't exist yet. To drop in
the real one when you've sourced it, set in `clintonjavery/src/site/identity.ts`:
```ts
export const HERO_PHOTO: string | null = '/images/clint-at-desk.jpg';
```
and the `<img>` (eager, high-priority) renders automatically as the LCP — no code
in `Landing.tsx` changes. Until then you'll see the ambient green→ink gradient
(the mock's placeholder). If you'd rather point me at an existing `public/images/*`
file to use provisionally now (so the hero has a real photo for the review), tell
me which one and I'll set the constant.

## Gate to `done`
- Browser checks **A (esp. the 320px fit)**, **B**, **C** pass.
- Commit suggested `3 - 1` (your convention). Stage: `src/pages/Landing.tsx`,
  `src/pages/LandingPlaceholder.tsx` (deletion), `src/App.tsx`, `src/site/identity.ts`,
  `src/styles.css`.

## Next
Story 3.2 appends the scroll-narrative sections below the hero (Latest slot →
"What I build"/Projects teaser → Footer), with reveal-on-scroll
(IntersectionObserver, Landing only, reduced-motion instant) + a skip-to-section
control. Story 3.3 fills the Latest-3 strip. Both extend this same `Landing.tsx`.