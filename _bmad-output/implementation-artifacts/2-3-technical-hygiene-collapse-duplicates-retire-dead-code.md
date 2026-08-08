# Story 2.3 — Technical hygiene: collapse duplicates, retire dead code/assets

**Status:** `review` · **Epic:** 2 (Content Migration & Technical Hygiene) · **FR:** FR-15

## What shipped

### AC1 — BalloonPopper collapsed to one
Kept **`src/fun/BalloonPopper.tsx`** (v1). Deleted `src/fun/BalloonPopperV2.tsx`.
v1 is complete (shows "Pop the {color} balloons!" instruction; +1/−1 scoring). v2
introduced regressions and was discarded: a **module-level `let currentButtonColor`**
(shared mutable global — breaks across instances / HMR), a **dead "Level:" label**
(an incomplete feature), and −3-per-miss scoring. v2's one nice touch (button tinted
to the target color via `gameStyles.gameButton`) was not worth the bugs;
`src/styles/game.module.css` (used only by v2) was deleted as the now-orphaned
stylesheet. Exposure of the kept game as a Projects entry happens in **Epic 4 / FR-9**.

### AC2 — `/reading` retired
The `/reading` route was already absent from the `App.tsx` route config (Epic 1
replaced the whole legacy route table — so the "commented-out route" the spec
referred to no longer existed). Completed the retirement by deleting the orphan
`src/pages/Reading.tsx` (no external importers).

### AC3 — `/gallery` + `gallery.tsx` retired
Route already absent (AC2 reasoning). Deleted `src/pages/Gallery.tsx` and its data
module `src/data/gallery.tsx` (the only importer). **`public/images/*` artwork
left untouched** — AC3's "artwork images used elsewhere stay"; they are unused for
now but are your photos, not dead code, and removing image files is out of scope.

### AC4 — editor cruft removed
Deleted `public/assets/bg-space.jpg~` (the only `*~` editor backup). `dist/` is not
git-tracked → no stale build artifacts in the repo. `public/vite.svg` (default
Vite scaffolding; your favicon is `/images/favicon.png` via `index.html`) was **left
untouched per your instruction**.

### "And" — route/nav audit
`App.tsx` has exactly 5 active routes (`/`, `/p`, `/p/:slug`, `/projects`,
`/projects/:slug`) plus the new catch-all; `TopNav` carries only Feed + Projects. No
orphaned route referenced in nav. App compiles clean (build + lint + 110 tests).

### Folded-in extras (your call, "fold them both in")
1. **`/support` historic redirect.** Added `/support  /p  301` to the generic
   block in `public/_redirects` (the legacy Contribute page lived at `/support` —
   confirmed `git show 64ead59`, line 46: `<Route path="/support" element={<Contribute />} />`).
   Target `/p` (not `/`): the support-pill (Story 1.8) is route-scoped to render in
   `SiteFooter` only on `/p` + `/p/:slug`, so `/support → /p` lands the visitor on a
   page that actually **shows** the support affordance in its footer.
2. **RR7 catch-all route.** Added `<Route path="*" element={<NotFoundPage />} />`.
   RR7 has no built-in 404; previously an unmatched client-side path **blank-paged**
   (Cloudflare's SPA fallback only rewrites *edge* 404s to `index.html` — React
   Router then rendered nothing). Extracted the on-brand NotFound block out of
   `PostPage.tsx` into a shared presentational `src/pages/NotFound.tsx`, reused by:
   - `PostPage` for a valid `/p/:slug` with no matching post (keeps its own
     `useHead({kind:'not-found'})` — unchanged behavior, now DRY), and
   - the new `src/pages/NotFoundPage.tsx` (catch-all), which emits the same
     noindex `<head>` via `useHead(buildHeadMeta({kind:'not-found'}))`.

### Dead-page sweep (your call, "remove them all")
Deleted legacy pages that are dead + unreferenced (superseded, not PRD goals or
replaced by other surfaces): `About`, `Home`, `Comics`, `Contribute`, `Fun`,
`Tools`, `Projects`. **Kept** the implementations `src/tools/*` (EffortSlider,
TextAnalyzer, TimeZoneConverter, UnitConverter) and `src/fun/BalloonPopper.tsx`
for Epic 4. `Contribute.tsx` is superseded by the SupportPill (`SUPPORT_URL` in
`identity.ts`); the shared `venmoButton` CSS (also used by `TimeZoneConverter` in
`src/tools/`) was **not** touched.

## Files

**Deleted (13):** `public/assets/bg-space.jpg~`, `src/pages/{Gallery,Reading,About,
Home,Comics,Contribute,Fun,Tools,Projects}.tsx`, `src/data/gallery.tsx`,
`src/fun/BalloonPopperV2.tsx`, `src/styles/game.module.css`

**Created (2):** `src/pages/NotFound.tsx`, `src/pages/NotFoundPage.tsx`

**Modified (3):** `public/_redirects` (+`/support` rule), `src/App.tsx` (catch-all
route + import), `src/pages/PostPage.tsx` (import shared `NotFound`, dropped local
def + now-unused `Link` import)

## Verification (automated)
- **Build:** green (1.99s), `dist/_redirects` emitted, no warnings.
- **Lint:** 0 (`eslint .`).
- **Tests:** 110 pass (no test referenced any deleted file; the extract preserved
  `PostPage` behavior — `<NotFound/>` renders the identical JSX the inline fn did).
- **AC grep audit:** exactly one BalloonPopper impl + zero v2 refs; zero dangling
  imports to deleted files; zero `*~`; catch-all + NotFoundPage wired; `/support`
  rule present; `NotFound` reused by both `PostPage` and `NotFoundPage` (DRY).

## Review instructions (do these in the browser + check the diff)

> Run `cd clintonjavery && npm run dev`, then walk the list. Everything is
> client-side except the two Cloudflare `_redirects` checks, which need a deploy
> (or you can read `dist/_redirects` to confirm the rules are present — but the
> 301/rewrite behavior only runs on Cloudflare, same caveat as Story 2.2).

### A. Build still clean (30 sec)
1. `git status` → expect 13 deletions, 2 new files, 3 modified (see Files above).
2. `npm run build` → green. `npm run lint` → no output.
3. `git diff src/pages/PostPage.tsx` → confirm only: import line lost `Link`,
   gained `import NotFound from './NotFound';`, and the local `NotFound` function
   block is gone (replaced by `<NotFound />` at the `if (!post)` site).

### B. Catch-all 404 (the main functional change) — 2 min
1. Visit **`http://localhost:5173/this-does-not-exist`** (any bogus path).
   Expect: the on-brand **"This one's not here."** page with body "No post lives at
   this URL." and links to **Feed** + **Projects**. (Before this story: blank.)
2. Click **Feed** → arrives at `/p` (client-side nav, scrolls to top after Story 2.2's
   ScrollToTop). Click **Projects** → `/projects`. Browser back → returns to the
   404 page.
3. Visit an invalid but type-correct slug: **`/p/no-such-post`**. Expect the *same*
   "This one's not here." page (this path goes through `PostPage`'s missing-post
   branch, not the catch-all — but they now share `NotFound`, so identical render —
   this is the DRY proof). Confirm the layout looks identical to step 1.
4. Open DevTools → Elements → `<head>`: on the 404 page, confirm there is a
   `<meta name="robots" content="noindex">` (noindex so junk URLs stay out of the
   index). Confirm the page `<title>` is the not-found title (not a real post's).

### C. Dead code is really gone (1 min)
1. `grep -r "BalloonPopperV2\|game.module" clintonjavery/src` → no matches.
2. `ls clintonjavery/src/pages` → no `Gallery.tsx`, `Reading.tsx`, `About.tsx`,
   `Home.tsx`, `Comics.tsx`, `Contribute.tsx`, `Fun.tsx`, `Tools.tsx`, `Projects.tsx`.
   Expect to still see: `Feed`, `PostPage`, `LandingPlaceholder`,
   `ProjectsPlaceholder`, `ProjectShowPlaceholder`, `NotFound`, `NotFoundPage`, and
   the `feed-utils`/`postPage-utils` + their tests.
3. App still navigates: click **Writing**/Feed → list renders; click a post → renders;
   click **Projects** → placeholder renders. Nothing 404s except genuinely-bogus paths.

### D. `/support` redirect (Cloudflare gate — same as 2.2)
1. `cat clintonjavery/public/_redirects` → confirm `/support  /p`
   `301` sits in the generic block (after the `/writing  /p  301` line, above the
   Story 2.2 per-post block and the catch-all).
2. **After deploy:** `curl -sI https://www.clintonavery.com/support` → expect
   `301` and `location: /p`. Then load `/support` in a browser → lands on the Feed
   **with the SupportPill visible in the footer** (the whole reason the target is
   `/p` not `/`). Tap the pill → opens Venmo in a new tab (the 1.8 behavior).

### E. Editor cruft
1. `find clintonjavery/public -name "*~"` → none. (Only `bg-space.jpg~` existed.)

## Gate to `done`
- Browser checks B + C pass locally.
- Deploy + confirm D (the one Cloudflare-only check); the rest is already green.
- Commit suggested: `2 - 3` (your convention). Stage everything: `git add -A` is
  safe here — the only working-tree items are this story's changes (your strip.png
  changes were already committed with 2-2 per your note).

## Notes for downstream
- **Epic 4** will re-wire `src/tools/*` + `src/fun/BalloonPopper.tsx` as Projects
  entries (FR-9) and add the `/tools/*` + `/fun/*` → `/projects/<slug>` 301s (the
  placeholder slots already exist in `_redirects`).
- The shared `NotFound` presentation is now the single source for the 404 body;
  if you restyle it, both the missing-post path and the catch-all update together.
- `layout.module.css` / `layout.module.css`-class consumers: the deleted legacy
  pages were the main users of many `layout.module.css` rules (pageContainer,
  heading, pageSubtext, galleryGrid, etc.). Those CSS rules are now orphaned but
  harmless; full CSS-Module retirement is tracked per AD-6 ("retired per-component
  as it is rebuilt") — not part of 2.3. Flagged, not actioned.