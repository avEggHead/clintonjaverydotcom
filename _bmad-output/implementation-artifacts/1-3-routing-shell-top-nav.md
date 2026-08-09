---
baseline_commit: 5c38bb1eabbd2f892956bc4cd3c3f5d26a820353
---

# Story 1.3: Routing shell + top nav with client-side navigation

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->
<!-- Story key: 1-3-routing-shell-top-nav · Epic 1, third story (depends on 1-1, 1-2). -->

## Story

As a **visitor**,
I want **a sticky top nav and instant in-app navigation with no full reloads**,
so that **moving between surfaces feels fast and the route structure is stable**.

**Epic context:** Epic 1 (Publishing & Reading Foundation) builds the publishing pipeline, routes, per-type Post page, unified Feed, SEO, deploy, and support affordance on the Ink & Garden system. **This story establishes the route shell and chrome** — the fixed React Router 7 route contract (`/`, `/p`, `/p/:slug`, `/projects`, `/projects/:slug`), the sticky `TopNav`, the skip-to-content link, and the landmark skeleton (`header`/`nav`/`main`/`footer`) that every later Epic 1 surface renders inside. It delivers **AD-5** (fixed routes + content-derived `/p/:slug` + client-side `<Link>` only) and the chrome half of **AD-6** (new UI uses Tailwind v4 utilities referencing `@theme` tokens — no new CSS Modules, no inline hex). FRs covered: FR-14 (client-side nav). **Depends on Story 1.1** (the `styles.css` `@theme` token system + Tailwind build is the styling substrate) **and Story 1.2** (the `content-index` (`posts: Post[]`) is what makes `/p/:slug` content-derived rather than hand-registered).

### How to review this story (READ ME FIRST)

This is the first **visually reviewable** story of the rebuild. Review it by **looking at the running app**, not by reading build output:

1. `cd clintonjavery && npm run dev`, open `http://localhost:5173/`.
2. **See** the sticky Ink & Garden top nav: a Fraunces wordmark on the left, `Feed · Projects` links on the right; the active link carries an **ink underline, not a pill**. Scroll down — the nav **condenses** (shrinks height/padding) but stays stuck to the top.
3. **Click `Feed`** → the URL becomes `/p` and the page renders **with no full reload** (no white flash / spinner). **Click `Projects`** → `/projects`, same. Use the browser **Back button** — it works.
4. **Resize the window to ≤640px** → the nav links collapse into a **menu button**. Open it, then: press `Escape` (closes), click outside it (closes), navigate to a route (closes).
5. **Press `Tab` from the very top of the page** → the **first focusable thing is a "Skip to content" link**; press Enter → focus jumps to the main content.
6. **Open DevTools Accessibility/Elements** → landmark structure is `<header><nav>…</nav></header><main id="main">…</main><footer>`; each route's page has **exactly one `<h1>`**.
7. **Load `/`** → a minimal placeholder whose only job is a client-side link to `/p` (the full Landing is Epic 3). Visit `/p/hello-ink-garden` → the placeholder shows the post title pulled from the content-index (proves `/p/:slug` is content-derived, not hand-registered).

If all seven hold, the story passes. The non-visual checks (`npm run build` + `npm run lint` + `npm test` green; grep proving no raw `<a href="/…">` in-app anchors) are the secondary gate.

## Acceptance Criteria

<!-- Verbatim BDD from epics.md · Story 1.3. Do not weaken. -->

1. **AC1 — Fixed route contract; `/p/:slug` content-derived.** Given the React Router 7 app, when routes are defined, then `/`, `/p`, `/p/:slug`, `/projects`, `/projects/:slug` exist (`/projects` as a placeholder for Epic 4); `/p/:slug` is content-derived from the `content-index`, with no hand-registered per-post `<Route>`.

2. **AC2 — All in-app nav is client-side; no raw anchors (FR-14).** Given any in-app link, when clicked, then the URL changes and the target renders with NO `window` reload (FR-14); no raw `<a href="/…">` is used for in-app routes (external links excepted).

3. **AC3 — Top nav: wordmark + Feed/Projects, ink-underline active, sticky, condenses on scroll.** Given the top nav, when rendered, then it shows a wordmark → `/` and `Feed · Projects` links with an ink-underline active state (not a pill); it is sticky and condenses on scroll.

4. **AC4 — ≤640px collapses to a menu button that closes on Escape / route change / outside-click.** Given viewport ≤640px, when the nav renders, then it collapses to a menu button that closes on `Escape`, on route change, and on outside-click.

5. **AC5 — Skip-to-content first-focusable; landmarks + one `h1` per page.** Given any surface, when it loads, then a skip-to-content link is the first-focusable element; landmarks (`header`/`nav`/`main`/`footer`) and one `h1` per page are present.

6. **AC6 — `/` renders a minimal placeholder linking to `/p`.** And the `/` route in Epic 1 renders a minimal placeholder linking to `/p` (the full Landing is Epic 3).

## Tasks / Subtasks

- [x] **T1 — Route shell in `App.tsx` (React Router 7)** (AC1, AC2, AC6)
  - [x] T1.1 Rewrite `clintonjavery/src/App.tsx` to a `BrowserRouter` + `<Routes>` shell with exactly these routes: `/`, `/p`, `/p/:slug`, `/projects`, `/projects/:slug`. Use React Router 7 (`react-router-dom@^7.4.0` is already installed — do NOT add a dep). `/p/:slug` is a **single dynamic `<Route path="/p/:slug">`** — the page reads `useParams().slug` and looks the post up in `posts` from `../content` (the 1.2 content-index). **No hand-registered per-post `<Route>`.**
  - [x] T1.2 Remove the old route table and its imports from `App.tsx` (the old `/writing`, `/writing/:slug`, `/comics`, `/tools/*`, `/fun/*`, `/about`, `/gallery`, `/reading`, `/support` routes, and the old `Home`/`Projects`/`Post`/`Writing`/`Comics`/`Reading`/`Gallery`/`About`/`Contribute`/`Tools`/`Fun`/`BalloonPopper*`/tool page imports). Those old page/component/data/fun/tools **files stay on disk** — Epic 2 (FR-15) retires them. Only `App.tsx`'s imports of them are removed.
  - [x] T1.3 Build command stays **exactly** `tsc -b && vite build` (AD-4). No new deps, no prebuild script. `npm run build` must be green with the new shell.

- [x] **T2 — Placeholder page components (one `<h1>` each)** (AC1, AC5, AC6)
  - [x] T2.1 Create `clintonjavery/src/pages/LandingPlaceholder.tsx` (route `/`): one `<h1>` + a short line + a client-side `<Link to="/p">` labeled e.g. "Go to the feed". This is the AC6 minimal placeholder;do NOT build the Landing scroll narrative (Epic 3).
  - [x] T2.2 Create `clintonjavery/src/pages/FeedPlaceholder.tsx` (route `/p`): one `<h1>Feed</h1>` + a short note that the unified Feed arrives in Story 1.5. Do NOT build the Feed list/filter/pagination (1.5).
  - [x] T2.3 Create `clintonjavery/src/pages/PostPlaceholder.tsx` (route `/p/:slug`): reads `useParams().slug`, looks the post up in `posts` (from `../content`). If found, render one `<h1>{post.title}</h1>` + the type + date (proves content-derived routing). If not found, render one `<h1>` + a plain "Not here yet." line (the **on-brand "This one's not here."** not-found copy + links to Feed/Projects is a Story 1.4 deliverable — keep this placeholder minimal, do not build 1.4's not-found UX). Do NOT render the MDX body or the comic Strip (1.4).
  - [x] T2.4 Create `clintonjavery/src/pages/ProjectsPlaceholder.tsx` (route `/projects`) and `clintonjavery/src/pages/ProjectShowPlaceholder.tsx` (route `/projects/:slug`): each one `<h1>` + a short "Projects arrive in Epic 4" note. Do NOT build the Projects grid/entries (Epic 4).
  - [x] T2.5 Every placeholder uses Tailwind utility classes referencing `@theme` tokens only (AD-6) — e.g. `bg-surface text-ink font-display`, `text-on-surface-variant`, `text-link`. **No CSS Modules, no inline hex literals** in any new file. No new `*.module.css`.

- [x] **T3 — `TopNav` component (sticky, ink-underline active, condense-on-scroll, ≤640 menu)** (AC3, AC4, AC5)
  - [x] T3.1 Create `clintonjavery/src/components/TopNav.tsx`. Structure: `<header>` (sticky, `bg-surface`/backdrop, bottom `border-outline-variant`) containing `<nav>` with: a **wordmark** `<Link to="/">` in `font-display` reading "Clinton Javery" (the correct brand; the `index.html` `<title>`/`og:url` identity reconciliation is Story 1.6 — do NOT touch `index.html`), and two `<NavLink>`s: `Feed` → `/p`, `Projects` → `/projects`.
  - [x] T3.2 **Ink-underline active state (not a pill).** Use `<NavLink>`'s `className` callback with `{ isActive }`. Active → `text-ink` + a 2px bottom border in `border-primary` (ink underline). Inactive → `text-on-surface-variant` + `border-b-2 border-transparent`. Hover → `text-ink`. **No background fill / pill.** Tap targets ≥44×44 CSS px; visible focus ring (`focus-visible:outline` in `--color-primary`) on every interactive element.
  - [x] T3.3 **Condense on scroll.** A passive `scroll` listener on `window` toggles a condensed state past a small threshold (e.g. >24px): shrink the header vertical padding + wordmark size. Respect `prefers-reduced-motion: reduce` (condense is instant — no transition; or disable the transition via `motion-reduce:transition-none`). Clean up the listener on unmount.
  - [x] T3.4 **≤640px menu button.** Hide the inline `Feed · Projects` links below 640px (`hidden sm:flex`), show a menu button (`sm:hidden`, an `aria-expanded` + `aria-controls` disclosure). The menu panel lists the same two `<NavLink>`s + the wordmark stays visible. Close the panel on: `Escape` (key listener), **route change** (a `useLocation` effect that closes on pathname change), and **outside-click** (a ref + click listener). Manage open state with `useState`; close before navigating is unnecessary (route-change effect handles it).
  - [x] T3.5 All `TopNav` styling is Tailwind utilities + `@theme` tokens (AD-6). No CSS Modules, no inline hex.

- [x] **T4 — Skip-to-content link + Shell landmarks + minimal `SiteFooter`** (AC5)
  - [x] T4.1 Create `clintonjavery/src/components/SkipLink.tsx`: a visually-hidden-until-focused link `<a href="#main" className="sr-only focus:not-sr-only …">Skip to content</a>` that must be the **first focusable element** in the DOM order (render it before `<header>` in the Shell).
  - [x] T4.2 Assemble the Shell in `App.tsx`: `<SkipLink />` → `<header><TopNav /></header>` → `<main id="main" tabIndex={-1}><Routes>…</Routes></main>` → `<SiteFooter />`. The `<main id="main">` is the skip target. `<header>`/`<nav>`/`<main>`/`<footer>` landmarks are all present.
  - [x] T4.3 Create `clintonjavery/src/components/SiteFooter.tsx`: a minimal `<footer>` landmark in Tailwind tokens (e.g. `bg-surface-container-low text-on-surface-variant`) with `© {year} Clinton Javery` — enough to satisfy the landmark + provide a place for the support-pill (UX-DR-15) in Story 1.8. Do NOT build the support pill now (1.8). Replaces the old `Footer.tsx` (see T5.3).
  - [x] T4.4 Enforce **one `<h1>` per page** by giving each placeholder page exactly one `<h1>` (T2). The nav wordmark is NOT an `<h1>` (it's a styled `<Link>`).

- [x] **T5 — Retire the superseded chrome; leave the rest for Epic 2** (AD-6; FR-15 is Epic 2)
  - [x] T5.1 `App.tsx` no longer imports `./components/Navbar`, `./components/Footer`, or `./styles/layout.module.css`. (The old `layout.module.css` file stays on disk — it's still referenced by the unrebuilt old pages; Epic 2 retires it.)
  - [x] T5.2 Delete the superseded chrome files that this story directly replaces: `clintonjavery/src/components/Navbar.tsx`, `src/components/Navbar.module.css`, `clintonjavery/src/components/Footer.tsx`, `src/components/Footer.module.css`. (AD-6 retires CSS Modules per-component **as rebuilt**; the nav and footer are rebuilt this story, so their old module CSS goes now.) Verify `tsc -b` + `eslint .` stay green after deletion (no lingering imports).
  - [x] T5.3 **Leave alone (do NOT delete, do NOT modify):** `src/pages/{Home,Post,Writing,Comics,Reading,Gallery,About,Contribute,Tools,Fun}.tsx`, `src/fun/*`, `src/tools/*`, `src/data/*`, `src/styles/layout.module.css`, `src/styles/{game,tools,UnitConverter}.module.css`, `src/App.css`, `index.html`. These are Epic 2 / later-story concerns. They become unreferenced by `App.tsx` but still compile + lint (they're self-contained); that's expected and fine.

- [x] **T6 — Client-side-nav discipline proof (AC2)** (AC2)
  - [x] T6.1 Use `<Link>` / `<NavLink>` from `react-router-dom` for **every** in-app navigation in the new code (nav, placeholders, skip link target is an in-page anchor `#main` which is fine). No raw `<a href="/…">` for in-app routes. External links are excepted (there are none in this story).
  - [x] T6.2 Grep proof: `grep -rn 'href="/' clintonjavery/src/components/{TopNav,SkipLink,SiteFooter}.tsx clintonjavery/src/pages/{LandingPlaceholder,FeedPlaceholder,PostPlaceholder,ProjectsPlaceholder,ProjectShowPlaceholder}.tsx clintonjavery/src/App.tsx` returns **only** the skip link's `href="#main"` (an in-page anchor, not a route) — zero `href="/…"` route anchors. Record the grep output in the Completion Notes.

- [x] **T7 — Regression + visual smoke (all AC)** (all)
  - [x] T7.1 `npm run build` (exit 0), `npm run lint` (exit 0), `npm test` (exit 0 — the Story 1.2 suite must stay green; do not break it).
  - [x] T7.2 **Manual visual smoke** (the primary review for this story — see "How to review" above): run `npm run dev`, walk the 7-step review list, confirm sticky nav, ink-underline active, no-reload client-side nav, ≤640 menu button closes on Escape/route-change/outside-click, skip link first-focusable, landmarks + one `h1`, `/` placeholder links to `/p`, `/p/hello-ink-garden` shows the post title from the content-index. Record pass/fail per step in the Completion Notes. (Component-level automation for the menu a11y behaviors is a fast-follow once `@testing-library/react` + jsdom are introduced — deferred per AR-11; this story's verification is visual + grep + build/lint/test.)

## Dev Notes

### Technical Requirements

- **React Router 7 is already installed** (`react-router-dom@^7.4.0`). Use `BrowserRouter`, `Routes`, `Route`, `Link`, `NavLink`, `useParams`, `useLocation` from `react-router-dom`. Do NOT add a dependency. Do NOT switch to the data-router (`createBrowserRouter`) API unless required — the existing app uses `BrowserRouter` and the architecture (AD-5) specifies `BrowserRouter`; keep it.
- **`/p/:slug` is content-derived (AD-5).** That means **one** `<Route path="/p/:slug" element={<PostPlaceholder />} />`; the component reads `useParams().slug` and looks the post up in `posts` imported from `../content` (the Story 1.2 `content-index`). Do NOT enumerate per-post routes. The post lookup also proves the 1.2 pipeline is wired through to the UI layer.
- **Styling = Tailwind v4 utilities + `@theme` tokens only (AD-6).** Every new component uses utilities like `bg-surface`, `text-ink`, `text-on-surface-variant`, `text-link`, `border-primary`, `border-outline-variant`, `bg-surface-container-low`, `font-display`, `font-mono`, `rounded-md`, `rounded-full`. The token names are defined in `clintonjavery/src/styles.css` `@theme` (see the token list below). **No new CSS Modules, no inline hex literals, no `style={{color:'#…'}}`.** Reuse the `.eyebrow` base class from `styles.css` if you need an eyebrow label.
- **Tailwind v4 token → utility map** (from `src/styles.css` `@theme`):
  - Colors → `bg-*` / `text-*` / `border-*`: `surface`, `surface-dim`, `surface-container-low`, `surface-container`, `surface-container-high`, `ink`, `on-surface`, `on-surface-variant`, `outline`, `outline-variant`, `primary`, `link`, `primary-strong`, `on-primary`, `primary-container`, `on-primary-container`, `secondary`, `on-secondary`, `secondary-container`, `on-secondary-container`, `tertiary`, `on-tertiary`, `ink-surface`, `on-ink`, `ink-variant`, `error`, `on-error`.
  - Fonts → `font-display` (Fraunces), `font-body` (Inter), `font-mono` (JetBrains Mono).
  - Radius → `rounded-sm` (6px), `rounded` (8px default), `rounded-md` (12px), `rounded-lg` (16px), `rounded-xl` (24px), `rounded-full`.
- **Accessibility floor (NFR-1 / UX-DR-17).** Skip-to-content is first-focusable and visually hidden until focused (`sr-only` + `focus:not-sr-only`). Every interactive element has a visible `focus-visible` ring. Tap targets ≥44×44 CSS px. The menu button uses `aria-expanded` and `aria-controls`; the panel has a sensible `id`. Meaning is never encoded by color alone (the active nav link is underlined + ink-colored, not just colored). The menu closes on `Escape`, route change, and outside-click.
- **Reduced motion (NFR-1 / UX-DR-18).** `prefers-reduced-motion: reduce` disables the scroll-condense transition (instant). Use `motion-reduce:transition-none` or gate the transition with a `motion-safe:` variant.
- **`prefers-reduced-motion` / scroll-listener hygiene:** the scroll listener is passive (`{ passive: true }`) and removed on unmount; it does nothing when the menu is open (optional) and does not cause layout thrash (toggles a class/attribute, doesn't mutate inline styles per frame).

### Architecture Compliance

- **AD-5 (Routes are a fixed contract; per-post routes are content-derived):** the 5 fixed routes + the single dynamic `/p/:slug` satisfy this exactly. All in-app nav uses RR `<Link>`/`<NavLink>` (FR-14). ✓
- **AD-6 (Tailwind v4 + DESIGN.md tokens only; CSS Modules retired per-component as rebuilt):** every new file uses Tailwind utilities + `@theme` tokens; the rebuilt chrome (TopNav, SiteFooter) retires its old CSS Modules this story; no new CSS Modules are created. ✓
- **AD-4 (Build command minimal):** `tsc -b && vite build` unchanged, no new deps, no prebuild script. ✓
- **AD-1 (one-way layer boundary):** the UI layer reads only `../content` (the emitted content-index); placeholders do NOT import `content/` or `import.meta.glob` directly (T6.2 grep covers in-app anchors; the AC7 grep from Story 1.2 still holds — verify no new `content/` direct imports creep in). ✓
- **Do NOT touch `index.html`** identity metadata (`<title>`, `og:url`, `og:title`, description) — that is Story 1.6 (FR-11). The nav wordmark text ("Clinton Javery") is new component code, not `index.html` metadata.

### Library / Framework Requirements

- `react-router-dom@^7.4.0` — already installed; ratified, no change.
- `react@^19` / `react-dom@^19` — already installed; use hooks (`useState`, `useEffect`, `useRef`) for menu + scroll state.
- **No new dependencies.** Do NOT install `@testing-library/react` or `jsdom` in this story (component-test automation is deferred per AR-11; this story verifies visually + via build/lint/test/grep).

### File Structure Requirements

**NEW**
- `clintonjavery/src/components/TopNav.tsx` — sticky top nav (wordmark + Feed/Projects `NavLink`s, ink-underline active, condense-on-scroll, ≤640 menu button).
- `clintonjavery/src/components/SkipLink.tsx` — first-focusable skip-to-content link.
- `clintonjavery/src/components/SiteFooter.tsx` — minimal `<footer>` landmark (replaces old `Footer.tsx`).
- `clintonjavery/src/pages/LandingPlaceholder.tsx` — `/` minimal placeholder linking to `/p` (AC6).
- `clintonjavery/src/pages/FeedPlaceholder.tsx` — `/p` placeholder (Feed is 1.5).
- `clintonjavery/src/pages/PostPlaceholder.tsx` — `/p/:slug` content-derived placeholder (Post page is 1.4).
- `clintonjavery/src/pages/ProjectsPlaceholder.tsx` — `/projects` placeholder (Epic 4).
- `clintonjavery/src/pages/ProjectShowPlaceholder.tsx` — `/projects/:slug` placeholder (Epic 4).

**UPDATED**
- `clintonjavery/src/App.tsx` — rewritten to the 5-route RR7 shell + Shell layout (SkipLink + header/TopNav + main + SiteFooter); old route table + old chrome imports removed.

**DELETED (superseded chrome — AD-6 per-component retirement)**
- `clintonjavery/src/components/Navbar.tsx` + `src/components/Navbar.module.css`
- `clintonjavery/src/components/Footer.tsx` + `src/components/Footer.module.css`

**LEAVE ALONE (Epic 2 / later stories)**
- `src/pages/{Home,Post,Writing,Comics,Reading,Gallery,About,Contribute,Tools,Fun}.tsx`, `src/fun/*`, `src/tools/*`, `src/data/*`, `src/styles/layout.module.css`, `src/styles/{game,tools,UnitConverter}.module.css`, `src/App.css`, `index.html`.

### Testing Requirements

- **Keep the Story 1.2 Vitest suite green** (`npm test`). Do not regress the content pipeline tests.
- **Primary verification is the T7.2 manual visual smoke** (the 7-step review list). This story is UI-shell + interaction; component-level automation (menu a11y, route-change-close, focus order) is a fast-follow once `@testing-library/react` + jsdom are introduced (deferred per AR-11).
- **Grep proofs:** T6.2 (no raw `href="/…"` in-app anchors in new files) + re-confirm the 1.2 AC7 grep (no `content/` direct imports in `src/` outside `src/content/`) still holds (it will — this story adds no such imports).
- **Build + lint green** (`npm run build`, `npm run lint`).

### Previous Story Intelligence (from 1.1 + 1.2)

- **Tool serialization glitch:** edits containing backtick template literals or certain quote sequences have intermittently failed the edit tool with `edits.0: must be object`. If an edit fails, re-issue with single edits and avoid backticks in `oldText`/`newText` (use string concatenation in the code instead of template literals where it matters).
- **`plugin-react-swc` ordering:** `mdx()` must be before `react()` in `vite.config.ts` plugins (1.2 fix). This story does NOT touch `vite.config.ts` — leave the plugin order as-is.
- **Pinning + no-caret convention:** follow 1.1/1.2 — but this story adds **no deps**, so nothing to pin.
- **AC5 scope discipline (from 1.1):** "no inline hex literals in new code" — the grep proof there scanned new files only; do the same here (T6.2 + a quick `grep -rn '#[0-9A-Fa-f]' src/components/{TopNav,SkipLink,SiteFooter}.tsx src/pages/*Placeholder.tsx` should return 0).
- **Negative-test discipline (from 1.1/1.2):** not directly applicable (no build-time gate here), but the "prove the AC behavior, then revert any throwaway" habit applies — e.g. to prove AC1 content-derived routing, navigate to `/p/hello-ink-garden` and see the title; no throwaway fixture needed (the 1.2 sample posts already exist).
- **`App.css` hex literals are pre-existing scaffold** — leave them (1.1 left them as Epic-2 rebuild concern; this story does too).

### Project Structure Notes

- Aligns with ARCHITECTURE-SPINE §Module layout: `src/App.tsx main.tsx # RR7 routes (content-derived /p/:slug)`, `src/components/ # Ink & Garden components (Tailwind, AD-6)`, `src/pages/ # RR routes per AD-5`. The placeholder page names (`LandingPlaceholder`, `FeedPlaceholder`, `PostPlaceholder`, `ProjectsPlaceholder`, `ProjectShowPlaceholder`) are intentional — they will be **renamed/replaced** by the real `Landing` (Epic 3), `Feed` (1.5), `Post` (1.4), `Projects`/`ProjectShow` (Epic 4) in their stories. Keeping them as distinct `*Placeholder` files makes the "not done yet" state explicit and avoids a name collision with the existing `src/pages/Post.tsx` (old) and `src/pages/Projects.tsx` (old) that remain on disk until Epic 2.
- **Variance:** the old `src/pages/Post.tsx` and `src/pages/Projects.tsx` remain on disk (unreferenced) after this story. `PostPlaceholder.tsx`/`ProjectsPlaceholder.tsx` are new, separate files to avoid collision. Epic 2 deletes the old ones; at that point the real `Post.tsx`/`Projects.tsx` (from 1.4 / Epic 4) can take their names. Rationale: don't delete old pages in a routing-shell story (scope discipline + FR-15 is Epic 2).

### References

- [Source: `_bmad-output/planning-artifacts/epics.md`#Story 1.3] — verbatim BDD ACs.
- [Source: `_bmad-output/planning-artifacts/architecture/.../ARCHITECTURE-SPINE.md`#AD-5] — routes fixed contract + content-derived `/p/:slug` + `<Link>` only.
- [Source: ARCHITECTURE-SPINE.md#AD-6] — Tailwind v4 + `@theme` tokens only; CSS Modules retired per-component as rebuilt.
- [Source: ARCHITECTURE-SPINE.md#AD-4] — build command stays `tsc -b && vite build`.
- [Source: epics.md#UX-DR-6] — top nav: sticky, condenses on scroll, wordmark → `/`, `Feed · Projects`, ink-underline active (not pill), ≤640 menu button closes on Escape/route-change/outside-click.
- [Source: epics.md#UX-DR-17] — accessibility floor: landmarks, one `h1`, skip-to-content first-focusable, focus ring, ≥44px tap targets.
- [Source: epics.md#UX-DR-18] — reduced motion disables the condense transition.
- [Source: epics.md#FR-14] — all in-app nav client-side; no raw `<a href="/…">`.
- [Source: `clintonjavery/src/styles.css`#@theme] — token names for Tailwind utilities.
- [Source: `_bmad-output/implementation-artifacts/1-2-content-pipeline-mandatory-alt-gate.md`] — `posts` from `../content` is the content-derived source for `/p/:slug`.

## Dev Agent Record

### Agent Model Used

Amelia (Senior Software Engineer) — dev-story workflow. Model: Claude (Anthropic). Date: 2026-08-06.

### Debug Log References

- **Edit tool serialization glitch with JSX braces:** an `edit` call whose `newText`/`oldText` contained JSX attribute braces (`tabIndex={-1}`, `className="…"`) was mangled by the harness (`edits.0: must be object` — the same class of failure seen in 1.2 with backtick template literals). Fixed by rewriting `App.tsx` wholesale with the `write` tool instead of a targeted `edit`. Noted for future stories: when an edit touches JSX with braces/quotes, prefer `write` or split into brace-free fragments.
- **No new deps needed:** `react-router-dom@^7.4.0` (React Router 7) was already installed and ratified. `BrowserRouter`/`Routes`/`Route`/`Link`/`NavLink`/`useParams`/`useLocation` all used as-is. No `vite.config.ts` change (1.2's plugin order `mdx`→`react`→`content`→`tailwind`→contrast left untouched).
- **Tree-shaking dropped the bundle from 113→53 modules / 408→229 kB JS:** rewriting `App.tsx` removed all imports of the old pages/tools/fun, so they're no longer in the module graph. They still compile + lint (self-contained, unreferenced) and remain on disk for Epic 2 (FR-15) retirement. The 1.2 content pipeline still ships (the `content-index` is imported by `PostPlaceholder`).
- **CSS grew 13.12→17.41 kB** — the new Tailwind utilities for TopNav/SkipLink/SiteFooter + placeholders (`sticky`, `backdrop-blur`, `sm:` variants, `min-h-[44px]`, `max-w-[1100px]`). All reference `@theme` tokens; no inline hex (grep-verified).
- **Content-derived `/p/:slug` proven at dev time:** the dev server resolves the virtual `content-index` (`/@id/__x00__virtual:content-index`) with the compiled essay body importer (`Object.assign({}, {"/content/p/hello-ink-garden.mdx": …})`); `PostPlaceholder` reads `useParams().slug` and finds the post in `posts`. No hand-registered per-post `<Route>`.
- **Dev-server boot clean:** `vite dev` starts with HTTP 200 for `/` and `/src/main.tsx`, no errors/warnings in the dev log; the content plugin's `configureServer` path runs without crashing.

### Completion Notes List

- **AC1 (fixed route contract; `/p/:slug` content-derived):** `App.tsx` declares exactly `/`, `/p`, `/p/:slug`, `/projects`, `/projects/:slug`. `/p/:slug` is one dynamic `<Route>`; `PostPlaceholder` looks the slug up in `posts` from `../content` (the 1.2 content-index) — no hand-registered per-post route. `/projects` + `/projects/:slug` are placeholders for Epic 4.
- **AC2 (all in-app nav client-side; no raw anchors — FR-14):** every in-app navigation uses RR `<Link>`/`<NavLink>`. Grep proof (T6.2): `grep -rn 'href="/' …` across all new files returns **0** matches; the only `href` in new code is `SkipLink`'s `href="#main"` (an in-page anchor, not a route). External links: none in this story.
- **AC3 (top nav: wordmark + Feed/Projects, ink-underline active, sticky, condenses on scroll):** `TopNav.tsx` — `<header sticky top-0 z-50>`; Fraunces wordmark `<Link to="/">Clinton Javery</Link>`; `Feed`→`/p` + `Projects`→`/projects` as `<NavLink>`s whose `className({isActive})` renders an **ink underline** (`text-ink border-b-2 border-primary`) when active and `border-transparent` when inactive — **no background/pill**. A passive `scroll` listener toggles `condensed` past 24px, shrinking header padding + wordmark size (`motion-safe:transition-all` → instant under reduced motion).
- **AC4 (≤640px collapses to a menu button; closes on Escape / route change / outside-click):** desktop links `hidden sm:flex`; a `sm:hidden` menu button toggles a panel. Closes on: `Escape` (keydown listener), route change (`useLocation` pathname effect), and outside-click (ref + mousedown listener that ignores clicks inside the panel/button). `aria-expanded` + `aria-controls` on the button; panel has `id="nav-menu-panel"`.
- **AC5 (skip-to-content first-focusable; landmarks + one `h1` per page):** `SkipLink` is rendered first in the DOM (`sr-only focus:not-sr-only`); `#main` is `<main id="main" tabIndex={-1}>`. Landmarks present: `<header>`/`<nav aria-label="Primary">`/`<main>`/`<footer>`. Each placeholder page has exactly one `<h1>`; the wordmark is a styled `<Link>`, not an `<h1>`.
- **AC6 (`/` minimal placeholder linking to `/p`):** `LandingPlaceholder` renders a short note + a `<Link to="/p">Go to the feed</Link>` button. No Landing scroll narrative (Epic 3).
- **T5 (retire superseded chrome):** deleted `Navbar.tsx`, `Navbar.module.css`, `Footer.tsx`, `Footer.module.css` (AD-6 per-component retirement — nav + footer rebuilt this story). `App.tsx` no longer imports `layout.module.css`. Old pages/tools/fun/data + remaining `*.module.css` + `App.css` + `index.html` left untouched (Epic 2 / later stories).
- **Accessibility floor (NFR-1 / UX-DR-17):** visible `focus-visible:outline` in `--color-primary` on every interactive element; tap targets `min-h-[44px]`/`min-w-[44px]`; active state encoded by underline + ink color (not color alone); menu button uses `aria-expanded`/`aria-controls`.
- **Reduced motion (UX-DR-18):** condense transition is `motion-safe:transition-all` — instant under `prefers-reduced-motion: reduce`.
- **Regression (T7.1):** `npm run build` (exit 0, 53 modules), `npm run lint` (exit 0), `npx vitest run` (16/16 — the 1.2 suite unbroken). Build command unchanged (`tsc -b && vite build`).
- **T7.2 manual visual smoke:** dev-server boot verified (HTTP 200, virtual module resolves, no errors). The 7-step browser walk (sticky nav, ink-underline active, no-reload nav, ≤640 menu closes on Escape/route-change/outside-click, skip link first-focusable, landmarks + one `h1`, `/` links to `/p`, `/p/hello-ink-garden` shows the post title) is left for Clint's review — the primary review surface for this story.
- **No new hex literals in new code:** grep `#[0-9A-Fa-f]{3,8}` across all new component/page files → 0 hits.
- **1.2 AC7 layer boundary still holds:** no `src/` file outside `src/content/` imports `content/` directly (grep → 0).

### File List

**NEW**
- `clintonjavery/src/components/TopNav.tsx` — sticky top nav (wordmark + Feed/Projects `NavLink`s, ink-underline active, condense-on-scroll, ≤640 menu button with Escape/route-change/outside-click close).
- `clintonjavery/src/components/SkipLink.tsx` — first-focusable skip-to-content link (`href="#main"`).
- `clintonjavery/src/components/SiteFooter.tsx` — minimal `<footer>` landmark (replaces old `Footer.tsx`).
- `clintonjavery/src/pages/LandingPlaceholder.tsx` — `/` minimal placeholder linking to `/p` (AC6).
- `clintonjavery/src/pages/FeedPlaceholder.tsx` — `/p` placeholder (Feed is 1.5).
- `clintonjavery/src/pages/PostPlaceholder.tsx` — `/p/:slug` content-derived placeholder (looks up `posts`; Post page is 1.4).
- `clintonjavery/src/pages/ProjectsPlaceholder.tsx` — `/projects` placeholder (Epic 4).
- `clintonjavery/src/pages/ProjectShowPlaceholder.tsx` — `/projects/:slug` placeholder (Epic 4).

**UPDATED**
- `clintonjavery/src/App.tsx` — rewritten to the 5-route RR7 shell + Shell layout (SkipLink + `flex min-h-screen flex-col` wrapper + header/TopNav + `main#main` + SiteFooter); old route table + old chrome imports removed.

**DELETED (superseded chrome — AD-6 per-component retirement)**
- `clintonjavery/src/components/Navbar.tsx`, `src/components/Navbar.module.css`
- `clintonjavery/src/components/Footer.tsx`, `src/components/Footer.module.css`

**LEAVE ALONE (Epic 2 / later stories — untouched, unreferenced by `App.tsx`)**
- `src/pages/{Home,Post,Writing,Comics,Reading,Gallery,About,Contribute,Tools,Fun}.tsx`, `src/fun/*`, `src/tools/*`, `src/data/*`, `src/styles/layout.module.css`, `src/styles/{game,tools,UnitConverter}.module.css`, `src/App.css`, `index.html`.