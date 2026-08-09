# Story 3.2 — Landing scroll narrative routes to each surface

**Status:** `review` · **Epic:** 3 (Landing — Identity & Funnel) · **FR:** FR-2

## What shipped

Extended `src/pages/Landing.tsx` below the 3.1 hero with the scroll narrative
per PRD addendum §D + UX-DR-4. The `/` route now renders a fragment: hero → three
scroll-revealed sections → the global SiteFooter.

### Sections (AC1 — PRD addendum §D)
- **"What's new"** (`#whats-new`) — the Latest slot. Heading "What's new";
  lede; a quiet placeholder block ("The three newest posts arrive here next").
  **Story 3.3 fills the 3 newest cards here** — this story ships the section
  shell + heading + reveal only.
- **"The work"** (`#work`) — Feed teaser. Heading "Writing & comics, one at a
  time." + lede + ONE primary CTA `Open the Feed →` → `/p`, plus two secondary
  type-filter shortcut links: `Browse essays` → `/p?type=essay`, `Browse comics`
  → `/p?type=comic`.
- **"What I build"** (`#build`) — Projects teaser. Heading "Small tools, made
  in the open." + lede + ONE primary `Explore Projects →` → `/projects`. Tiles
  arrive in Epic 4 (FR-9).

All three on the light `surface` paper (UX line 184: dark reserved for the hero
+ comic viewer chrome), `ink` text — the dark hero hands off to a light read.

### In-narrative routing (AC2)
Every section's links are RR `<Link>` (no full reload): `/p`, `/p?type=essay`,
`/p?type=comic`, `/projects`. The type-filter shortcuts land on the same Feed
pre-scoped — confirmed Feed reads `searchParams.get('type')` → values
`essay`/`comic` (Feed.tsx). URL changes, no reload (FR-2).

### Reveal-on-scroll (AC3) — `src/components/Reveal.tsx` (new)
Each section is a `Reveal` wrapping a `<section>`: opacity-0 + translate-y-4
until an `IntersectionObserver` (threshold 0.12) intersects it, then reveals
once and stays. **Landing-only** by usage — `Reveal` is only imported by
`Landing.tsx` (grep-confirmed Feed/Post do not use it; UX-MAXIM: never hide
content the user came for). `prefers-reduced-motion: reduce` → `setShown(true)`
on mount (no observer, no transition; `motion-reduce:transition-none` belt +
suspenders) → instant show.

### Skip-to-section (AC4) — focus-revealed control
A `<nav aria-label="Jump to section">` is the **first focusable element** on
`/`, visually hidden (`sr-only`) until `:focus-within`, then fixed top-left
below the sticky nav — mirroring the established `SkipLink` pattern. Links:
`Latest` → `#whats-new`, `The work` → `#work`, `What I build` → `#build`,
`Footer` → `#site-footer`. Each is a plain `<a href="#id">` (native same-page
hash scroll; no RR route change → `ScrollToTop` doesn't fire). Each `Reveal`
section has `id` + `tabIndex={-1}` so the hash link both scrolls AND moves
focus there. Keyboard/AT users reach every section without scrolling (AC4).

### Footer (AC5) — global SiteFooter now carries the pill on `/`
Updated `SiteFooter.tsx`: the `support-pill` predicate now includes
`pathname === '/'` (was `/p` + `/p/:slug` only per Story 1.8). 3.2 AC5
explicitly requires the Landing footer to carry identity + copyright + the
pill, so the 1.8 "absent on the Landing" scope is superseded — the pill now
shows on `/`, `/p`, `/p/:slug`; still absent on Projects. Added
`id="site-footer"` so the skip control can target it. No full nav duplicate.

## Files

**Created:** `src/components/Reveal.tsx`
**Modified:** `src/pages/Landing.tsx` (skip-nav + 3 reveal sections appended to
the 3.1 hero), `src/components/SiteFooter.tsx` (pill on `/` + `id="site-footer"` + comment)
**Untracked (asset):** `public/images/me-posing-temp.jpg` (Clint's temp hero
photo, wired via `HERO_PHOTO` in identity.ts during 3.2 prep — include in this
commit or the 3.1 commit retroactively; see Notes)

## Verification (automated)
- **Build:** green (1.78s). No type/lint warnings.
- **Lint:** 0.
- **Tests:** 110 pass. (Component render tests are out of scope per AR-11; the
  reveal/skip behavior is the manual-review layer, like `useHead`.)
- **AC grep audit:**
  - 3 section ids (`whats-new`/`work`/`build`) present (AC1).
  - in-narrative links: 2× `/p`, 1× `/p?type=essay`, 1× `/p?type=comic`, 2×
    `/projects` (AC2).
  - `Reveal` imported only by Landing (Landing-only invariant, AC3).
  - skip nav has 4 hash targets matching the section ids + `#site-footer` (AC4).
  - SiteFooter predicate `pathname === '/' || pathname === '/p' || …` (AC5) +
    `id="site-footer"`.

## Review instructions (browser — ~7 min)

> `cd clintonjavery && npm run dev`, open `http://localhost:5173`.

### A. Scroll narrative + reveal (AC1, AC3)
1. Land on `/` — hero (with the temp photo at low opacity). Scroll down slowly:
   each section ("What's new" → "The work" → "What I build") **fades + slides up
   ~16px into view as it enters** the viewport, once, then stays.
2. DevTools → toggle **`prefers-reduced-motion: reduce`** (Rendering panel)
   and reload — **all sections render instantly**, no fade/transition. (AC3.)
3. Confirm the dark hero ↔ light-paper sections handoff reads right: dark hero,
   then `bg-surface` (light) sections, then footer.

### B. In-narrative routing (AC2)
1. In "The work", click **Open the Feed** → `/p` (client-side; scrolls to top
   via 2.2's ScrollToTop). Browser back → returns to the section.
2. Click **Browse essays** → `/p?type=essay` (Feed pre-scoped to essays —
   confirm the Type Filter reads "Essays"). Back.
3. Click **Browse comics** → `/p?type=comic` (Feed reads "Comics"). Back.
4. In "What I build", click **Explore Projects** → `/projects`. Back.
   - All four navigate client-side (no full page reload; the URL bar changes).

### C. Skip-to-section (AC4)
1. On `/`, **Tab** from the URL bar. After the global "Skip to content" link,
   a dark "Jump to" bar appears top-left with Latest / The work / What I build /
   Footer.
2. Tab to **Latest**, Enter → `#whats-new` scrolls into view and **focus moves
   to the section** (focus ring on the section). Repeat for **The work**,
   **What I build**, **Footer** — each jumps + focuses without you scrolling.
3. Confirm the control disappears (visually hidden) when it loses focus.

### D. Footer support-pill on the Landing (AC5)
1. Scroll to the bottom of `/`. The footer shows **© 2026 Clinton J Avery** AND
   the **SupportPill** ("Support the site") — it was previously absent on `/`.
   Tap the pill → Venmo in a new tab (1.8 behavior).
2. Visit `/projects` — the footer pill is **absent** (Projects excluded).

### E. Temp hero photo (from 3.2 prep)
- The hero now shows your `me-posing-temp.jpg` at ~40% opacity over the dark
  ink-surface, behind the identity text. Sanity-check the crop/opacity work on
  mobile + desktop. (Swap later by changing `HERO_PHOTO` in identity.ts.)

## Gate to `done`
- Browser checks **A (esp. the reduced-motion instant)**, **B**, **C**, **D** pass.
- Commit suggested `3 - 2`. Stage: `src/components/Reveal.tsx`,
  `src/pages/Landing.tsx`, `src/components/SiteFooter.tsx`,
  `src/site/identity.ts` (the `HERO_PHOTO` temp photo line), and the new asset
  `public/images/me-posing-temp.jpg`. **Note:** the 3.1 commit (`3 - 1`) left
  `identity.ts`'s `HERO_PHOTO` at `null`; this story's commit flips it to the
  temp photo — so `identity.ts` carries both the slot (3.1) and the temp value
  (this story). Consolidate honestly: if you'd rather the temp-photo line ride
  with the 3.2 commit (cleanest), do that.

## Notes / decisions
- **Pill on `/` supersedes 1.8's "absent on Landing" scope.** 1.8 scoped the pill
  to content pages (`/p`+`/p/:slug`) because the Landing was then a placeholder
  with no footer narrative. 3.2 AC5 explicitly requires the pill on the Landing
  footer, so the predicate now includes `/`. The 1.8 record's "absent on
  Landing" was correct for its story; this supersedes it.
- **Skip-to-section is focus-revealed, not visible-at-rest.** It costs zero
  above-the-fold space (vs. a visible "jump bar" that would crowd the 92vh hero
  and break the 320px fit from 3.1's AC1). Keyboard/AT users reach it first in
  tab order; sighted mouse users scroll (the narrative is "accent, not a gate",
  per addendum §D). If you'd prefer a *visible* jump bar in the hero, say so and
  I'll swap the treatment — but I'd recheck the 320px fit.
- **Latest section is a placeholder until 3.3.** It renders heading + lede +
  a muted "arrive here next" block. Story 3.3 wires the content-index → the 3
  newest posts (FR-3) into this slot.

## Next
Story 3.3 — fill the Latest-3 strip: the 3 most-recent published posts in
reverse-chrono, mixing essay (`post-card`) and comic (`comic-card`) per type,
each linking to its Post via client-side nav. Replaces the muted placeholder
block in the "What's new" `Reveal`. Epic 3 ends with 3.3.