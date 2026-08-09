# Story 4.2 — Rehome existing tools/games as live in-app Project demos

**Status:** `review` · **Epic:** 4 (Projects — Verifiable Proof) · **FR:** FR-9

## What shipped

Re-homed the 5 existing tools/games as **live, usable in-app demos** at
`/projects/:slug`, each re-skinned to Tailwind v4 + `@theme` tokens (AD-6), with
historic `/tools/*` + `/fun/*` routes 301'd to their new homes. The two
orphaned CSS modules are retired. **Epic 4 complete.**

### The live demos (AC1 + AC2)
Each `ProjectEntry` now carries `component` (the tool), wired in
`src/data/projects.ts`:

| slug | component | live route |
|---|---|---|
| time-zone-converter | `TimeZoneConverter` | `/projects/time-zone-converter` |
| text-analyzer | `TextAnalyzer` | `/projects/text-analyzer` |
| effort-estimator | `EffortSlider` | `/projects/effort-estimator` |
| unit-converter | `UnitConverter` | `/projects/unit-converter` |
| balloon-popper | `BalloonPopGame` | `/projects/balloon-popper` |

New `src/pages/ProjectShow.tsx` (replaces `ProjectShowPlaceholder`) looks the
slug up via `findProject`; unknown slug → the on-brand `NotFound` + a
`not-found` head (mirrors PostPage's missing-slug path). The show page renders
an `<h1>` title + summary + stack chips + a source link (AC5), then the live
tool inside a bordered "demo" panel. An external-live entry (no `component`,
`liveUrl` is `http`) renders an "Open the live demo ↗" anchor instead.

### Behavior preserved (AC2 — "no behavior regression")
Each tool's **logic is verbatim** from the v1; only visuals were re-skinned:
- **TimeZoneConverter** — `DateTime.fromISO(input, {zone}).setZone(to).toFormat('yyyy LLL dd, hh:mm a ZZZZ')`, same zones.
- **TextAnalyzer** — same 6 counts (word/char/charNoSpaces/whitespace/line/punctuation), same regex.
- **EffortSlider** — the exact estimation chain (normalize ÷ `MAX_SLIDER=5` → `√·4.5` → `ceil` → nearest Fibonacci); Radix sliders keep `min=0 max=8 step=0.05`, vertical orientation (`flex-col-reverse`). The v1 debug cruft (500px-wide thumb, magenta borders, white-on-dark "space" spacer) is gone — the *math* is byte-for-byte preserved.
- **UnitConverter** — the same flat 6-unit table + `value·conv[from]/conv[to]`. ⚠️ The v1 table mixes length/mass/volume (so `m→kg` gives a cross-category value); that quirk is **preserved** as-is (flagged, not silently "fixed" — changing the math would be the regression).
- **BalloonPopper** — 1s spawn interval, +1 match / −1 miss (floored at 0), change-target button. Balloon colours are CSS **named** colours (game data — the target is a colour word the player matches), kept on `style` (not hex, not design tokens).

### Heading hygiene + AD-6 (no regression to the site outline)
Each tool's **own `<h1>` is removed** — the show page carries the page `<h1>`
(the project title); one h1/page is maintained (NFR-1). EffortSlider's
"Effort estimate: N" is the tool's output, rendered as a result `<p>` (not a
heading). No tool imports a CSS module anymore.

### CSS-module retirement (AD-6)
After the re-skin, `src/styles/layout.module.css` (326 lines, hex) and
`src/styles/UnitConverter.module.css` had **zero importers** → both **deleted**.
grep confirms no remaining references. The tools are pure Tailwind v4 +
`@theme` tokens (AD-6). New `src/site/buttons.ts` exports `buttonPrimary` /
`buttonGhost` / `field` class strings (light-surface, `outline-primary` ring)
shared by the tools + show page.

### External / in-site link handling (AC3)
`ProjectCard` (4.1): in-site `liveUrl` (`/…`) → RR `<Link>`; external → new tab
`rel="noopener noreferrer"`. `ProjectShow` + its source link use the same
`noopener noreferrer` for external opens. In-app tools link to `/projects/:slug`
(UX-DR-12) — which now renders the live tool (AC3 end-to-end).

### Historic 301s (AC4) — `public/_redirects`
Concrete rules (replacing the AR-9 stub comment), sitting above the SPA `/*`
fallback (Cloudflare first-match-wins). Slugs verified from git history
(the v1 `App.tsx` route paths):
```
/tools/timezone        /projects/time-zone-converter  301
/tools/textanalyzer    /projects/text-analyzer        301
/tools/effortestimator /projects/effort-estimator     301
/tools/unitconverter   /projects/unit-converter       301
/fun/balloon-popper    /projects/balloon-popper        301
/fun/balloon-popperv2  /projects/balloon-popper        301   # v2 collapsed in 2.3
/tools                 /projects                      301   # bare index
/fun                   /projects                      301   # bare index
```
8 rules → 30 total in `_redirects` (was 22). `/fun/balloon-popperv2` folds to
the single Balloon Popper entry (Story 2.3 collapsed v2 into v1), so neither
legacy URL 404s. (301 chains are only verifiable on the Cloudflare deploy, as
noted in 1.7 — `vite preview` ignores `_redirects`.)

### Head metadata — `kind: 'project'` (test-first)
Added `buildHeadMeta({ kind: 'project'; title; description; canonical })` to
`head-meta.ts` (mirrors `feed`): `<title> = <entry> · <author>`, description =
summary, `og:url`/canonical = `/projects/:slug`, default OG image, `website`
type, no noindex. 3 new tests (`project` head) + the show page wires it; an
unknown slug emits `not-found`. 116 tests total.

## ⚠️ Pre-existing red, now fixed (flag for you)
Your `4 - 1` commit replaced the placeholder "First Strip" comic with a **real
comic** — *"Certified Artisanal Brainthoughts"* (date `2026-07-16`, Sid & Darrel
at Burger Boss). That's real content; `validate.test.ts`'s stale assertion
(expected the old `2026-08-01` placeholder) went red. I **updated the test to
match the committed content** (`2026-07-16`) + its comment — I did not touch the
content. If `2026-07-16` was wrong and `2026-08-01` was intended, revert the
content date and I'll revert the test. (Slug `first-strip` is unchanged, so the
3.3 Latest strip still surfaces it as the 2nd-newest — just retitled/redated.)

## Files
**Created:** `src/site/buttons.ts`, `src/pages/ProjectShow.tsx`.
**Re-skinned (behavior preserved):** `src/tools/TimeZoneConverter.tsx`,
`src/tools/TextAnalyzer.tsx`, `src/tools/EffortSlider.tsx`,
`src/tools/UnitConverter.tsx`, `src/fun/BalloonPopper.tsx`.
**Modified:** `src/data/projects.ts` (`component` wired), `src/App.tsx`
(`/projects/:slug` → `ProjectShow`), `src/site/head-meta.ts` (`project` kind +
case), `src/site/head-meta.test.ts` (3 tests), `src/content/validate.test.ts`
(stale-date fix), `public/_redirects` (8 historic 301s).
**Deleted:** `src/pages/ProjectShowPlaceholder.tsx`,
`src/styles/layout.module.css`, `src/styles/UnitConverter.module.css`.

## Verification (automated)
- **Build:** green (2.98s).
- **Lint:** 0.
- **Tests:** 116 pass (+3 `project` head-meta; +1 stale-date fix).
- **AC grep audit:** 5 `component:` wired; `/projects/:slug` → `ProjectShow`;
  0 CSS-module references remain; 8 historic 301 rules + bare indices; show
  page renders summary + stack + source; tools have no `<h1>` + no CSS-module
  import; EffortSlider math (`MAX_SLIDER=5`, `√·4.5`, `ceil`, Fibonacci,
  `max=8 step=0.05`) byte-identical; external links `noopener noreferrer`.

## Review instructions (browser — ~10 min)

> `cd clintonjavery && npm run dev`.

1. **Live Time Zone Converter** (`/projects/time-zone-converter`): pick a
   date/time + from/to zones → Convert → the formatted result box. Try a
   from/to pair; back-button works (client-side).
2. **Live Text Analyzer** (`/projects/text-analyzer`): type/paste → the 6
   stats update live. Paste a paragraph, watch word/line/punct counts change.
3. **Live Effort Estimator** (`/projects/effort-estimator`): drag the 5 vertical
   sliders → the Fibonacci "Effort estimate" updates. (Drag Complexity to ~8
   alone → estimate climbs via the √ dampening.) The v1 estimate numbers
   should match the old tool for the same slider positions (math preserved).
4. **Live Unit Converter** (`/projects/unit-converter`): value + from/to →
   `result.toFixed(4)`. (Note `m→kg` is the preserved cross-category quirk.)
5. **Live Balloon Popper** (`/projects/balloon-popper`): balloons spawn ~1/s;
   pop a `target`-coloured one (+1) vs miss (−1); "Change target colour" works.
6. **Each show page:** has an `<h1>` title + summary + stack chips + "Source ↗"
   (→ GitHub file, new tab). One h1 per page. "← All projects" back to the list.
7. **De-emphasis (4.1 / UX-DR-16):** still inert for these 5 (all have live +
   source). Not exercisable here — only if an entry omits a link.
8. **Head (DevTools):** a project page shows
   `<title>Time Zone Converter · Clinton J Avery</title>`, canonical
   `/projects/time-zone-converter`; an unknown slug (`/projects/nope`) → the
   NotFound page + a `noindex` head.

## Gate to `done`
- Each live tool (steps 1–5) **works as before** — especially EffortSlider's
  estimate numbers and UnitConverter's results matching the old tool.
- The show-page layout (step 6) reads right.
- Commit suggested `4 - 2`. Stage the new + re-skinned tool files, `buttons.ts`,
  `ProjectShow.tsx`, `projects.ts`, `App.tsx`, `head-meta.ts`,
  `head-meta.test.ts`, `validate.test.ts` (stale-date fix), `_redirects`; and
  the deletions (`git rm` of the placeholder + 2 CSS modules is already staged
  in the index — your `4 - 2` commit will record them).

## Notes / decisions
- **EPIC 4 COMPLETE** (4.1 list + 4.2 live demos → FR-9 covered).
- **UnitConverter cross-category quirk preserved, flagged.** The mixed
  length/mass/volume table means `m→kg` is nonsensical. Keeping it preserves
  "no behavior regression"; fixing it (category-locked dropdowns) is a small
  follow-up you can green-light separately.
- **Balloon colours stay inline.** They're CSS named colours (gameplay data —
  "pop the RED balloons"), not design tokens, so they're on `style` (no hex; the
  design system isn't involved). Decorative chrome is all Tailwind tokens.
- **301 chains unverified locally** (1.7 learning) — `git ls-remote` confirmed
  `main`, but the `/tools/*` → `/projects/*` 301s are only testable on the
  Cloudflare deploy.
- **`sourceUrl` paths are stable** — I re-skinned the tools IN PLACE (same file
  paths), so the GitHub deep links committed in 4.1 remain valid.

## Next
**Epic 5: Comic Reading Experience — Zoom & Pan** (the remaining epic).
`EXPERIENCE` zoom/pan state table; a viewer chrome to inspect comics up close.
Until then the site is feature-complete against FRs 1–9.