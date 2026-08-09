---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
inputDocuments:
  - "_bmad-output/planning-artifacts/prds/prd-clintonjaverydotcom-2026-08-04/prd.md"
  - "_bmad-output/planning-artifacts/prds/prd-clintonjaverydotcom-2026-08-04/addendum.md"
  - "_bmad-output/planning-artifacts/architecture/architecture-clintonjaverydotcom-2026-08-04/ARCHITECTURE-SPINE.md"
  - "_bmad-output/planning-artifacts/ux-designs/ux-clintonjaverydotcom-2026-08-04/DESIGN.md"
  - "_bmad-output/planning-artifacts/ux-designs/ux-clintonjaverydotcom-2026-08-04/EXPERIENCE.md"
---

# clintonjaverydotcom - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for clintonjaverydotcom, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

- **FR-1:** Landing hero renders an action-oriented photograph + one-line identity statement fully inside the first viewport on all viewports ≥320px; the hero is the LCP element with no layout shift above it on initial render.
- **FR-2:** Landing scroll narrative routes to Feed, Projects, and type-filter shortcuts via in-narrative links using client-side navigation (URL changes, no full reload); every section reachable without scrolling via a skip-to-section control.
- **FR-3:** Landing shows a "Latest" set of exactly the 3 most-recent Posts in reverse-chronological order; each links to its Post via client-side nav; fewer than 3 Posts renders only those that exist.
- **FR-4:** Feed renders all published Posts in reverse-chronological order with a Type Filter (all / essays only / comics only) that re-scopes the list client-side; changing the filter updates URL + list without a full page reload; `status: draft` Posts never appear.
- **FR-5:** Feed paginates at 10 Posts per page with stable, shareable per-page URLs; page 1 shows the 10 newest, etc.; empty pages beyond the last populated page return no items (never an error).
- **FR-6:** Each Post has a dedicated page rendering per type — Essay Post renders the rich markdown/MDX body (headings, paragraphs, images, code blocks, callouts, embeds); Comic Post renders the Strip as an `<img alt="…">` populated from Alt Text, plus title, date, and optional caption/notes; reachable by client-side nav and direct URL at `/p/<slug>`.
- **FR-7:** A new Essay Post or Comic Post is publishable by adding a correctly-structured content file to `content/` and pushing to `main`, with no `.tsx`/component edits and no manual dev/build; Cloudflare Pages auto-builds and deploys and the Post goes live.
- **FR-8:** Every Comic Post with absent or empty Alt Text is invalid and fails the build with a message naming the offending file and the missing field; Essay Posts require title + body; a Post missing required frontmatter does not render on the site.
- **FR-9:** Projects renders a list of Projects Entries, each exposing at least one of a live demo URL or in-site live tool plus a source repository URL, a one-line summary, and the relevant tech stack; existing tools/games (Time Zone Converter, Text Analyzer, Effort Estimator, Unit Converter, Balloon Popper) are reachable as Projects Entries with live, usable demos.
- **FR-10:** Every Post renders its own `<title>` (closely reflecting the Post title, never a generic site-wide title), meta description, and Open Graph/Twitter Card tags (`og:title`, `og:description`, `og:image`, `og:url`, `twitter:card`) populated from the Post's fields; `ogImage` is per-Post (the Strip image for Comic Posts) unless overridden.
- **FR-11:** Site identity metadata is reconciled to `clintonjavery.com` — `index.html` declares `og:url = https://clintonjavery.com` and a `<title>`/`og:title` consistent with the brand/author name; no competing domain/tag mismatch (currently mismatched as `clintonavery.dev` / "Clinton Avery") remains.
- **FR-12:** A Support call-to-action (linking the existing Contribute/Venmo destination) is present on Post pages and the Feed footer area; there is no `/support` or `/contribute` top-level route in the site navigation; dropping the Contribute page from navigation does not break the Support link target.
- **FR-13:** 100% of existing blog posts defined today in `.tsx` data files are present in the new Post model with content, text, images, and heading structure preserved and reachable at Post URLs; a before/after spot-check shows no posts dropped or visually broken; redirects/URL continuity for previously indexed post URLs are handled (no 404s on prior paths where feasible).
- **FR-14:** All in-app links use client-side routing; clicking any in-app link changes the URL and renders the target without a `window` reload; no raw `<a href="/…">` anchors are used for in-app routes (external links excepted).
- **FR-15:** Dead/orphaned code and routes are removed — the duplicate Balloon Popper components collapse to exactly one implementation exposed as a Projects Entry; the commented-out `/reading` route is retired; editor-cruft `*~` files and stale build artifacts are removed from `public/`.
- **FR-16:** A Comic Post page lets the reader zoom and pan across the Strip — pinch on touch; Ctrl+wheel + on-screen `+`/`−` controls on pointer; `+`/`−` keyboard zoom; drag pans while zoomed (touch or pointer); arrow keys pan; a Reset control (and `0` key) returns to fit; `Esc` resets and exits zoom — all confined to the Strip image area (never the page chrome); keyboard-accessible and does not trap focus (WCAG 2.1 AA).

### NonFunctional Requirements

- **NFR-1 (Accessibility — WCAG 2.1 AA):** Semantic HTML with landmarks, one `h1` per page, ordered headings; skip-to-content link first-focusable on every surface; visible focus ring on every interactive element; focus order follows reading order; tap targets ≥44×44 CSS px on touch; meaning never encoded by color alone; descriptive link text (not "here"); external links open in a new tab with `rel="noopener"`; comic alt text is mandatory and describes the strip's conveyed content/gag (not "a comic"); zoom/pan is keyboard-operable and does not trap focus; `prefers-reduced-motion: reduce` disables scroll-reveal and zoom transitions (instant).
- **NFR-2 (Performance):** Static site on Cloudflare Pages, no runtime/database; LCP under a static-site budget with no client-side data fetch critical to first paint; do not over-engineer performance beyond Cloudflare static defaults (counter-metric SM-C1).
- **NFR-3 (Maintainability):** Content and application code are separated — publishing touches only `content/`; one styling system (Tailwind v4); content loaded at build time via Vite `import.meta.glob` (no runtime fetch).
- **NFR-4 (Browser support):** Evergreen Chromium/Firefox/Safari; responsive from 320px to wide desktop.
- **NFR-5 (Deploy):** Automatic via Cloudflare Pages on push to `main`; the build fails closed on invalid content (FR-8); SPA fallback serves `index.html` for unmatched routes.
- **NFR-6 (Privacy):** No third-party analytics/tracking in v1 (counter-metric SM-C2).
- **NFR-7 (Migration integrity):** 100% of prior posts are reachable and visually intact post-rebuild (before/after spot-check) — success metric SM-2.

### Additional Requirements

- **AR-1 (Brownfield, no greenfield template):** Rebuild on top of the existing React 19 + Vite 6 + React Router 7 app; preserve the stack and existing posts — no starter/greenfield template. (Affects Epic 1 Story 1 bootstrap.)
- **AR-2 (Tailwind v4 wiring):** Wire Tailwind v4 via the `@tailwindcss/vite` plugin (no PostCSS) and `@import "tailwindcss"` in a single `src/styles.css`; CSS Modules are retired per-component (no new CSS Modules).
- **AR-3 (Design-token ownership):** Establish a `@theme` token block in `src/styles.css` mapping every DESIGN.md (Ink & Garden) token by name; components reference `@theme` tokens only — no inline hex literals.
- **AR-4 (Build-time contrast gate):** A build-time WCAG AA contrast check asserts the load-bearing token pairs (Primary `#2E7D32` as link text on Surface; white on-Primary button fill; any Secondary-as-text usage) and fails the build if under 4.5:1, locking darker variants (`#256628` / `#26702C`) where required — closes the UX open item.
- **AR-5 (Content pipeline — single Vite plugin):** Implement build-time content via one custom Vite plugin that globs `content/p/**/*.{md,mdx}` with `import.meta.glob({ eager: true })` + `gray-matter` frontmatter parse + `@mdx-js/rollup` MDX compile; builds a typed `content-index`; emits per-post `<head>` meta + `/sitemap.xml` + `/robots.txt`; enforces the FR-8 mandatory-alt gate inside the build.
- **AR-6 (Content schema as authoritative contract):** Define `src/content/schema.ts` matching the PRD addendum §A frontmatter schema as the authoritative Post data contract; the emitted `content-index` exposes one typed `Post[]` — the only Post type any consumer uses.
- **AR-7 (Build command):** Build command stays minimal — `tsc -b && vite build` — with no separate prebuild script (validation + meta + sitemap run inside the Vite plugin).
- **AR-8 (Deploy migration):** Retire `.github/workflows/deploy.yml` (Azure Storage `$web` + CDN); deploy static assets to Cloudflare Pages via git auto-deploy on `main`.
- **AR-9 (Redirects contract):** Author `public/_redirects` ordered — historic 301s first (`/writing/:slug → /p/:slug 301`, `/comics → /p?type=comic 301`, `/tools/:slug → /projects/:slug 301`, `/fun/:slug → /projects/:slug 301`, `/about → / 301`, `/gallery → / 301`, `/reading → / 301`), then `/* /index.html 200` last so React Router owns unmatched paths.
- **AR-10 (Routing contract):** React Router 7 `BrowserRouter`; fixed routes `/`, `/p`, `/projects`, `/projects/:slug`; dynamic `/p/:slug` is content-derived from the collection — no hand-registered per-post `<Route>`.
- **AR-11 (Deferred — not v1):** Per-story ComicViewer input wiring detail; test framework (introduce Vitest at the first story that needs it); image optimization/responsive images; RSS feed; subscribe/follow; analytics; paywall.
- **AR-12 (Paywall design-not-against):** Post frontmatter + pipeline must allow a future `access: free|premium` field and a future auth-gate layer without re-architecting content; v1 publishes everything as `free`.
- **AR-13 (Dependency verify-at-install):** Install-time verification of version pins for the new dependencies — `@tailwindcss/vite`, `@mdx-js/rollup`, `gray-matter` (pin latest, verify on web before adding). Existing stack versions are ratified from `package.json`.

### UX Design Requirements

- **UX-DR-1 (Design-token system):** Implement the full Ink & Garden design-token system in `src/styles.css` `@theme` — colors (surface, surface-dim, surface-container-low/-container/-high, ink, on-surface, on-surface-variant, outline, outline-variant, primary, on-primary, primary-container, on-primary-container, accent-mint, secondary, on-secondary, secondary-container, on-secondary-container, tertiary, on-tertiary, tertiary-container, ink-surface, on-ink, ink-variant, error, on-error, error-container, on-error-container, background, on-background), typography ramps (display-lg + display-lg-mobile, headline-lg/md/sm, title, body-lg/md/sm, eyebrow, caption, code), rounded scale (none/sm/DEFAULT/md/lg/xl/full), spacing scale (unit, gutter, margin-mobile/tablet/desktop, section-gap, section-gap-mobile, prose-max, feed-max, hero-min) — matching DESIGN.md frontmatter 1:1.
- **UX-DR-2 (Type system):** Load and apply Fraunces (display/headline serif), Inter (body/UI), JetBrains Mono (code/eyebrow) with appropriate fallbacks (Georgia / system-ui / ui-monospace); body line-height ≥1.6; eyebrows `0.14em` uppercase tracked; titles never all-caps; never set long body copy in Fraunces.
- **UX-DR-3 (landing-hero):** Full-bleed dark `ink-surface` stage ≥92vh on all viewports; action photograph + one-line Fraunces identity + a primary CTA; the identity and hero render fully inside the first viewport at 320px; mint accent reserved for dark-panel energy.
- **UX-DR-4 (scroll-narrative-section):** Landing scroll narrative built from sections (per PRD addendum §D + EXPERIENCE IA): Hero → Latest-3 → "The work"/Feed teaser → "What I build"/Projects teaser → Footer; each section routes via client-side nav; reveal-on-scroll into view, reduced-motion instant; all sections also reachable without scrolling (skip-to-section control).
- **UX-DR-5 (latest-strip):** The 3 newest Posts in reverse-chrono on the Landing; each links to its Post via client-side nav; fewer than 3 renders only those that exist.
- **UX-DR-6 (top-nav):** Sticky, condenses on scroll; wordmark → `/`; `Feed · Projects` links with ink-underline active state (not a pill background); in-app links use client-side nav; collapses to a menu button ≤640px; the menu closes on `Escape`, on route change, and on outside-click.
- **UX-DR-7 (type-filter):** Segmented All / Essays / Comics pill control above the Feed; the active segment flips to `ink-surface` fill + `on-ink` text; URL-driven (`?type=`); changing it updates URL + list client-side with no reload; uses text labels, not color alone, to convey state.
- **UX-DR-8 (post-card essay):** List layout (not a grid); title in `headline-sm` Fraunces + date + 1-line excerpt in `caption`; optional image; tap navigates to the Post via client-side nav.
- **UX-DR-9 (comic-card):** Strip image-forward with minimal chrome — date + optional caption chip in `secondary`; the image is the card; tap navigates to the Post.
- **UX-DR-10 (comic-viewer stage):** Dark `ink-surface` stage presenting the Strip edge-to-edge (no rounded mask on the artwork; a `rounded.lg` container); below the strip — title (Fraunces), date, optional caption (rendered in `on-surface-variant` with a `secondary` left accent rule — never a Secondary fill), optional author afterword, and the `support-pill`; no long-form body.
- **UX-DR-11 (comic zoom/pan interaction):** Implement the FR-16 zoom/pan set — fit default; single tap/click toggles fit↔100%; double-tap/click also toggles; pinch free-zoom on touch; `+`/`−` on-screen controls; `Ctrl+wheel` pointer zoom (preserves page scroll); drag pan (touch or pointer) confined to strip bounds; on-screen Reset + `0` key reset + `Esc` reset-and-exit; keyboard `+`/`−`/`0`/arrows/`Esc`; controls bottom-right, reveal on hover/tap/focus, auto-hide after ~2.5s inactivity while remaining keyboard-focusable (reveal on focus); reduced-motion = instant transitions; focus never trapped (`Tab` leaves the viewer).
- **UX-DR-12 (project-card):** `surface-container-low` card; project title, one-line summary (`body-sm`), stack chips, live + source affordances; in-app tools link to `/projects/:slug`; a dead live/source link is de-emphasised (muted, not clickable) but the card is kept (title/summary/stack remain as the proof point); responsive grid 1 col `<768`, 2 col `768–1024`, 3 col `≥1024`; subtle hover lift on `pointer:fine` only (no lift on touch).
- **UX-DR-13 (pagination):** Prev/Next + page numbers; `on-surface-variant` text, active page in `primary`; shareable per-page URLs that return the same page on direct load.
- **UX-DR-14 (buttons):** `button-primary` (`primary` fill + `on-primary`, `md` radius, generous horizontal padding, one primary CTA per section, never more than one primary above the fold per section) and `button-ghost` (ink text + `1px outline`).
- **UX-DR-15 (support-pill):** `secondary-container` background + `on-secondary-container` text, `full` radius, placed in the footer area of content pages (Post pages + Feed); never a top-level nav item; dropping Contribute from nav does not break its link target.
- **UX-DR-16 (state patterns):** On-brand not-found "This one's not here." + links to Feed and Projects; empty filter "No posts match that filter yet."; image-load-failure "Couldn't load the strip. Refresh?" with retry (alt text remains available to AT); Feed cold-load skeleton list placeholder (posts populate without spinner churn); pagination beyond end returns no items (never an error); Project dead live/source link de-emphasised, not removed.
- **UX-DR-17 (accessibility floor implementation):** Landmarks (`header`/`nav`/`main`/`footer`), one `h1` per page, ordered headings; skip-to-content link first-focusable on every surface; visible focus ring on every interactive element; focus order follows reading order; tap targets ≥44×44 CSS px; type filter uses text labels not color alone; descriptive link text (not "here"); external links open in a new tab with `rel="noopener"`; comic alt text describes the strip's conveyed content (not "a comic").
- **UX-DR-18 (reduced motion):** `prefers-reduced-motion: reduce` disables scroll-reveal fade/slide (instant show) and the comic-viewer zoom transition (instant — no ≤150ms allowance).
- **UX-DR-19 (responsive & platform):** Breakpoints 640/768/1024/1280; Feed single-column at all widths; Projects grid 1/2/3 columns per breakpoints; Landing hero ≥92vh; comic viewer full-bleed on mobile, constrained (`feed-max`) and centered on desktop; works on touch and pointer with on-screen zoom controls on both.
- **UX-DR-20 (voice & tone microcopy):** UI chrome is straight — no hype, exclamation marks, streak/badge counters, or "Welcome" dead-end; empty/error copy matches the EXPERIENCE tone table; comic titles may be funny but UI chrome is not.

### FR Coverage Map

| FR | Epic | Description |
|---|---|---|
| FR-1 | Epic 3 | Landing action hero + identity above the fold |
| FR-2 | Epic 3 | Landing scroll narrative routes to Feed/Projects |
| FR-3 | Epic 3 | Landing Latest-3 strip |
| FR-4 | Epic 1 | Feed lists all posts, type-filterable |
| FR-5 | Epic 1 | Feed paginated at 10/page, shareable URLs |
| FR-6 | Epic 1 | Per-type Post page (essay body / comic Strip+alt) |
| FR-7 | Epic 1 | Publish a post by adding a file + commit |
| FR-8 | Epic 1 | Mandatory comic alt-text build gate |
| FR-9 | Epic 4 | Projects entries with live demos + source + stack |
| FR-10 | Epic 1 | Per-post SEO/OG/Twitter + ogImage |
| FR-11 | Epic 1 | Site identity metadata reconciled to clintonjavery.com |
| FR-12 | Epic 1 | Support affordance on content pages |
| FR-13 | Epic 2 | 100% of existing posts migrated intact |
| FR-14 | Epic 1 | All in-app nav is client-side routing |
| FR-15 | Epic 2 | Dead code/orphaned routes removed (BalloonPopper exposed via Epic 4) |
| FR-16 | Epic 5 | Comic Strip interactive zoom & pan |

## Epic List

### Epic 1: Publishing & Reading Foundation
Clint can add a Post file to `content/` and have it render live on a unified, paginated, type-filtered Feed and a per-type Post page (essay body / comic Strip+alt), on the Ink-&-Garden design system deployed to Cloudflare Pages, with the build-time mandatory-alt gate and full per-post SEO/identity metadata.
**FRs covered:** FR-4, FR-5, FR-6, FR-7, FR-8, FR-10, FR-11, FR-12, FR-14

### Epic 2: Content Migration & Technical Hygiene
Clint's full existing catalogue (16 essays) is migrated intact to the new Post model with content/heading/image fidelity and historic-URL continuity, and the dead code/orphaned routes are retired (duplicate BalloonPopper collapsed to one, `/reading` retired, `*~` editor cruft removed).
**FRs covered:** FR-13, FR-15

### Epic 3: Landing — Identity & Funnel
The site gets its front door: a full-bleed action hero, a scroll narrative routing to Feed/Projects, and a "Latest 3" strip — carrying the About job and funneling both audiences.
**FRs covered:** FR-1, FR-2, FR-3

### Epic 4: Projects — Verifiable Proof
The Projects portfolio rehomes the existing tools/games (Time Zone Converter, Text Analyzer, Effort Estimator, Unit Converter, Balloon Popper) as live linkable in-app demos with summaries + stack + source links, so an evaluator verifies competence in under a minute.
**FRs covered:** FR-9

### Epic 5: Comic Reading Experience — Zoom & Pan
The Comic Post's Strip becomes fully readable: the full pinned zoom/pan interaction set (pinch/Ctrl+wheel/+/− zoom, drag/arrow pan, Reset/Esc, focus-never-trapped, reduced-motion) and the comic-caption treatment.
**FRs covered:** FR-16

## Epic 1: Publishing & Reading Foundation

Clint can add a Post file to `content/` and have it render live on a unified, paginated, type-filtered Feed and a per-type Post page (essay body / comic Strip+alt), on the Ink-&-Garden design system deployed to Cloudflare Pages, with the build-time mandatory-alt gate and full per-post SEO/identity metadata.

**FRs covered:** FR-4, FR-5, FR-6, FR-7, FR-8, FR-10, FR-11, FR-12, FR-14

### Story 1.1: Apply the Ink & Garden design system

As a **Clint (author)**,
I want the app restyled to my Ink & Garden identity via Tailwind v4,
So that every surface I build next is on-system without ad-hoc CSS.

**Acceptance Criteria:**

**Given** Tailwind v4 is a devDependency but unwired, **when** I add `@tailwindcss/vite` + `@import "tailwindcss"` + a `@theme` block mapping every DESIGN.md token to `src/styles.css`, **then** `npm run build` succeeds and the tokens resolve as Tailwind utilities. *(Verifies `@tailwindcss/vite`/`@mdx-js/rollup`/`gray-matter` version pins — AR-13.)*

**Given** DESIGN.md defines color/typography/rounded/spacing tokens, **when** the build runs, **then** a utility exists for each token (e.g. `text-primary`, `bg-surface`, `font-display`) usable in components, mapping 1:1 to the DESIGN.md frontmatter.

**Given** the type system is Fraunces / Inter / JetBrains Mono, **when** the app loads, **then** all three load with correct fallbacks and apply to display / body-UI / code-eyebrow respectively; body line-height ≥1.6; eyebrow `0.14em` uppercase; titles never all-caps.

**Given** the build-time WCAG AA contrast gate asserts the load-bearing pairs, **when** it runs, **then** Primary-as-link-on-Surface and white-on-Primary are checked against 4.5:1; if a pair measures under, the build fails unless the darker variant (`#256628` / `#26702C`) is locked — closes the UX open item.

**And** no inline hex literal remains in new component code (tokens-only).

### Story 1.2: Stand up the content pipeline + mandatory-alt gate

As a **Clint (author)**,
I want to author Posts as markdown/MDX files that the build turns into a typed collection,
So that publishing is a content act and an invalid comic is blocked before it ships.

**Acceptance Criteria:**

**Given** a sample Essay Post at `content/p/<slug>.mdx` with frontmatter per addendum §A + a markdown/MDX body, **when** the build runs, **then** a typed Post is emitted in the `content-index` with parsed frontmatter and a compiled MDX body.

**Given** a sample Comic Post with `type: comic` + `strip.image` + `strip.alt`, **when** the build runs, **then** its entry exposes `strip.image` and a non-empty `strip.alt`.

**Given** a Comic Post whose `strip.alt` is absent or empty, **when** the build runs, **then** the build FAILS with a message naming the file and the missing `strip.alt` (FR-8); no deploy occurs.

**Given** an Essay Post missing required `title` or body, **when** the build runs, **then** it fails naming the file + the missing field.

**Given** a Post with `status: draft`, **when** the build runs, **then** it is excluded from the `content-index` and never renders.

**Given** the build command, **then** it is exactly `tsc -b && vite build` — the single custom Vite plugin owns `import.meta.glob` (eager) + `gray-matter` parse + `@mdx-js/rollup` MDX compile + validation + index emission. 

**And** any consumer importing Post data imports only the emitted `content-index` (no direct glob/import of `content/` from `src/` — AD-1).

### Story 1.3: Routing shell + top nav with client-side navigation

As a **visitor**,
I want a sticky top nav and instant in-app navigation with no full reloads,
So that moving between surfaces feels fast and the route structure is stable.

**Acceptance Criteria:**

**Given** the React Router 7 app, **when** routes are defined, **then** `/`, `/p`, `/p/:slug`, `/projects`, `/projects/:slug` exist (`/projects` as a placeholder for Epic 4); `/p/:slug` is content-derived from the `content-index`, with no hand-registered per-post `<Route>`.

**Given** any in-app link, **when** clicked, **then** the URL changes and the target renders with NO `window` reload (FR-14); no raw `<a href="/…">` is used for in-app routes (external links excepted).

**Given** the top nav, **when** rendered, **then** it shows a wordmark → `/` and `Feed · Projects` links with an ink-underline active state (not a pill); it is sticky and condenses on scroll.

**Given** viewport ≤640px, **when** the nav renders, **then** it collapses to a menu button that closes on `Escape`, on route change, and on outside-click.

**Given** any surface, **when** it loads, **then** a skip-to-content link is the first-focusable element; landmarks (`header`/`nav`/`main`/`footer`) and one `h1` per page are present.

**And** the `/` route in Epic 1 renders a minimal placeholder linking to `/p` (the full Landing is Epic 3).

### Story 1.4: Per-type Post page

As a **reader**,
I want to open a Post at its own URL and read it per type,
So that I can read an essay's body or view a comic strip.

**Acceptance Criteria:**

**Given** an Essay Post slug, **when** I navigate to `/p/:slug`, **then** the page renders the MDX body (headings, paragraphs, images, code blocks, callouts) in the `prose-max` reading column.

**Given** a Comic Post slug, **when** I navigate to `/p/:slug`, **then** it renders the Strip as an `<img>` with `alt` populated from `strip.alt`, plus title (Fraunces), date, and optional caption in the dark `ink-surface` comic-viewer stage at fit, edge-to-edge with no rounded mask on the artwork (zoom/pan is Epic 5).

**Given** a caption is present, **when** rendered, **then** it uses `on-surface-variant` text with a `secondary` left accent rule — never a Secondary fill.

**Given** a direct URL load with no prior Landing visit, **when** the page loads, **then** it renders fully independent of any other surface.

**Given** a slug with no matching Post, **when** navigated, **then** an on-brand "This one's not here." is shown with links to Feed + Projects.

**And** given a comic Strip image that errors, **when** it fails to load, **then** "Couldn't load the strip. Refresh?" with a retry shows and the alt text remains available to AT.

### Story 1.5: Unified Feed with type filter + pagination

As a **reader**,
I want to browse all posts in one chronological stream, filter to essays or comics, and paginate,
So that I can find and binge the form I'm in the mood for.

**Acceptance Criteria:**

**Given** published posts in the `content-index`, **when** I open `/p`, **then** all render reverse-chronologically as cards (essay: title + date + excerpt; comic: strip image-forward + date + optional caption chip).

**Given** page size 10, **when** paginating, **then** page 1 shows the 10 newest; prev/next + page numbers with the active page in `primary`; each page has a shareable URL that returns the same page on direct load.

**Given** the Type Filter, **when** I select All / Essays / Comics, **then** the URL updates (`?type=`) and the list re-scopes client-side with NO full reload.

**Given** `/p?type=comic`, **when** opened directly, **then** the Feed is pre-scoped to comics.

**Given** a filter with zero matches, **when** rendered, **then** "No posts match that filter yet." is shown; pagination beyond the last populated page returns no items (never an error).

**Given** the Feed cold-load, **when** first painting, **then** a skeleton list placeholder shows; posts populate without spinner churn.

**And** drafts, **when** the Feed renders, **then** never appear.

### Story 1.6: Per-post SEO + site identity metadata

As a **sharer / search engine**,
I want each Post page to emit its own title, description, and social card, and the site's identity reconciled,
So that shared links and search entries are accurate and on-brand.

**Acceptance Criteria:**

**Given** a Post page, **when** rendered, **then** its document head has `<title>` reflecting the Post title (never a generic site-wide title), a meta description (or `excerpt` fallback), and `og:title`/`og:description`/`og:image`/`og:url` + `twitter:card` (FR-10).

**Given** a Comic Post, **when** `og:image` is set, **then** it is the Strip image unless overridden by `ogImage`.

**Given** an Essay Post, **when** `og:image` is set, **then** it is `ogImage` if provided, else a site default.

**Given** the root `index.html`, **when** rendered, **then** `og:url = https://clintonjavery.com` and `<title>`/`og:title` + author name are consistent — no `clintonavery.dev` / "Clinton Avery" mismatch remains (FR-11).

**And** the build, **when** it runs, **then** `/sitemap.xml` and `/robots.txt` are emitted from the `content-index`.

### Story 1.7: Deploy to Cloudflare Pages + SPA fallback

As a **Clint (author)**,
I want the site to deploy automatically to Cloudflare Pages on push to `main`, with deep links working,
So that publishing is just a commit and shared URLs resolve.

**Acceptance Criteria:**

**Given** `.github/workflows/deploy.yml` (Azure Storage + CDN), **when** Epic 1 ships, **then** it is removed and Cloudflare Pages git auto-deploy on `main` is configured (AR-8).

**Given** a push to `main`, **when** Cloudflare builds, **then** it runs `tsc -b && vite build` and deploys the static `dist/`.

**Given** an invalid Comic Post (missing alt), **when** Cloudflare builds, **then** the build fails and no deploy occurs (fails closed).

**Given** `public/_redirects`, **when** authored, **then** generic historic 301s come first (`/about→/`, `/reading→/`, `/gallery→/`, `/comics→/p?type=comic`), then `/* /index.html 200` LAST (SPA fallback); the per-post `/writing/<slug>` redirect map is added in Epic 2.

**And** a deep link `/p/<slug>` opened directly, **when** Cloudflare serves it, **then** `index.html` is served and React Router renders the Post (no edge 404).

### Story 1.8: Support affordance on content pages

As a **reader who wants to support Clint**,
I want a Support link in the footer of content pages (not the nav),
So that I can contribute without it competing with site navigation.

**Acceptance Criteria:**

**Given** the `support-pill` component, **when** rendered, **then** it uses `secondary-container` background + `on-secondary-container` text, `full` radius.

**Given** a Post page and the Feed, **when** rendered, **then** the `support-pill` appears in the footer area of each (FR-12).

**Given** the nav, **when** rendered, **then** there is no `/support` or `/contribute` top-level route or nav item.

**And** the Contribute page dropped from navigation, **when** the `support-pill` link is checked, **then** it still resolves to the existing Contribute/Venmo destination.

<!-- Epic 1 complete: 8 stories covering FR-4,5,6,7,8,10,11,12,14. Remaining epics appended below. -->

## Epic 2: Content Migration & Technical Hygiene

Clint's full existing catalogue (16 essays) is migrated intact to the new Post model with content/heading/image fidelity and historic-URL continuity, and the dead code/orphaned routes are retired (duplicate BalloonPopper collapsed to one, `/reading` and `/gallery` retired, `*~` editor cruft removed).

**FRs covered:** FR-13, FR-15

### Story 2.1: Migrate existing essay posts to the content model

As a **Clint (author)**,
I want my 16 existing essay posts moved into the new `content/p/` Post model intact,
So that nothing I've written is lost and the catalogue is live on the new pipeline.

**Acceptance Criteria:**

**Given** the `Post` records in `src/data/posts.tsx`, **when** migrated, **then** each becomes a `content/p/<slug>.mdx` file with frontmatter `title`, `date` (ISO, converted from the display string), `type: essay`, and `slug` (= filename, kebab-case), plus a body preserving the text, heading structure, and inline images moved to content-referenced paths.

**Given** all 16 records, **when** the build runs, **then** all 16 compile into the `content-index` with no missing required fields and the build passes.

**Given** each migrated post, **when** visually spot-checked before/after, **then** its text, heading structure, and images are preserved — no post dropped or visually broken (SM-2 / NFR-7).

**And** once migration is verified, **when** the app reads from `content/` only, **then** the hardcoded `src/data/posts.tsx` data module is removed (content is now file-based).

### Story 2.2: Historic redirect map for migrated post URLs

As a **reader with an old `/writing/<slug>` link (or a search engine)**,
I want it to resolve to the new `/p/<slug>`,
So that no previously-indexed post 404s.

**Acceptance Criteria:**

**Given** the exported list of prior `/writing/<slug>` URLs, **when** authoring `public/_redirects`, **then** a `301 /writing/<slug> → /p/<slug>` rule is added for each migrated slug, positioned above the `/* /index.html 200` catch-all from Story 1.7.

**Given** an old `/writing/<slug>` link, **when** opened, **then** Cloudflare returns a 301 to `/p/<slug>` and the Post renders.

**And** the prior-URL list, **when** checked against the live site, **then** no prior post URL 404s (FR-13).

### Story 2.3: Technical hygiene — collapse duplicates and retire dead code/assets

As a **Clint (author)**,
I want the duplicate BalloonPopper collapsed to one, the orphaned `/reading` and `/gallery` routes retired, and editor cruft removed,
So that the codebase carries no dead weight.

**Acceptance Criteria:**

**Given** `BalloonPopper` + `BalloonPopperV2` both exist, **when** collapsed, **then** exactly one Balloon Popper implementation remains (the better of the two); the other is deleted and the app compiles with no dangling imports (its *exposure* as a Projects Entry happens in Epic 4 / FR-9).

**Given** the commented-out `/reading` route, **when** retired, **then** no routed-but-unlisted `/reading` route remains in the route config.

**Given** `/gallery` and `gallery.tsx` are dropped surfaces (PRD non-goal), **when** retired, **then** the `/gallery` route and its data module are removed — only if no other code references them (artwork images used elsewhere stay).

**Given** `public/` contains `*~` editor-backup files (e.g. `bg-space.jpg~`) and stale build artifacts, **when** cleaned, **then** none remain.

**And** the route/nav audit, **when** checked, **then** no other orphaned route referenced in nav remains, and the app compiles clean.

<!-- Epic 2 complete: 3 stories covering FR-13, FR-15. Remaining epics appended below. -->

## Epic 3: Landing — Identity & Funnel

The site gets its front door: a full-bleed action hero, a scroll narrative routing to Feed/Projects, and a "Latest 3" strip — carrying the About job and funneling both audiences.

**FRs covered:** FR-1, FR-2, FR-3

### Story 3.1: Landing hero renders the identity above the fold

As a **visitor**,
I want a full-bleed action hero with a one-line identity above the fold,
So that I instantly know who Clint is and where to go.

**Acceptance Criteria:**

**Given** the `/` route (replacing the Epic-1 placeholder), **when** rendered on any viewport ≥320px (and ≥360px), **then** a full-bleed dark `ink-surface` hero ≥92vh shows an action-oriented photograph + a one-line Fraunces identity statement + a primary CTA, all fully inside the first viewport (FR-1).

**Given** the hero, **when** measured, **then** it is the LCP element with no layout shift above it on initial render.

**Given** the primary CTA, **when** rendered, **then** exactly one `button-primary` CTA routes client-side to the Feed — never more than one primary CTA above the fold.

**And** the mint accent, **when** used on the hero, **then** it's reserved for dark-panel energy, not a large fill on the paper surface.

### Story 3.2: Landing scroll narrative routes to each surface

As a **visitor**,
I want the Landing scroll to link me to the Feed and Projects,
So that I can route to Writing/Comics or the portfolio without a separate About page.

**Acceptance Criteria:**

**Given** the Landing below the hero, **when** rendered, **then** the scroll narrative sections appear per PRD addendum §D + EXPERIENCE IA: "What's new" (Latest slot), "The work"/Feed teaser, "What I build"/Projects teaser, Footer.

**Given** each narrative section, **when** its in-narrative link is tapped, **then** it routes client-side to Feed, Projects, or a type-filter shortcut (`/p?type=comic` / `?type=essay`) — URL changes, no full reload (FR-2).

**Given** scrolling, **when** a section enters view, **then** it reveals on scroll (IntersectionObserver), on the Landing only (never on Feed/Post); under `prefers-reduced-motion: reduce` it shows instantly.

**Given** the sections, **when** a user can't or won't scroll, **then** each is reachable via a skip-to-section control.

**And** the footer, **when** rendered, **then** it carries identity + copyright + the `support-pill` (no full nav duplicate).

### Story 3.3: Landing "Latest" strip surfaces the newest content

As a **visitor**,
I want the 3 most-recent posts on the Landing,
So that I can jump straight to the newest thing.

**Acceptance Criteria:**

**Given** published posts in the `content-index`, **when** the Landing "What's new" section renders, **then** exactly the 3 most-recent Posts appear in reverse-chronological order (filling the slot from Story 3.2).

**Given** each Latest item, **when** tapped, **then** it links to its Post page via client-side nav (FR-3).

**Given** fewer than 3 Posts exist, **when** rendered, **then** only those that exist appear — no empty slots.

**And** the Latest items, **when** a mix of essay and comic posts, **then** each renders per type (composite of `post-card` / `comic-card`).

<!-- Epic 3 complete: 3 stories covering FR-1, FR-2, FR-3. Remaining epics appended below. -->

## Epic 4: Projects — Verifiable Proof

The Projects portfolio rehomes the existing tools/games (Time Zone Converter, Text Analyzer, Effort Estimator, Unit Converter, Balloon Popper) as live linkable in-app demos with summaries + stack + source links, so an evaluator verifies competence in under a minute.

**FRs covered:** FR-9

### Story 4.1: Projects list page with project cards

As an **evaluator**,
I want to browse a list of Projects with summaries, stack, and live + source links,
So that I can pick one to verify and use it in seconds.

**Acceptance Criteria:**

**Given** the `/projects` route (replacing the Epic-1 placeholder), **when** rendered, **then** it lists Projects Entries, each exposing a live demo URL or in-site live tool + a source repository URL + a one-line summary + the relevant tech stack (FR-9).

**Given** a `project-card`, **when** rendered, **then** it shows the project title, a one-line summary (`body-sm`), stack chips, and live + source affordances; in-app tools link to `/projects/:slug` (UX-DR-12).

**Given** a dead live-demo or source link, **when** that target is down, **then** it's de-emphasised (muted, not clickable) but the card remains showing title/summary/stack as the proof point — no broken-link dead-end (UX-DR-16).

**Given** the responsive grid, **when** width varies, **then** it's 1 col `<768px`, 2 col `768–1024px`, 3 col `≥1024px`; subtle hover lift on `pointer:fine` only (no lift on touch).

**And** a Project, **when** authored, **then** it follows the PRD addendum §E field set (`title`, `summary`, `stack`, `liveUrl`, `sourceUrl`, `screenshots?`, `date`, `featured?`).

### Story 4.2: Rehome existing tools/games as live in-app Project demos

As an **evaluator (or reader)**,
I want to use Clint's existing tools/games live on the site as Projects Entries,
So that I can verify he actually built them.

**Acceptance Criteria:**

**Given** Time Zone Converter, Text Analyzer, Effort Estimator, Unit Converter, and the single consolidated Balloon Popper (from Story 2.3), **when** rehomed, **then** each is reachable at `/projects/:slug` with a live, usable demo.

**Given** the existing tool components (currently under `/tools/*` or `/fun/*`), **when** migrated under `/projects/:slug`, **then** each tool functions as before (no behavior regression) at its new route.

**Given** a Project's `liveUrl`, **when** it's an in-site tool, **then** it links to `/projects/:slug`; when external, **then** it opens in a new tab with `rel="noopener"`.

**Given** historic `/tools/:slug` and `/fun/:slug` links, **when** opened, **then** they 301 to `/projects/:slug` (per the `_redirects` contract established in Story 1.7) — no 404.

**And** each rehomed entry, **when** rendered, **then** it displays a one-line summary + tech stack + a source-repo link where one exists.

<!-- Epic 4 complete: 2 stories covering FR-9. Remaining epics appended below. -->

## Epic 5: Comic Reading Experience — Zoom & Pan

The Comic Post's Strip becomes fully readable: the full pinned zoom/pan interaction set (pinch / Ctrl+wheel / +/− zoom, drag/arrow pan, Reset/Esc, focus-never-trapped, reduced-motion) — so readers can read a strip's lettering and detail.

**FRs covered:** FR-16

### Story 5.1: Comic Strip interactive zoom & pan

As a **reader on a phone (or keyboard)**,
I want to zoom and pan a strip to read its lettering and detail,
So that I can catch the gag even when a drawing is dense at fit.

**Acceptance Criteria:**

**Given** a Comic Post page, **when** the Strip renders, **then** it defaults to **fit** (scaled to container width); taller-than-viewport strips scroll vertically within the stage.

**Given** fit state, **when** I single tap (touch) or single click (pointer) on the strip, **then** it toggles between fit and **100% (1:1)**; a double-tap/double-click also toggles fit↔100%.

**Given** a touch device, **when** I pinch, **then** the strip free-zooms (pinch-zoom).

**Given** a pointer device, **when** I scroll, **then** the page scrolls normally; when I `Ctrl+wheel`, **then** the strip zooms (Ctrl+wheel preserves page scroll).

**Given** on-screen `+`/`−` controls, **when** tapped/clicked, **then** they zoom in/out.

**Given** the strip is zoomed beyond fit, **when** I drag (touch or pointer) or press arrow keys, **then** it pans, confined to the strip bounds — no overpan into page chrome; zoom/pan never moves the nav or surrounding content.

**Given** zoom active, **when** I press `+`/`−` (zoom), arrow keys (pan), `0` (reset to fit), or `Esc` (reset + exit zoom), **then** each works; the interaction is keyboard-accessible (FR-16).

**Given** zoom controls, **when** positioned, **then** they sit bottom-right on `rgba(18,22,15,0.6)` chips, reveal on hover/tap/focus, and auto-hide after ~2.5s of inactivity.

**Given** auto-hidden controls, **when** visually hidden, **then** they remain keyboard-focusable (reveal on focus) — never removed from the tab order.

**Given** the viewer, **when** I press `Tab` through it, **then** focus never traps — `Tab` moves past the viewer (WCAG 2.1 AA).

**Given** a Reset control, **when** activated (on-screen or `0`), **then** the strip returns to fit; `Esc` resets and exits zoom.

**And** `prefers-reduced-motion: reduce`, **when** zoom transitions occur, **then** they are instant (no ≤150ms allowance).

<!-- Epic 5 complete: 1 story covering FR-16. All epics appended. -->