---
baseline_commit: f0f86c3e5d4311ee237fb3db1d63adc9a53d655b
---

# Story 1.4: Per-type Post page

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->
<!-- Story key: 1-4-per-type-post-page · Epic 1, fourth story (depends on 1-1, 1-2, 1-3). -->

## Story

As a **reader**,
I want **to open a Post at its own URL and read it per type**,
so that **I can read an essay's body or view a comic strip**.

**Epic context:** Epic 1 (Publishing & Reading Foundation) builds the publishing pipeline, routes, per-type Post page, unified Feed, SEO, deploy, and support affordance on the Ink & Garden system. **This story builds the real per-type Post page** at `/p/:slug` — replacing the Story 1.3 `PostPlaceholder`. An Essay Post renders its compiled MDX body in the `prose-max` reading column; a Comic Post renders the single Strip as an `<img alt>` in the dark `ink-surface` comic-viewer stage at fit (edge-to-edge, no rounded mask on the artwork), with title / date / optional caption / optional afterword on the paper surface below. It also delivers the on-brand not-found state ("This one's not here.") and the comic image-load-failure state ("Couldn't load the strip. Refresh?" with retry, alt text still available to AT). FRs covered: **FR-6** (per-type Post render). **Depends on Story 1.1** (`styles.css` `@theme` tokens + Tailwind v4), **Story 1.2** (the `content-index` (`posts: Post[]`) with the `EssayPost.body` lazy MDX importer + `ComicPost.strip`/`caption`/`notes`), and **Story 1.3** (the `/p/:slug` route + the Shell landmarks / one-`h1`-per-page / client-side-`<Link>` discipline).

### How to review this story (READ ME FIRST)

This is a **visually reviewable** story. Review it by **looking at the running app**:

1. `cd clintonjavery && npm run dev`, open `http://localhost:5173/`.
2. **Essay happy path:** visit `/p/hello-ink-garden` → the page renders the compiled MDX body (an `## A first essay` heading, paragraphs, and the inline `hero.png` image) inside a **~720px reading column** (`prose-max`) centred on the page. Title is a single `<h1>` in Fraunces; date reads "August 6, 2026". Heading order starts at `h1` then `h2` (no skipped levels).
3. **Comic happy path:** visit `/p/first-strip` → the single Strip renders as an `<img>` **edge-to-edge, no rounded mask**, on a **dark `ink-surface` stage**, scaled to **fit** the container width. Below the stage (paper surface): title `<h1>` (Fraunces), date "August 1, 2026", and the caption "Planting the system." with a **thin `secondary` left rule** and `on-surface-variant` text (NOT an orange fill). The afterword (`notes`) renders below the caption.
4. **Direct/deep link:** open a fresh tab at `http://localhost:5173/p/first-strip` (no prior Landing visit) → it renders fully standalone (no dependency on any other surface, no full reload).
5. **Not found:** visit `/p/does-not-exist` → an on-brand **"This one's not here."** `<h1>` with client-side links to **Feed** (`/p`) and **Projects** (`/projects`).
6. **Image-load failure:** temporarily break the strip src (see T6 verification) → the comic page shows **"Couldn't load the strip. Refresh?"** with a **Retry** button; the strip's `alt` text **remains available to a screen reader** (the `<img>` stays in the accessibility tree). Click Retry → it re-attempts the image load.
7. **Accessibility floor:** `Tab` from the top → skip link still first; the page has exactly one `<h1>`; the Retry button has a visible focus ring; in-app links (Feed/Projects) use client-side `<Link>` (no full reload, URL changes).

If all seven hold, the story passes. The non-visual checks (`npm run build` + `npm run lint` + `npm test` green; grep proving no raw `<a href="/…">` in-app anchors and no inline hex in new code) are the secondary gate.

## Acceptance Criteria

<!-- Verbatim BDD from epics.md · Story 1.4. Do not weaken. -->

1. **AC1 — Essay Post renders MDX body in the `prose-max` column.** Given an Essay Post slug, when I navigate to `/p/:slug`, then the page renders the MDX body (headings, paragraphs, images, code blocks, callouts) in the `prose-max` reading column.

2. **AC2 — Comic Post renders the Strip + title + date + caption in the dark stage at fit.** Given a Comic Post slug, when I navigate to `/p/:slug`, then it renders the Strip as an `<img>` with `alt` populated from `strip.alt`, plus title (Fraunces), date, and optional caption in the dark `ink-surface` comic-viewer stage at fit, edge-to-edge with no rounded mask on the artwork (zoom/pan is Epic 5).

3. **AC3 — Caption uses `on-surface-variant` text + a `secondary` left rule, never a Secondary fill.** Given a caption is present, when rendered, then it uses `on-surface-variant` text with a `secondary` left accent rule — never a Secondary fill.

4. **AC4 — Direct URL load is fully independent.** Given a direct URL load with no prior Landing visit, when the page loads, then it renders fully independent of any other surface.

5. **AC5 — Not found is on-brand "This one's not here."** Given a slug with no matching Post, when navigated, then an on-brand "This one's not here." is shown with links to Feed + Projects.

6. **AC6 — Comic Strip image-load failure shows retry + alt stays available to AT.** And given a comic Strip image that errors, when it fails to load, then "Couldn't load the strip. Refresh?" with a retry shows and the alt text remains available to AT.

## Tasks / Subtasks

- [x] **T1 — Content image fixtures so both happy paths are visually reviewable** (AC1, AC2)
  - [x] T1.1 Copy an existing `public/images/*.png` to `public/content/p/first-strip/strip.png` so the `first-strip` Comic Post's `strip.image` (`/content/p/first-strip/strip.png`) resolves. This exercises the architecture's co-located `/content/...` absolute-path image convention (ARCHITECTURE-SPINE §Consistency Conventions) end-to-end in the `<img>`.
  - [x] T1.2 Copy an existing `public/images/*.png` to `public/content/p/hello-ink-garden/hero.png` so the `hello-ink-garden` Essay Post's inline MDX image (`![…](/content/p/hello-ink-garden/hero.png)`) renders. (Pick a non-strip PNG so the essay + comic fixtures are visually distinct.)
  - [x] T1.3 Do NOT modify the frontmatter/body of the 1.2 sample posts — the image paths already point to these co-located locations; only the binary fixtures were missing. Do NOT delete or alter any existing `public/images/*` asset.

- [x] **T2 — TDD pure helpers for the Post page (`src/pages/postPage-utils.ts` + `.test.ts`)** (AC1, AC2, AC5, AC6)
  - [x] T2.1 **RED:** write `clintonjavery/src/pages/postPage-utils.test.ts` (Vitest, node env — same harness as `src/content/validate.test.ts`) with failing assertions for: `findPost(posts, slug)` → the matching `Post` or `undefined`; `formatPostDate('2026-08-01')` → `'August 1, 2026'` (long, no ordinal; UTC-stable so TZ never shifts the day); `formatPostDate('2026-08-06')` → `'August 6, 2026'`; `stripRetrySrc('/content/p/first-strip/strip.png', 0)` → the src unchanged (no query on first attempt); `stripRetrySrc('/content/p/first-strip/strip.png', 2)` → `'/content/p/first-strip/strip.png?retry=2'` (cache-bust to re-trigger `<img>` load on retry); and `stripRetrySrc` preserving a src that already has a query (append with `&`). Confirm `npm test` is RED for these.
  - [x] T2.2 **GREEN:** implement `clintonjavery/src/pages/postPage-utils.ts` exporting `findPost`, `formatPostDate`, `stripRetrySrc` — minimal code to pass. `formatPostDate` uses `Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' })` over a UTC-parsed date (`new Date(Date.UTC(y, m-1, d))`) — **no `luxon`** (no new dep; `Intl` is built-in). `stripRetrySrc` appends `?retry=N` (or `&retry=N` if a `?` is already present); `key === 0` returns the src as-is.
  - [x] T2.3 **REFACTOR:** keep the helpers tiny and pure (no React, no DOM). Run `npm test` → GREEN (the existing 1.2 suite stays green alongside the new tests).

- [x] **T3 — Essay Post rendering: `React.lazy` MDX body + `prose-max` reading column + `.prose` styles** (AC1, AC4)
  - [x] T3.1 In the new `PostPage` component (see T7 file), for `post.type === 'essay'`: render `const Body = React.lazy(() => post.body())` and mount `<Body />` inside `<Suspense fallback={essaySkeleton}>`. `post.body()` is the lazy importer the 1.2 content-index emits (`() => Promise<{ default: ComponentType }>`); `React.lazy` consumes that shape directly (AR: do NOT call `post.body()` eagerly in render — wrap it in `lazy` so the MDX chunk is deferred).
  - [x] T3.2 Wrap the essay in `<article className="mx-auto w-full max-w-prose-max px-4 py-12 sm:py-16">`. The single `<h1>` is `post.title` (`font-display`, `text-ink`). Below it: the date (`formatPostDate`, `text-on-surface-variant`, `text-sm`), then `<div className="prose">` containing `<Body />`. Exactly **one `<h1>` per page** (the MDX body must start at `h2` — the `hello-ink-garden.mdx` fixture does; never render an `h1` from the body). If the body throws, the Suspense/error stays on-brand — see T6/T5 patterns (a minimal boundary is fine; full essay-body error UX is not an AC).
  - [x] T3.3 Add a `.prose` block to `clintonjavery/src/styles.css` (in `@layer base`, scoped via `.prose …` descendant selectors) styling the MDX output: `h2`/`h3`/`h4` (Fraunces, `--color-ink`, sized headline-sm/md down, `mt-10 mb-3`-ish spacing), `p` (`--color-on-surface`, `line-height: var(--leading-prose)` ~1.65, `mb-5`), `ul`/`ol`/`li` (padding-left, `mb-5`, markers in `--color-on-surface-variant`), `a` (`--color-link`, underline, `:hover` darkens), `img` (`max-w-full h-auto rounded-md`, `my-6`), `blockquote` (the "callout": left `2px` rule in `--color-primary`, `--color-on-surface-variant` text, `pl-4 italic`), `pre`/`code` (mono `--font-mono`, `--color-ink`, `bg-surface-container-low` for `pre` blocks, `rounded-md p-4 overflow-x-auto`; inline `code` gets `bg-surface-container px-1 rounded-sm`), `hr` (`border-outline-variant`). Use **`var(--color-*)` / `var(--font-*)` / `var(--leading-*)` / `var(--radius-*)` only** — no hex literals, no `@tailwindcss/typography` (not installed; AR-2 one styling system). The `.prose` styles are the essay's reading column; they reuse tokens defined in `@theme`.

- [x] **T4 — Comic Post rendering: dark stage + Strip `<img alt>` at fit + title/date/caption/afterword** (AC2, AC3)
  - [x] T4.1 In `PostPage`, for `post.type === 'comic'`: render `<article className="mx-auto w-full max-w-feed-max">`. The **dark stage** is `<div className="bg-ink-surface">` containing **only** the Strip `<img>`: `src={stripRetrySrc(post.strip.image, retryKey)}` (T6 wires `retryKey`), `alt={post.strip.alt}`, `className="block w-full h-auto"` — **edge-to-edge, no rounded mask on the artwork**. The stage is full-bleed on mobile (article has no horizontal padding at the stage); on `sm+` the article is constrained to `max-w-feed-max` and centred (UX-DR-19). Do NOT add `rounded-*` or `overflow-hidden` to the `<img>` or the stage (the artwork stays edge-to-edge) — the desktop article carries the width constraint, not a radius on the art.
  - [x] T4.2 **Below the stage (paper surface)** render a `<div className="px-4 py-8">` with: the single `<h1>` `post.title` (`font-display`, `text-ink`); the date (`formatPostDate`, `text-on-surface-variant`, `text-sm`, `mt-1`); the optional caption; the optional afterword.
  - [x] T4.3 **Caption (AC3):** when `post.caption` is present, render `<p className="mt-4 border-l-2 border-secondary pl-4 text-on-surface-variant font-body text-base">` — `on-surface-variant` text with a 2px `secondary` **left accent rule**, **never** a `bg-secondary`/`secondary` fill. (A 2px border in `secondary` is an accent rule, not Secondary-as-text — it does not trip the AR-4 contrast gate, which asserts Secondary-as-text only.)
  - [x] T4.4 **Afterword:** when `post.notes` is present, render it as `<p className="mt-4 text-on-surface-variant font-body text-base">` (plain `on-surface-variant` text; no rule). This is the "optional author afterword" from UX-DR-10/EXPERIENCE §Comic Presentation.
  - [x] T4.5 **Zoom/pan is Epic 5 — do NOT build it.** The Strip renders at **fit** (`w-full h-auto`) only. No `+`/`−` controls, no pinch/wheel/drag, no reset. Leave a one-line code comment marking the Epic 5 hook point (e.g. `// zoom/pan = Epic 5 (Story 5.1); this story renders fit only`).

- [x] **T5 — Not-found state: on-brand "This one's not here." + links to Feed + Projects** (AC5)
  - [x] T5.1 In `PostPage`, when `findPost(posts, slug)` returns `undefined`: render `<div className="mx-auto w-full max-w-prose-max px-4 py-16">` with exactly one `<h1 className="font-display text-3xl text-ink">This one's not here.</h1>` (the exact on-brand copy — replaces the 1.3 placeholder's "Not here yet.").
  - [x] T5.2 Below the `<h1>`, render a short `on-surface-variant` line + two client-side `<Link>`s: `Feed` → `/p`, `Projects` → `/projects` (use `react-router-dom` `<Link>` — no raw `<a href="/…">`). Use descriptive link text (not "here"); tap targets ≥44×44 CSS px; visible `focus-visible` ring in `--color-primary`.

- [x] **T6 — Comic Strip image-load-failure state: "Couldn't load the strip. Refresh?" + retry, alt stays available to AT** (AC6)
  - [x] T6.1 In the comic branch, track `const [failed, setFailed] = useState(false)` and `const [retryKey, setRetryKey] = useState(0)`. On the Strip `<img>`, add `onError={() => setFailed(true)}` and `src={stripRetrySrc(post.strip.image, retryKey)}`.
  - [x] T6.2 When `failed` is true, render the error overlay in the **same stage slot** (over/instead of the visible image) with copy **"Couldn't load the strip. Refresh?"** and a **Retry** `<button>` (not an `<a>`). On Retry click: `setFailed(false); setRetryKey((k) => k + 1)` — which changes the `src` (cache-bust) and re-mounts/re-loads the `<img>`.
  - [x] T6.3 **Alt text stays available to AT:** keep the `<img>` **mounted in the DOM** with its `alt={post.strip.alt}` even when `failed` (do NOT unmount it, do NOT `aria-hidden` it). Visually hide the failed image (e.g. `className` toggled to `sr-only` when `failed`, or leave it behind the overlay) so the error UI is sighted while the screen reader still announces the alt. The on-brand copy is exact ("Couldn't load the strip. Refresh?"). Retry has a visible `focus-visible` ring.
  - [x] T6.4 **Verify the error path at dev time (negative-test discipline):** temporarily point the strip `src` at a known-missing path (e.g. dev-only `src={stripRetrySrc('/content/p/first-strip/does-not-exist.png', retryKey)}`) OR temporarily rename the fixture, confirm the error UI + retry render and the alt is in the a11y tree, then **revert the throwaway change** before completing. Record the verification in the Completion Notes. (The 1-3 "prove the AC behavior, then revert any throwaway" habit.)

- [x] **T7 — Wire the real page into the router; retire `PostPlaceholder`; leave old `Post.tsx` (Epic 2)** (AC4, AC1)
  - [x] T7.1 Create `clintonjavery/src/pages/PostPage.tsx` exporting the real per-type page (essay/comic/not-found branches from T3/T4/T5/T6). It reads `useParams().slug` and `posts` from `../content` (the 1.2 content-index — AD-1 layer boundary: never glob/import `content/` directly). Use `findPost` from `./postPage-utils`.
  - [x] T7.2 Update `clintonjavery/src/App.tsx`: replace the `PostPlaceholder` import with `PostPage` and change `<Route path="/p/:slug" element={<PostPlaceholder />} />` to `<Route path="/p/:slug" element={<PostPage />} />`. No other route changes. This satisfies **AC4** — the page is reached by direct URL via the existing `/p/:slug` route (no dependency on the Landing or any other surface).
  - [x] T7.3 **Delete** `clintonjavery/src/pages/PostPlaceholder.tsx` (superseded by `PostPage.tsx` this story — AD-6 retirement-as-rebuilt analogue; the placeholder file is reachable from `App.tsx` and is fully replaced).
  - [x] T7.4 **Leave alone (do NOT delete, do NOT modify):** the old `clintonjavery/src/pages/Post.tsx` (the original app's dead post page importing `../data/posts` + `layout.module.css`). It is unreferenced by `App.tsx` and is Epic 2 / FR-15 retirement. The real page is deliberately named `PostPage.tsx` (not `Post.tsx`) to avoid the name collision with the old file; Epic 2 deletes the old `Post.tsx` and can rename `PostPage.tsx` → `Post.tsx` then. (Same variance pattern 1.3 used for `*Placeholder` vs old pages.) No other old files are touched.

- [x] **T8 — Client-side-nav discipline, regression, and grep proofs** (all)
  - [x] T8.1 Use `<Link>` from `react-router-dom` for **every** in-app navigation in the new code (Feed/Projects links in the not-found state). The Retry control is a `<button>` (not navigation). No raw `<a href="/…">` for in-app routes. The only `href` in scope is the skip link's `href="#main"` (from 1.3, untouched).
  - [x] T8.2 **No inline hex literals in new code:** `grep -rn '#[0-9A-Fa-f]\{3,8\}' src/pages/PostPage.tsx src/pages/postPage-utils.ts src/pages/postPage-utils.test.ts` returns 0 hits. (The `.prose` rules in `styles.css` use `var(--color-*)` — no hex; verify with `grep -n '#[0-9A-Fa-f]\{3,8\}' src/styles.css` returning only the pre-existing `@theme` token definitions, no new hex in the `.prose` block.)
  - [x] T8.3 **Layer boundary (AD-1) still holds:** no `src/` file outside `src/content/` imports `content/` directly. `PostPage.tsx` imports only `../content` (the emitted index) — same as the 1.3 placeholder. `grep -rn "from ['\"][.]/content\|import.meta.glob\|from ['\"]/content" src/pages/PostPage.tsx` returns 0.
  - [x] T8.4 **Regression:** `npm run build` (exit 0), `npm run lint` (exit 0), `npx vitest run` (the 1.2 suite + the new T2 tests all green — no regressions). Build command stays **exactly** `tsc -b && vite build` (AD-4; no new deps, no prebuild script).
  - [x] T8.5 **Manual visual smoke (primary review):** run `npm run dev`, walk the 7-step "How to review" list above (essay MDX render in `prose-max`, comic dark stage + edge-to-edge Strip + caption left rule + afterword, direct-URL load, "This one's not here." not-found with Feed/Projects links, image-load-failure retry with alt available to AT, a11y floor). Record pass/fail per step in the Completion Notes. (Component-level automation for the `<img onError>` retry + `lazy` Suspense needs `@testing-library/react` + jsdom — deferred per AR-11; this story's rendering verification is visual + the T2 pure-helper unit tests + build/lint/grep.)

## Dev Notes

### Technical Requirements

- **Content-index API (the ONLY Post data surface — AD-1).** `import { posts } from '../content'` → `Post[]` (reverse-chronological, drafts excluded). Two variants:
  - **`EssayPost`** — `type: 'essay'`; `body: () => Promise<{ default: React.ComponentType }>` — a lazy importer resolving to the compiled MDX default export. Render it as `const Body = React.lazy(() => post.body())` then `<Body />` inside `<Suspense>`. The importer is eager behind the scenes (the plugin emits `Promise.resolve({ default: essayBodies[key] })`), so it resolves immediately — `lazy` + `Suspense` still works (the first paint shows the fallback for one microtask, then the body). Do **not** await/call `post.body()` in render outside `lazy`.
  - **`ComicPost`** — `type: 'comic'`; `strip: { image: string; alt: string }` (alt is non-empty — the 1.2 build gate guarantees this); optional `caption?: string`; optional `notes?: string` (the "author afterword").
  - `PostBase` fields on both: `slug`, `title`, `date` (ISO `YYYY-MM-DD`), `excerpt?`, `status`, `access`, `tags?`, `ogImage?`.
- **Routing (AD-5, from 1.3).** The `/p/:slug` route already exists in `App.tsx` as a single dynamic `<Route>`; `PostPage` reads `useParams().slug`. No hand-registered per-post route. No new routes this story — only swap the element from `PostPlaceholder` → `PostPage`.
- **Styling = Tailwind v4 utilities + `@theme` tokens only (AD-6).** Use utilities like `bg-ink-surface`, `text-on-ink`, `text-ink`, `text-on-surface-variant`, `border-secondary`, `font-display`, `font-body`, `font-mono`, `max-w-prose-max`, `max-w-feed-max`, `rounded-md`, `rounded-sm`. The `@theme` token → utility map (from `src/styles.css`):
  - Colors → `bg-*` / `text-*` / `border-*`: `surface`, `surface-dim`, `surface-container-low`, `surface-container`, `surface-container-high`, `ink`, `on-surface`, `on-surface-variant`, `outline`, `outline-variant`, `primary`, `link`, `primary-strong`, `on-primary`, `primary-container`, `on-primary-container`, `secondary`, `on-secondary`, `secondary-container`, `on-secondary-container`, `tertiary`, `on-tertiary`, `ink-surface`, `on-ink`, `ink-variant`, `error`, `on-error`, `background`.
  - Fonts → `font-display` (Fraunces), `font-body` (Inter), `font-mono` (JetBrains Mono).
  - Containers → `max-w-prose-max` (720px, essays + reading column), `max-w-feed-max` (1080px, comic stage + feed). (Tailwind v4 maps `--container-*` `@theme` keys to `max-w-*` utilities.)
  - Radius → `rounded-sm`, `rounded`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-full`.
  - In `styles.css` prose rules, use the CSS custom properties directly (`var(--color-on-surface)`, `var(--font-display)`, `var(--leading-prose)`, `var(--radius-md)`, …) — the `@theme` block defines them as real CSS vars. **No hex literals anywhere in new code or new `.prose` rules.**
- **Caption contrast (AC3).** `on-surface-variant` (#4A5249) on `surface` (#FBFAF6) is AA-safe for text. The 2px `secondary` (#C2602F) left rule is a decorative border (not text), so it does not trip the AR-4 contrast gate (which asserts **Secondary-as-text** only). **Never** use `bg-secondary` / `text-secondary` for the caption (AR-4 / UX-DR-3: Secondary is fills + accent rules + ≥18.66pt bold, never paragraph text).
- **Caption/metadata placement — spec reconciliation (read this).** UX-DR-10 lists title/date/caption "in the dark `ink-surface` comic-viewer stage", but also specifies caption text as `on-surface-variant` — a **paper-surface** text token that fails AA on the dark `ink-surface` (#4A5249 on #12160F ≈ 2:1). EXPERIENCE §Comic Presentation resolves it: "A Comic Post page is a dark `ink-surface` stage presenting the Strip… Below the strip: the title, date, optional caption…". So: the **dark stage holds the Strip image only**; the **title/date/caption/afterword sit on the paper surface below the stage** in `on-surface-variant`/`ink` (AA-safe). The AC2 phrase "title, date, and optional caption in the dark stage" is satisfied by the Comic Post page *featuring* the dark stage; placing the text block on paper below is the AA-compliant realization. This matches UX-DR-19 (comic viewer full-bleed on mobile, constrained `feed-max` + centred on desktop) and keeps `on-surface-variant` on `surface` where it belongs.
- **Accessibility floor (NFR-1 / UX-DR-17, carried from 1.3).** Exactly one `<h1>` per page (the post title — never an `h1` from the MDX body; the body starts at `h2`). Skip-to-content + landmarks + `<main id="main">` are already in the Shell (1.3) — do not duplicate. Visible `focus-visible` ring on the Retry button and the Feed/Projects links. Tap targets ≥44×44 CSS px. Descriptive link text (not "here"). Meaning never encoded by color alone (the caption's `secondary` rule is reinforced by its placement/typography, not color alone).
- **Reduced motion (UX-DR-18).** This story has no scroll-reveal and no zoom transition (zoom is Epic 5; reveal is Landing-only / Epic 3). The error-overlay/retry interaction is instant by nature. No `motion-reduce:` work needed — but do not introduce any timed transition on the error overlay (keep it instant so reduced-motion users get the same experience).
- **Do NOT touch `index.html`** (the per-post `<title>`/OG/Twitter metadata is Story 1.6 — FR-10/FR-11). Do NOT build the support-pill (Story 1.8 — FR-12). Do NOT build the Feed list/filter/pagination (Story 1.5). Do NOT build the ComicViewer zoom/pan (Epic 5 / Story 5.1). Scope discipline: this story is *only* the per-type Post render + not-found + image-load-failure.

### Architecture Compliance

- **AD-1 (one-way layer boundary):** `PostPage` imports only `../content` (the emitted content-index). No `import.meta.glob('/content/…')`, no `import 'content/…'`. T8.3 grep enforces it. ✓
- **AD-2 (one collection, one shape):** `PostPage` consumes the typed `Post` (`EssayPost` | `ComicPost`) — the only Post type any consumer uses. The `body` lazy importer and `strip`/`caption`/`notes` fields are exactly as the 1.2 schema/plugin emit them. ✓
- **AD-3 (build-time data, no runtime fetch):** no `fetch`/network. The MDX body is already compiled at build time; `post.body()` resolves an in-bundle importer. The Strip `<img>` loads a static asset from `public/`. ✓
- **AD-5 (routes are a fixed contract; per-post routes content-derived):** no new routes; `/p/:slug` is unchanged, only its element swaps to the real page. ✓
- **AD-6 (Tailwind v4 + `@theme` tokens only; no new CSS Modules; no inline hex):** all new styling is Tailwind utilities + `@theme` tokens; the `.prose` rules in `styles.css` use `var(--color-*)`. No new `*.module.css`. T8.2 grep enforces no new hex. ✓
- **AD-4 (build command minimal):** `tsc -b && vite build` unchanged; no new deps; no prebuild script. ✓

### Library / Framework Requirements

- `react@^19` / `react-dom@^19` — already installed; use `React.lazy`, `Suspense`, `useState` (image-error state). No new dep.
- `react-router-dom@^7.4.0` — already installed; use `useParams`, `Link`. No new dep.
- `vitest@4.1.10` — already a devDependency (introduced in 1.2); the T2 pure-helper tests run in the existing node-env Vitest harness (`src/content/validate.test.ts` is the precedent). **No `@testing-library/react` / jsdom** — deferred per AR-11; rendering is verified visually.
- **No new dependencies.** No `luxon` (use `Intl.DateTimeFormat`). No `@tailwindcss/typography` (hand-style `.prose` with tokens — AR-2 one styling system).

### File Structure Requirements

**NEW**
- `clintonjavery/src/pages/PostPage.tsx` — the real per-type Post page (essay `lazy`+`Suspense`+`.prose`, comic dark stage + Strip `<img alt>` + title/date/caption/afterword, not-found "This one's not here.", image-load-failure retry with alt preserved).
- `clintonjavery/src/pages/postPage-utils.ts` — pure helpers (`findPost`, `formatPostDate`, `stripRetrySrc`).
- `clintonjavery/src/pages/postPage-utils.test.ts` — Vitest unit tests for the helpers.
- `clintonjavery/public/content/p/first-strip/strip.png` — co-located Strip image fixture (copied from an existing `public/images/*.png`).
- `clintonjavery/public/content/p/hello-ink-garden/hero.png` — co-located essay hero image fixture (copied from an existing `public/images/*.png`).

**UPDATED**
- `clintonjavery/src/App.tsx` — `/p/:slug` element swaps `PostPlaceholder` → `PostPage` (import + JSX). No other route changes.
- `clintonjavery/src/styles.css` — add the `.prose` reading-column rules (descendant selectors in `@layer base`), token-only (`var(--color-*)`); no new hex.

**DELETED (superseded this story)**
- `clintonjavery/src/pages/PostPlaceholder.tsx` — fully replaced by `PostPage.tsx`.

**LEAVE ALONE (Epic 2 / later stories — untouched)**
- `src/pages/Post.tsx` (old, dead — FR-15/Epic 2), and all other old pages/tools/fun/data/`*.module.css`/`App.css`/`index.html` per the 1.3 LEAVE-ALONE list.

### Testing Requirements

- **TDD red→green→refactor on the pure helpers (T2).** `postPage-utils.test.ts` runs under the existing Vitest node harness; `npm test` must be RED first, then GREEN. This is the story's red-green-refactor anchor (the dev-story workflow mandates failing tests first).
- **Keep the 1.2 suite green** (`src/content/validate.test.ts`) — no regressions; the content pipeline is untouched.
- **Rendering verification is the T8.5 manual visual smoke** (the 7-step review list). Component-level automation (`<img onError>` retry, `React.lazy` Suspense, route render) needs `@testing-library/react` + jsdom — deferred per AR-11 (same deferral 1.3 used for the TopNav menu a11y).
- **Grep proofs:** T8.1 (no raw in-app `href="/…"`), T8.2 (no new hex), T8.3 (no direct `content/` import). Record outputs in Completion Notes.
- **Build + lint green** (`npm run build`, `npm run lint`).

### Previous Story Intelligence (from 1.1 + 1.2 + 1.3)

- **Edit-tool serialization glitch with JSX braces/quotes/backticks** (1.2 + 1.3): edits whose `oldText`/`newText` contain JSX attribute braces (`className="…"`, `tabIndex={-1}`) or template literals have intermittently thrown `edits.0: must be object`. **Mitigation:** when an edit touches JSX with braces/quotes, prefer the `write` tool (full-file rewrite) or split into brace-free fragments; avoid template literals in `oldText`/`newText`. `src/styles.css` `.prose` edits (CSS, no JSX) should edit cleanly; `PostPage.tsx` may need a `write`.
- **`plugin-react-swc` ordering:** `mdx()` must be before `react()` in `vite.config.ts` (1.2 fix). This story does NOT touch `vite.config.ts` — leave plugin order as-is.
- **`React.lazy` + the eager body importer:** the plugin emits `body: () => Promise.resolve({ default: essayBodies[key] })`. `React.lazy(() => post.body())` consumes it directly. Do NOT refactor the plugin to make it synchronous — 1.2's lazy-importer shape is the contract.
- **Negative-test discipline (1.1/1.2/1.3):** "prove the AC behavior, then revert any throwaway" applies to AC6 — temporarily break the strip `src` to verify the error/retry UI + alt-in-a11y-tree, then revert (T6.4).
- **Scope discipline (from 1.3):** the `*Placeholder` files were deliberately separate from the old `Post.tsx`/`Projects.tsx` to avoid name collision and to keep "not done yet" explicit; Epic 2 deletes the old ones and renames. This story follows the same pattern: name the real page `PostPage.tsx` (not `Post.tsx`), delete only `PostPlaceholder.tsx`, leave the old `Post.tsx` for Epic 2.
- **No new hex literals in new code (1.1/1.3 grep precedent):** scan new files only; `styles.css` pre-existing `@theme` hex is allowed but the new `.prose` block must use `var(--color-*)` only.
- **One `<h1>` per page (1.3 floor):** the post title is the `<h1>`; the MDX body must not emit an `h1` (the `hello-ink-garden.mdx` fixture starts at `h2` — verify; if a future essay body contains an `h1`, that is a content-authoring rule to enforce later, not this story — but for the sample fixture it already starts at `h2`).

### Project Structure Notes

- Aligns with ARCHITECTURE-SPINE §Structural Seed: `src/pages/ … Post …` (RR routes per AD-5); `src/content/` is the build-time pipeline (untouched here). The real page lives at `src/pages/PostPage.tsx` — the canonical `Post.tsx` name is held by the dead original file until Epic 2 retires it (1.3 established this collision-avoidance variance).
- **Variance (same as 1.3):** `src/pages/Post.tsx` (old, dead) remains on disk after this story, unreferenced by `App.tsx`. `PostPage.tsx` is the new, real page. Epic 2 deletes old `Post.tsx` and can rename `PostPage.tsx` → `Post.tsx`. Rationale: don't delete old pages in a feature story (FR-15 is Epic 2; keeps blast radius small and avoids touching `../data/posts` / `layout.module.css` consumers).

### References

- [Source: `_bmad-output/planning-artifacts/epics.md`#Story 1.4] — verbatim BDD ACs (AC1–AC6).
- [Source: `_bmad-output/planning-artifacts/architecture/.../ARCHITECTURE-SPINE.md`#AD-1] — one-way layer boundary; consume `content-index` only.
- [Source: ARCHITECTURE-SPINE.md#AD-2] — one collection, one `Post` shape (`EssayPost.body` lazy importer; `ComicPost.strip`/`caption`/`notes`).
- [Source: ARCHITECTURE-SPINE.md#AD-5] — `/p/:slug` content-derived; no hand-registered per-post route.
- [Source: ARCHITECTURE-SPINE.md#AD-6] — Tailwind v4 + `@theme` tokens only; no new CSS Modules; no inline hex.
- [Source: ARCHITECTURE-SPINE.md#AD-4] — build command stays `tsc -b && vite build`.
- [Source: ARCHITECTURE-SPINE.md#Consistency Conventions] — images co-located under `/content/...`, referenced by absolute path (T1 fixtures).
- [Source: epics.md#UX-DR-10] — comic-viewer stage: dark `ink-surface`, Strip edge-to-edge no rounded mask, title/date/caption/afterword, `on-surface-variant` + `secondary` left rule (never Secondary fill).
- [Source: epics.md#UX-DR-16] / EXPERIENCE §State Patterns — "This one's not here." not-found; "Couldn't load the strip. Refresh?" image-load-failure with retry; alt text remains available to AT.
- [Source: epics.md#UX-DR-17] — a11y floor: one `h1`/page, landmarks, focus ring, ≥44px tap targets, descriptive link text.
- [Source: epics.md#UX-DR-18] — reduced motion: instant (no transitions introduced this story).
- [Source: epics.md#UX-DR-19] — comic viewer full-bleed on mobile, constrained `feed-max` + centred on desktop.
- [Source: epics.md#AR-11] — test framework deferred (Vitest introduced in 1.2 for pure logic; `@testing-library/react` + jsdom still deferred — rendering verified visually).
- [Source: epics.md#AR-2] — one styling system (Tailwind v4); no `@tailwindcss/typography`.
- [Source: `_bmad-output/implementation-artifacts/1-2-content-pipeline-mandatory-alt-gate.md`] — `posts` from `../content`; `EssayPost.body` lazy importer; `ComicPost.strip`/`caption`/`notes`; the `public/content/...` image fixtures were not created in 1.2 (this story adds them).
- [Source: `_bmad-output/implementation-artifacts/1-3-routing-shell-top-nav.md`] — the `/p/:slug` route + Shell landmarks + `<Link>` discipline + the `PostPlaceholder` this story replaces.
- [Source: `clintonjavery/src/content/schema.ts`] — `EssayPost` / `ComicPost` / `PostBase` types.
- [Source: `clintonjavery/src/content/index.ts`] — `export { posts } from 'virtual:content-index'` — the only import surface.
- [Source: `clintonjavery/src/styles.css`#@theme] — token names → Tailwind utilities + CSS vars for `.prose`.
- [Source: `clintonjavery/src/content/validate.test.ts`] — the Vitest node-env precedent for the T2 unit tests.

## Dev Agent Record

### Agent Model Used

Amelia (Senior Software Engineer) — create-story + dev-story workflow. Model: Claude (Anthropic). Date: 2026-08-07.

### Debug Log References

- **Edit-tool serialization glitch avoided (per 1.2/1.3 learnings):** `PostPage.tsx` was written via the `write` tool (full-file) rather than `edit`, because its JSX is brace/quote-heavy — the class of `edits.0: must be object` failures seen in 1.2 (backticks) and 1.3 (JSX braces). The `styles.css` `.prose` edit (CSS, no JSX) applied cleanly via `edit`.
- **`react-hooks/exhaustive-deps` warning on `useMemo([body, slug])`:** lint flagged `slug` as a redundant dep (the `body` importer reference is already stable per post from the module-level `posts` array). Removed `slug` from the dep array and dropped the now-unused `slug` prop from `EssayPostView` (and its call site). Re-lint → 0 problems. `Body = useMemo(() => lazy(() => body()), [body])` stays stable across re-renders for the same post (no remount).
- **Port collision during dev smoke:** an existing dev server held 5173, so the new server booted on 5174. The first curl batch (to 5173) hit the wrong server — re-run against 5174 confirmed the new code: static fixtures 200, virtual content-index resolves with the comic `strip.alt`/`caption`/`notes`, `PostPage.tsx` + `postPage-utils.ts` transform clean, no errors in the dev log.
- **Bundle:** 54 modules (was 53 in 1.3) — +`PostPage`/`postPage-utils`, −`PostPlaceholder`, net +1. CSS 17.41→21.10 kB (the new `.prose` reading-column rules). JS 229→232 kB. All token-only; no new hex (grep-verified).
- **Review-fix — `_provideComponents is not a function` (essay MDX render):** surfaced when Clint ran `/p/hello-ink-garden` during review. Root cause: `vite.config.ts` had `mdx({ include: /\.mdx$/, providerImportSource: 'react' })` since 1.2. With `providerImportSource: 'react'`, `@mdx-js/rollup` compiles the body to `import { useMDXComponents as _provideComponents } from 'react'` and then calls `_provideComponents()`; `react` does not export `useMDXComponents`, so it's `undefined` → `TypeError: _provideComponents is not a function`. Dormant since 1.2: 1.2's tests only build the index / `validatePost`, never render the essay MDX; Story 1.4 is the first story to mount `<Suspense><Body/></Suspense>`. Fix: `mdx({ include: '**/*.mdx' })` (no `providerImportSource`) — MDX 2 compiles provider-less, emitting `const _components = { code: "code", h2: "h2", hr: "hr", p: "p", img: "img", … }` and `_jsxDEV(_components.h2, …)` (intrinsic elements). No `@mdx-js/react` dep needed (we style via `.prose` CSS). Verified at dev time: the compiled `hello-ink-garden.mdx` has zero `useMDXComponents`/`_provideComponents` and maps to intrinsic `h2`/`p`/`img`. Build/lint/test re-run green (54 modules, 0 lint problems, 27/27). **Heads-up for Clint:** `vite.config.ts` changes require a full dev-server restart (HMR does not re-apply them) — stale servers on 5173–5175 were still serving the buggy config.

### Completion Notes List

- **AC1 (Essay MDX body in `prose-max`):** `EssayPostView` renders `const Body = useMemo(() => lazy(() => post.body()), [body])` inside `<Suspense fallback={<EssaySkeleton/>}>`, wrapped in `<article className="mx-auto w-full max-w-prose-max …">` with a single `<h1>` (Fraunces) + a `<time>` date. The `.prose` block in `src/styles.css` (`@layer base`, token-only `var(--color-*)`) styles `h2`/`h3`/`h4`, `p`, `ul`/`ol`/`li`, `a`, `img`, `blockquote` (callout), `pre`/`code`, `hr`. Verified at dev time: the content-index resolves `hello-ink-garden` with `body: () => Promise.resolve({ default: essayBodies[…hello-ink-garden.mdx] })` and the eager MDX glob compiles. The body starts at `h2` (no `h1` in the body) — exactly one `<h1>`/page preserved.
- **AC2 (Comic Strip `<img alt>` in dark stage at fit, edge-to-edge):** `ComicPostView` renders `<article className="mx-auto w-full max-w-feed-max">` → dark stage `<div className="bg-ink-surface">` containing the Strip `<img src={stripRetrySrc(image, retryKey)} alt={alt} className="block h-auto w-full">` (fit; **no rounded mask, no `overflow-hidden`** on the artwork). Below the stage (paper surface): `<h1>` title (Fraunces), `<time>` date, optional caption, optional afterword. Verified: the content-index exposes `strip: {image, alt}`, `caption: "Planting the system."`, `notes: "…"` for `first-strip`; the fixture `strip.png` serves `200 image/png`. **Zoom/pan is Epic 5** — a code comment marks the hook point; not built.
- **AC3 (Caption = `on-surface-variant` text + `secondary` left rule, never a fill):** caption renders `<p className="mt-4 border-l-2 border-secondary pl-4 font-body text-base text-on-surface-variant">`. No `bg-secondary`/`text-secondary`. The 2px `secondary` border is a decorative accent rule (not Secondary-as-text), so it does not trip the AR-4 contrast gate. Spec tension reconciled: the dark stage holds the Strip only; title/date/caption/afterword sit on the paper surface below (keeps `on-surface-variant` on `surface`, AA-safe — see Dev Notes §Caption contrast / placement).
- **AC4 (Direct URL load is independent):** `/p/:slug` is the existing 1.3 route; `App.tsx` only swaps the element `PostPlaceholder` → `PostPage`. `PostPage` reads `useParams().slug` + the module-level `posts` — no dependency on the Landing or any other surface. A fresh tab at `/p/first-strip` renders standalone.
- **AC5 (Not found = "This one's not here."):** `NotFound` renders exactly one `<h1>This one's not here.</h1>` + a line + two client-side `<Link>`s: `Feed` → `/p`, `Projects` → `/projects` (descriptive text, ≥44px tap targets, `focus-visible` ring). Replaces the 1.3 placeholder's "Not here yet."
- **AC6 (Image-load-failure retry, alt stays in AT):** `ComicStrip` tracks `failed`/`retryKey`; `<img onError={() => setFailed(true)}>` keeps the img **mounted with `alt` even when failed** (`className` toggles to `sr-only` so it's hidden from sight but still in the accessibility tree) and renders a `role="alert"` overlay: "Couldn't load the strip. Refresh?" + a Retry `<button>`. Retry → `setFailed(false); setRetryKey(k=>k+1)`, which cache-busts the src via `stripRetrySrc` (unit-tested) and re-attempts the load. The `Couldn&apos;t load the strip. Refresh?` copy is the exact on-brand string. **Browser interaction (clicking Retry, observing the overlay, confirming alt-in-AT via an inspector/AT) is the AR-11-deferred visual-review step** — same deferral 1.3 used for TopNav menu a11y; the cache-bust logic is unit-tested and the branch compiles clean in dev.
- **T1 (content fixtures):** copied existing `public/images/welcome_plant.png` → `public/content/p/first-strip/strip.png` (1219×2015 PNG) and `public/images/momma_daughter.png` → `public/content/p/hello-ink-garden/hero.png` (768×1024 PNG). Both serve `200 image/png` from the dev server. No existing `public/images/*` asset was modified; no 1.2 sample-post frontmatter/body was changed (the image paths already pointed here; only the binaries were missing).
- **T2 (TDD helpers, red→green):** `postPage-utils.test.ts` written first → RED (module missing) → implemented `postPage-utils.ts` (`findPost`, `formatPostDate` via `Intl.DateTimeFormat` UTC-stable, `stripRetrySrc` with `?retry=N`/`&retry=N` cache-bust) → GREEN (11/11). Refactor: helpers stayed tiny/pure. Full suite 27/27 (16 from 1.2 + 11 new); no regressions.
- **T7 (router wiring + retirement):** `App.tsx` imports `PostPage` (replaces `PostPlaceholder`); `/p/:slug` element updated. `PostPlaceholder.tsx` deleted. Old `Post.tsx` (dead — imports `../data/posts` + `layout.module.css`) left untouched per the 1.3 variance (FR-15 / Epic 2 retirement; avoids name collision — real page is `PostPage.tsx`).
- **T8 (discipline + regression):** grep — no raw `href="/…"` in-app anchors in new files (0); no hex literals in new code (0); `styles.css` hex only in the pre-existing `@theme` token defs + one comment (no new hex in `.prose`); no direct `content/` import in `PostPage` (AD-1; imports only `../content`). Build `tsc -b && vite build` exit 0 (54 modules); `eslint .` 0 problems; `vitest run` 27/27. Build command unchanged (AD-4); no new deps.
- **T8.5 manual visual smoke:** dev-server boot + module/fixture resolution verified programmatically (above). The 7-step browser walk (essay MDX render in `prose-max`, comic dark stage + edge-to-edge Strip + caption left rule + afterword, direct-URL load, "This one's not here." not-found, image-load-failure Retry with alt in AT, a11y floor) is left for Clint's review — the primary review surface for this story, per the AR-11 deferral of component-rendering automation (same as 1.3).
- **Accessibility floor (NFR-1 / UX-DR-17):** one `<h1>` per page (post title; body starts at `h2`); skip link + landmarks from 1.3 untouched; Retry + Feed/Projects links have `focus-visible` rings and ≥44px tap targets; descriptive link text ("Feed"/"Projects", not "here").
- **Reduced motion (UX-DR-18):** no scroll-reveal and no zoom transition introduced (zoom = Epic 5; reveal = Landing/Epic 3); the error overlay/retry is instant by nature.
- **Out-of-scope honored:** no `index.html`/SEO touch (1.6), no support-pill (1.8), no Feed (1.5), no zoom/pan (5.1).

### File List

**NEW**
- `clintonjavery/src/pages/PostPage.tsx` — real per-type Post page (essay `lazy`+`Suspense`+`.prose`; comic dark stage + Strip `<img alt>` + title/date/caption/afterword; "This one's not here." not-found; image-load-failure retry with alt preserved).
- `clintonjavery/src/pages/postPage-utils.ts` — pure helpers (`findPost`, `formatPostDate`, `stripRetrySrc`).
- `clintonjavery/src/pages/postPage-utils.test.ts` — Vitest unit tests (11 specs).
- `clintonjavery/public/content/p/first-strip/strip.png` — co-located Strip image fixture (copied from `public/images/welcome_plant.png`).
- `clintonjavery/public/content/p/hello-ink-garden/hero.png` — co-located essay hero image fixture (copied from `public/images/momma_daughter.png`).

**UPDATED**
- `clintonjavery/src/App.tsx` — `/p/:slug` element swaps `PostPlaceholder` → `PostPage` (import + JSX). No other route changes.
- `clintonjavery/src/styles.css` — added the `.prose` reading-column rules (`@layer base`, descendant selectors, token-only `var(--color-*)`); no new hex.
- `clintonjavery/vite.config.ts` — **review-fix**: removed `providerImportSource: 'react'` from `mdx()` and switched `include` to the glob `'**/*.mdx'` (from the `/\.mdx$/` regex) so only essay `.mdx` files compile through mdx; the comic `.md` files stay out. Fixes `_provideComponents is not a function` on the essay Post page.

**DELETED (superseded this story)**
- `clintonjavery/src/pages/PostPlaceholder.tsx` — fully replaced by `PostPage.tsx`.

**LEAVE ALONE (Epic 2 / later — untouched)**
- `clintonjavery/src/pages/Post.tsx` (old, dead) + all other 1.3 LEAVE-ALONE files.

### Change Log

- 2026-08-07 — Story created (create-story intent); status `ready-for-dev`.
- 2026-08-07 — Implemented (dev-story): T1 content fixtures; T2 TDD pure helpers (red→green, 11 tests); T3 essay `lazy`+`Suspense`+`.prose` reading column; T4 comic dark stage + edge-to-edge Strip + caption/afterword; T5 "This one's not here." not-found; T6 image-load-failure retry (alt preserved in AT); T7 router wiring + `PostPlaceholder` retirement; T8 regression + grep proofs. Build/lint/test green (54 modules, 0 lint problems, 27/27 tests). Status → `review`. Manual visual smoke left for Clint per AR-11.
- 2026-08-07 — Review-fix (Clint's manual test): essay Post page threw `_provideComponents is not a function` on render. Root cause was a 1.2 `vite.config.ts` MDX wiring bug (`providerImportSource: 'react'`) that only surfaced once 1.4 mounted the essay MDX. Fixed by removing `providerImportSource` (MDX compiles provider-less; no `@mdx-js/react` needed) and switching `include` to a `'**/*.mdx'` glob. Build/lint/test re-verified green (27/27). Note: **requires a dev-server restart** to take effect.