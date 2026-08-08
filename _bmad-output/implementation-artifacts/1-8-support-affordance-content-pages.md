---
baseline_commit: cea4588 2 - 1
---

# Story 1.8: Support affordance on content pages

Status: review

## Story

As a **reader who wants to support Clint**,
I want a Support link in the footer of content pages (not the nav),
So that I can contribute without it competing with site navigation.

**Epic 1, Story 1.8** (`_bmad-output/planning-artifacts/epics.md`, Story 1.8) — covers **FR-12** + **UX-DR-15**. This is the **final story of Epic 1** (the epics file's own marker `<!-- Epic 1 complete: 8 stories … -->` confirms 1.1–1.8 is the full set). It delivers the `support-pill` CTA — the single piece of Epic 1 that was genuinely not shipped by the 1.1–1.7 run (verified at kickoff: no `1-8-*` artifact existed and `SiteFooter.tsx` carried the placeholder comment `// The support-pill (UX-DR-15) lands in 1.8.`). All other Epic-1 stories were committed through `4bd14f9 1 - 7` (later `cea4588 2 - 1` added Story 2.1).

## Acceptance Criteria (from epics.md Story 1.8) + status

1. **AC1 — `support-pill` uses `secondary-container` background + `on-secondary-container` text, `full` radius.** ✓ — `src/components/SupportPill.tsx` line 24: `… rounded-full bg-secondary-container … text-on-secondary-container …`. Tokens exist in `src/styles.css` (`--color-secondary-container: #F6D9C2`, `--color-on-secondary-container: #3A1A07`, `--radius-full: 9999px`); the same `bg-secondary-container`/`text-on-secondary-container` utilities are already used by the Feed comic-caption chip, so the pill is consistent with the existing palette. (Token-only — AD-6 satisfied; no inline hex.)
2. **AC2 — the `support-pill` appears in the footer area of each Post page and the Feed (FR-12).** ✓ — `src/components/SiteFooter.tsx` renders `<SupportPill />` (the global `<footer>` landmark, mounted on every route in `App.tsx`) **conditionally** via `useLocation`: `const showSupport = pathname === '/p' || pathname.startsWith('/p/')`. So the pill appears in the footer landmark on `/p` (Feed) and `/p/:slug` (every Post page, essay + comic), and is **absent** on `/` (Landing) and `/projects*`. This is the faithful reading of UX-DR-15 ("footer area of content pages (Post pages + Feed)") and keeps the pill inside the actual footer landmark — matching the epics footer note that the footer "carries identity + copyright + the `support-pill`."
3. **AC3 — there is no `/support` or `/contribute` top-level route or nav item.** ✓ — `src/App.tsx` routes only `/`, `/p`, `/p/:slug`, `/projects`, `/projects/:slug`. `src/components/TopNav.tsx` nav items are only **Feed** and **Projects**. `grep -E "/support|/contribute" src/App.tsx src/components/TopNav.tsx` → no hits. (The legacy `src/pages/Contribute.tsx` page file still exists but is **un-routed + un-imported** — `grep -rn "Contribute" src` finds only its own definition; it is dead code, retired properly with Gallery/Reading/BalloonPopper in Story 2.3's FR-15 hygiene sweep, not here. Leaving it does not violate this AC, which is specifically about *routes and nav items*.)
4. **AC4 — the Contribute page dropped from navigation, when the `support-pill` link is checked, resolves to the existing Contribute/Venmo destination.** ✓ — `SUPPORT_URL` in `src/site/identity.ts` line 40 = `'https://venmo.com/u/clintonjavery'`, which is **byte-identical** to the href the (de-routed) `src/pages/Contribute.tsx` line 8 linked to. The pill links the Venmo URL **directly** (not to the now-un-routed `/contribute`), so the Contribute page's removal from navigation can never break the Support link target — the destination is centralized in `identity.ts` and external. `target="_blank" rel="noopener noreferrer"` + a visually-hidden "(opens in a new tab)" cue for AT users.

## Tasks / Subtasks

- [x] **Task 1 — Pin the destination + scope** [dev-agent]
  - [x] T1.1 The "existing Contribute/Venmo destination" = the Venmo URL the de-routed `Contribute.tsx` page linked to (`https://venmo.com/u/clintonjavery`), confirmed by grep. Linking to `/contribute` would 404→SPA-fallback (it has no route), so the pill **must** link the Venmo URL directly — which is exactly what AC4 requires ("dropping Contribute from nav does not break the Support link target").
  - [x] T1.2 Scope = content pages only (Post `/p/:slug` + Feed `/p`) per UX-DR-15. Decided the pill renders in the **global `SiteFooter` landmark, route-conditioned** (vs. a local footer strip inside `Feed.tsx`/`PostPage.tsx`): single source of truth, keeps identity + copyright + support-pill together in one `<footer>` (matches the epics footer note), scopes to content routes, and avoids any duplication on the Landing — which Epic 3 will give its own footer-narrative section (Story 3.2/3.3).
  - [x] T1.3 Confirmed tokens exist (`secondary-container`, `on-secondary-container`, `radius-full`) and that the Feed already uses the container pair — so the pill is on-palette, not a new token.

- [x] **Task 2 — Author the support-pill + wire the footer** (AC1/AC2/AC4) [dev-agent]
  - [x] T2.1 Added `SUPPORT_URL` to `src/site/identity.ts` (the single-source-of-truth for site identity — no duplicate Venmo string anywhere in `src/`). Doc-comment ties it to 1.8 / FR-12.
  - [x] T2.2 New `src/components/SupportPill.tsx` — presentational `<a>`: `rounded-full bg-secondary-container text-on-secondary-container`, `min-h-[44px]` touch target, the project's common `focus-visible:outline-2/-offset-2/-primary` ring, `font-body text-sm font-semibold`, `motion-safe:transition-colors hover:brightness-95`, `target="_blank" rel="noopener noreferrer"`, visible label **"Support the site"** (meaning via text, not color → NFR-1) + an `sr-only` "(opens in a new tab)" cue.
  - [x] T2.3 Rewrote `src/components/SiteFooter.tsx` — replaced the 1.7 placeholder (copyright-only single-line) with a flex footer (`identity + copyright` left, `support-pill` right; stacks center on mobile) and `useLocation`-conditioned `<SupportPill />`. Imported `useLocation` from `react-router-dom` (SiteFooter already renders inside `<BrowserRouter>` in App.tsx, so the hook is valid). Removed the `// … lands in 1.8.` placeholder comment.
  - [x] T2.4 Did NOT add a test. The project tests **logic only** (no RTL/jsdom render tests — `TopNav`/`SkipLink`/the old `SiteFooter` all have none; AR-11 deferral). The pill is a pure presentational link with no logic to test.

- [x] **Task 3 — Verify AC4 (non-breaking target)** [dev-agent]
  - [x] T3.1 grep-proved `SUPPORT_URL` == old `Contribute.tsx` Venmo href (byte-identical) → AC4 holds: Contribute dropped from nav, the pill still resolves to the same destination.

- [x] **Task 4 — Regression sweep** (AC2/AC3) [dev-agent]
  - [x] T4.1 `npm run build` green (1.84s); `npm run lint` 0 problems; `npx vitest run` 110 passed (unchanged — no new test logic). `App.tsx` routes and `TopNav` nav items unchanged → AC3 still holds.

- [x] **Task 5 — Story file & status** [dev-agent]
  - [x] T5.1 Filled the Dev Agent Record, marked agent-doable task checkboxes `[x]`, Status → `review`.

## Developer Context

### Design decision: route-conditioned global footer (vs. local page footer)

Two readings of "the `support-pill` appears in the footer area of each (Post page and the Feed)":

- **(a) Render the pill locally** at the bottom of `Feed.tsx` and `PostPage.tsx` content (a content-area footer strip), keeping `SiteFooter` dumb/copyright-only.
- **(b) Render the pill in the global `SiteFooter` landmark, route-conditioned** to `/p` + `/p/:slug`.

Chose **(b)**. Reasons:
- The epics footer note says "the footer … carries identity + copyright + the `support-pill` (no full nav duplicate)" — i.e. the pill belongs **in the footer landmark** alongside identity + copyright, not as an extra content-area strip. (b) makes that literally true.
- Single source of truth: one `<SupportPill />` render site, not two copy-pasted placements in `Feed`/`PostPage` (DRY).
- UX-DR-15 scopes the pill to "content pages (Post pages + Feed)"; (b) honors that scope (`showSupport` gates on `/p` + `/p/`) while keeping the footer landmark on every route (identity + copyright never disappear).
- No duplication risk for Epic 3: on `/` (Landing) `showSupport` is false, so the pill does **not** render in the global footer there — Epic 3 can build its own footer-narrative section (Story 3.2) without colliding with a global pill.
- Small cost: `SiteFooter` becomes route-aware (`useLocation`). The coupling is one line and stays within the router subtree (SiteFooter is always rendered inside `<BrowserRouter>`), so it does not violate AD-5's route-shell invariants.

### What this story deliberately did NOT do

- **Did NOT delete `src/pages/Contribute.tsx`** or its `layout.module.css` styles (`supportSection`, `qrContainer`, `qrImage`, `qrCaption`, and the shared `venmoButton`). Story 1.8's ACs are about **nav + the pill's target**, not file cleanup; `Contribute.tsx` is already un-routed + un-imported (verified: `grep -rn "Contribute" src` finds only its own export). It is dead cruft that retires with `/reading`, `/gallery`, BalloonPopper, and the `*~` editor cruft in **Story 2.3** (FR-15 hygiene). Removing it here would be scope-creep (and `venmoButton` is still referenced by `src/tools/TimeZoneConverter.tsx`, so its CSS can't be pulled in isolation). Left for 2.3.
- **Did NOT add a `/contribute` or `/support` route** (would violate AC3). The pill links the external Venmo URL directly.
- **Did NOT touch `TopNav`** (already had no Contribute/Support item — AC3 was already satisfied at kickoff).
- **Did NOT add new design tokens** — reused existing `secondary-container`/`on-secondary-container`/`radius-full`.
- **Did NOT touch** the comic strip image changes present in the working tree at kickoff (`public/content/p/first-strip/strip.png` modified, `strip_old.png` untracked). Those are Clint's own in-progress changes, unrelated to 1.8; left untouched.

### Why `target="_blank"` + `rel="noopener noreferrer"`

The Venmo destination is external. Opening in a new tab keeps the reader's place in the content site (a support CTA you don't want to lose your reading spot for). `noopener` prevents the new page from accessing `window.opener`; `noreferrer` is the conventional companion (and avoids leaking the referrer to a third party). A `sr-only` "(opens in a new tab)" span gives AT users the same cue sighted users get visually (a new tab opening), satisfying the spirit of NFR-1 (meaning not by behavior alone).

## Architecture Compliance

- **AD-6 (Tailwind v4 + @theme tokens only; no CSS Modules, no inline hex)** — the pill uses only token utilities (`bg-secondary-container`, `text-on-secondary-container`, `rounded-full`, `border-outline-variant`, `text-on-surface-variant`, `bg-surface-container-low`, `outline-primary`), all defined in `src/styles.css`. No CSS Module imported by `SupportPill.tsx` or the new `SiteFooter.tsx`.
- **AD-5 (route shell)** — unchanged. `App.tsx` routes + `SiteFooter` mount are untouched; `useLocation` is consumed inside the already-router-mounted footer.
- **FR-12** — satisfied in full (pillar on Post+Feed footer, no nav item, non-breaking Venmo target).
- **UX-DR-15** — `secondary-container` bg + `on-secondary-container` text + `full` radius; footer area of content pages; never a nav item; target survives Contribute de-nav.
- **NFR-1 (meaning not by color alone)** — the pill's affordance is its visible text label "Support the site"; color (`secondary-container`) is reinforcement, not the sole signal. The new-tab cue is text (`sr-only`), not behavior-only.
- **NFR-4 (touch ≥44px)** — `min-h-[44px]` on the pill; `inline-flex items-center` for vertical centering.
- **identity.ts single-source-of-truth (1.6 AC4)** — `SUPPORT_URL` added there; the Venmo string is NOT duplicated in `SupportPill.tsx` (imports it) — the AC4 grep-proof of 1.6's no-duplication invariant extends cleanly.

## Library / Framework Requirements

**Nothing new.** Reuses React 19, react-router-dom 7 (`useLocation`), Tailwind v4 + `@theme`. `package.json` unchanged.

## File Structure Requirements

- **NEW (1):** `clintonjavery/src/components/SupportPill.tsx`.
- **MODIFIED (2):** `clintonjavery/src/components/SiteFooter.tsx` (route-conditioned pill + flex layout; removed 1.7 placeholder comment), `clintonjavery/src/site/identity.ts` (added `SUPPORT_URL`).
- **UNCHANGED:** `App.tsx` routes, `TopNav.tsx`, `Feed.tsx`, `PostPage.tsx`, `src/styles.css`, `package.json`, all content, all other components/pages. `src/pages/Contribute.tsx` intentionally left for Story 2.3.

## Testing Requirements

- **No new tests.** The project tests logic only (AR-11 deferral — no RTL/jsdom render harness; `TopNav`/`SkipLink`/the prior `SiteFooter` have zero component tests). The pill is a pure presentational `<a>` with zero branching logic.
- The four ACs are each proven by a `grep` (see §Acceptance Criteria) — the build compiling the token utilities confirms the classes exist; `useLocation`-gating + the `SUPPORT_URL` identity check are the regression guards.
- Regression: `npm run build` green / `npm run lint` 0 / `npx vitest run` 110 passed.

## Previous Story Intelligence (from 1.6 / 1.7 / 2.1)

- **1.6's identity.ts single-source-of-truth** (AC4 no-duplicate grep proof) is the reason `SUPPORT_URL` lives in `identity.ts` and the pill imports it — keeping the Venmo URL in exactly one place means Contribute's de-nav can never silently orphan the target.
- **1.7's `SiteFooter.tsx` placeholder comment** (`// The support-pill (UX-DR-15) lands in 1.8.`) was the explicit deferral that made this story. It is now removed.
- **2.1's deletion pattern** (remove the dead importers when dropping a data source) is mirrored here in spirit: Contribute is *de-navved* (not deleted) — deletion deferred to 2.3 because `Contribute.tsx` shares `venmoButton` CSS with `TimeZoneConverter` and groups naturally with the 2.3 cruft sweep.
- **Story 2.2 (the `/writing/<slug>` 301 map) is still open** — finishing 1.8 closes **Epic 1**; Epic 2 resumes at 2.2.

## Git Intelligence

- **Baseline (this story):** `cea4588` (`2 - 1`). (This story was done after `2 - 1`; the epics file orders it at the end of Epic 1 but it was the one genuinely-unshipped Epic-1 piece.)
- **Changes (mine, uncommitted):**
  - **NEW:** `clintonjavery/src/components/SupportPill.tsx`
  - **MODIFIED:** `clintonjavery/src/components/SiteFooter.tsx`, `clintonjavery/src/site/identity.ts`
- **Changes in the working tree that are NOT mine (Clint's, pre-existing at kickoff, left untouched):** `clintonjavery/public/content/p/first-strip/strip.png` (modified), `clintonjavery/public/content/p/first-strip/strip_old.png` (untracked). Flagged here so the commit can stage **only** the three Story-1.8 files (`git add clintonjavery/src/components/SupportPill.tsx clintonjavery/src/components/SiteFooter.tsx clintonjavery/src/site/identity.ts`) and keep the comic-strip changes separate if desired.
- **Commit convention:** prior commits are terse (`1 - 7`, `2 - 1`); the agent leaves the commit to Clint. Suggested message: `feat(ui): story 1.8 — support-pill on content-page footer (Venmo CTA)`.
- Committing Epic 1's last story here closes the epic; the next commit convention might naturally be `1 - 8`.

## Latest Technical Information

- **`useLocation`** from `react-router-dom` 7 returns `{ pathname }` (no search); the pill gating uses `pathname` only so `/p?type=comic` still shows the pill (`pathname === '/p'`).
- **Tailwind v4 token utilities** for `@theme` CSS vars follow the pattern `bg-<token-name>` / `text-<token-name>` / `rounded-<radius-name>` — `bg-secondary-container`, `text-on-secondary-container`, `rounded-full` are all valid (compiled in the green build; also used by `Feed.tsx`).
- **`sr-only`** is Tailwind's built-in visually-hidden utility (used elsewhere in the project e.g. `ComicCardImage` `failed ? 'sr-only' : …`), so the "(opens in a new tab)" cue is reliably hidden visually + exposed to AT.

## Story Completion Status

- **Status:** `in-progress` → **`review`**.
- **Agent-done (T1–T5):** support-pill authored per UX-DR-15 tokens; wired route-conditioned into the global footer; `SUPPORT_URL` centralized in identity.ts (byte-identical to old Contribute Venmo href); build/lint/110-tests green; AC1–AC4 each grep-proven.
- **Clint's gate (to move `review` → `done`):**
  1. **Visual spot-check** — on `npm run dev`, open `/p` (Feed) and a `/p/<slug>` Post (essay + comic): confirm the pill renders in the footer (right on desktop, stacked above/below the copyright on mobile ≈320px), is the `secondary-container` tan pill with `full` radius, "Support the site" label, and opens Venmo in a new tab. Confirm NO pill on `/` and `/projects`.
  2. **Decide on the strip.png working-tree changes** (Clint's own; stage separately or revert — not part of 1.8).
  3. **Commit** (his convention) — suggested message above; stage only the three 1.8 files if keeping the strip changes separate.
- **Epic 1 is complete after this story** (the epics file's `<!-- Epic 1 complete: 8 stories … -->` marker; 1.1–1.7 already committed through `4bd14f9`/`cea4588`, 1.8 here). **Epic 2 resumes at Story 2.2** (the `/writing/<slug> → /p/<slug>` 301 map — whose authoritative old→new slug table was captured in `2-1-migrate-existing-essay-posts.md`).

---

## Dev Agent Record

### Agent Model Used

Amelia (Senior Software Engineer). Model: Claude (Anthropic). Date: 2026-08-08.

### Debug Log References

- **Kickoff: confirmed 1.8 was the genuinely-unshipped Epic-1 piece.** No `1-8-*` artifact; `SiteFooter.tsx` still carried `// The support-pill (UX-DR-15) lands in 1.8.`; all of 1.1–1.7 was in `4bd14f9`. So this story is real work, not a no-op.
- **The "Contribute/Venmo destination" had to be the Venmo URL, not `/contribute`.** `grep` showed `/contribute` has NO route in `App.tsx` (only `/`, `/p`, `/p/:slug`, `/projects*`) and no nav item in `TopNav` — so a pill href of `/contribute` would SPA-fallback to the Landing, actively *breaking* the target. The AC4 intent ("dropping Contribute from nav does not break the Support link target") only holds if the pill points at the external destination the Contribute page stood in front of → `https://venmo.com/u/clintonjavery` (verified byte-identical to `Contribute.tsx` line 8). Centralized as `SUPPORT_URL` in `identity.ts` so AC4 survives any future Contribute-page deletion.
- **Scope choice: footer landmark (route-conditioned) over a content-area strip.** The epics footer note ("footer carries identity + copyright + the support-pill") puts the pill in the `<footer>` landmark, not as an extra strip inside `Feed`/`PostPage`. Going route-conditioned in the global `SiteFooter` is the DRY reading that also scopes to content pages (UX-DR-15) and stays out of Epic 3's Landing footer-narrative section. Cost is one `useLocation` call (SiteFooter is router-mounted), within AD-5.
- **No new test.** The codebase tests logic only (`feed-utils`, `postPage-utils`, `validate`, `head-meta`, `sitemap`, `site-utils` — 6 files, 110 tests; zero RTL/render). `TopNav`/`SkipLink`/the prior `SiteFooter` have no component tests. A pure presentational `<a>` has no logic to unit-test. ACs proven by grep + green build.
- **Why not delete `Contribute.tsx` here.** It is un-routed + un-imported (dead), but AC3 is about routes/nav, not files; `venmoButton` CSS is shared with `TimeZoneConverter.tsx`; and `Contribute.tsx` groups with the 2.3 cruft sweep (`/reading`, `/gallery`, BalloonPopper, `*~` editor). Scope discipline → leave for 2.3.
- **Left Clint's strip.png changes alone.** `public/content/p/first-strip/strip.png` (M) + `strip_old.png` (??) were in the working tree at kickoff — not from 1.8 (the build never touches content images). Recorded so the commit stages only the three 1.8 files.

### Completion Notes List

- **`SupportPill.tsx`** — new presentational `<a>`: `rounded-full bg-secondary-container text-on-secondary-container`, `min-h-[44px]`, focus ring, `target=_blank rel=noopener noreferrer`, label "Support the site" + `sr-only` "(opens in a new tab)"; `href={SUPPORT_URL}` from `identity.ts`.
- **`SiteFooter.tsx`** — flex footer; `<SupportPill />` rendered iff `pathname === '/p' || pathname.startsWith('/p/')`; identity + copyright always present; placeholder comment removed.
- **`identity.ts`** — `SUPPORT_URL = 'https://venmo.com/u/clintonjavery'` added (matches the old Contribute page href exactly → AC4).
- **No route/nav change** — AC3 holds (no `/support` or `/contribute` route/nav item); `App.tsx` and `TopNav.tsx` untouched.
- **Regression:** build green (1.84s), lint 0, 110 tests pass; `package.json` unchanged.

### File List

**NEW (1):** `clintonjavery/src/components/SupportPill.tsx`
**MODIFIED (2):** `clintonjavery/src/components/SiteFooter.tsx`, `clintonjavery/src/site/identity.ts`
**UNCHANGED:** `App.tsx`, `TopNav.tsx`, `Feed.tsx`, `PostPage.tsx`, `styles.css`, `package.json`, all content, all other components/pages. `src/pages/Contribute.tsx` left for Story 2.3.

### Change Log

- 2026-08-08 — Story 1.8 implemented (Epic 1's final story). Kicked off after Clint committed Story 2.1 (`cea4588 2 - 1`) and asked to "step back and finish up story 1.8 to close out epic 1." Confirmed 1.1–1.7 shipped, 1.8 unstarted (`SiteFooter` placeholder). Authored `SupportPill` per UX-DR-15 tokens, wired route-conditioned into the global footer, centralized the Venmo target in `identity.ts` (byte-identical to the de-routed Contribute page). Build/lint/110-tests green; AC1–AC4 grep-proven. Status `review`. Flagged and left untouched Clint's in-tree comic-strip changes. Closing 1.8 completes Epic 1; Epic 2 resumes at 2.2.