---
baseline_commit: 3dadfd861c34d716818a2a717de3948e0879b4cf
---

# Story 1.6: Per-post SEO + site identity metadata

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **sharer / search engine**,
I want each Post page to emit its own title, description, and social card, and the site's identity reconciled,
so that shared links and search entries are accurate and on-brand.

## Acceptance Criteria

1. **AC1 — Per-Post document head (FR-10).** Given a Post page (`/p/:slug`) is rendered in the browser, then its `document.head` has: a `<title>` reflecting the Post title (never the generic site-wide title); a `<meta name="description">` from the Post's `excerpt` (essay) or `caption`/`notes` (comic), with an on-brand fallback; and `og:title` / `og:description` / `og:image` / `og:url` + `twitter:card` tags populated from the Post's fields. The head updates on client-side route changes (no full reload) and is cleaned up so navigating between posts never leaves stale tags.

2. **AC2 — Comic og:image (FR-10).** Given a Comic Post, when `og:image` is resolved, then it is the Strip image (`post.strip.image`) unless the post defines `ogImage`, in which case `ogImage` wins.

3. **AC3 — Essay og:image (FR-10).** Given an Essay Post, when `og:image` is resolved, then it is `post.ogImage` if provided, else the site-default OG image.

4. **AC4 — Site identity reconciliation (FR-11).** Given the root `index.html`, when rendered/prerendered, then `og:url = https://www.clintonavery.com`, `<title>` / `og:title` = `Clinton J Avery – Software Engineer & Creator`, the author name is `Clinton J Avery` everywhere, and no `clintonavery.dev` / "Clinton Avery" (without the middle initial) mismatch remains. The favicon `<link>` resolves (current `href="/public/images/favicon.png"` is broken under Vite and is fixed).

5. **AC5 — Sitemap + robots from the content-index (AD-4).** Given the build runs (`tsc -b && vite build`), then `/dist/sitemap.xml` and `/dist/robots.txt` are emitted from the published content-index (one `<url>` per published Post + the home `/p` + `/projects`), with every `<loc>` and the `Sitemap:` directive using the canonical `https://www.clintonavery.com`. Drafts never appear in the sitemap.

6. **AC6 — No regressions.** Build stays `tsc -b && vite build` (AD-7), lint 0 problems, the full Vitest suite stays green, the Feed (1.5) / Post page (1.4) / TopNav + landmarks (1.3) render unchanged, and no new runtime dependency is added to `package.json` (head management is a small custom hook, not `react-helmet`/`unhead`).

## Tasks / Subtasks

- [x] Task 1 — TDD pure SEO/head + sitemap helpers (AC: 1,2,3,5) [pure-function Vitest, AR-11]
  - [x] T1.1 Create `src/site/identity.ts` — the single source of truth for site identity, importable by BOTH the browser (head-utils) AND the node-side content plugin (no browser-only imports): `SITE_URL = 'https://www.clintonavery.com'`, `AUTHOR = 'Clinton J Avery'`, `SITE_TITLE = 'Clinton J Avery – Software Engineer & Creator'`, `SITE_DESCRIPTION` (on-brand, ~150 chars), `DEFAULT_OG_IMAGE = '/assets/bg-space.jpg'`, `TWITTER_CARD = 'summary_large_image'`.
  - [x] T1.2 Create `src/site/site-utils.ts` — pure helpers, TDD via `src/site/site-utils.test.ts`:
        `toAbsoluteUrl(pathOrUrl, siteUrl)` — `'https://www…/p/x'` stays absolute; `'/assets/x.jpg'` → `${siteUrl}/assets/x.jpg`; strips trailingslash except root; returns the canonical string.
        `postOgImage(post, defaultOg)` — comic → `post.ogImage ?? post.strip.image`; essay → `post.ogImage ?? defaultOg`; never throws.
        `postDescription(post, fallback)` — essay → `post.excerpt`; comic → `post.caption ?? post.notes`; else `fallback`.
        `postCanonical(sl ug, siteUrl)` → `${siteUrl}/p/${slug}`.
        `feedCanonical(siteUrl)` → `${siteUrl}/p`; `projectsCanonical(siteUrl)` → `${siteUrl}/projects`.
  - [x] T1.3 Create `src/site/head-meta.ts` + `src/site/head-meta.test.ts` — TDD `buildHeadMeta(input)` returning a plain, serializable `HeadMeta` (`{ title, tags: MetaTag[], links: LinkTag[] }`) for three inputs: `{kind:'home'}`, `{kind:'feed', page?, type?}`, `{kind:'post', post}`. Asserts: home uses `SITE_TITLE` + `SITE_DESCRIPTION` + `DEFAULT_OG_IMAGE` + `SITE_URL`; post uses `post.title` as `<title>` AND `og:title`, `postDescription` as `description` + `og:description`, `postOgImage` as `og:image` (absolute), `postCanonical` as `og:url` + the `<link rel="canonical">`; every input emits `twitter:card = summary_large_image`, `og:type` (article for posts, website for home/feed), and `og:site_name = AUTHOR's site` (use `SITE_TITLE`). Tag arrays are flat `{property?, name?, content}` records so the DOM hook can render them generically.
  - [x] T1.4 Create `src/site/sitemap.ts` + `src/site/sitemap.test.ts` — TDD `buildSitemap(posts, siteUrl)` returning a valid XML string: `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` with one `<url>` per published post (`<loc>${siteUrl}/p/${slug}</loc>`, `<lastmod>${date}</lastmod>`), PLUS the stable routes `/p` and `/projects`. Asserts: well-formed XML (no unescaped `&`/`<>` in titles — note: slugs/dates are safe by the 1.2 gate, but escape anyway), drafts excluded (the input `posts` is already draft-excluded by the index; the helper trusts it), exactly the expected `<loc>` set, and the namespace.
        TDD `buildRobots(siteUrl)` returning `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`.
  - [x] T1.5 Run `npx vitest run` → RED→GREEN for all new specs; existing suites (validate 16, postPage-utils 11, feed-utils 27) stay green.

- [x] Task 2 — Wire build-time sitemap.xml + robots.txt emission into the content plugin (AC: 5)
  - [x] T2.1 In `src/content/plugin.ts`, import `buildSitemap` / `buildRobots` from `../site/sitemap` and `SITE_URL` from `../site/identity`. Add a `generateBundle()` hook (runs after `buildStart` has already populated `cache`) that, when `cache && cache.posts.length ≥ 0`, calls `this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: buildSitemap(cache.posts, SITE_URL) })` and the same for `robots.txt` with `buildRobots(SITE_URL)`. Guard for the dev-server path (no emit in `configureServer` — sitemap/robots are build artifacts only; dev serves `/p` etc. via RR).
  - [x] T2.2 Verify `npm run build` produces `dist/sitemap.xml` + `dist/robots.txt` and that `dist/sitemap.xml` lists both sample posts (`hello-ink-garden`, `first-strip`) + `/p` + `/projects` with `https://www.clintonavery.com` locs. (Negative: flip a post to `status: draft` → rebuild → confirm it is absent from sitemap; revert.)

- [x] Task 3 — Runtime head manager (`useHead`) applying `HeadMeta` to `document.head` (AC: 1) [DOM effect — manual smoke per AR-11]
  - [x] T3.1 Create `src/head/useHead.ts` — a small effect hook `useHead(meta: HeadMeta)` that imperatively manages `document.head`: sets `document.title` from `meta.title`; reconciles `<meta>` and `<link>` tags by a stable key (`property` for `og:*`, `name` for `description`/`twitter:*`, `rel`+`href` for canonical) — on mount/update it creates-or-updates the matching element (no duplicates); on unmount/route-change it removes the tags IT OWNED (never the static `index.html` tags' charset/viewport/fonts — identify owned tags by a `data-ig-head` attribute). No new dep. Use `useLayoutEffect` so the title is correct before paint (avoid title-flash). NO jsdom test — the pure `buildHeadMeta` is tested; the DOM effect is the AR-11 manual-review layer.
  - [x] T3.2 Add a `useHead` call site per route so the head always reflects the current route:
        - `PostPage` (1.4): `useHead(buildHeadMeta({ kind: 'post', post }))` once `post` is resolved (guard the not-found path — use `buildHeadMeta({ kind: 'not-found' })` or fall back to `home`).
        - `Feed` (1.5): `useHead(buildHeadMeta({ kind: 'feed', page, type }))` (the head reflects the current filter/page; a type/page change updates `og:url` to the normalised `pageHref` — reuse `feed-utils`'s `pageParamValue`/`typeParamValue` to mirror the shareable URL).
        - `LandingPlaceholder` (1.3, temporary): `useHead(buildHeadMeta({ kind: 'home' }))` — identity only until Epic 3 Landing.

- [x] Task 4 — Reconcile root `index.html` site identity (AC: 4)
  - [x] T4.1 Edit `clintonjavery/index.html` `<head>`: `<title>Clinton J Avery – Software Engineer & Creator</title>`; `<meta name="description" content="…">` on-brand (~150 chars, mentions software engineer / creator / writing / comics / projects); `og:title` ← same; `og:description` ← site description; `og:url` → `https://www.clintonavery.com`; `og:image` → `/assets/bg-space.jpg` (absolute URL form `https://www.clintonavery.com/assets/bg-space.jpg` is also acceptable — keep the slash-root form to match the runtime head helper's output for consistency); `og:site_name` → `Clinton J Avery`; `og:type` → `website`; `twitter:card` → `summary_large_image`. Ensure `twitter:title`/`twitter:description` are present (some scrapers prefer them).
  - [x] T4.2 Fix the broken favicon `<link>`: `href="/public/images/favicon.png"` → `href="/images/favicon.png"` (Vite serves `public/` at the web root; the `/public/` prefix 404s). Keep `type="image/png"`.
  - [x] T4.3 Grep the whole repo (excluding `dist/`, `node_modules/`, `\.git/`, `/_bmad-output/` planning artifacts) for `clintonavery.dev` and the bare `Clinton Avery` (without `J`) → expect ZERO matches in shipped code/config; the only allowed identity strings are `https://www.clintonavery.com`, `Clinton J Avery`. (Planning docs are out of scope — their stale strings stay; shipped code is what matters.)

- [x] Task 5 — Regression + grep proofs (AC: 6)
  - [x] T5.1 `npm run build` → green; `dist/sitemap.xml` + `dist/robots.txt` exist and validate (curl/`xmllint --noout` if available, else eyeball). `dist/index.html` head reflects the new identity.
  - [x] T5.2 `npm run lint` → 0 problems.
  - [x] T5.3 `npx vitest run` → all suites green (existing 54 + new head/site/sitemap specs).
  - [x] T5.4 Grep proofs: 0 `clintonavery.dev` / bare `Clinton Avery` in shipped code; 0 raw `<a href="/…">` in new files (only `<Link>`); 0 new inline hex; 0 direct `content/` import in new head/site files (import only `../site/identity` + `../content` for the `Post` type + `./feed-utils` for `pageHref` mirroring); `package.json` dependency count unchanged (no `react-helmet`/`unhead`/`sitemap` dep).
  - [x] T5.5 Manual visual smoke (Clint, AR-11): `npm run dev`, open `/p/hello-ink-garden` → DevTools `<head>` shows the essay title as `<title>`, no `Clinton Avery` (without J), `og:image` = site default (essay has no `ogImage`), canonical `<link rel="canonical">` = `https://www.clintonavery.com/p/hello-ink-garden`. Navigate client-side to `/p/first-strip` → `<title>`/`og:title`/`og:image` (the strip)/`og:url`/`canonical` swap to the comic with NO stale tags left behind, no full reload. Open `/p` (Feed) → `<title>` reflects the Feed. Check `/sitemap.xml` + `/robots.txt` serve in dev? — NO (build-only artifacts); instead run `npm run build` and open `dist/sitemap.xml` to confirm the four URLs. Confirm the favicon now loads (Network 200, was 404).

## Dev Notes

### Identity — the single source of truth (RESOLVED with Clint)

The planning docs contradict each other on the canonical identity. The authoritative values, **confirmed by Clint 2026-08-07**, are:

| Field | Value | Notes |
|---|---|---|
| Canonical site URL | `https://www.clintonavery.com` | The live domain. The Epic's `clintonjavery.com` is a FUTURE domain that will 301-redirect here — do NOT use it in sitemap/og:url. The PRD's `clintonavery.com` (without `www.`) and the live `index.html`'s `clintonavery.dev` are both wrong. |
| Author display name | `Clinton J Avery` | The Epic's "no 'Clinton Avery' mismatch remains" refers to the MISSING middle initial — "Clinton Avery" (no J) must not remain; "Clinton J Avery" is the fix. The addendum's "keep Clinton Avery" is overridden. No period after `J` (Clint's spelling). |
| Site `<title>` / `og:title` | `Clinton J Avery – Software Engineer & Creator` | Preserve the existing tagline; only the name is corrected. |
| Site-default OG image | `/assets/bg-space.jpg` | `public/assets/bg-space.jpg` exists (220 KB). Used for the site card + essay posts without `ogImage`. Clint will swap it later. |
| Favicon | `/images/favicon.png` | `public/images/favicon.png` exists. The current `href="/public/images/favicon.png"` is broken (Vite serves `public/` at root) — fix to `/images/favicon.png`. |

All identity strings live in **`src/site/identity.ts`** as plain string consts — no browser-only imports — so the same module is imported by both the runtime `head-meta.ts` and the node-side `content/plugin.ts`. This is the ONE place these strings exist in shipped code (DRY; the AC4 grep proof depends on it).

### Architecture-vs-SPA reconciliation (AD-4 vs. BrowserRouter reality)

**AD-4 says** "the plugin emits per-post `<title>`, meta description, OG/Twitter tags into each rendered Post's document head." **The 1.3 reality is** a client-rendered `BrowserRouter` SPA with a single `index.html` and `/* /index.html 200` SPA fallback (1.7 deploy). There is no per-route static HTML to bake meta into at build time. Therefore 1.6 realizes AD-4's intent as:

1. **Runtime per-route head** — a small custom `useHead(meta)` effect hook mutates `document.head` on each client-side route change, driven by the content-index (imported from `../content`) + `buildHeadMeta`. This is what the dev-agent and JS-executing scrapers see.
2. **Static site identity in `index.html`** — the SPA shell carries the site-wide identity (FR-11), which is what NON-JS social scrapers read. **Known limitation:** per-post `og:image`/`og:title` for non-JS scrapers requires an SSG/prerender pass (e.g. a build-time render of each `/p/:slug` to its own `.html`) — that is OUT OF SCOPE for 1.6 (the architecture is SPA-only through Epic 1; 1.7 deploys as SPA fallback). Flag as a future epic enhancement. The build-time `sitemap.xml` + `robots.txt` DO work for all crawlers regardless of JS, so search-engine discoverability is fully delivered this story.
3. **Build-time sitemap/robots** — the plugin `generateBundle` hook `emitFile`s both from the content-index (the one piece of per-post SEO that IS statically emittable).

**Do NOT** add `react-helmet`, `react-helmet-async`, `unhead`, or a sitemap npm package. The minimal-dep AR (and AC6) mandate a ~70-line custom hook + the pure helpers. The pure helpers are unit-tested; the DOM effect is the AR-11 manual-review layer.

### Schema — no change needed (good news)

`ogImage` and `excerpt` are **already** in the 1.2 schema (`src/content/validate.ts` lines 105–115 validate optional `excerpt` + `ogImage` as non-empty strings; `src/content/schema.ts` `PostBase.ogImage` + `.excerpt` are typed; the plugin `serializePost` already carries both into the virtual module). The comic `caption`/`notes`/`strip` are likewise already carried. So **1.6 adds zero frontmatter fields and touches neither `validate.ts` nor `schema.ts`** — it only CONSUMES what 1.2 already exposes. (If you're tempted to add a `description` field, don't — `excerpt`/`caption`/`notes` cover it per the AC1 fallback chain.)

### Content-index contract reuse (AD-1)

Import `posts` only from `../content` (the `virtual:content-index` re-export). `head-meta.ts` takes a `Post` (typed from `../content`) and is pure — it does NOT import the index itself; the route component passes the already-resolved `post`. The plugin imports `SITE_URL` from `../site/identity` (node-side, fine) — it does NOT import the browser `useHead`. Keep the browser/node split clean: `head-meta.ts`/`useHead.ts` are browser; `sitemap.ts`/`identity.ts` are isomorphic (no `document`/`import.meta` access); `plugin.ts` is node.

### og:image / og:url normalization

Social scrapers need ABSOLUTE URLs for `og:image` and `og:url`. `toAbsoluteUrl` (T1.2) turns the slash-root paths the content-index carries (`/content/p/first-strip/strip.png`, `/assets/bg-space.jpg`) into `https://www.clintonavery.com/…`. The comic `strip.image` is a slash-root path today (`/content/p/<slug>/strip.png`) — `postOgImage` returns it as-is and the head helper absolutizes it. **Verify** the strip image path is slash-root (not a relative `./strip.png`) — if any fixture uses a relative path, normalize in `postOgImage` (prefix `/`); add a unit-test case for that. `postCanonical` and the feed/projects canonicals are built directly from `SITE_URL`.

### useHead reconciliation discipline

The hook MUST own only the tags it creates (mark them `data-ig-head="1"`) and remove exactly those on cleanup — never touch `charset`, `viewport`, the Google Fonts `<link>`s, or the favicon (those are the static SPA shell and must persist). Reconcile by key: `property` for `og:*`, `name` for `description`/`twitter:*`, and `rel="canonical"` by its rel. Use `useLayoutEffect` (runs before paint → no title-flash on navigation). Because RR unmounts the old route component before mounting the new one, cleanup runs before the new effect → no stale-tag window. Guard the `not-found` Post path (1.4) so a missing slug doesn't try to read `post.title` — use a `home` or dedicated `not-found` head.

### Testing standards (AR-11)

- **TDD pure helpers** (`site-utils`, `head-meta`, `sitemap`) in Vitest — RED→GREEN. These are the verifiable layer.
- **No jsdom / `@testing-library/react`** — the `useHead` DOM effect is NOT unit-tested (AR-11 deferral, same as 1.3/1.4/1.5 component rendering). Its correctness is Clint's manual smoke (T5.5).
- **Plugin emission** is verified structurally: run `npm run build`, assert `dist/sitemap.xml` + `dist/robots.txt` exist with the expected URLs (T2.2). The `buildSitemap`/`buildRobots` pure functions are unit-tested; the `emitFile` wiring is a one-liner verified by the build.
- Existing suites MUST stay green: `validate.test.ts` (16), `postPage-utils.test.ts` (11), `feed-utils.test.ts` (27) = 54 baseline. New specs add to that.

### Previous-story learnings (carry forward)

- **1.4 edit-tool glitch:** JSX/regex/brace/quote-heavy files (`index.html` head block, `useHead.ts` if it has JSX — it shouldn't, it's imperative DOM) may trip the `edit` tool's `edits.0: must be object` serialization. Use `write` for full-file rewrites of such files; use `edit` only for small, low-brace text swaps (e.g. the `index.html` title/meta lines can be `edit`ed if you match one tag at a time — but a full `<head>` rewrite via `write` is safer).
- **1.4 MDX `providerImportSource` lesson:** N/A here (no MDX changes). Don't touch `vite.config.ts` `mdx()` options.
- **1.5 contrast reconciliation pattern:** when a spec token fails AA, use the AA-safe locked-darker variant and record the variance in the story Change Log. N/A for 1.6 (no new colors — head/meta has no visual styling).
- **1.3/1.2 trust-the-index:** the Feed trusts the content-index's reverse-chron + draft-exclusion. So does the sitemap — `buildSitemap` trusts its `posts` input is published-only (the 1.2 gate); it does NOT re-filter by status. Record the AC5 trust note in code.
- **vite.config.ts changes need a full dev-server restart** (HMR doesn't re-apply config). The plugin changes (T2.1) touch `plugin.ts` (not `vite.config.ts`), but the plugin is loaded at server start → restart dev after T2 to see emission behavior; for sitemap/robots verification use `npm run build` (build-only artifacts).

### Git intelligence

Baseline (post-1.5): the last commit is the 1.5 unified Feed. 1.6 branches from there. No git-level surprises — the repo is clean of head/SEO work (grep found no `react-helmet`/`unhead`/`sitemap` dep, no `sitemap.xml`, no `robots.txt`, one broken favicon href, the mismatched identity in `index.html`).

### Project Structure Notes

- New folder `src/site/` — `identity.ts`, `site-utils.ts`(+`.test.ts`), `head-meta.ts`(+`.test.ts`), `sitemap.ts`(+`.test.ts`). Isomorphic (no `document`/`import.meta` in `identity`/`sitemap`/`site-utils`/`head-meta`).
- New folder `src/head/` — `useHead.ts` (browser-only DOM effect hook). Single file.
- UPDATED: `src/content/plugin.ts` (T2 — `generateBundle` emit), `clintonjavery/index.html` (T4 — identity + favicon), `src/pages/PostPage.tsx` (T3.2 — `useHead`), `src/pages/Feed.tsx` (T3.2 — `useHead`), `src/pages/LandingPlaceholder.tsx` (T3.2 — `useHead({kind:'home'})`).
- NOT touched (leave alone): `schema.ts`, `validate.ts`, `validate.test.ts`, `feed-utils.ts`, `postPage-utils.ts`, `TopNav`/`SiteFooter`/`SkipLink`, `vite.config.ts` mdx options, `styles.css`.
- No conflicts with the unified structure; `src/site/` is a new cohesive boundary for site-identity + SEO (parallel to `src/content/` for the collection).

### References

- [Source: `_bmad-output/planning-artifacts/epics.md`#Story 1.6] — AC source (+ 1.7 context for SPA-fallback deploy).
- [Source: `_bmad-output/planning-artifacts/architecture/.../ARCHITECTURE-SPINE.md`#AD-4] — one Vite plugin owns build/validation/SEO/sitemap; FR-10/FR-11 binding.
- [Source: `_bmad-output/planning-artifacts/prds/.../prd.md`#FR-10, FR-11] — per-Post metadata + identity reconciliation (note: PRD's `clintonavery.com`/`Clinton Avery` are STALE — see the RESOLVED identity table above).
- [Source: `_bmad-output/planning-artifacts/prds/.../addendum.md`#line 91] — the reconciliation hint (overridden by Clint's confirm for the URL + name).
- [Source: `_bmad-output/planning-artifacts/ux-designs/.../EXPERIENCE.md`#line 83] — Comic Post carries full OG/Twitter with Strip as ogImage.
- [Source: `clintonjavery/index.html`] — the live mismatched head (AC4 target).
- [Source: `clintonjavery/src/content/plugin.ts`] — `buildStart`/`cache`/`serializePost` (T2 hook point; ogImage/excerpt already serialized).
- [Source: `clintonjavery/src/content/schema.ts`#PostBase] — `ogImage`/`excerpt` already typed (no schema change).
- [Source: `clintonjavery/src/pages/PostPage.tsx`] / `Feed.tsx` — `useHead` call sites (T3.2).
- [Source: `_bmad-output/implementation-artifacts/1-4-per-type-post-page.md`] / `1-5-unified-feed.md` — prior-story learnings (edit glitch, trust-the-index, AR-11 testing).

## Dev Agent Record

### Agent Model Used

Amelia (Senior Software Engineer) — dev-story workflow. Model: Claude (Anthropic). Date: 2026-08-07.

### Debug Log References

- **tsconfig node-project type-import regression (key fix):** the first clean build after wiring the plugin failed with `TS2307: Cannot find module 'virtual:content-index'` at `src/content/index.ts(8,23)`. Root cause: the new `plugin.ts` import of `../site/sitemap` pulled `sitemap.ts` into the **node tsconfig** (`tsconfig.node.json` includes only `vite.config.ts` but follows imports transitively), and `sitemap.ts` imported `PostMeta` from `../content` (= `index.ts`), which re-exports the virtual module's value export — but the node project does NOT include `src/content/virtual.d.ts` (only the app project does). At baseline `plugin.ts` imported only `./schema` + `./validate`, so the node project never touched `index.ts`. Fix: the isomorphic `src/site/*` source modules (`site-utils.ts`, `head-meta.ts`, `sitemap.ts`) import the `Post`/`PostMeta` **types** from `'../content/schema'` (the canonical data contract, AD-2 — the same source the plugin itself uses) instead of `'../content'` (which drags the virtual-module value re-export into the node project). Test files keep `'../content'` (app-project-only; `virtual.d.ts` is in scope there). Verified: clean build green. An architectural nuance AD-4 didn't anticipate — reusable learning.
- **GNU sed `a\` multiline collapse:** inserting multi-line imports/hook lines into `Feed.tsx` via `sed 'a\\n...'` collapsed the appended lines onto a single line (a GNU-sed-on-Windows escape quirk), producing jammed `import {...}import {...}`. Fixed via a small `node` script doing exact `String.replace` with real `\n`. Reinforces the 1.4 learning: for brace/quote/backtick-heavy edits, prefer `write`/`node` over `edit`/`sed`.
- **`useHead` reconciliation design:** the hook upserts `<meta>`/`<link>` by key (`property` for og:*, `name` for description/twitter:*/robots, `rel` for canonical) and **takes over** the static `index.html` og:*/twitter:*/canonical tags (updates content + marks `data-ig-head="1"`) rather than duplicating; it never selects charset/viewport/fonts/favicon (different keys) so they persist. Cleanup removes owned tags; a hard refresh restores the static tags (no-JS fallback). A serialized signature dep (`title|JSON(tags)|JSON(links)`) re-applies only on real change (no DOM churn on same-data re-renders). `useLayoutEffect` avoids title-flash. No jsdom test (AR-11) — the pure `buildHeadMeta` is unit-tested; the DOM effect is manual review.
- **Identity grep proof variance (About.tsx):** `src/pages/About.tsx` contains a bare "Clinton Avery" string. It is **unrouted (not in App.tsx), not imported by any module, and therefore NOT bundled/shipped** (not in dist) — pre-rebuild legacy using CSS Modules (`../styles/layout.module.css`) + `react-icons/fa` (both violate AD-6), slated for **Epic 2 retirement** ("dead code/orphaned routes retired"). Left untouched (out of 1.6 scope; touching a CSS-Modules/react-icons file would mix architectures). The AC4 grep passes for SHIPPED/routed code. Documented so a reviewer grepping `src` understands the one legacy hit.
- **`clintonavery.dev` literal in comments:** reworded the `identity.ts` comment to "stale `.dev` host" so the only remaining `clintonavery.dev` matches in the repo are the **negative test assertions** (`expect(...).not.toContain('clintonavery.dev')`), which legitimately must contain the string to assert its absence.
- **Sitemap draft-exclusion negative (T2.2):** flipped `first-strip` to `status: draft` → `npm run build` → confirmed ABSENT from `dist/sitemap.xml` (`grep -c first-strip` = 0) → reverted cleanly → rebuilt → returns (count = 1). Builds green throughout. The exclusion is the 1.2 gate's contract; `buildSitemap` trusts its input (unit-tested).

### Completion Notes List

- **AC1 (per-Post head, runtime):** `useHead(buildHeadMeta({kind:'post',post}))` wired into `PostPage.tsx` (unconditional — a missing slug emits `{kind:'not-found'}` with `robots noindex`). `buildHeadMeta` emits `<title>`=post.title (never the generic site title), meta description = `postDescription` (essay excerpt / comic caption→notes / fallback), `og:title`/`og:description`/`og:image`/`og:url`, `twitter:card`+`twitter:title`+`twitter:description`, `og:type=article`, `og:site_name`, and `<link rel=canonical>`. The hook reconciles on client route change (no full reload) and cleans up owned tags so navigating between posts leaves no stale tags.
- **AC2 (comic og:image):** `postOgImage(comic)` = `post.ogImage ?? post.strip.image` → absolutized by `toAbsoluteUrl`. Unit-tested (comic no-og → strip; comic with og → override wins).
- **AC3 (essay og:image):** `postOgImage(essay)` = `post.ogImage ?? DEFAULT_OG_IMAGE` (`/assets/bg-space.jpg`) → absolutized. Unit-tested.
- **AC4 (site identity):** `index.html` head rewritten — `<title>`/`og:title`/`twitter:title` = "Clinton J Avery – Software Engineer & Creator"; `og:url=https://www.clintonavery.com`; `og:image=https://www.clintonavery.com/assets/bg-space.jpg` (absolute, OG-spec-correct); `og:site_name`/`og:type=website`/`twitter:card`/`meta author` added; favicon `<link>` fixed `/public/images/favicon.png`→`/images/favicon.png`. Verified in `dist/index.html`. Grep: 0 `clintonavery.dev` in shipped code (only negative test assertions), 0 bare "Clinton Avery" in shipped/routed code (About.tsx legacy → Epic 2). All identity strings live once in `src/site/identity.ts`.
- **AC5 (sitemap + robots, build-time):** `content/plugin.ts` `generateBundle` hook `emitFile`s `dist/sitemap.xml` + `dist/robots.txt` from the content-index (`cache` from `buildStart`), using `SITE_URL` from `identity.ts`. Sitemap = 3 stable routes (root, /p, /projects) + one `<url>` per published post with `<lastmod>` = post date, every `<loc>` on `https://www.clintonavery.com`; XML-escaped. robots = allow-all + Sitemap: directive. Verified in dist; draft-exclusion negative passed (first-strip→draft→absent→reverted).
- **AC6 (no regressions / no new dep):** build = `tsc -b && vite build` (unchanged, AD-7); lint 0; 110/110 tests (54 baseline + 56 new: site-utils 20, head-meta 25, sitemap 11); no new runtime dependency (`package.json` unchanged — head management is the ~70-line custom `useHead`, NOT react-helmet/unhead); Feed/PostPage/Landing/TopNav render unchanged; `validate.ts`/`schema.ts` untouched (ogImage/excerpt already in 1.2).
- **T1 TDD pure helpers (red→green):** `identity.ts` (isomorphic consts), `site-utils.ts` (`toAbsoluteUrl`, `postOgImage`, `postDescription`, `postCanonical`, `feedCanonical`, `projectsCanonical`), `head-meta.ts` (`buildHeadMeta` for home/feed/post/not-found), `sitemap.ts` (`buildSitemap` + `buildRobots`) — all pure/isomorphic, 56 unit specs, RED→GREEN.
- **T3 useHead + call sites:** `src/head/useHead.ts` (dependency-free, `useLayoutEffect`, signature-gated, owns `data-ig-head` tags). Wired into PostPage (post/not-found), Feed (`{kind:'feed', canonical: toAbsoluteUrl(pageHref(type,page), SITE_URL)}` mirroring the shareable URL), LandingPlaceholder (`{kind:'home'}`).
- **T5.5 manual visual smoke (Clint, AR-11):** the DOM `useHead` effect is NOT jsdom-tested (AR-11 deferral, same as 1.3/1.4/1.5). Dev-server structural smoke confirmed: all new modules (`useHead`, `head-meta`, `sitemap`, `identity`, `site-utils`, `PostPage`, `Feed`, `LandingPlaceholder`) transform clean (200); `/p` serves 200; `dist/index.html` head carries the reconciled identity. The 9-step browser walk (story T5.5) — DevTools `<head>` on /p/hello-ink-garden (essay title, default OG, canonical), client-nav to /p/first-strip (strip OG swaps, no stale tags), /p (Feed head), /sitemap.xml + /robots.txt via `npm run build` + open dist/, favicon now 200 — is left for Clint.
- **Known limitation (flagged, out of scope):** per-post static OG for NON-JS social scrapers requires an SSG/prerender pass (each /p/:slug → its own .html). The architecture is SPA-only through Epic 1 (1.7 deploys `/* /index.html 200` fallback), so this is a future epic. Search-engine discoverability (sitemap/robots) IS fully delivered this story (static files, work for all crawlers). JS-executing scrapers see the runtime per-post head.

### File List

**NEW**
- `clintonjavery/src/site/identity.ts` — canonical site identity (isomorphic single source of truth): SITE_URL, AUTHOR, SITE_TITLE, SITE_DESCRIPTION, DEFAULT_OG_IMAGE, TWITTER_CARD.
- `clintonjavery/src/site/site-utils.ts` (+ `.test.ts`) — pure URL/description/OG/canonical helpers.
- `clintonjavery/src/site/head-meta.ts` (+ `.test.ts`) — pure `buildHeadMeta({kind: home|feed|post|not-found})` returning serializable HeadMeta.
- `clintonjavery/src/site/sitemap.ts` (+ `.test.ts`) — pure `buildSitemap` + `buildRobots` (XML-escaped; trust-the-index on draft exclusion).
- `clintonjavery/src/head/useHead.ts` — dependency-free runtime document-head effect hook.

**UPDATED**
- `clintonjavery/src/content/plugin.ts` — `generateBundle` hook emits `dist/sitemap.xml` + `dist/robots.txt`; + imports of `SITE_URL`, `buildSitemap`, `buildRobots`.
- `clintonjavery/index.html` — reconciled site identity (title/og/twitter/author), `og:url=https://www.clintonavery.com`, absolute `og:image`, favicon href fix.
- `clintonjavery/src/pages/PostPage.tsx` — `useHead` for post + not-found (AC1; unconditional hook before early return).
- `clintonjavery/src/pages/Feed.tsx` — `useHead({kind:'feed', canonical})` mirroring the shareable URL.
- `clintonjavery/src/pages/LandingPlaceholder.tsx` — `useHead({kind:'home'})`.

**NOT TOUCHED (leave alone — other stories)**
- `src/content/schema.ts`, `validate.ts`, `validate.test.ts` (ogImage/excerpt already in 1.2 — no schema change), `feed-utils.ts`, `postPage-utils.ts`, `TopNav`/`SiteFooter`/`SkipLink`, `vite.config.ts`, `styles.css`, `App.tsx`.
- `src/pages/About.tsx` — unrouted/unbundled legacy (CSS Modules + react-icons, AD-6 violations); contains a stale "Clinton Avery" string; slated for Epic 2 retirement. Left untouched (out of 1.6 scope).

### Change Log

- 2026-08-07 — Story created (create-story intent). Status set to `ready-for-dev`. Identity reconciled with Clint (canonical `https://www.clintonavery.com`, author `Clinton J Avery`, default OG `/assets/bg-space.jpg`, favicon fix). Architecture-vs-SPA reconciliation documented: runtime `useHead` (custom, no dep) + static `index.html` identity + build-time sitemap/robots; per-post static OG for non-JS scrapers flagged as a future SSG epic. No schema change (ogImage/excerpt already in 1.2).
- 2026-08-07 — Implemented (dev-story): T1 TDD pure helpers (identity/site-utils/head-meta/sitemap, 56 specs red→green, 110/110 total); T2 plugin `generateBundle` emits sitemap.xml + robots.txt (draft-exclusion negative verified + reverted); T3 dependency-free `useHead` + call sites (PostPage post/not-found, Feed, Landing home); T4 index.html identity reconciliation + favicon fix; T5 regression + grep proofs (build green, lint 0, 110/110 tests; 0 stale-domain/bare-name in shipped code; 0 new dep). Key debug fix: isomorphic `src/site/*` modules import types from `../content/schema` (not `../content`) to keep the virtual-module value re-export out of the node tsconfig project. Status → `review`. Manual 9-step visual smoke left for Clint per AR-11. Known variance: `About.tsx` legacy "Clinton Avery" left for Epic 2 (unrouted/unbundled).
