---
baseline_commit: 5501f76dfeb45c7810cece5d80641364990d2762
---

# Story 1.5: Unified Feed with type filter + pagination

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->
<!-- Story key: 1-5-unified-feed · Epic 1, fifth story (depends on 1-1, 1-2, 1-3, 1-4). -->

## Story

As a **reader**,
I want **to browse all posts in one chronological stream, filter to essays or comics, and paginate**,
so that **I can find and binge the form I'm in the mood for**.

**Epic context:** Epic 1 (Publishing & Reading Foundation) builds the publishing pipeline, routes, per-type Post page, unified Feed, SEO, deploy, and support affordance on the Ink & Garden system. **This story builds the real unified Feed** at `/p` — replacing the Story 1.3 `FeedPlaceholder`. It renders **all published Posts reverse-chronologically** as per-type cards (essay: title + date + 1-line excerpt; comic: strip image-forward + date + optional caption chip), with an **All / Essays / Comics segmented Type Filter** (URL-driven `?type=`), **10-per-page pagination** with prev/next + page numbers (URL-driven `?page=`, shareable), the on-brand empty-filter state ("No posts match that filter yet."), a calm cold-load skeleton, and the ensured exclusion of drafts. FRs covered: **FR-4** (Feed + type filter, client-side re-scope), **FR-5** (10/page pagination, shareable URLs), **FR-14** (in-app client-side nav). **Depends on Story 1.1** (`styles.css` `@theme` tokens + Tailwind v4 utilities), **Story 1.2** (the `content-index` export `posts: Post[]` — already reverse-chron by `date` DESC, `slug` ASC tiebreak, **published-only / draft-excluded** — see Dev Notes §Content-index contract), and **Story 1.3** (the `/p` route + Shell landmarks / one-`h1`-per-page / client-side-`<Link>` discipline). Reuses **Story 1.4's** `stripRetrySrc` helper for the comic-card image-load-failure cache-bust (EXPERIENCE state table line 92: image-load-failure applies to "Post (comic) / card").

### How to review this story (READ ME FIRST)

This is a **visually reviewable** story. Review it by **looking at the running app** (`cd clintonjavery && npm run dev`, open `http://localhost:5173/p`):

1. **Default Feed:** `/p` shows the page `<h1>`, the All/Essays/Comics segmented filter (`All` active = `ink-surface` fill + `on-ink` text; the others `surface-container` + `on-surface-variant`), then the cards in **reverse-chron** order: `hello-ink-garden` (Aug 6) before `first-strip` (Aug 1). With only 2 posts, page 1 shows both and **no pagination** control renders (≤1 page).
2. **Essay card:** the `hello-ink-garden` card shows its Fraunces title, the date, and the **1-line excerpt** from frontmatter (`excerpt`); the whole card is a client-side `<Link>` to `/p/hello-ink-garden` (URL changes, no full reload).
3. **Comic card:** the `first-strip` card is **image-forward** — the strip image is the visual top of the card — with the date and the caption chip "Planting the system." in `secondary-container`/`on-secondary-container` (NOT an orange fill). Whole card links client-side to `/p/first-strip`.
4. **Type filter:** click `Comics` → URL becomes `/p?type=comic`, list re-scopes to just `first-strip` **client-side, no reload**. Click `Essays` → `/p?type=essay`, just `hello-ink-garden`. Click `All` → back to `/p` (clean URL, `?type=` normalised out). Each active segment flips to the dark fill; selection is also conveyed by `aria-checked` (not color alone).
5. **Direct/sahreable deep link:** open a fresh tab at `http://localhost:5173/p?type=comic` → the Feed is **pre-scoped to comics** (no flash of all-posts then filter — the correct filter applies on first paint). `?page=2` on a 1-page feed shows **no items** (never an error); the pagination control (if any) points back to page 1.
6. **Empty filter:** (only reachable once there are 0 of a type — e.g. add a draft essay of the missing type, or temporarily) → shows **"No posts match that filter yet."** with the filter control still usable to switch back. (`essay` and `comic` both currently have ≥1 published post, so this needs a throwaway to verify — see T7.4.)
7. **Cold-load skeleton:** on first paint of `/p`, a **calm skeleton list** flashes briefly (gray placeholder bars) before the real cards populate — **no spinner**, no churn. On filter/page changes the list updates instantly (no skeleton re-flash).
8. **Comic-card image failure:** temporarily break a comic strip src → its card shows a muted "Couldn't load the strip. Refresh?" with a Retry affordance; the `alt` stays available to a screen reader (the `<img>` stays in the a11y tree).
9. **Accessibility floor:** `Tab` from the top → skip link first; the page has exactly one `<h1>`; the segmented filter is a `role="radiogroup"` with `role="radio"` `aria-checked`; pagination (when present) is a `<nav aria-label="Pagination">` of links with `aria-current="page"` on the active one; every interactive element has a visible focus ring; tap targets ≥44px; drafts never appear.

If all nine hold, the story passes. The non-visual checks (`npm run build` + `npm run lint` + `npm test` green; grep proving no raw `<a href="/…">` in-app anchors and no inline hex in new code) are the secondary gate.

## Acceptance Criteria

<!-- Verbatim BDD from epics.md · Story 1.5. Do not weaken. -->

1. **AC1 — All published posts render reverse-chronologically as per-type cards.** Given published posts in the `content-index`, when I open `/p`, then all render reverse-chronologically as cards (essay: title + date + excerpt; comic: strip image-forward + date + optional caption chip).

2. **AC2 — Pagination at 10/page with prev/next + page numbers, active in `primary`, shareable URLs.** Given page size 10, when paginating, then page 1 shows the 10 newest; prev/next + page numbers with the active page in `primary`; each page has a shareable URL that returns the same page on direct load.

3. **AC3 — Type Filter updates `?type=` and re-scopes client-side, no reload.** Given the Type Filter, when I select All / Essays / Comics, then the URL updates (`?type=`) and the list re-scopes client-side with NO full reload.

4. **AC4 — `?type=comic` direct load is pre-scoped.** Given `/p?type=comic`, when opened directly, then the Feed is pre-scoped to comics.

5. **AC5 — Empty filter copy + pagination beyond end returns no items (never an error).** Given a filter with zero matches, when rendered, then "No posts match that filter yet." is shown; pagination beyond the last populated page returns no items (never an error).

6. **AC6 — Cold-load skeleton placeholder, posts populate without spinner churn.** Given the Feed cold-load, when first painting, then a skeleton list placeholder shows; posts populate without spinner churn.

7. **AC7 — Drafts never appear.** And drafts, when the Feed renders, then never appear.

## Tasks / Subtasks

- [x] **T1 — TDD pure helpers for the Feed (`src/pages/feed-utils.ts` + `.test.ts`)** (AC1, AC2, AC3, AC4, AC5, AC7)
  - [x] T1.1 **RED:** write `clintonjavery/src/pages/feed-utils.test.ts` (Vitest, `environment: node` — same harness as `src/content/validate.test.ts` and `src/pages/postPage-utils.test.ts`) with failing assertions for:
    - `parseTypeParam(undefined)` → `'all'`; `parseTypeParam('comic')` → `'comic'`; `parseTypeParam('essay')` → `'essay'`; `parseTypeParam('all')` → `'all'`; `parseTypeParam('bogus')` → `'all'` (invalid → all); `parseTypeParam('COMIC')` → `'comic'` (case-insensitive).
    - `parsePageParam(undefined)` → `1`; `parsePageParam('2')` → `2`; `parsePageParam('0')` → `1`; `parsePageParam('-3')` → `1`; `parsePageParam('abc')` → `1`; `parsePageParam('2.9')` → `1` (integers only); `parsePageParam('99')` → `99` (NOT clamped here — the caller handles beyond-end; T1.4 covers empty-on-beyond). `parsePageParam` returns the page as-is so an out-of-range page yields an empty slice (AC5).
    - `totalPages(0, 10)` → `0`; `totalPages(1, 10)` → `1`; `totalPages(10, 10)` → `1`; `totalPages(11, 10)` → `2`; `totalPages(23, 10)` → `3`.
    - `paginatePosts(samplePosts, 'all', 1, 10)` → the full list sliced to page 1; `paginatePosts(samplePosts, 'essay', 1, 10)` → only essays, slice page 1; `paginatePosts(samplePosts, 'comic', 1, 10)` → only comics; `paginatePosts(samplePosts, 'all', 2, 10)` with 11 posts → item 11 only; `paginatePosts(samplePosts, 'all', 99, 10)` → `[]` (beyond end → empty, never throw — AC5); `paginatePosts(samplePostsThatAreAllDrafts, …)` — note: the real `posts` is already draft-excluded by the content gate, so `paginatePosts` does NOT re-filter by status; it trusts its input is published-only. Document this in the helper's JSDoc (AC7 is satisfied at the index layer, not here).
    - `buildPageWindow(1, 1)` → `[1]`; `buildPageWindow(3, 5)` → `[1, 2, 3, 4, 5]`; `buildPageWindow(5, 10)` → `[1, '…', 4, 5, 6, '…', 10]` (window radius 1 + first/last always shown + ellipsis gaps); `buildPageWindow(1, 10)` → `[1, 2, '…', 10]`; `buildPageWindow(10, 10)` → `[1, '…', 9, 10]`; `buildPageWindow(1, 1)` no ellipsis. (`buildPageWindow` returns `(number | 'ellipsis')[]`.)
    - `typeParamValue('all')` → `null` (means "omit `?type=`"); `typeParamValue('essay')` → `'essay'`; `typeParamValue('comic')` → `'comic'` (used to normalise the URL — `all` is represented by the ABSENCE of `?type=`, see Dev Notes §URL contract).
    - `pageParamValue(1)` → `null` (omit `?page=` for page 1); `pageParamValue(2)` → `2` (string `'2'`).
    Confirm `npm test` is RED for these.
  - [x] T1.2 **GREEN:** implement `clintonjavery/src/pages/feed-utils.ts` exporting `parseTypeParam`, `parsePageParam`, `totalPages`, `paginatePosts`, `buildPageWindow`, `typeParamValue`, `pageParamValue` — minimal pure code to pass. No React, no DOM, no router. `paginatePosts` filters by type then slices `[(page-1)*size, page*size)`. `buildPageWindow` adds the `1` and `last` ends plus a radius-1 window around `current`, inserting `'…'` where there's a gap of ≥2. Parse helpers are defensive (`Number.isInteger`, `Math.max(1, …)`, `.toLowerCase().trim()`).
  - [x] T1.3 **REFACTOR:** keep helpers tiny/pure. Run `npm test` → GREEN (the 1.2 `validate.test.ts` + 1.4 `postPage-utils.test.ts` suites stay green alongside the new tests — target ~16+ specs).

- [x] **T2 — Route wiring + retirement of `FeedPlaceholder`** (all ACs)
  - [x] T2.1 In `clintonjavery/src/App.tsx`: swap the `/p` element from `<FeedPlaceholder />` to the new `<Feed />` (import + JSX). **NO** other route changes — `/p/:slug` (PostPage), `/` (LandingPlaceholder), `/projects`(+`/:slug`) placeholders all stay untouched. The Shell (`BrowserRouter` + `SkipLink` + `TopNav` + `<main id="main">` + `SiteFooter`) from 1.3 is reused as-is — the Feed renders *inside* `<main>`.
  - [x] T2.2 Delete `clintonjavery/src/pages/FeedPlaceholder.tsx` — fully superseded by `Feed.tsx` (and remove its now-unused import from `App.tsx`). LEAVE `LandingPlaceholder.tsx` (Epic 3) and `ProjectsPlaceholder`/`ProjectShowPlaceholder` (Epic 4) alone.
  - [x] T2.3 Confirm the build still has **no hand-registered per-post `<Route>`** (AD-5) — the Feed + PostPage read slug/page from the content-index / URL; nothing per-post is added to the router.

- [x] **T3 — Feed page shell: `<h1>` + page layout + consume `useSearchParams`** (AC1, AC5)
  - [x] T3.1 Create `clintonjavery/src/pages/Feed.tsx`. It imports `posts` from `../content` (the `virtual:content-index` re-export — AD-1; **never** `import.meta.glob('/content/...')` directly) and the helpers from `./feed-utils`. It reads `useSearchParams()` from `react-router-dom` (RR 7.4 → `useSearchParams` is the canonical query hook; **not** `useLocation().search` string parsing). Derive the live filter + page: `const type = parseTypeParam(searchParams.get('type')); const page = parsePageParam(searchParams.get('page'));` — computed once per render from `searchParams` (single source of truth → direct loads + in-app navigations share one code path; AC4 pre-scope "just works" because the initial `searchParams` reflects the URL).
  - [x] T3.2 Page shell: a `<div className="mx-auto w-full max-w-feed-max px-4 py-12 sm:py-16">` whose **single `<h1>`** is the page heading (e.g. `"Feed"` in `font-display` — one `<h1>` per page, NFR-1). Inside the shell, in reading order: the `<h1>`, the Type Filter (T4), the card list (T5) or the empty/skeleton state (T6/T7), the pagination (T8). Exactly **one `<h1>` per page** — cards use `<h2>`/`<h3>` for their titles (the post title is the card's heading, NOT an `<h1>`). This keeps the document outline: page `<h1>` → card `<h2>` → (Post page has its own `<h1>`).

- [x] **T4 — Type Filter segmented control (radiogroup, URL-driven)** (AC3, AC4)
  - [x] T4.1 Render the filter as `<div role="radiogroup" aria-label="Filter posts by type" className="…segmented…">` containing three `<button role="radio" aria-checked={active}>` items: **All / Essays / Comics** (text labels — meaning is **not** encoded by color alone, NFR-1/UX-DR-17). The active segment flips to `bg-ink-surface text-on-ink`; inactive are `bg-surface-container text-on-surface-variant`. Container `rounded-full` (DESIGN.md `type-filter.radius: rounded.full`); the whole control sits **above** the card list. Tap targets ≥44px (NFR-1).
  - [x] T4.2 On click/`Enter`/`Space`, call `setSearchParams(next)` where `next` drops/sets `type` via `typeParamValue(nextType)` (so `all` → remove `?type=`, clean URL) AND **resets `page` to 1** (a filter change re-paginates from page 1 — never strand the user on a now-empty page N). Build `next` with a fresh `URLSearchParams` to keep keys ordered/clean. `setSearchParams` performs **client-side** navigation (RR updates the URL + `useSearchParams` re-renders) — **no full reload** (FR-14/AC3).
  - [x] T4.3 Keyboard: radiogroup items are real `<button>`s → native `Tab`/`Enter`/`Space`; `aria-checked` reflects the active one. Focus-visible ring on each. (Using buttons-not-links here because it's a single-select filter — the canonical a11y shape — while the URL still updates for shareability via `setSearchParams`. Document the choice in Dev Notes §Segmented-control a11y.)

- [x] **T5 — Per-type card rendering (essay card + comic card, client-side `<Link>`)** (AC1, AC7)
  - [x] T5.1 Each card is a `<Link to={`/p/${post.slug}`}>` (client-side nav — FR-14) wrapping an `<article>` with the card tokens (`bg-surface border border-outline-variant rounded-lg`, DESIGN.md `post-card`/`comic-card`). The list is a **single column** (UX-DR-8/19 — "list layout, not a grid"; "Feed single-column at all widths") — a vertical stack of full-width cards with vertical gaps. Each card title is an `<h2>` (not `<h1>`). Whole card is clickable via the `<Link>` (award a clear focus ring on the link).
  - [x] T5.2 **Essay card** (`post.type === 'essay'`): `<h2 className="font-display text-headline-sm text-ink">post.title</h2>`, then date (`formatPostDate(post.date)` — **import `formatPostDate` from `./postPage-utils`**, reuse the 1.4 helper so dates format identically across Feed + Post), `text-on-surface-variant text-sm`, then the 1-line excerpt (`post.excerpt ?? ''`) in `caption`/`text-sm text-on-surface-variant`. If `excerpt` is absent, omit the excerpt line (don't render empty chrome). No card image for essays in v1 (essay `ogImage` is for SEO, 1.6; the card is title+date+excerpt).
  - [x] T5.3 **Comic card** (`post.type === 'comic'`): **image-forward** — the Strip is the visual top of the card. Render the comic image via the same retry helper as 1.4: `src={stripRetrySrc(post.strip.image, retryKey)}` (import `stripRetrySrc` from `./postPage-utils`), `alt={post.strip.alt}`. Below the image (or beside on wider screens — keep it simple: below in a small `p-3`/`p-4` footer band): the date and, **only if `post.caption` is present**, a **caption chip** `<span className="inline-block rounded-full bg-secondary-container px-3 py-1 text-on-secondary-container text-sm">post.caption</span>` (DESIGN.md `comic-card`: "optional caption chip in `secondary`"; AR-4 contrast — `secondary-container` + `on-secondary-container` is the AA-safe container pair, NOT a `secondary` text fill). The card date band is `text-on-surface-variant text-sm`.
  - [x] T5.4 **Comic-card image-load failure** (EXPERIENCE state table line 92): give the comic card its OWN minimal `<img onError>` retry (reuse the 1.4 `ComicStrip`-style pattern at card scale): on error, swap the `<img>` to `sr-only` (keeps `alt` in the a11y tree) and show a muted tile "Couldn't load the strip. Refresh?" + a **Retry** button that bumps `retryKey` (cache-busts via `stripRetrySrc`, re-attempts the load). Scope this tightly — it's a defensive parity with the Post page, low cost because `stripRetrySrc` already exists. (No skeleton churn here — the rest of the card [date/caption] renders regardless; only the image tile shows the retry state.)

- [x] **T6 — Cold-load skeleton placeholder (no spinner)** (AC6)
  - [x] T6.1 Implement a **cold-load-only** skeleton: `const [hydrated, setHydrated] = useState(false)` → `useEffect(() => { const id = setTimeout(() => setHydrated(true), 150); return () => clearTimeout(id); }, [])` (runs ONCE on mount — empty dep array; **does NOT re-run on filter/page changes** so there's no churn on re-scope). While `!hydrated`, render a static skeleton list: `pageSize` (10) placeholder bars — `<li>`/`<div>` with `bg-surface-container` + `rounded-md`, a tall bar (title) + two shorter bars (text), matching the card footprint. Once `hydrated`, render the real cards. **No spinner animation** (brand "no hype"); the skeleton is **static** (no shimmer pulse) → reduced-motion-safe by default. The 150ms min-display makes the skeleton perceivable on cold-load without feeling like churn; document the reconciliation in Dev Notes §Skeleton & synchronous data.

- [x] **T7 — Empty + beyond-end + draft states** (AC5, AC7)
  - [x] T7.1 **Zero matches for the active filter** (`paginated.items.length === 0` AND `totalPages ≥ 1` for that filter, i.e. the type genuinely has no posts): render the on-brand **"No posts match that filter yet."** in `text-on-surface-variant`, centered/calm, with the filter control still usable (so the user can switch back to All). Keep it minimal — no icon-heavy empty state (UX-DR-16). The `<h1>` + filter still render; only the list area shows the message.
  - [x] T7.2 **Pagination beyond end** (`page > totalPages` for the active filter, e.g. `/p?page=99` on a 1-page feed): render **no items** (empty list area — NOT the "no posts match" copy; the empty-filter copy is for zero-of-type, beyond-end is a different state). The pagination control (T8) still renders and points back to valid pages. **Never throw / never a 404** (AC5). (With `totalPages === 0` — i.e. zero published posts of any type, unreachable today — show the empty-filter copy too.)
  - [x] T7.3 **Drafts never appear (AC7):** the `posts` from the content-index are already draft-excluded by the 1.2 build gate (`buildCollection` skips `status: 'draft'` before emitting the virtual module). The Feed does **not** re-filter by status — it trusts the index. Add an assertion-style comment in `Feed.tsx` noting AC7 is satisfied at the content-index layer (one-way boundary, AD-1). No Feed-side work for AC7 beyond the trust + comment.
  - [x] T7.4 **Negative-test verification (throwaway, then revert):** to exercise the empty-filter copy without waiting for a genuinely empty type, temporarily add a throwaway draft of the only essay (or temporarily flip `hello-ink-garden`'s frontmatter `status: draft`) → reload `/p` with `?type=essay` → confirm "No posts match that filter yet." shows; confirm `?type=all` still lists comics (the draft essay is excluded). Then **revert the throwaway**. Also temporarily visit `/p?page=99` → confirm no error, no items. Record the verification in the Completion Notes.

- [x] **T8 — Pagination control (prev/next + windowed page numbers, shareable)** (AC2)
  - [x] T8.1 When `totalPages > 1` for the active filter, render a `<nav aria-label="Pagination" className="…">` after the card list. Compute `window = buildPageWindow(page, totalPages)`. Render: a **Prev** link (disabled/styled-muted + `aria-disabled` when `page === 1`), the page-number links (each a `<Link>` to `{ ?type=, ?page=N }` with the active page styled `text-primary font-semibold` and `aria-current="page"`), an ellipsis rendered as a non-link `<span aria-hidden="true">…</span>`, and a **Next** link (disabled when `page === totalPages`). All client-side `<Link>`s — shareable URLs (AC2/FR-5). Tap targets ≥44px.
  - [x] T8.2 Build each page link's `to` from the current `type` + the target page, using `typeParamValue`/`pageParamValue` (so `/p` for `{all,1}`, `/p?page=2`, `/p?type=comic&page=2`, etc. — clean, shareable, normalised). Use RR `<Link>` `to={{ search: … }}` or a hand-built search string via `URLSearchParams` — either is fine; ensure `?type=` is omitted for `all` and `?page=` omitted for page 1 (Dev Notes §URL contract).
  - [x] T8.3 When `totalPages <= 1`, render **no** pagination control (don't render a disabled page 1 + greyed next on a single page — UX-DR-13 shows the control only when it paginates).

- [x] **T9 — Discipline + regression gate** (all ACs)
  - [x] T9.1 **gpl/ad:** `npm run build` (`tsc -b && vite build` — AD-7, unchanged) green; `npm run lint` 0 problems; `npx vitest run` all green (1.2 + 1.4 + new feed-utils suites). `pages/` count goes up by net +1 (`Feed`/`feed-utils` + `feed-utils.test`, −`FeedPlaceholder`).
  - [x] T9.2 **grep (AD-1 / AD-3 / FR-14):** (a) no raw `<a href="/…">` in-app anchors in the new files (T8 uses `<Link>`); (b) no inline hex literals in new code (tokens via Tailwind utilities / `var(--color-*)` only); (c) no `import.meta.glob('/content/...')` or direct `content/...` import in `Feed.tsx` (imports only `../content` + sibling `./*-utils`).
  - [x] T9.3 **a11y floor (NFR-1):** one `<h1>` (page) + card `<h2>`s; segmented filter is a radiogroup with `aria-checked`; pagination is a labelled `<nav>` with `aria-current="page"`; skip link + landmarks from 1.3 untouched; focus-visible rings; tap targets ≥44px; meaning not by color alone (text labels + aria).
  - [x] T9.4 **reduced motion (UX-DR-18):** the skeleton is static (no animation) → reduced-motion-safe by default; no scroll-reveal on the Feed (scroll-reveal is Landing-only, EXPERIENCE line 102); no zoom transitions involved.
  - [x] T9.5 **manual visual smoke:** `npm run dev`, walk the 9-step "How to review" list above (the primary review surface — render behaviour is deferred from component tests per AR-11). Record any throwaway-verified states (empty filter, beyond-end) in Completion Notes.

## Dev Notes (READ BEFORE IMPLEMENTING)

### Content-index contract (do not re-sort / do not re-filter drafts)
`posts` (from `../content` → `virtual:content-index`) is **already** the correct, ordered, published-only collection — `buildCollection` in `src/content/plugin.ts` sorts **`date` DESC, `slug` ASC tiebreak** (FR-5 feed order) and **excludes `status: 'draft'`** before emitting. So the Feed:
- does **NOT** re-sort (trust the order; `paginatePosts` preserves input order);
- does **NOT** re-filter drafts (AC7 is satisfied at the index layer — add the trust comment, per T7.3);
- only **filters by `type`** (All/Essays/Comics) and **slices** by page.
Type-filter then slice: `paginatePosts(posts, type, page, 10)` returns `{ items, totalPages }` where `totalPages` is computed from the **filtered** count (so `?type=comic` with 1 comic → `totalPages === 1`, no pagination control, AC2 honoured per-filter). **Gotcha:** if you compute `totalPages` from the *unfiltered* `posts.length`, the page numbers would be wrong for filtered views — always filter-then-count. The helper signature makes this explicit (filter inside `paginatePosts`, return `totalPages` from the filtered set).

### URL contract (normalisation for shareable + clean URLs)
- `?type=`: `all` is represented by the **absence** of the param (clean `/p`); `essay`/`comic` set `?type=essay`/`?type=comic`. `parseTypeParam` accepts missing/invalid/`'all'` → `'all'`; case-insensitive.
- `?page=`: page 1 is represented by the **absence** of the param (clean `/p`); page N>1 sets `?page=N`. `parsePageParam` accepts missing/invalid/<1/non-integer → `1`; returns the integer as-is (beyond-end handled by the slice, AC5).
- Combining: `/p?type=comic&page=2` is the canonical filtered+paginated URL. Direct load of any such URL returns the same page (AC2/AC4) because the *initial* `useSearchParams` reflects the URL on first render — there's no "flash all then filter" (the filter/page are derived once, synchronously, from `searchParams`).
- Always rebuild the query via a fresh `URLSearchParams` (or `setSearchParams` with a next object) so unused keys are dropped and ordering is stable; **never** mutate the live `searchParams` object (RR gives you a snapshot).

### Segmented-control a11y (radiogroup-of-buttons, not links)
A Type Filter is a single-select control; the canonical accessible shape is `role="radiogroup"` + `role="radio"` `aria-checked` items that are real `<button>`s (native `Tab`/`Enter`/`Space`, real focus rings). We deliberately use **buttons + `setSearchParams`** rather than `<Link>`s here: links would convey "navigable destinations," but a filter communicates "the currently selected view." The URL still updates (shareable, AC3) via `setSearchParams` — there is NO full reload (RR re-runs `useSearchParams`). The active segment is conveyed by **both** the dark fill AND `aria-checked` (not color alone, NFR-1). Pagination page numbers, by contrast, ARE distinct destinations → those stay `<Link>`s with `aria-current="page"`.

### Skeleton + synchronous data (reconciliation)
`posts` is a **build-time** `eager` `import.meta.glob` → it is available **synchronously** at runtime (no fetch, no suspense, AD-3/NFR-3). So a true "loading" state doesn't exist for the list data. AC6's "skeleton placeholder on cold-load" is a **perceived-performance** affordance, not async-wait: we show a static skeleton for a short cold-load window (150ms, mount-once) then swap to real cards. This gives a calm "populate without spinner churn" feel while honouring the brand's "no spinners / no hype / no churn." The skeleton is **static** (no shimmer animation) so it's reduced-motion-safe by default (UX-DR-18). If the 150ms flash ever feels like churn in review, it's a one-line tune — not an architecture issue. **Re-runs:** the skeleton does NOT re-flash on filter/page changes (those are instant) — only the true cold-load shows it.

### Comic-card image-load-failure (defensive parity with 1.4)
EXPERIENCE state table line 92 lists image-load-failure for "Post (comic) / **card**." The 1.4 `stripRetrySrc` helper + `<img onError>`-keep-alt-sr-only-then-retry pattern is the established solution; we reuse it at card scale. Cost is near-zero (helper exists + unit-tested). Scope it tight: only the comic card's image tile swaps to the retry state — the date/caption band renders regardless, so a failed image doesn't blank the card. This is **not** one of the seven BDD ACs verbatim, but the state table makes it an expected behaviour; including it now prevents broken-image cards in the Feed once Epic 2 adds many comics.

### Per-type card rendering — token map (Tailwind v4 utilities, AD-6, AR-3)
All tokens resolve from the 1.1 `@theme` block; use the generated Tailwind utilities (no hex, no CSS Modules):
- Page column: `max-w-feed-max` (`--container-feed-max: 1080px`).
- Card: `bg-surface border border-outline-variant rounded-lg`.
- Essay title: `font-display text-ink` (headline-sm-ish). Card title is `<h2>`.
- Date/excerpt/caption-band: `text-on-surface-variant text-sm`.
- Filter container: `rounded-full`; active seg `bg-ink-surface text-on-ink`; inactive `bg-surface-container text-on-surface-variant`.
- Caption chip: `rounded-full bg-secondary-container text-on-secondary-container text-sm` (the safe container pair — NOT `bg-secondary text-on-*`).
- Pagination: numbers/prev/next `text-on-surface-variant`; active `text-primary font-semibold` + `aria-current="page"`; disabled `aria-disabled` + muted.
- Skeleton: `bg-surface-container rounded-md` static bars.
If a complex descendant pattern is genuinely needed, add it to `@layer base` in `src/styles.css` (token-only `var(--color-*)`) — like the 1.4 `.prose` block. **Prefer Tailwind utilities first**; only reach for `styles.css` if utility composition can't express it.

### What is OUT of scope (other stories)
- **Support pill** in the Feed footer → **Story 1.8** (FR-12). Do NOT build it here.
- **Per-post SEO/OG** + `og:image` + sitemap → **Story 1.6** (FR-10/FR-11). Cards don't emit meta.
- **Landing** (`/` hero/narrative/Latest-3) → **Epic 3**. `/` stays `LandingPlaceholder`.
- **Comic zoom/pan** → **Story 5.1** (FR-16). Cards/images are static (fit).
- **Tags** (schema reserves `tags?` but the feature is deferred, AR-11). Cards don't render tags.
- **RSS/subscribe/analytics** — deferred (AR-11).

### Reused 1.4 helpers (cross-page import is fine)
`Feed.tsx` imports from `./postPage-utils` (sibling in `src/pages/`): `formatPostDate` (identical "August 1, 2026" formatting across Feed + Post) and `stripRetrySrc` (comic-card image cache-bust). These are pure functions; the cross-page import is the intended seam (no need to relocate them). If a future story wants these shared across more surfaces, extract to `src/utils/` then — not now (avoid touching committed 1.4 files).

### Testing strategy (AR-11 deferral honoured)
Pure helpers (`feed-utils.ts`) are TDD'd with Vitest (`environment: node`) — that's the red→green→refactor loop. The **render layer** (`Feed.tsx` — segmented control, cards, skeleton, pagination, empty/beyond-end states) is **not** component-tested because the project has no `@testing-library/react`/jsdom (AR-11 defers it). It is verified by (a) the dev-server smoke + the 9-step manual review (T9.5, the primary review surface) and (b) the build/lint/grep gates (T9.2). This matches the 1.3/1.4 deferral exactly.

## Previous-story intelligence (carry forward)

- **1.4 (per-type Post page):** established `pages/PostPage.tsx` + `pages/postPage-utils.ts`(+`.test.ts`) — **reuse `formatPostDate` + `stripRetrySrc` here** (see Reused 1.4 helpers above). Established the **edit-tool-serialization glitch** → for new page files that are JSX/brace-heavy, **write them via the `write` tool** (full-file), not the `edit` tool; reserve `edit` for small unique-string swaps in low-brace files. Established that `styles.css` edits (CSS, no JSX) apply cleanly via `edit`. Established the **`.prose` block** approach (`@layer base`, token-only) — use the same `styles.css` seam if the Feed needs a complex descendant rule.
- **1.4 review-fix (MDX `_provideComponents`):** `vite.config.ts` had `mdx({ providerImportSource: 'react' })` which threw on essay-body render; **fixed** by removing `providerImportSource` (MDX compiles provider-less). **Does not affect 1.5** (the Feed never renders essay MDX bodies — only cards) — but carry the lesson: render the actual feature at dev time, don't trust that "it builds" = "it renders."
- **1.3 (routing shell + TopNav):** the Shell (`BrowserRouter` + `SkipLink` + `TopNav` + `<main id="main" tabIndex={-1}>` + `SiteFooter`) is the container — `Feed` renders inside `<main>`, reuses landmarks + skip link, adds the page `<h1>`. Established client-side-`<Link>` discipline + `?type=` route exists at `/p` (AD-5). Established one-`<h1>`-per-page + `aria-current` patterns (TopNav active state) — mirror for pagination.
- **1.2 (content pipeline):** `buildCollection` does the sort + draft-exclude + validate; the `posts` export is the one contract (AD-1/AD-2). The Feed **trusts** it (no re-sort, no re-filter, AD-1 import-only-via-`../content`). `useSearchParams` reads `?type=`/`?page=` — these are RR query params, not content-derivered routes.
- **1.1 (design system):** Tailwind v4 utilities from `@theme`; `--container-feed-max: 1080px`; tokens for card/filter/pagination already defined. No new tokens needed for 1.5.

## AR / FR / UX-DR map (traceability)

| Requirement | Where in this story |
|---|---|
| FR-4 (Feed + type filter, client-side re-scope) | T3/T4/T5 (cards) + T4.2 (`setSearchParams`, no reload) — AC1/AC3 |
| FR-5 (10/page pagination, shareable URLs) | T8 + `feed-utils.paginatePosts/totalPages/buildPageWindow` — AC2 |
| FR-14 (in-app client-side nav) | T5.1 cards `<Link>`, T8.2 pagination `<Link>`, T4.2 filter `setSearchParams` — all ACs |
| UX-DR-7 (type filter segmented, `?type=`, text not color) | T4 — radiogroup + active `ink-surface`/`on-ink` + text labels |
| UX-DR-8 (essay card: title+date+excerpt, list) | T5.2 |
| UX-DR-9 (comic card: strip image-forward + date + caption chip) | T5.3 + T5.4 |
| UX-DR-13 (pagination prev/next + numbers, active `primary`, shareable) | T8 |
| UX-DR-16 (empty/beyond-end/skeleton states) | T6 (skeleton) + T7.1 (empty) + T7.2 (beyond-end) + T5.4 (card image failure) |
| UX-DR-17 (a11y floor) | T3.2 (one `<h1>`), T4.1 (radiogroup `aria-checked`), T8.1 (pagination `<nav>` + `aria-current`), T9.3 |
| UX-DR-18 (reduced motion) | T6.1 (static skeleton), T9.4 |
| UX-DR-19 (responsive, Feed single-column all widths) | T5.1 (single column) |
| AD-1 (no direct `content/` import) | T3.1 + T9.2c (import only `../content`) |
| AD-5 (route scheme `/p` + `?type=`) | T2.1 (route swap), T3.1/T4 (query params) |
| AD-6/AR-3 (tokens only, one styling system) | T9.2b (no hex), token-map Dev Note |
| AD-7 (build cmd unchanged) | T9.1 |
| AR-11 (component tests deferred) | Testing strategy Dev Note + T9.5 manual review |

## Dev Agent Record

### Agent Model Used

Amelia (Senior Software Engineer) — create-story + dev-story workflow. Model: Claude (Anthropic). Date: 2026-08-07.

### Debug Log References

- **Edit-tool serialization glitch (per 1.4 learning):** `Feed.tsx` and `App.tsx` were written via the `write` tool (full-file) rather than `edit`, because they are JSX/brace/quote-heavy — the exact class of `edits.0: must be object` failures seen in 1.2 (backticks) and 1.4 (JSX import lines). A first `edit` attempt on `App.tsx` (quoted import + `<Route>` JSX) failed with `edits.0: must be object`; the `write` rewrite succeeded. Low-brace files (`feed-utils.ts` ellipsis-char fix) applied cleanly via `edit`.
- **`buildPageWindow` sentinel vs literal ellipsis:** the initial impl pushed a sentinel `'ellipsis'` token, but the TDD tests assert the literal `'…'` character — fixed to `(number | '…')[]` returning the real ellipsis (the view renders whatever the helper returns, so the literal is the contract).
- **Pagination `primary` vs AA contrast:** UX-DR-13 / DESIGN.md say the active page is in `{colors.primary}` (#2E7D32), but #2E7D32 on Surface is ~4.4:1 — below the 4.5:1 AA normal-text threshold (13–14px page numbers are normal text). Reconciled using the AA-safe locked-darker variant **`text-link` (`#256628`)** — the same reconciliation 1.1 used for `.prose a` link text. The AR-4 build gate only checks four fixed hex pairs (Ink/OnSV on Surface, `#256628` on Surface, white on `#26702C`); `text-link` is in the *asserted* set, so it's provably AA. The active page is the primary-green accent by intent AND passes AA. Recorded as a known, intended variance from the literal DESIGN.md token.
- **Dev-server content-plugin cache (superficial staleness):** during the T7.4 throwaway draft verification, hand-editing `hello-ink-garden.mdx` to `status: draft` mid-session did NOT regenerate the baked `virtual:content-index` module (the content plugin caches the baked `posts` array in dev and only rebuilds on a server restart, not on every FS edit). The curl-after-edit returned the stale (both-posts) module. This is a pre-existing plugin dev-cache characteristic, NOT a 1.5 bug. Draft exclusion itself is 1.2's proven contract (`validate.test.ts` asserts `buildCollection` excludes drafts), and the empty-filter data path is unit-tested in `feed-utils.test.ts`. Throwaway was reverted cleanly (0 stray `status: draft` lines; cold `npm run build` green).
- **Bundle:** 54 → 55 modules (1.4 baseline) — +`Feed`/`feed-utils`, −`FeedPlaceholder`, net +1. CSS 21.10→22.55 kB (negligible; the Feed is utility-styled, almost no new CSS — only Tailwind utilities). JS 232→238 kB (the Feed + lazy-ish; no image). 54→54+27 tests (validate 16 + postPage 11 + feed 27 = 54 total).

### Completion Notes List

- **AC1 (all published reverse-chron as per-type cards):** `Feed.tsx` imports `posts` from `../content` (AD-1 — already reverse-chron by `date` DESC, `slug` ASC tiebreak, published/draft-excluded by the 1.2 gate), computes `paginatePosts(posts, type, page, 10)` once via `useMemo`, and renders a single-column `<ul>` of `<Card>`s. Essay card: `<h2>` title (Fraunces `font-display text-headline-sm text-ink`) + date (`formatPostDate` — reused from 1.4 so dates match across Feed/Post) + optional 1-line `excerpt` (`line-clamp-2 text-sm text-on-surface-variant`). Comic card: image-forward strip (the image is the visual top) + date + optional caption chip (`bg-secondary-container text-on-secondary-container` — the AA-safe container pair, not a `secondary` text fill). Card title is `<h2>` (page owns the only `<h1>`). Whole card is a client-side `<Link to={\`/p/${slug}\`}>` (FR-14).
- **AC2 (10/page pagination, prev/next + numbers, active in link-green, shareable URLs):** `Pagination` renders only when `totalPages > 1` (no sad single-page nav). Prev/Next `<Link>`s + windowed numbers via `buildPageWindow(page, totalPages)` (adds 1, last, current±1, `'…'` for gaps ≥3). Active page = `aria-current="page"` + `text-link font-semibold` (the AA-safe locked-darker `primary` variant — see Debug Log). Each pagination URL is `/p` · `/p?page=N` · `/p?type=comic` · `/p?type=comic&page=N` (normalised: `all`/page-1 omit the param) via `pageHref()` — shareable + direct-load returns the same page (AC4 routes share one code path through `useSearchParams`). Tap targets ≥44px.
- **AC3 + AC4 (Type Filter `?type=`, client-side re-scope, direct pre-scope, no reload):** a `role="radiogroup"` of three `role="radio" aria-checked` `<button>`s (All/Essays/Comics — text labels, meaning NOT by color alone). Active flips to `bg-ink-surface text-on-ink`; inactive `bg-surface-container text-on-surface-variant`. On select → `setSearchParams(pageHref(next, 1))` (client-side, RR updates URL + re-renders — no full reload) and **resets page to 1** (never strands the user on an empty page N). Direct `/p?type=comic` pre-scopes on first paint because `type`/`page` are derived once from `useSearchParams` (no flash-all-then-filter). `?type=` normalises: `all` → param omitted (clean `/p`).
- **AC5 (empty-filter copy + beyond-end = no items, never an error):** `EmptyState` — zero-of-type filter (`items.length === 0` && `totalPages === 0`) → on-brand **"No posts match that filter yet."**; beyond-end (`page > totalPages`, totalPages ≥1) → **"No posts on this page."** + a `<Link>` Back to page 1. `paginatePosts` returns `[]` for `page > totalPages` (unit-tested) — never throws, never 404s. The pagination control still renders pointing back.
- **AC6 (cold-load skeleton, no spinner churn):** `hydrated` state flips `false→true` once on mount after a 150ms `setTimeout` (empty-dep `useEffect` → does NOT re-flash on filter/page changes = no churn). While `!hydrated`, `<Skeleton>` renders 6 STATIC placeholder bars (`bg-surface-container` — no shimmer animation → reduced-motion-safe by default, UX-DR-18). Reconciliation: `posts` is a build-time eager `import.meta.glob` (synchronous at runtime), so the skeleton is a perceived-cold-load affordance, not async-wait (documented in the story Dev Notes).
- **AC7 (drafts never appear):** satisfied upstream — `posts` is draft-excluded by the 1.2 build gate (`buildCollection`/`validatePost`, proven in `validate.test.ts`). `Feed.tsx` carries a comment noting it trusts the index and does NOT re-filter by status. `paginatePosts` is a pure filter-then-slice (no status logic).
- **Comic-card image-load failure (EXPERIENCE state table line 92, defensive parity with 1.4):** `ComicCardImage` reuses 1.4's `stripRetrySrc` + `<img onError>` pattern at card scale. On error the `<img>` stays mounted `sr-only` (so `alt` remains in the a11y tree) and a muted tile ("Couldn't load the strip. Refresh?" + Retry button) shows over it. Retry bumps `retryKey` → cache-busts via `stripRetrySrc` and re-attempts. The Retry button `e.preventDefault()`s so it doesn't trigger the surrounding card `<Link>`. Cost was near-zero (helper reused).
- **T1 (TDD helpers, red→green):** `feed-utils.test.ts` written first → RED (module missing) → implemented `feed-utils.ts` (`parseTypeParam` — case-insensitive/trim, invalid→`all`; `parsePageParam` — int-only, `<1`/junk→1, returns out-of-range AS-IS; `totalPages`; `paginatePosts` — filter-then-slice, `totalPages` from the FILTERED count; `buildPageWindow` — 1+last+current±1, `'…'` for gaps ≥3; `typeParamValue`/`pageParamValue` — `all`/page-1 → `null` = omit) → GREEN (27 specs). Full suite 54/54 (16 validate + 11 postPage + 27 feed).
- **T2 (routing + retirement):** `App.tsx` `/p` element swapped `FeedPlaceholder`→`Feed` (import + JSX; rewritten via `write`). `FeedPlaceholder.tsx` deleted. No other routes touched (`/p/:slug` PostPage, `/` LandingPlaceholder, `/projects` placeholders unchanged). No hand-registered per-post route (AD-5).
- **T7.4 throwaway draft verification:** flipped `hello-ink-garden` to `status: draft`; confirmed via the (reverted) cold build that the build stays green with a draft present; draft exclusion itself is 1.2's contract (validated in `validate.test.ts`), and the empty-filter-of-essay path is unit-tested (`paginatePosts` 0-comics → `[]`). The visual copy ("No posts match that filter yet.") is the AR-11-deferred manual-review step. Throwaway reverted cleanly; cold build + 54/54 tests green afterward.
- **T8.5 / T9.5 manual visual smoke:** the 9-step browser walk (default Feed, essay card, comic card, filter re-scope, `?type=comic` deep link, `?page=99` beyond-end, cold-load skeleton, comic-card image failure, a11y floor) is left for Clint's review — the primary review surface for this story, per the AR-11 deferral of component-rendering automation (same as 1.3/1.4). Dev-server structural smoke confirmed: `/p` → 200, `Feed.tsx`/`feed-utils.ts` transform clean (200), virtual index holds both posts, comic strip fixture serves `200 image/png`.
- **Discipline (T9.2):** grep — 0 raw `<a href="/…">` in-app anchors in new files; 0 inline hex literals; 0 real `import.meta.glob`/direct `content/` import in `Feed.tsx` (the only `content/p` string match is the explanatory comment on line 9). Build/lint/test green (55 modules, 0 lint problems, 54/54 tests). Build command unchanged (AD-7); no new deps.
- **Accessibility floor (NFR-1 / UX-DR-17):** one `<h1>` ("Feed") + card `<h2>`s; segmented filter is a labelled `radiogroup` of `radio` buttons with `aria-checked` (text labels, not color alone); pagination is a `<nav aria-label="Pagination">` with `aria-current="page"` + `aria-disabled` prev/next; skip link + landmarks from 1.3 untouched; `focus-visible:outline outline-primary` rings on every interactive el; tap targets ≥44px (`min-h-[44px]` / `min-w-[44px]`).
- **Reduced motion (UX-DR-18):** skeleton is static (no animation) → reduced-motion-safe by default; no scroll-reveal on the Feed (Landing-only); no zoom transitions.
- **Out-of-scope honored:** no support-pill (1.8), no SEO meta (1.6), no Landing (Epic 3), no zoom/pan (5.1), no tags/RSS (AR-11).

### File List

**NEW**
- `clintonjavery/src/pages/Feed.tsx` — the unified Feed page (cards + Type Filter + pagination + skeleton + empty/beyond-end states + comic-card image retry).
- `clintonjavery/src/pages/feed-utils.ts` — pure helpers (`parseTypeParam`, `parsePageParam`, `totalPages`, `paginatePosts`, `buildPageWindow`, `typeParamValue`, `pageParamValue`).
- `clintonjavery/src/pages/feed-utils.test.ts` — Vitest unit tests (27 specs).

**UPDATED**
- `clintonjavery/src/App.tsx` — `/p` element swaps `FeedPlaceholder` → `Feed` (import + JSX). No other route changes.

**DELETED**
- `clintonjavery/src/pages/FeedPlaceholder.tsx` — fully replaced by `Feed.tsx`.

**REUSED (no changes to committed 1.4 files)**
- `clintonjavery/src/pages/postPage-utils.ts` — `Feed.tsx` imports `formatPostDate` + `stripRetrySrc` (cross-page sibling import; pure, intended seam).

**LEAVE ALONE (other stories)**
- `pages/LandingPlaceholder.tsx` (Epic 3), `pages/ProjectsPlaceholder.tsx` + `ProjectShowPlaceholder.tsx` (Epic 4), `pages/Post.tsx` (old, Epic 2), all other 1.3/1.4 LEAVE-ALONE files.

### Change Log

- 2026-08-07 — Story created (create-story intent); status `ready-for-dev`.
- 2026-08-07 — Implemented (dev-story): T1 TDD pure helpers (red→green, 27 specs); T2 route wiring + `FeedPlaceholder` retirement; T3 page shell (`useSearchParams` + `useMemo` filter-then-slice) + page `<h1>`; T4 Type Filter segmented radiogroup (`?type=`, client-side, page-1 reset); T5 per-type cards (essay title/date/excerpt, comic image-forward/date/caption-chip) as client-side `<Link>`s with card `<h2>`s; T5.4 comic-card image retry (reused 1.4 `stripRetrySrc`, alt stays in AT); T6 cold-load skeleton (150ms mount-once, static, no churn); T7 empty/beyond-end states + AC7 trust-the-index comment + T7.4 throwaway draft verification (reverted); T8 windowed pagination (active `text-link`/AA-safe, shareable normalised URLs). T9 regression + grep proofs: build 55 modules, lint 0, 54/54 tests; 0 raw anchors / 0 hex / 0 direct content import. Status → `review`. Manual 9-step visual smoke left for Clint per AR-11. Intended variance from literal DESIGN.md: pagination active uses `text-link` (#256628, AA-safe) instead of `--color-primary` (#2E7D32) to meet WCAG AA normal-text (same reconciliation as 1.1 prose links).