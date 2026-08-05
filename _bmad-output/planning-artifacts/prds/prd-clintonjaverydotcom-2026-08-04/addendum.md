# Addendum — clintonjavery.com Reimagining PRD

Technical "how" and depth that belongs downstream (architecture, solution design) or earned a place but didn't fit the PRD's capability-level narrative. Derived from the brainstorm, the brief, and the PRD's confirmed decisions.

## A. Content Pipeline (implementation detail for architecture)

**Model:** Posts are markdown/MDX files in `content/` at the repo root (e.g. `content/2026/08/my-strip.md`). Each file's YAML frontmatter drives the post; the body is the content.

**Frontmatter (common):**
```yaml
title: string        # required (all posts)
date: ISO-8601       # required; drives Feed order
type: essay|comic    # required
slug: string         # required; URL fragment
excerpt: string      # optional; meta description fallback
status: draft|published  # default published; drafts never render
ogImage: path|url    # optional; defaults to strip image for comics
tags: [string]       # optional (deferred feature; schema reserves it)
```
**Essay Post body:** markdown/MDX; supports headings, images, code blocks, callouts, embeds (rich styling control is the point).

**Comic Post frontmatter additions:**
```yaml
strip:
  image: path        # required; the finished, Krita-lettered Strip image (single image)
  alt: string        # REQUIRED; descriptive text of the whole strip (accessibility)
caption: string      # optional; a one-line strip caption/tagline
notes: string        # optional; author afterword shown on the Post page
```

**Comic Post body:** none — a comic is `strip.image` + `alt` (+ optional caption/notes). The application displays the Strip only; all finishing/lettering is done off-site in Krita before publishing. A Comic Post is always exactly one image (no multi-panel sequence).

**Why MDX:** lets essays embed interactive components if/when needed later without changing the pipeline; a comic is plain markdown + a single image. No runtime CMS; everything is build-time static.

**Build-time validation (FR-8):** a build/lint pass walks `content/`, enforces required frontmatter per type, and **fails the build** (so Cloudflare Pages does not deploy an invalid post) naming the file + missing field. Comic Post with empty `strip.alt` is the canonical failure.

## B. Styling architecture decision (confirmed)

The site was mid-transition: Tailwind v4 installed but uncommitted, CSS Modules also in use. **Confirmed decision: commit to Tailwind v4** in the rebuild and retire ad-hoc per-component CSS Modules for new surfaces. Net: one styling system, less fat. Architecture only needs to confirm the rollout mechanics, not the choice. Removed from PRD Open Questions.

## C. Information Architecture (confirmed)

```
Landing  (/) — hero (action photography) + scroll narrative (About inline) + Latest-3 strip + section links
Feed      (/feed or /p — scheme TBD) — unified, paginated 10/page, Type Filter (all/essays/comics)
Post      (/p/{slug} or {type}/{slug} — TBD) — per-type render
Projects  (/projects) — list of Projects Entries (absorbs /tools/* and /fun/*)
```
Top-level nav: **Feed · Projects** (the Landing is identity/entry; Comics/Essays are filter views on Feed). No separate `/about`, `/reading`, `/gallery`, `/fun`, `/tools`, `/support` top-level routes. Support is an in-content Affordance.

## D. Landing scroll narrative (proposed sections, for UX)

A concrete proposal the PRD assumes (FR-2); to be validated in UX:
1. **Hero** — action photograph + identity one-liner + primary CTA to Feed.
2. **"What's new"** — the Latest-3 strip (FR-3).
3. **"The work"** — short scrolling showcase linking Feed and a Projects teaser.
4. **"What I build"** — Projects teaser tiles.
5. **Footer** — identity, copyright, Support Affordance, no full nav duplicate.

All sections reachable without scrolling (skip-to-section control); narrative is accent, not a gate.

## E. Projects Entry content model (FR-9 detail)

Proposed fields (the PRD assumes this set):
```yaml
title: string          # required
summary: string        # one-liner
stack: [string]        # tech
liveUrl: url           # live demo (in-site tool or external)
sourceUrl: url         # repo
screenshots: [path]    # optional
date: ISO-8601         # when shipped/added
featured: bool         # optional pinning
```
Existing tools/games rehome as Projects Entries with `liveUrl` pointing to the in-app route they keep (Time Zone Converter, Text Analyzer, Effort Estimator, Unit Converter, Balloon Popper).

## F. Migration procedure (FR-13 detail)

1. Extract each record from `src/data/posts.tsx` (and any gallery data) into a Post markdown file with matched frontmatter.
2. Preserve text, heading structure, inline images (move assets under content-referenced paths).
3. Per-post before/after visual check; fix styling drift per file.
4. Define URL continuity: redirect map from historic `/writing/{slug}` paths to the new scheme (server-level redirects on Cloudflare Pages via `_redirects` or `_headers`).
5. Confirm no post 404s against an exported list of prior URLs.

## G. Cheap technical hygiene swept in (FR-14, FR-15)

- Replace `Navbar` raw `<a href>` with React Router `<Link>`/`NavLink` everywhere in-app.
- Collapse `BalloonPopper` + `BalloonPopperV2` to a single Projects Entry (keep the better implementation).
- Remove `/reading` route (commented-out of nav; retire).
- Remove `public/assets/bg-space.jpg~` and any `*~` editor backups.
- Reconcile `index.html`: `og:url` → `https://clintonavery.com`; `<title>`/`og:title` → "Clinton Avery" + correct brand; add site-default description.
- Reconcile Open Graph/social-preview image path (currently `/social-preview.png` may not exist).
- Clean stale local branches before tagging v1.

## H. Cross-cutting NFRs (for architecture and the FR test plan)

- **Accessibility:** Target confirmed: WCAG 2.1 AA. Strip images require descriptive Alt Text (FR-8 enforces at build time); zoom/pan is keyboard-accessible and does not trap focus (FR-16). Keyboard-navigable, semantic HTML, sufficient contrast.
- **Performance:** static site on Cloudflare Pages; no runtime/database. LCP under static-site budget; no client-side data fetching critical to first paint. (Counter-metric SM-C1: do not over-engineer.)
- **Maintainability:** content and application code are separated — publishing touches only `content/` (FR-7). One styling system (§B).
- **Browser support:** evergreen Chromium/Firefox/Safari; responsive 320px–desktop.
- **Deploy:** automatic via Cloudflare Pages on push to `main`; build must fail closed on invalid content (FR-8).
- **Privacy:** no third-party analytics/tracking in v1 (SM-C2).

## I. Future paywall design-not-against (constraint, not a v1 feature)

The design must not prevent a later, per-Post paywall component: Post frontmatter should allow a future `access: free|premium` field and a future auth gate layer without re-architecting content. v1 publishes everything as `free` (default). Not built, not blocking — recorded so architecture doesn't paint the pipeline into a corner.