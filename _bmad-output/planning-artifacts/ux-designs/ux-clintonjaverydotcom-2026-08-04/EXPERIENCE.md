---
title: "EXPERIENCE.md — clintonjavery.com"
status: final
created: 2026-08-04
updated: 2026-08-04
sources:
  - "{planning_artifacts}/prds/prd-clintonjaverydotcom-2026-08-04/prd.md"
  - "{planning_artifacts}/prds/prd-clintonjaverydotcom-2026-08-04/addendum.md"
---

# clintonjavery.com — Experience Spine

> Behavioral contract. Visual identity lives in `DESIGN.md` (Ink & Garden); this spine is _how it works_ and cross-references DESIGN.md tokens as `{path.to.token}`. **Spines win on conflict** with any mock or wireframe. WCAG 2.1 AA accessibility floor (PRD-confirmed). Responsive web, public, no auth.

## Foundation

Responsive web, mobile-first from 320px up to wide desktop, deployed static on Cloudflare Pages. No authentication, no persistence layer, no runtime CMS. No UI component system is inherited; `DESIGN.md` (Ink & Garden) is the visual identity reference and Tailwind v4 is the styling engine (implementation). Two input modalities are load-bearing here: **touch (pinch)** and **pointer (keyboard + mouse)**, because the comic zoom interaction (PRD FR-16) must work on both.

## Information Architecture

| Surface       | Route (proposed)                | Reached from                       | Purpose                                                                       |
| ------------- | ------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------- |
| Landing       | `/`                             | direct / wordmark                  | Identity-narrative hero, Latest strip, routes to Feed + Projects (PRD FR-1–3) |
| Feed          | `/p` (all)                      | Landing, nav                       | Unified chronological Posts, Type Filter, paginated (PRD FR-4–5)              |
| Feed filtered | `/p?type=comic` / `?type=essay` | Type filter, Landing section links | Same Feed, pre-scoped by type                                                 |
| Post          | `/p/{slug}`                     | Feed, Latest, direct link          | Per-type render: essay body or comic strip (PRD FR-6); comic viewer here      |
| Projects      | `/projects`                     | Landing, nav                       | Projects Entries list (absorbs Tools/Fun) (PRD FR-9)                          |
| Project tool  | `/projects/{slug}`              | Projects list                      | Live in-app tool demo (e.g., Unit Converter)                                  |

Top-level nav surfaces **Feed · Projects**; the Landing is identity/entry. **No** `/about`, `/reading`, `/gallery`, `/fun`, `/tools`, `/support` top-level routes (PRD Non-Goals). The Support Affordance lives in content-page footers, not the nav (PRD FR-12).

`[CONFIRMED: route scheme `/p`+`/p/{slug}`+`/projects/{slug}` (author, 2026-08-04); historic-path redirects deferred to architecture/SEO (PRD OQ1, OQ3).]`

→ Composition references: `mockups/key-landing-hero.html` (Landing), `mockups/key-comic-post-viewer.html` (Comic Post / viewer). Spine wins on conflict.

## Voice and Tone

Microcopy. Brand voice and aesthetic posture live in `DESIGN.md.Brand & Style`.

| Do                                                              | Don't                                                    |
| --------------------------------------------------------------- | -------------------------------------------------------- |
| "Latest" / "New this week" / "Read" / "Open the tool"           | "Welcome!!" / "Click here to explore!"                   |
| "No posts match that filter yet."                               | "0 results found 😞"                                     |
| "Couldn't load the strip. Refresh?"                             | "ERR_IMAGE_FAILED"                                       |
| Comic titles can be funny; UI chrome is straight.               | Streaks, badges, exclamation marks, hype copy in chrome. |
| A strip's caption is the author's; chrome stays out of the way. | Editorial chrome competing with the artwork.             |

## Component Patterns

Behavioral. Visual specs live in `DESIGN.md.Components`.

| Component                | Use             | Behavioral rules                                                                                                                                        |
| ------------------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Top nav                  | all surfaces    | Sticky, condensed on scroll; wordmark → `/`; `Feed · Projects` links; client-side nav (FR-14). `≤640px` collapses to a menu button.                     |
| Type filter              | Feed            | Segmented All/Essays/Comics; URL-driven (`?type=`); changing it updates URL + list client-side, no reload (FR-4).                                       |
| Latest strip             | Landing         | The 3 newest Posts, reverse-chrono; each links to its Post via client-side nav (FR-3).                                                                  |
| Post card (essay)        | Feed            | Title + date + excerpt; tap → Post. List layout (not grid).                                                                                             |
| Comic card               | Feed            | Strip image forward + date + optional caption chip; tap → Post.                                                                                         |
| Comic viewer             | Post (comic)    | Dark stage + the Strip + zoom/pan controls. See §Comic Presentation.                                                                                    |
| Project card             | Projects        | Title, one-liner, stack chips, live + source affordances; in-app tools link to `/projects/{slug}`.                                                      |
| Pagination               | Feed            | Prev/Next + page numbers; shareable per-page URLs (FR-5).                                                                                               |
| Buttons                  | CTAs            | One primary CTA per section (`button-primary`); `button-ghost` for secondary routes. Never more than one primary above the fold per section.            |
| Support pill             | content footers | Contribute-style affordance (this is the PRD's "Support Affordance / call-to-action — same concept, renamed `support-pill`"); never a nav item (FR-12). |
| Scroll-narrative section | Landing         | Reveals on scroll into view; respects `prefers-reduced-motion` (instant show).                                                                          |

## Comic Presentation

→ Composition reference: `mockups/key-comic-post-viewer.html`.

A product-specific section — comics are core and behave differently from essays.

A **Comic Post page** is a dark `{colors.ink-surface}` stage presenting the single finished Strip (`DESIGN.md` keeps the image edge-to-edge, no rounded mask). Below the strip: the title (Fraunces), date, optional caption (rendered in `{colors.on-surface-variant}` with a `{colors.secondary}` left accent rule — never a Secondary fill, per DESIGN.md contrast rules), optional author afterword, and the Support pill footer. No long-form body. No long-form body.

**Zoom/pan interaction (resolves PRD FR-16, pinned in review):**

- **Fit (default)** — strip scaled to fit its container width; taller-than-viewport strips scroll vertically within the stage.
- **Toggle zoom** — single tap (touch) or single click (pointer) toggles between _fit_ and _100% (1:1)_; double-click/double-tap also toggles fit ↔ 100%.
- **Free zoom** — pinch on touch; `+` / `−` on-screen controls; pointer wheel/Ctrl+wheel (UX to pick default — see Open Items). `[CONFIRMED: Ctrl+wheel zoom (not bare-wheel) — preserves page scroll (author, 2026-08-04).]`
- **Pan** — drag (touch or pointer) while zoomed; confined to the strip bounds (no overpan into chrome).
- **Reset** — on-screen Reset control returns to fit; `0` key resets; `Esc` resets and exits zoom.
- **Keyboard** — `+`/`−` zoom in/out; `0` reset; arrow keys pan; `Esc` reset+exit. Keyboard-focusable, does **not** trap focus (FR-16 / WCAG AA).
- **Chrome** — zoom controls bottom-right, appear on hover (pointer) / tap (touch) / focus, auto-hide after ~2.5s of inactivity. Controls remain keyboard-focusable while visually auto-hidden (reveal on focus) — never removed from the tab order.

**Sharing:** the Comic Post page carries full OG/Twitter metadata with the Strip as `ogImage` (PRD FR-10).

## State Patterns

| State                    | Surface             | Treatment                                                                                                                                                         |
| ------------------------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Empty filter result      | Feed                | `No posts match that filter yet.` (no icon-heavy empty state).                                                                                                    |
| Pagination beyond end    | Feed                | Renders no items (never an error).                                                                                                                                |
| Post not found           | Post                | Friendly on-brand 404: `This one's not here.` + links to Feed + Projects.                                                                                         |
| Image load failure       | Post (comic) / card | `Couldn't load the strip. Refresh?` with a retry; alt text remains available to AT.                                                                               |
| Zoom active              | Comic viewer        | Reset control gains emphasis; back-to-fit is always one action.                                                                                                   |
| Draft post               | —                   | Build-time failure, not a runtime state (PRD FR-8); never renders.                                                                                                |
| Reduced motion           | all                 | Scroll-reveal shows content instantly; viewer zoom transition is instant (no ≤150ms allowance).                                                                   |
| Feed cold-load           | Feed                | First paint shows a skeleton list placeholder; posts populate without spinner churn.                                                                              |
| Project demo/source down | Projects card       | A dead live-demo or source link is de-emphasised (muted, not clickable), never removed — the card still shows title, summary, and stack chips as the proof point. |

## Interaction Primitives

- **Tap/click to act.** Client-side navigation everywhere for in-app routes (PRD FR-14) — zero full-page reloads.
- **Scroll-reveal** used sparingly on Landing sections only; never on Feed/Post (don't hide content the user came for).
- **Keyboard-first for the viewer** — the comic is a reading surface; every zoom/pan action has a keyboard equivalent.
- **Banned:** full-page reloads via `<a href>`; autoplay carousels; hover-only disclosure; modal-on-landing; scroll-hijacking; bare-wheel zoom; streak/badge counters; entry popups.

## Accessibility Floor (WCAG 2.1 AA)

Behavioral. Visual contrast lives in `DESIGN.md`.

- **Semantic HTML** — landmarks (`header/nav/main/footer`), one `h1` per page, headings ordered; skip-to-content link first-focusable on every surface.
- **Focus** — visible focus ring on every interactive element; focus order follows reading order; the comic viewer is keyboard-operable and does **not** trap focus (FR-16) — `Tab` moves past it. Auto-hidden zoom controls remain keyboard-focusable while visually hidden (reveal on focus).
- **Navigation** — the mobile nav menu (`≤640`) closes on `Escape`, on route change, and on outside-click.
- **Comic alt text is mandatory** (PRD FR-8 enforces at build time) and must **describe the strip's conveyed content/gag**, not merely "a comic." It is the alt text _and_ the assistive narrative.
- **Reduced motion** — `prefers-reduced-motion: reduce` disables scroll-reveal fade/slide (instant) and viewer zoom transition (instant; no ≤150ms allowance).
- **Tap targets** ≥ 44×44 CSS px on touch.
- **Color** — text/background pairings meet AA contrast in `DESIGN.md` tokens; never encode meaning by color alone (type filter uses text labels, not only color).
- **Links** — descriptive text, not "here"; external links open in new tab with `rel="noopener"`.

## Responsive & Platform

Mobile-first. Breakpoints: `640` (sm), `768` (md), `1024` (lg), `1280` (xl).

- **Nav** collapses to a menu button `≤640`.
- **Feed** is single-column at all widths (chronological list).
- **Projects** grid: 1 col `<768`, 2 col `768–1024`, 3 col `≥1024`.
- **Landing hero** fills `≥92vh` on all viewports; the action photograph + identity render fully inside the first viewport at `320px` (PRD FR-1).
- **Comic viewer** is full-bleed on mobile; on desktop the stage is constrained (`feed-max`) with the strip centered.
- **Touch vs pointer** — the viewer offers on-screen zoom controls on both; pinch on touch; keyboard on desktop. No reliance on hover.
- **Cross-browser:** evergreen Chromium/Firefox/Safari.

## Inspiration & Anti-patterns

- **Lifted from Substack:** the clean reading column + per-post page as the canonical share target; the calm, content-forward feed.
- **Lifted from humorous / Sunday-funny tradition (and modern webcomic readers):** the image-forward strip page with easy zoom-to-read-lettering; the strip _is_ the page.
- **Lifted from maker-editorial personal sites (Frank Chimero, Maggie Appleton):** the "made by a person, on purpose" warmth; identity that reads in the hero without a separate About.
- **Rejected — corporate portfolio templates & tech-bro gradients:** off-brand for a writing-and-comics-first author site.
- **Rejected — the current "Welcome" hero over a space photo:** a dead-end that tells a visitor nothing and routes no one (PRD §1 problem statement).
- **Rejected — linktree-style link grids:** flattens identity into a menu; the Landing is a narrative, not a launcher.

## Key Flows

> **UJ-3 (Clinton publishes)** is a content-pipeline act with _no visitor-facing UI_ (PRD Feature Group 4 — Content Pipeline). It has no Key Flow here by design; it is owned by the architecture/content-pipeline contract, not this UX spine. Its edge case (missing Alt Text → build blocks publish) is captured as the mandatory-alt build gate in PRD FR-8 and enforced at build time, never at runtime.

### Flow 1 — Maya lands and reads the new strip (UJ-1)

1. Maya opens `clintonjavery.com` from a shared link.
2. Landing hero renders (action photograph + one-line identity); no full reload.
3. She scrolls; the Latest strip shows the newest comic at the top.
4. She taps the strip → client-side nav to its Post page.
5. Comic Post page renders the Strip in the dark stage at **fit**, OG metadata ready.
6. She reads it; if lettering is small, she taps once → toggle to **100%**, drags to pan.
7. `Esc` resets to fit.
8. **Climax:** she laughs, taps Back → Feed filtered to comics, skims two more.

Failure: she lands directly on `/p/{slug}` instead → the Post page still renders fully (not dependent on the Landing) with its own metadata.

### Flow 2 — Diana verifies competence in under a minute (UJ-2)

1. Diana (hiring manager) opens the resume's site link.
2. Landing hero signals who he is in one beat; she taps **Projects** in the nav (client-side).
3. Projects list renders; she scans two cards and opens one whose one-liner + stack match her need.
4. The Project card's live link opens an in-app tool (`/projects/{slug}`); she uses it for ten seconds.
5. She opens the source repo link (new tab).
6. **Climax:** she closes the tab with a concrete, verifiable proof point — in under a minute.

Empty state: Projects has at least the migrated tools, so not empty; if a live demo is temporarily down, the card still shows source + summary (no broken-link dead-end).

### Flow 3 — Maya zooms a strip to catch the small print (FR-16, accessibility)

1. On a Comic Post page, Maya (reading on her phone) finds the strip's lettering too small at fit.
2. She pinches to zoom; the stage zooms the strip only (page chrome doesn't move).
3. She drags to pan across the strip; pan stops at the strip bounds.
4. She taps Reset (or `Esc`) → back to fit.
5. **Climax:** she read the gag and the experience was under her control — one tap reset all the way out.
6. If she instead uses keyboard (desktop): `+` zooms, arrow keys pan, `Esc` resets; focus never trapped, `Tab` leaves the viewer.
7. **Failure:** none — zoom has no network failure mode; the controls are present whenever the strip renders. A strip that fails to load is handled by the _Image load failure_ state, not the viewer.

## Resolved Decisions

All six open items confirmed by the author on 2026-08-04 (Fast path → Full finalize):

1. **Pointer zoom default = `Ctrl+wheel`** — preserves page scroll; affects FR-16 acceptance-test wording (see §Comic Presentation).
2. **Strip image = edge-to-edge, no rounded mask on the artwork** — the container carries the radius.
3. **Light-paper default site**, dark reserved for the Landing hero + the comic viewer chrome.
4. **Type system = Fraunces (display/headline) + Inter (body/UI) + JetBrains Mono (code/eyebrow).**
5. **Route scheme = `/p` + `/p/{slug}` + `/projects/{slug}`**; historic-path redirects deferred to architecture/SEO (PRD OQ1, OQ3).
6. **Landing scroll sections** beyond hero / Latest / Projects-teaser: as drafted (PRD FR-2 + addendum §D: identity → Latest → Projects teaser → Support affordance).
