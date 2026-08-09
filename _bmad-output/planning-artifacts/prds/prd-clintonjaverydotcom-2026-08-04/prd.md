---
title: "PRD: clintonjavery.com Reimagining"
status: final
created: 2026-08-04
updated: 2026-08-04
---

# PRD: clintonjavery.com Reimagining

_Working title — confirm._

## 0. Document Purpose

This PRD is the requirements contract for the reimagining of clintonjavery.com, a personal publishing site. It is written for: Clint (author/owner), the downstream BMad workflow owners (architecture, epics/stories), and the agent that will implement it. Requirements are expressed as capabilities, not implementation; technical "how" lives in `addendum.md`. Vocabulary is anchored in §3 Glossary and must be used verbatim throughout. Assumptions inferred without confirmation are tagged inline `[ASSUMPTION: …]` and indexed in §9.

Two upstream inputs already exist and this PRD builds on them, it does not duplicate them:

- Brainstorm: `_bmad-output/planning-artifacts/brainstorm-clintonjavery-site-reimagining.md`
- Product Brief + addendum: `_bmad-output/planning-artifacts/briefs/brief-clintonjaverydotcom-2026-08-04/`

## 1. Vision

clintonjavery.com is being reimagined from a scattered personal site into a focused **writing-and-comics publishing platform with a project portfolio second**. Its single highest job is to let its one author publish short humorous standalone comic strips and essays on a regular cadence _without the site itself becoming the obstacle_. Today, adding a post means editing TypeScript data files and shipping a full rebuild — friction that kills a weekly habit. The reimagining collapses the site to three surfaces — a **Landing that is the About on top of the funnel**, a **unified Feed** where Writing and Comics are facets of one chronological stream rather than separate sites, and a **Projects** portfolio that absorbs today's tools and games as proof — and replaces the code-deploy publishing model with a git + markdown/MDX pipeline where a new post is just a new file and a commit.

It serves two visitors through one funnel: readers who come for the newest thing, and evaluators (potential clients/employers) who want to see competence fast. Monetization is a future _maybe_; the design must not rule it out, but building it is explicitly out of scope for v1. Every existing blog post migrates intact. Success is a site whose author can sustain 2 essays + 2 comics per month because publishing is a content act, not an engineering one.

## 2. Target User

### 2.1 Jobs To Be Done

**Reader / fan (primary visitor):**

- "When a new strip drops, I want to see it in one click so I can start my Monday with a laugh." (functional/contextual)
- "I want to browse the back-catalogue filtered to just comics or just essays, so I can binge the form I'm in the mood for." (functional)
- "I want a stable, shareable link to a specific strip/essay to send to a friend." (social/functional)

**Evaluator — potential client / employer (secondary visitor):**

- "I want to decide in under 60 seconds whether this person can build, so I can shortlist or move on." (functional/contextual)
- "I want a live, linkable example of something he shipped, so I can verify it's real, not bragged." (functional)

**Clint — the author (the actual primary user of the system):**

- "I want to publish a new strip or essay by adding a file and committing, so that a busy week doesn't break the cadence." (functional/contextual)
- "I want every strip to be accessible (alt text) without re-laying-out the comic, so accessibility is automatic, not a chore." (functional)
- "I want my existing posts to survive the rebuild intact so I don't lose work." (emotional/functional)

### 2.2 Non-Users (v1)

- Subscribers/members — there is no follow/subscribe/join in v1 (no email capture, **no RSS** per decision 2ii; the Section-508/email path is a fast-follow, not a user of v1).
- Mobile-app users — v1 is a responsive web site, not a native app.
- Paying readers — paywall/premium content is out of scope; v1 has no authenticated/privileged user.

### 2.3 Key User Journeys

- **UJ-1. Maya finds this week's strip before her coffee's done.**
  Maya, a former coworker who follows Clint's work, lands on `clintonjavery.com` from a shared link. Not authenticated (public site, no auth). She sees the Landing hero (an action shot of Clinton at work), scrolls two beats, and a "Latest" strip shows the most recent comic. She taps the strip → its Post page loads (no full-page reload — client-side nav). She reads it, laughs, taps the next/previous or back to the Feed filtered to comics, and skims three more strips. Resolves: she's had her Monday laugh and leaves. Edge case: if she lands on a Post URL directly (shared link), the page renders the full strip + SEO metadata for sharing.

- **UJ-2. Diana, a hiring manager, verifies "he did that" in under a minute.**
  Diana, reviewing Clinton for a senior eng role, opens the resume's site link. She lands on the Landing, sees the hero + scroll narrative that immediately signals who he is, and taps **Projects**. She scans the list, opens one entry that links to a _live_ tool he built (formerly a /tools/ page), uses it for 10 seconds, and opens its source repo link. She closes the tab satisfied. Resolves: she has one concrete, verifiable proof point in under 60 seconds.

- **UJ-3. Clinton publishes a strip on a packed Tuesday without touching code.**
  Clinton finishes drawing a gag strip and lettering it into the image. He drops the image into `content/`, creates a new Comic Post file (title, date, type, strip image, alt text), commits to `main`. Cloudflare Pages auto-builds and deploys; the strip appears as the newest item on the Feed and in the Landing "Latest" strip. He did not start a dev server, edit any `.tsx`, or open a component file. Resolves: the strip is live in under a few minutes of authoring. Edge case: he misses the mandatory alt-text field → the build/lint flags the post as invalid before publish.

## 3. Glossary

- **Landing** — the root surface; a hero plus scroll narrative that carries the About job and routes visitors to Feed or Projects. There is no separate About page.
- **Feed** — the unified, chronological, paginated stream of all **Posts** (essays + comics intermixed), filterable by **Type Filter**.
- **Post** — a single published content item, version-controlled as a markdown/MDX file in `content/`. Has a `type` of either **Essay Post** or **Comic Post**.
- **Essay Post** — a `type: essay` Post with a rich markdown/MDX body.
- **Comic Post** — a `type: comic` Post representing one standalone humorous **Strip** (Sunday-funny-pages / humorous tradition). Lettering/captions are in-image; descriptive **Alt Text** is mandatory.
- **Strip** — the single finished image (lettered/finished in Krita) that constitutes a Comic Post. One Strip per Comic Post. The author finishes the artwork off-site in Krita; the application displays the image only and performs no image processing or editing.
- **Type Filter** — the control on the Feed to show all / essays only / comics only.
- **Projects Entry** — a portfolio record in **Projects**, including former Tools/Fun items as live linkable demos.
- **Content Pipeline** — the file-based authoring/deploy flow: new Post = new file + commit → Cloudflare Pages auto-deploy.
- **Support Affordance** — the Contribute-style call-to-action embedded on content pages; not a top-level route.
- **ogImage** — the per-Post Open Graph/social-preview image used by SEO/social sharing metadata.
- **Alt Text** — the descriptive text that conveys a Strip's content to assistive tech (mandatory on every Comic Post).
- **Migration** — the one-time conversion of the existing `.tsx`-defined posts into the new Post file format, content + styling fidelity intact.

## 4. Features

### 4.1 Landing — Identity & Funnel

**Description:** The root surface carries the About job: a hero of action-oriented photography of Clinton programming/talking with people, followed by a scroll narrative of eye-catching sections that route visitors to **Feed** or **Projects**. It funnels both audiences without splitting the site. Realizes UJ-1, UJ-2.

**Functional Requirements:**

#### FR-1: Landing hero renders an action-oriented identity

The Landing renders a hero with an action-oriented photograph and a one-line identity statement above the fold on all viewports. Realizes UJ-2.

**Consequences (testable):**

- Hero image + identity statement render fully inside the first viewport on viewports ≥320px and ≥360px wide.
- LCP element is the hero, with no layout shift above it on initial render.

#### FR-2: Landing scroll narrative routes to each surface

The Landing scroll contains linked sections that route to Feed (writing + comics) and Projects via client-side navigation (no full page reload). Realizes UJ-1, UJ-2.

**Consequences:**

- Each nav target (Feed, Projects; type-filter shortcuts to comics/essays) is reachable via an in-narrative link that navigates client-side (URL changes, no browser full reload).
- Scrolling reveals each section; all sections are also reachable without scrolling (skip-to-section control).

#### FR-3: Landing surfaces the latest content

The Landing shows a "Latest" strip of the 3 most recently published **Posts** (any type). Realizes UJ-1.

**Consequences:**

- Exactly the 3 most-recent Posts by date appear, in reverse-chronological order.
- Each item links to its Post page via client-side nav.
- If fewer than 3 Posts exist, the strip renders only those that exist.

`[ASSUMPTION: 3 is the right "Latest" count; tunable.]`

### 4.2 Unified Feed (Writing + Comics)

**Description:** A single chronological stream of all Posts — essays and comics intermixed — filterable by Type Filter, paginated. Replaces the separate Writing/Comics sections. Realizes UJ-1.

**Functional Requirements:**

#### FR-4: Feed lists all Posts chronologically, type-filterable

The Feed renders all published **Posts** in reverse-chronological order and provides a Type Filter (all / essays only / comics only) that re-scopes the list client-side. Realizes UJ-1.

**Consequences:**

- With the filter set to "essays only," every rendered item is an Essay Post; "comics only" → every item is a Comic Post; "all" → mixed by date.
- Changing the filter updates the URL and list without a full page reload.
- Draft/`status: draft` Posts never appear in the Feed.

#### FR-5: Feed is paginated at 10 Posts per page

The Feed paginates at 10 Posts per page with stable, shareable per-page URLs. Realizes UJ-1.

**Consequences:**

- Page 1 shows the 10 newest Posts; page 2 the next 10; etc.
- Each page has a unique, shareable URL that returns the same page on direct load (not logged-in state).
- Empty pages return no items (never an error) beyond the last populated page.

#### FR-6: Post pages render per type

Each Post has a dedicated page rendering its content per type: Essay Post renders the rich markdown/MDX body; Comic Post renders the **Strip** image with **Alt Text**, title, date, and optional notes/afterword. Realizes UJ-1.

**Consequences:**

- A Comic Post page renders the Strip with an `<img alt="…">` populated from the Post's Alt Text.
- An Essay Post page renders headings, paragraphs, images, code blocks, callouts, and embeds declared in its body.
- Post pages are reachable by client-side nav from the Feed and by direct URL.

`[ASSUMPTION: an Article/Post detail URL scheme is `/p/{slug}`or`/{type}/{slug}` — TBD in architecture.]`

### 4.3 Content Authoring Pipeline

**Description:** Publishing is a content act via the **Content Pipeline**: a new Post is a file in `content/` + a commit; Cloudflare Pages auto-deploys. No application code edits required to publish. Realizes UJ-3.

**Functional Requirements:**

#### FR-7: A new Post is publishable without code edits

The author can publish a new Essay Post or Comic Post by adding a content file and committing, without editing application code or starting a dev/build manually. Realizes UJ-3.

**Consequences:**

- Adding a correctly-structured Post file to `content/` and pushing to `main` results in that Post being live after the Cloudflare Pages build, with no `.tsx`/component edits.
- The Content Pipeline treats both Post types identically at the deploy boundary (file + commit → live).

#### FR-8: Comic Post requires Alt Text; invalid posts are blocked before publish

Every Comic Post is invalid (and blocked from publish) if its Alt Text is absent or empty; Essay Posts require a title and body. Realizes UJ-3 (edge).

**Consequences:**

- A Comic Post whose Alt Text field is empty causes the build to fail with a message naming the offending file and the missing field.
- A Post missing required frontmatter does not render on the site.

`[ASSUMPTION: "block before publish" = a build-time check; exact mechanism (lint vs build step) is an architecture concern.]`

### 4.4 Projects (Portfolio)

**Description:** Projects presents a list of **Projects Entries** — including the existing tools/games rehomed as live, linkable demos — each with enough metadata for an evaluator to verify competence quickly. Realizes UJ-2.

**Functional Requirements:**

#### FR-9: Projects lists entries with verifiable proof

Projects renders a list of Projects Entries, each linking to a live demo and/or source repository, plus a one-line description and the relevant stack. Realizes UJ-2.

**Consequences:**

- Every Projects Entry exposes at least one of: a live demo URL or an in-site live tool (formerly /tools/_ or /fun/_).
- Each entry displays a one-line summary and tech stack.
- Existing tools/games (Time Zone Converter, Text Analyzer, Effort Estimator, Unit Converter, Balloon Popper) are reachable as Projects Entries with live, usable demos.

`[ASSUMPTION: full Projects Entry field set (stack, screenshots, live link, source link, one-liner, date) is specified in addendum.]`

### 4.5 Per-Content SEO & Social Metadata

**Description:** Every Post has full per-Post SEO/social metadata so essays and especially comics are shareable and discoverable. Realizes UJ-1, UJ-2.

**Functional Requirements:**

#### FR-10: Every Post emits full per-Post metadata

Each Post renders its own `<title>`, meta description, and Open Graph/Twitter Card tags with a per-Post **ogImage**. Realizes UJ-1, UJ-2.

**Consequences:**

- A Post page's `<title>` equals (or closely reflects) the Post title; never a generic site-wide title.
- Each Post page includes `og:title`, `og:description`, `og:image`, `og:url`, and `twitter:card` tags, populated from the Post's fields.
- The ogImage is Post-specific (the Strip image itself for Comic Posts) unless overridden.

#### FR-11: Site identity metadata is reconciled

Site-level identity metadata uses `clintonavery.com` and the correct author name and title across all pages. Realizes UJ-2.

**Consequences:**

- `index.html` (and equivalents) declare `og:url` = `https://clintonavery.com` and a `<title>`/`og:title` consistent with the brand (currently mismatched as `clintonavery.dev` / "Clinton Avery").
- A single canonical site URL is used; no competing domain/tag mismatch remains.

### 4.6 In-Content Support Affordance

**Description:** A Contribute-style **Support Affordance** is embedded on content pages, not a top-level route. Realizes UJ-1.

**Functional Requirements:**

#### FR-12: Support affordance appears on content pages

A Support call-to-action (linking the existing Contribute destination e.g. Venmo) is present on Post pages and the Feed, without being a top-level navigation item. Realizes UJ-1.

**Consequences:**

- The Support Affordance renders on Post pages and the Feed footer area.
- There is no `/support` or `/contribute` route in the site navigation as a top-level section.
- Dropping the Contribute page from navigation does not break the Support link target.

### 4.7 Migration & Technical Hygiene

**Description:** All existing blog posts are migrated to the Post model intact, and known cheap technical issues are fixed as part of the rebuild. Realizes UJ-3 (existing posts), and quality.

**Functional Requirements:**

#### FR-13: All existing posts migrate intact

100% of existing blog posts defined today in `.tsx` data files are present in the new Post model with content and styling fidelity. Realizes UJ-3.

**Consequences:**

- After migration, every prior post is reachable at a Post URL, with its text, images, and heading structure preserved; a before/after spot-check of the catalogue shows no posts dropped or visually broken.
- Redirects or URL continuity for previously indexed post URLs are handled (no 404s on prior paths where feasible).

`[ASSUMPTION: URL continuity/redirect strategy is an architecture/SEO concern; captured in addendum.]`

#### FR-14: In-app navigation uses client-side routing, no full reloads

All in-app links use client-side routing; no in-app navigation triggers a full page reload. Realizes UJ-1, UJ-2.

**Consequences:**

- Clicking any in-app link changes the URL and renders the target without `window` reload (SPA navigation).
- No raw `<a href="/…">` anchors are used for in-app routes (external links excepted).

#### FR-15: Dead/orphaned code and routes removed

Known orphans are removed: duplicate BalloonPopper components collapse to one; the commented-out Reading route is retired; editor-cruft files and stale build artifacts in `public/` are removed. Realizes quality.

**Consequences:**

- Exactly one Balloon Popper implementation exists and is exposed as a Projects Entry.
- No routed but unlisted `/reading` route remains.
- No `*~` editor-backup files exist in `public/`.

### 4.8 Comic Image Viewing (Zoom & Pan)

**Description:** A Comic Post's Strip can be viewed interactively — zoom and pan/scroll — so a reader can read detail in a finished strip. The application displays the Strip image only; all finishing and lettering happen in Krita before the image is published. Realizes UJ-1.

**Functional Requirements:**

#### FR-16: Comic Strip supports interactive zoom and pan

A Comic Post page lets the reader zoom and pan across the Strip image (pinch-zoom on touch; zoom controls and drag/scroll on pointer) without navigating away from the Post. Realizes UJ-1.

**Consequences (testable):**

- On a touch device, a pinch gesture zooms the Strip; a drag pans while zoomed.
- On a pointer device, zoom controls (and/or wheel/trackpad zoom) zoom the Strip; a drag pans while zoomed.
- Zoom and pan are confined to the Strip image area — they do not zoom the page chrome, navigation, or surrounding content.
- The interaction is keyboard-accessible and does not trap keyboard focus (WCAG 2.1 AA).
- A reset control returns the Strip to its default fit-to-container state.

`[ASSUMPTION: exact default zoom input (zoom buttons vs scroll-wheel) and key bindings are a UX-level decision.]`

## 5. Non-Goals (Explicit)

- **No follow/subscribe/RSS** in v1 (decision 2ii); revisit as fast-follow. The site is read-without-following for now.
- **No paywall / premium content / authentication** in v1 — no privileged/authenticated user exists. The design must _not preclude_ adding a paywall component later, but it is not built.
- **No standalone Gallery** or non-comic visual art section.
- **No About page** as a dedicated route (About is the Landing's job).
- **No active lead-generation tooling** (inquiry CTAs, resume capture funnels). The portfolio is a credibility signal, not a managed funnel.
- **No greenfield rewrite** — the rebuild is on top of the existing app and existing posts; the stack (React/Vite/React Router) is kept.
- **Not a CMS-managed site** — authoring is git + files; no database/headless CMS in v1.

## 6. MVP Scope

### 6.1 In Scope

- New IA: Landing (About inline, hero + scroll narrative + Latest strip), unified Feed (paginated, Type Filter), Projects (absorbs Tools/Fun).
- Content Pipeline: git + markdown/MDX; Essay Post and Comic Post models; build-time validation (Alt Text mandatory on comics).
- Migration of 100% of existing posts, intact.
- Per-Post full SEO/social metadata; site identity reconciliation to `clintonavery.com`.
- In-content Support Affordance.
- Technical hygiene: client-side `<Link>` routing, dead code/route removal, duplicate consolidation.

### 6.2 Out of Scope for MVP

- RSS feed / email subscribe / "follow" (deferred fast-follow). `[NOTE FOR PM: emotionally load-bearing — revisit soon so cadence converts to audience.]`
- Paywall / premium content / auth (deferred; design-not-against only).
- Standalone Gallery / non-comic art (dropped, not deferred).
- Projects as case-study long-form writeups (v1 = linkable proof only).
- Tags/categories beyond Post `type` (deferred; design extensible). `[ASSUMPTION: frontmatter allows future `tags` without model change.]`

## 7. Success Metrics

_Counter-metrics are as load-bearing as primaries — they stop the wrong optimization._

**Primary**

- **SM-1**: Publishing cadence sustained — 2 essays + 2 comics published per month, held for 3 consecutive months, via the Content Pipeline only (no code edits per post). Validates FR-7, FR-8.
- **SM-2**: Migration integrity — 100% of prior posts reachable and visually intact post-rebuild (before/after spot-check). Validates FR-13.

**Secondary**

- **SM-3**: Evaluator speed — an evaluator can reach a live, linkable Projects Entry from the Landing in ≤2 in-app navigations. Validates FR-9, FR-2.
- **SM-4**: Zero full-reload in-app navigations — all in-app route changes are client-side. Validates FR-14.
- **SM-5**: Shareability — every Post exposes full OG/Twitter metadata + per-Post ogImage (verifiable via any social preview tool). Validates FR-10.

**Counter-metrics (do not optimize)**

- **SM-C1**: Page-load micro-optimization beyond Cloudflare static defaults — _do not_ over-engineer performance; a static site on Cloudflare Pages is already fast. Counterbalances any temptation to introduce build/runtime complexity in the name of speed.
- **SM-C2**: Built-in analytics dashboards / vanity metrics — _do not_ add tracking infrastructure in v1; it risks privacy friction and is not needed for a passion-with-career-signal site. Counterbalances creeping "measure everything".
- **SM-C3**: Featured/curated content surfaces — _do not_ build hand-curated homepage carousels; the "Latest 3" is automatic by date, to keep the Landing maintenance-free. Counterbalances editorializing the home page.

## 8. Open Questions

1. Post URL scheme (`/p/{slug}` vs `/{type}/{slug}` vs preserving historic paths) — needs architecture + SEO continuity decision (FR-6, FR-13).
2. Build-time validation mechanism for mandatory Alt Text (lint hook vs build step) — architecture (FR-8).
3. URL continuity/redirect strategy for previously indexed post URLs (FR-13).
4. Whether the existing Contribute/Venmo destination is kept as-is or offers a different payment method later — minor, not blocking.
5. Projects Entry content depth (case study vs link-only) for v2 — deferred (FR-9).

_Resolved during review:_ Comic Strip is always a single finished image (Krita-authored) — panel-sequence option removed. Styling commits to **Tailwind v4** (Addendum §B). Accessibility target confirmed **WCAG 2.1 AA**.

## 9. Assumptions Index

- §4.1 FR-3 — "Latest" count of 3 is the right value; tunable.
- §4.2 FR-6 — Post detail URL scheme is `/p/{slug}` or `/{type}/{slug}`, TBD in architecture.
- §4.3 FR-8 — "block before publish" means a build-time check; exact mechanism is architecture.
- §4.4 FR-9 — full Projects Entry field set specified in addendum.
- §4.7 FR-13 — URL continuity/redirect strategy is architecture/SEO.
- §4.8 FR-16 — exact default zoom input (buttons vs scroll-wheel) and key bindings are a UX decision.
- §6.2 — frontmatter allows future `tags` without a model change.
