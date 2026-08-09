# Story 4.1 — Projects list page with project cards

**Status:** `review` · **Epic:** 4 (Projects — Verifiable Proof) · **FR:** FR-9

## What shipped

Replaced the Epic-1 `/projects` placeholder with the real Projects portfolio
list: a typed data model (PRD addendum §E) of 5 entries, a `ProjectCard`
(UX-DR-12), and the responsive grid page. Cards link live + source; dead links
de-emphasise (UX-DR-16). An evaluator can scan the portfolio in seconds.

### Data model — `src/data/projects.ts` (AC4: §E field set)
`ProjectEntry`: `slug, title, summary, stack[], date, liveUrl?, sourceUrl?,
screenshots?, featured?, component?`. Slugs kebab-case; `date` = each tool
file's first-commit date (honest "when shipped"). 5 entries rehome the existing
tools/games (per Story 4.2's targets):

| slug | stack | date | source |
|---|---|---|---|
| time-zone-converter | React, Luxon | 2025-03-28 | `…/tools/TimeZoneConverter.tsx` |
| text-analyzer | React | 2025-04-01 | `…/tools/TextAnalyzer.tsx` |
| effort-estimator | React, Radix UI | 2025-08-02 | `…/tools/EffortSlider.tsx` |
| unit-converter | React | 2026-04-03 | `…/tools/UnitConverter.tsx` |
| balloon-popper | React | 2025-04-01 | `…/fun/BalloonPopper.tsx` |

`liveUrl` = `/projects/<slug>` (in-site — RR Link). `sourceUrl` = a deep link
into the GitHub repo (default branch `main`):
`https://github.com/avEggHead/clintonjaverydotcom/blob/main/clintonjavery/<path>`.
`component` (the live tool to render at `/projects/:slug`) is left unset here —
**Story 4.2 wires it + renders the live demos**; 4.1 is list-only.
`findProject(slug)` helper exported for 4.2's show page.

### Cards — `src/components/ProjectCard.tsx` (AC2 + AC3)
`surface-container-low` card: title (`h2` — page h1 is "Projects", NFR-1),
one-line summary (`body-sm`, `line-clamp-2`), stack chips
(`secondary-container`/`on-secondary-container` rounded-full), and live +
source affordances in an `mt-auto` row (so equal-height cards align at bottom).
- **In-site `liveUrl`** (`/…`) → RR `<Link to={liveUrl}>` "Live demo →" (UX-DR-12).
- **External `liveUrl`** (`http`) → `<a target="_blank" rel="noopener noreferrer">` "Live demo ↗" (Story 4.2 AC).
- **No `liveUrl`** / **no `sourceUrl`** → a muted, NON-clickable span ("No live
  demo" / "No source") — `text-on-surface-variant/50` — card stays as the proof
  point (UX-DR-16).
- **Hover lift** (`pointer:fine:hover:-translate-y-0.5` + `shadow-md`) gated
  behind `motion-safe:` AND `pointer-fine:` — no lift on touch, none under
  `prefers-reduced-motion` (AC4).

### List page — `src/pages/Projects.tsx` (AC1 + AC4)
`/projects` → h1 "Projects" + lede + responsive grid:
`grid list-none gap-5 md:grid-cols-2 lg:grid-cols-3` (1 col `<768`,
2 col `768–1024`, 3 col `>=1024`, UX-DR-12). Head via the new `projects`
`buildHeadMeta` kind (canonical `/projects`, `website` type — AC1 SEO parity
with the Feed). `list-none` so the `<ul>` grid isn't bulleted.

### Head metadata — `src/site/head-meta.ts` (test-first)
Added a `kind: 'projects'; canonical: string` variant to `HeadInput` (mirrors
`feed`): title `Projects · <author>`, `og:url`/canonical = provided, site
default `og:image`, `website` type, no `robots` noindex. 3 new tests in
`head-meta.test.ts` (113 total, up from 110) — title, canonical/og:url, and
image/type/no-robots.

## Files
**Created:** `src/data/projects.ts`, `src/components/ProjectCard.tsx`,
`src/pages/Projects.tsx`.
**Modified:** `src/site/head-meta.ts` (`projects` kind + case),
`src/site/head-meta.test.ts` (3 tests), `src/App.tsx` (route → `Projects`).
**Deleted:** `src/pages/ProjectsPlaceholder.tsx` (stale Epic-1 placeholder).
**Cleaned:** `public/images/me-posing-temp.jpg~` editor backup (Story 2.3 AC
hygiene).

## Verification (automated)
- **Build:** green (1.92s).
- **Lint:** 0.
- **Tests:** 113 pass (+3 for the `projects` head-meta kind).
- **AC grep audit:** `/projects` route → `Projects`; 5 entries each with
  live+source+summary+stack+date; card `text-body-sm` summary + stack chips +
  in-site `liveUrl.startsWith('/')` → RR `<Link>`; dead-link muted spans
  (`No live demo`/`No source`); grid `md:grid-cols-2 lg:grid-cols-3`;
  `motion-safe:pointer-fine:hover:…` lift; §E fields on the type.

## Review instructions (browser — ~5 min)

> `cd clintonjavery && npm run dev`, open `http://localhost:5173/projects`.

1. **The list:** 5 cards — Time Zone Converter, Text Analyzer, Effort
   Estimator, Unit Converter, Balloon Popper — each with title, one-line
   summary, stack chips, and **Live demo →** + **Source ↗** affordances. Hero
   "Explore Projects" + Landing "What I build" → here.
2. **Responsive grid:** resize — 3 col `>=1024`, 2 col `768–1024`, 1 col `<768`.
3. **Hover lift:** on a fine pointer (desktop mouse), hover a card → subtle
   `-translate-y-0.5` + shadow. On a touch device / DevTools "coarse" → no lift.
   With `prefers-reduced-motion: reduce` → no lift (and no transition).
4. **Live link (AC2):** "Live demo →" routes client-side to
   `/projects/<slug>` — **still the placeholder show page** (the live tool
   renders in Story 4.2). Expected for 4.1; flag if you'd rather I roll 4.2
   before gating 4.1.
5. **Source link:** "Source ↗" opens the GitHub deep link to the tool file in a
   new tab (`noopener noreferrer`).
6. **Head (optional, DevTools Elements → <head>):** `<title>Projects · Clinton
   J Avery</title>`, `og:url`/canonical = `https://clintonjavery.com/projects`,
   `og:type=website`. No `noindex`.

## Gate to `done`
- Checks 1–3 pass (the list, the responsive grid, the pointer-fine-only lift).
- ⚠️ Check 4: the live-demo target is the placeholder until 4.2 — decide
  whether to gate 4.1 now or roll straight into **Story 4.2** (re-skin + live
  demos + `/tools` + `/fun` 301s) so the live links work end-to-end. My
  recommendation: gate 4.1 (the list is reviewable on its own), then 4.2.
- Commit suggested `4 - 1`. Stage: new `src/data/projects.ts`,
  `src/components/ProjectCard.tsx`, `src/pages/Projects.tsx`; modified
  `src/site/head-meta.ts`, `src/site/head-meta.test.ts`, `src/App.tsx`;
  deleted `src/pages/ProjectsPlaceholder.tsx`. (Leave the
  `public/images/me-posing-temp.jpg~` deletion out — it's already gone from
  the working tree.)

## Notes / decisions
- **Source URLs are GitHub deep links** (default branch `main`, confirmed via
  `git ls-remote --symref origin HEAD`). If you rename files during 4.2's
  re-skin, update the `sourceUrl` paths — but I plan to re-skin IN PLACE (same
  paths), so the links stay valid.
- **`featured` + `screenshots` fields exist on the type (§E) but are unused in
  v1** — no pinning reorder, no screenshot rendering. Populating them would be
  dead config until those features ship; the field set is *supported*, not all
  populated. (Say the word if you want featured-pinning wired now.)
- **Dead-link de-emphasis is implemented but DORMANT** — all 5 current entries
  have both a live + a source link, so the muted "No live demo"/"No source"
  spans don't render for any current card. To see the de-emphasis, add an entry
  that omits `liveUrl` (e.g. a case-study writeup). The logic path is correct +
  grepped (UX-DR-16 satisfied in spirit).
- **`ProjectShowPlaceholder` stays** for `/projects/:slug` until Story 4.2
  replaces it with the live-tool renderer.

## Next
**Story 4.2** — rehome the 5 tools/games as live in-app demos:
1. Re-skin each tool to Tailwind v4 + `@theme` tokens (AD-6) — retire
   `layout.module.css` + `UnitConverter.module.css` (the AD-6 retirement noted
   in Epic 4). Preserve behavior (4.2 AC: "no behavior regression").
2. Wire `component` on each `ProjectEntry` + render it at `/projects/:slug`
   (replace `ProjectShowPlaceholder`); show summary + stack + source on the
   show page.
3. Historic `/tools/:slug` + `/fun/:slug` → `/projects/:slug` 301s in
   `public/_redirects` (per the 1.7 contract — no 404).