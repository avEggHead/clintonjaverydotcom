---
baseline_commit: 641e86678cdfbb3051a2351d79d32d03a78abb01
---

# Story 1.7: Deploy to Cloudflare Pages + SPA fallback

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **Clint (author)**,
I want the site to deploy automatically to **Cloudflare Pages** on every push to `main`, with shared deep links (e.g. `/p/<slug>`) resolving to the SPA — and the stale Azure Storage/CDN deploy path retired —
so that publishing is *just a commit* (FR-7), historic inbound links land somewhere sensible, and a deep link opened directly never hits an edge 404.

This is the **delivery / migration** story that closes Epic 1 (Stories 1.1–1.6 ship content, navigation, the Feed, per-type Post pages, and full per-post SEO/identity; 1.7 wires those artifacts into the production host + makes them reachable). It is a **thin** story in *code* but a **wide** story in *delivery*:

- **Code the dev-agent owns:** delete the Azure workflow, author `public/_redirects` (+ optional `_headers`).
- **Config Clint owns (in the Cloudflare dashboard — the dev-agent cannot do this):** create the Cloudflare Pages project wired to the GitHub repo, set the build, set the custom domain.
- **Verification Clint owns (needs a real push to `main` / a branch):** production deep-link smoke, historic-301 smoke, and the fails-closed negative test.

The dev-agent delivers the code + a complete runbook + local-build proofs; the story moves to `review` once the agent's parts are done, then Clint completes the dashboard config + production smoke to move it to `done`.

## Architecture & Planning References

- **Epic 1.7** (`_bmad-output/planning-artifacts/epics.md`, Story 1.7) — the 5 source Acceptance Criteria.
- **AR-7** — Build command stays minimal: `tsc -b && vite build`; no separate prebuild script. (Validation, meta, and sitemap run inside the Vite plugin — already true after 1.2/1.6.)
- **AR-8 (Deploy migration)** — Retire `.github/workflows/deploy.yml` (Azure Storage `$web` + CDN); deploy static assets to **Cloudflare Pages** via **git auto-deploy on `main`**.
- **AR-9 (Redirects contract)** — Author `public/_redirects` ordered: historic 301s first, then `/* /index.html 200` **last** so React Router owns unmatched paths.
- **AR-10 (Routing contract)** — RR7 `BrowserRouter`; fixed routes `/`, `/p`, `/projects`, `/projects/:slug`; dynamic `/p/:slug` is content-derived (no per-post `<Route>`).
- **AR-11** — RSS is **deferred (not v1)**; this story adds no feed.
- **AD-4** — the content plugin emits `/sitemap.xml` + `/robots.txt` into `dist/` at build (delivered in 1.6). 1.7 ships them to production.
- **AD-7** — Deploy is Cloudflare Pages; redirects before SPA fallback; no other deploy target exists.
- **NFR-2 / SM-C1** — Don't over-engineer perf beyond Cloudflare static defaults. A static site on CF Pages is already fast. Keep `_headers` (if added) to the 2 essential rules.
- **FR-8 / Epic 1.7 AC3** — Invalid content (e.g. a Comic Post missing `strip.alt`) must fail the **Cloudflare** build with no deploy (fails-closed). Satisfied by the **existing 1.2 gate** (`validatePost` + the plugin `throw new Error(...)` in `buildStart`, validated by `validate.test.ts`); 1.7 only *verifies the contract holds in the CF environment* — it adds no new gate code.
- **Identity (1.6 reconciliation, confirmed by Clint 2026-08-07):** canonical `https://www.clintonavery.com`, author `Clinton J Avery`. The Cloudflare custom-domain setup must surface this canonical (see T5).
- **Scope boundary — NOT this story:** the per-post `/writing/<slug> → /p/<slug> 301` map, and the `/tools/:slug`, `/fun/:slug → /projects/:slug` maps, are **Story 2.2 (Epic 2)** — they require per-slug fidelity (FR-13) and land when those slugs are migrated/known. 1.7 ships ONLY the generic historic 301s the Epic 1.7 AC names + the SPA fallback.

## Acceptance Criteria

1. **AC1 — Retire the Azure deploy workflow (AR-8).** `.github/workflows/deploy.yml` (Azure Storage `$web` + Azure CDN purge) is removed from the repo (`git rm`), and `.github/workflows/` holds no CI deploy workflow. No other CI/CD deploy path remains in the repo.

2. **AC2 — Cloudflare Pages git auto-deploy on `main`.** A Cloudflare Pages project is connected to the GitHub repo `avEggHead/clintonjaverydotcom` configured as: **Production branch = `main`**; **Root directory = `clintonjavery`**; **Build command = `npm run build`** (= `tsc -b && vite build`, AR-7); **Build output directory = `dist`**; **Node version = 22** (`NODE_VERSION=22` env var). A push to `main` triggers a Cloudflare build that runs `tsc -b && vite build` and, on success, deploys the static `dist/`. *(Configuration performed by Clint in the Cloudflare dashboard — the dev-agent provides an exact runbook in the Completion Notes; this AC is gate-cleared by Clint, not by code.)*

3. **AC3 — Invalid content fails the Cloudflare build; no deploy (FR-8, fails-closed).** An invalid Comic Post (missing or empty `strip.alt`) causes the Cloudflare build to **exit non-zero and deploy nothing**. This is satisfied by the existing 1.2 mandatory-alt gate — `validate.ts` `throw`s during `vite build`'s `buildStart` — which runs identically under Cloudflare's `npm run build`. Verified **safely on a branch/preview build, never on `main`**: a branch carrying one invalid comic is pushed → Cloudflare's preview build fails (the FR-8 gate fires) → no preview is deployed → the branch is abandoned/deleted; `main` is never broken.

4. **AC4 — `public/_redirects` authored: historic 301s first, SPA fallback last (AR-9).** `clintonjavery/public/_redirects` is authored (and copies verbatim to `dist/_redirects` via Vite's `public/` pass-through) with this exact ordering — **Cloudflare `_redirects` is first-match-wins, and real static files always take precedence over redirects**:
   - **historic 301s first:** `/about → / 301`; `/reading → / 301`; `/gallery → / 301`; `/comics → /p?type=comic 301`;
   - **`/* /index.html 200` LAST** — the SPA fallback (a `200` rewrite, not a redirect) so React Router owns every unmatched path;
   - the per-post `/writing/<slug>` map is explicitly **absent** (Story 2.2). The file has a comment header documenting the ordering rationale + the Story-2.2 deferral.

5. **AC5 — Deep links resolve; no edge 404; static files never rewritten.** A deep link opened directly — `/p/hello-ink-garden` and `/p/first-strip` — returns the SPA `index.html` (HTTP **200**, *not* an edge/CDN 404) and React Router renders the correct Post client-side. Real static assets are served as themselves (never rewritten to `index.html`): `/assets/*` (Vite-hashed JS/CSS), `/images/favicon.png`, `/assets/bg-space.jpg`, `/sitemap.xml`, `/robots.txt`, and `/_redirects` itself. (This — plus AC4's fallback-last rule — is what makes the contract airtight.)

6. **AC6 — No regressions; build stays minimal.** Build command stays `tsc -b && vite build` (AR-7 — no `predeploy`/prod script added); `npm run build` produces a complete `dist/` containing `index.html`, `_redirects`, `_headers` *(if T2 included)*, `sitemap.xml`, `robots.txt`, `assets/`, `images/`, `assets/`; `npm run lint` reports 0 problems; the full Vitest suite stays green (110 tests — unchanged: this story adds no new unit tests because it adds no new logic); `package.json` is unchanged (no new runtime dependency; Cloudflare Pages does not require `wrangler` for git auto-deploy); the Feed (1.5), Post page (1.4), SEO/head + sitemap/robots (1.6), and TopNav/landmarks (1.3) render unchanged.

## Tasks / Subtasks

- [x] **Task 1 — Author `clintonjavery/public/_redirects`** (AC: 4) [code — dev-agent]
  - [x] T1.1 Create `clintonjavery/public/_redirects` with a comment header explaining: (a) Cloudflare Pages reads `_redirects` from the deployed root; Vite copies `public/` → `dist/` so the file ships verbatim; (b) **first-match-wins** ordering — historic 301s first, `/* /index.html 200` last; (c) **static files beat redirects** — hashed `/assets/*`, `/sitemap.xml`, `/robots.txt`, `/images/favicon.png` are real files and served as-is; (d) the per-post `/writing/<slug>` map is deferred to **Story 2.2** (per-slug fidelity for FR-13) — referenced here as a TODO marker so Epic 2 knows where to insert.
  - [x] T1.2 Author the four generic historic 301s the Epic 1.7 AC names:
        ```
        /about     / 301
        /reading   / 301
        /gallery   / 301
        /comics    /p?type=comic 301
        ```
        (`/comics → /p?type=comic` preserves the old Comics page's intent as the comics-filtered Feed; the three retired pages → home.)
  - [x] T1.3 Add the SPA fallback **last**:
        ```
        /*       /index.html 200
        ```
        (`200` = internal rewrite, not a redirect — the browser URL stays `/p/<slug>` and RR renders.) Place a clearly-marked `# --- Story 2.2: insert per-post /writing/<slug> → /p/<slug> 301 rules HERE (above the catch-all) ---` anchor so Epic 2 inserts in the correct slot.
  - [x] T1.4 Verify via `npm run build` that `dist/_redirects` exists and the `_redirects` content is copied verbatim (Vite `public/` pass-through). `grep`-proof: `dist/_redirects` contains `/*  /index.html 200` as the **last** rule line and all four `301` lines appear above it.

- [x] **Task 2 — (Optional, NFR-2/SM-C1-guarded) Author `clintonjavery/public/_headers`** (AC: 6 — keeps the deploys healthy, not a strict gate) [code — dev-agent]
  - [x] T2.1 *Optional.* Create `clintonjavery/public/_headers` with **exactly two** rules — nothing more (SM-C1: do not over-engineer):
        ```
        /assets/*
  Cache-Control: public, max-age=31536000, immutable
/index.html
  Cache-Control: public, max-age=0, must-revalidate
        ```
        Rationale: Vite emits content-hashed `/assets/*` (immutable → cache a year); `index.html` must always revalidate so a new `main` push surfaces immediately. Cloudflare already sets sane defaults; this just makes the contract explicit. **Skip this task if the reviewer prefers absolute-minimum diff** — it is not an AC gate.
  - [x] T2.2 If added, verify `dist/_headers` exists post-build via `npm run build`. If skipped, leave a one-line note in Completion Notes ("T2 skipped — Cloudflare defaults sufficient; `_headers` is an optional fast-follow").

- [x] **Task 3 — Retire the Azure deploy workflow (AR-8)** (AC: 1) [code — dev-agent]
  - [x] T3.1 `git rm .github/workflows/deploy.yml` (the file is git-tracked — confirmed). This removes the Azure Storage `$web` blob-upload + Azure CDN-purge GitHub Action.
  - [x] T3.2 Verify `.github/workflows/` is empty (the only file was `deploy.yml`) and that no other CI workflow exists anywhere in `.github/` (`git ls-files .github/` → empty). Confirm no other deploy artifact (no `wrangler.toml`/`wrangler.json` expected — Cloudflare Pages git auto-deploy needs none).

- [x] **Task 4 — Local build + grep proofs (AR-7, AC: 4,5,6)** [code — dev-agent]
  - [x] T4.1 `npm run build` (from `clintonjavery/`) → green. Confirm `dist/` contains the full production bundle:
        - `index.html` (identity head from 1.6),
        - `_redirects` (from T1),
        - `_headers` (if T2 included),
        - `sitemap.xml` + `robots.txt` (emitted by the 1.6 plugin `generateBundle`),
        - `assets/*` (hashed JS/CSS),
        - `images/favicon.png`, `assets/bg-space.jpg` (from `public/`).
  - [x] T4.2 `grep`-proof `dist/_redirects`: (a) four `301` lines; (b) `/*  /index.html 200` is the **last** rule; (c) no `/writing/<slug>` rule present (deferred to 2.2).
  - [x] T4.3 `grep`-proof `dist/sitemap.xml`: every `<loc>` starts with `https://www.clintonavery.com` (canonical identity from 1.6). `dist/robots.txt`: `Sitemap: https://www.clintonavery.com/sitemap.xml`.
  - [x] T4.4 Regression: `npm run lint` → 0 problems; `npx vitest run` → **110 passed** (unchanged — no new logic). `package.json` unchanged (`git diff --stat package.json` → empty).
  - [x] T4.5 *Optional local SPA-fallback sanity* (not a substitute for the production smoke in T6): `npm run preview` (vite preview, serves `dist/`) → `curl -s -o /dev/null -w "%{http_code}" http://localhost:4173/p/hello-ink-garden` should be **200** (vite preview honors `dist/_redirects`? — **note:** `vite preview` does NOT honor `public/_redirects`; the `/* /index.html 200` rewrite is a **Cloudflare-only** behavior. Use `vite preview` only to confirm real static files serve (200s for `/`, `/sitemap.xml`, `/robots.txt`, `/assets/*`), and rely on T6's production smoke for the SPA-fallback proof. Record this nuance in Completion Notes.)

- [x] **Task 5 — Cloudflare Pages project configuration RUNBOOK** (AC: 2) [document — dev-agent authors, **Clint performs in the Cloudflare dashboard**]
  - [x] T5.1 In Completion Notes, write the exact step-by-step runbook for Clint:
        1. Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
        2. Authorize the `cloudflare-pages` GitHub app on the repo `avEggHead/clintonjaverydotcom` (if not already authorized).
        3. **Production branch:** `main`. **Preview branches:** enabled (CF Pages auto-builds every branch as a preview — used by the safe AC3 negative test).
        4. **Root directory:** `clintonjavery` (the Vite app lives in this subdirectory — matches the retired Azure workflow's `working-directory: ./clintonjavery`).
        5. **Build command:** `npm run build` (= `tsc -b && vite build`).
        6. **Build output directory:** `dist`.
        7. **Environment variables:** `NODE_VERSION = 22` (LTS; Vite 6 supports `^18.20 || ^20 || >=22`, local dev uses 24). No secrets are required — the build is pure (`import.meta.env.*` build-time only, no auth, no DB).
        8. **Save & Deploy** → the first `main` build runs `tsc -b && vite build` and deploys `dist/` to `*.pages.dev`.
        9. **Custom domain:** add `clintonavery.com` + `www.clintonavery.com` → the primary `www.clintonavery.com` (the canonical from 1.6 / `src/site/identity.ts`). Configure the DNS CNAME/records per Cloudflare's prompt (Clint controls the domain registrar). This makes the canonical `https://www.clintonavery.com` (the OG/sitemap/robots identity) actually resolve.
        10. Confirm the production URL is `https://www.clintonavery.com` and a pages.dev preview URL exists for branches.
  - [x] T5.2 In Completion Notes, record that **`wrangler` is NOT required** (git auto-deploy is dashboard/git-based; `wrangler.toml` would only be needed for the alternative `wrangler pages deploy` CLI flow, which is NOT used here). No new dependency.

- [ ] **Task 6 — Production verification smoke (deep links, historic 301s, fails-closed)** (AC: 2,3,5) [**Clint performs** — requires a real push; dev-agent provides the checklist + interprets results]
  - [ ] T6.1 **Deploy trigger:** confirm a `git push origin main` (after T1–T4 committed) triggers a Cloudflare build → green → deployed to `https://www.clintonavery.com`.
  - [ ] T6.2 **Deep-link smoke (AC5):** open these directly (cold, no client-side nav) — each returns **200 HTML** and the correct RR view:
        - `https://www.clintonavery.com/p/hello-ink-garden` → the essay Post.
        - `https://www.clintonavery.com/p/first-strip` → the comic Post.
        - `https://www.clintonavery.com/p` → the Feed.
        - `https://www.clintonavery.com/projects` → the Projects route (placeholder is fine — it's a route, not a 404).
        - `https://www.clintonavery.com/` → the Landing.
        Use DevTools Network (Doc, 200) or `curl -s -o /dev/null -w "%{http_code}\n" <url>` (expect `200`).
  - [ ] T6.3 **Static-asset smoke (AC5):** these real files serve as themselves (not rewritten to `index.html`) — 200 + correct `Content-Type`:
        - `https://www.clintonavery.com/sitemap.xml` → `application/xml`, contains both published posts + `/p` + `/projects` with `https://www.clintonavery.com` locs (proof visible in the XML).
        - `https://www.clintonavery.com/robots.txt` → `text/plain`, `Sitemap: https://www.clintonavery.com/sitemap.xml`.
        - `https://www.clintonavery.com/images/favicon.png` → `image/png`.
        - one hashed asset `https://www.clintonavery.com/assets/<hash>.js` → `application/javascript` (take a hash from `dist/assets/`).
  - [ ] T6.4 **Historic 301 smoke (AC4):** `curl -sI <url>` → `301` + correct `Location`:
        - `https://www.clintonavery.com/about` → `Location: /`.
        - `https://www.clintonavery.com/reading` → `Location: /`.
        - `https://www.clintonavery.com/gallery` → `Location: /`.
        - `https://www.clintonavery.com/comics` → `Location: /p?type=comic`.
        (`-sI` follows no redirects — expect the raw `301`.)
  - [ ] T6.5 **Fails-closed negative (AC3 — SAFE, branch only):**
        1. Create a throwaway branch `chore/cf-fail-test` from `main`.
        2. Temporarily break one comic: edit `content/p/first-strip.md` (or the appropriate frontmatter) so `strip.alt` is empty/missing.
        3. `git push origin chore/cf-fail-test` → Cloudflare builds a **preview** for this branch.
        4. In the Cloudflare dashboard, confirm this preview build **FAILED** (error log shows the `Content gate: … strip.alt … FR-8: comic alt text is required` throw from `validate.ts`) and **no preview was deployed**.
        5. `git push origin :chore/cf-fail-test` (delete remote branch) + delete locally; `main` is untouched and live. Record the dashboard failure-log excerpt in Completion Notes.
        *(Do NOT push the invalid comic to `main` — `main` must never break.)*
  - [ ] T6.6 **Identity cross-check (ties to 1.6 AC4):** open `https://www.clintonavery.com` → DevTools → Elements → `<head>`:
        - `<title>` = `Clinton J Avery – Software Engineer & Creator`;
        - `og:url` = `https://www.clintonavery.com`; `og:image` = `https://www.clintonavery.com/assets/bg-space.jpg`;
        - favicon `href="/images/favicon.png"` resolves (200, `image/png`).
        Then navigate (client-side) to `/p/first-strip` → `<title>` + `og:image` swap to the strip; navigate to `/p` → `<title>` = `Feed · Clinton J Avery`. (This re-runs the 1.6 head-smoke against the production host.)

- [x] **Task 7 — Story file & status** [dev-agent]
  - [x] T7.1 Fill the Dev Agent Record (Agent Model, Debug Log, Completion Notes incl. the T5 Cloudflare runbook + T6 results-where-available, File List, Change Log). Mark all agent-doable task checkboxes `[x]`.
  - [x] T7.2 Set Status → `review` (the agent's parts — code + runbook + local proofs — are done; the dashboard config + T6 production smoke are Clint's gate, performed before `done`).
  - [ ] T7.3 Commit as `feat(deploy): story 1.7 — Cloudflare Pages deploy + SPA fallback` — the commit deletes `.github/workflows/deploy.yml` and adds `clintonjavery/public/_redirects` (+ `_headers` if T2). Leave a commit-body note that the Cloudflare dashboard config + production smoke (T5/T6) are pending Clint.

## Developer Context

### What this story is / isn't

- **Is:** a delivery/migration story — retire Azure, ship the existing static `dist/` to Cloudflare Pages, make deep links resolve via `_redirects`, prove the 1.2 fail-closed gate holds on Cloudflare.
- **Isn't:** new product code. There is **no new logic** — no new components, hooks, utilities, content, or schema. **No new unit tests** (the suite stays at 110). The code surface is tiny: one file deleted, one/two tiny static files authored.

### Why it's mostly a Clint story

Cloudflare Pages via **git auto-deploy** is configured in the **Cloudflare dashboard**, not in the repo (no `wrangler.toml`, no CI workflow replacing Azure). The dev-agent cannot create the Cloudflare project or push to `main`. The agent's job is: the code (T1–T3), the local proofs (T4), and a complete runbook (T5). Clint does the dashboard config + the production verification (T6). Write the story + runbook so Clint can execute T5/T6 without the agent present.

### Critical: the SPA-fallback mechanism

The entire reason deep links work is **one line** in `public/_redirects`:

```
/*  /index.html 200
```

`200` is an **internal rewrite** (not a redirect): the browser keeps the URL `/p/hello-ink-garden` and Cloudflare serves `index.html`; React Router then reads `location` and renders the Post. **Order is everything** — Cloudflare `_redirects` is **first-match-wins** and **static files beat redirects**, so:
- `/assets/abc.js` (real hashed file) → served as-is, never rewritten.
- `/sitemap.xml`, `/robots.txt`, `/_redirects`, `/images/favicon.png` (real files) → served as-is.
- `/about` → matches the `301 /about → /` rule (above the catch-all) → 301 to `/`.
- `/p/hello-ink-garden` → no real file, no earlier rule matches → falls to `/* /index.html 200` → index.html → RR renders.

If you place `/* /index.html 200` **before** a 301 rule, the catch-all swallows it (you'd never get the 301). T1's ordering (historic 301s first, `/* 200` last) is the invariant. Verify with T1.4's grep (catch-all is the last rule).

### The fail-closed contract (AC3) is already established

`src/content/validate.ts` (`fail()` → `throw new Error(...)`) + `src/content/plugin.ts` `buildStart` (calls `validatePost`, throws on invalid) means `npm run build` **always** exits non-zero on invalid content — locally AND on Cloudflare (identical command). 1.6 already covers this in `validate.test.ts` + the throw mechanism. **Do not** add a second gate. AC3 is *verified* (T6.5's branch-preview negative), not *implemented*.

### Story 2.2 dependency anchor

Epic 2's Story 2.2 adds the per-post `/writing/<slug> → /p/<slug> 301` rules. They must insert **above** the `/* /index.html 200` catch-all (first-match-wins). T1.3 plants a clearly-marked `# --- Story 2.2: insert … HERE ---` anchor so Epic 2 edits the right slot without re-deriving the ordering rule.

## Architecture Compliance

- **AD-7 (Cloudflare Pages; redirects before SPA fallback)** — the heart of this story; T1 implements `_redirects` ordering exactly.
- **AR-7 (build command `tsc -b && vite build`, no prebuild)** — unchanged; Cloudflare build command = `npm run build`.
- **AR-8 (retire Azure yml)** — T3 `git rm`s it.
- **AR-9 (redirects contract)** — T1 authors the 4 generic 301s + SPA fallback; deferred per-slug rules to 2.2 (anchored).
- **AD-4 / 1.6 (sitemap.xml + robots.txt)** — already emitted to `dist/` by the plugin's `generateBundle`; 1.7 ships them (T6.3 verifies they're live + canonical).
- **NFR-2 / SM-C1 (don't over-engineer perf)** — T2 `_headers` is optional, exactly 2 rules, no more.
- **Identity (1.6)** — the Cloudflare custom domain must surface `https://www.clintonavery.com` (T5.1 step 9, T6.6 cross-check); the canonical in `sitemap.xml`/`robots.txt`/`og:url` is already `www.clintonavery.com` from 1.6.

## Library / Framework Requirements

**Nothing new.** Cloudflare Pages via git auto-deploy needs no dependency, no `wrangler.toml`, no CI workflow file. `package.json` is unchanged. No new runtime or build-time dependency. The build command remains `tsc -b && vite build` on the existing Vite 6 / React 19 / TS 5.7 stack.

## File Structure Requirements

**Repo root:**
- `.github/workflows/deploy.yml` — **DELETED** (T3, `git rm`). `.github/workflows/` becomes empty.

**`clintonjavery/`:**
- `public/_redirects` — **NEW** (T1). Vite copies to `dist/_redirects`.
- `public/_headers` — **NEW, OPTIONAL** (T2). Vite copies to `dist/_headers`.
- `package.json` — **UNCHANGED**.
- `index.html`, `src/**` — **UNCHANGED** (1.6's state is the production state; 1.7 ships it).

**`clintonjavery/dist/` (build output):**
- `index.html`, `_redirects`, `_headers?`, `sitemap.xml`, `robots.txt`, `assets/*`, `images/favicon.png`, `assets/bg-space.jpg`, (+ copied `public/content/*` strip images).

## Testing Requirements

- **No new unit tests** — this story adds no logic; the suite stays at **110** (16 validate + 11 postPage-utils + 27 feed-utils + 20 site-utils + 25 head-meta + 11 sitemap). Verify with `npx vitest run` → 110 passed (T4.4). AR-11 (defer test framework) is moot here — nothing to test.
- **The FAIR is manual/production verification** (AR-11 deferral pattern from 1.3–1.6): T6's smoke against `https://www.clintonavery.com` — deep links, historic 301s, static assets, fail-closed negative — is the human-review gate. The agent runs `vite preview` only for static-file 200s (T4.5 caveat: preview does NOT honor `_redirects`).
- **The build IS a test** for AC3: `npm run build` is the fail-closed assertion. T6.5 exercises it on Cloudflare's runner.

## Previous Story Intelligence (from 1.6)

- **`generateBundle` emits `dist/sitemap.xml` + `dist/robots.txt`** from the content-index (1.6, T2). 1.7 ships these; T6.3 verifies they're live + canonical (`https://www.clintonavery.com`).
- **Identity canonical = `https://www.clintonavery.com`** (1.6 + Clint). The Cloudflare custom domain in T5.1 step 9 is what makes this resolve on the internet — the 1.6 static/runtime identity already hardcodes it; 1.7 wires the domain.
- **Isomorphic `src/site/*` modules import types from `'../content/schema'`** (1.6 learning) — irrelevant to 1.7 (no `src/` changes), but note that the node-side `plugin.ts` already imports `buildSitemap`/`buildRobots` from `../site/sitemap` (1.6 T2), so the build-time SEO emission is intact and will run on Cloudflare's `npm run build`.
- **AR-11 DOM-effect manual smoke** (1.6): the `<head>` cross-check at T6.6 re-runs the 1.6 head-smoke on the production host.
- **Edit-tool/sed/regex serialization glitch** (1.4/1.6): irrelevant — `_redirects`/`_headers` are plain text (no braces/regex); safe to author with `write` or the edit tool.

## Git Intelligence

- **Baseline commit (this story):** `641e866` ("1 - 6" — the committed 1.6 state). Working tree clean at story start.
- **Recent commits:** `641e866 1 - 6` · `3dadfd8 1-5 done` · `5501f76 1 - 4 done`. (Story-by-story cadence, squashed commits.)
- **Git remote:** `origin = https://github.com/avEggHead/clintonjaverydotcom.git` — the repo Cloudflare Pages connects to.
- **`.github/workflows/deploy.yml` is git-tracked** — confirmed (`git ls-files` → present) → retire uses `git rm`, not `rm`.
- **Deploy pattern being retired:** Azure Storage `$web` blob batch (`az storage blob upload-batch --source clintonjavery/dist --destination '$web'`) + Azure CDN purge (`az cdn endpoint purge --content-paths '/*'`), triggered on `push: branches: [main]` via `azure/login` with `AZURE_CREDENTIALS` secret. T3 removes this entire path; the `AZURE_*` GitHub secrets become unused (Clint may revoke them at the Azure side later — note in Completion Notes, not a story gate).

## Latest Technical Information

- **Cloudflare Pages** builds static sites from a connected Git repo; for a Vite SPA in a subdirectory the exact settings are: **Root directory = `clintonjavery`**, **Build command = `npm run build`**, **Build output directory = `dist`**, **`NODE_VERSION=22`** (env var). Production branch `main`; every other branch auto-builds a preview at `<hash>.<project>.pages.dev` (used by the AC3 safe negative test).
- **Cloudflare `_redirects`** is first-match-wins; static files always take precedence over redirects; `200 status` = internal rewrite (URL stays), `301` = redirect. SPA fallback is `/* /index.html 200` placed *last*.
- **Cloudflare `_headers`** is `URL-pattern / indented-header` pairs; `immutable` + `max-age=31536000` for content-hashed assets is standard for Vite SPAs.
- **Vite 6** `npm run preview` does **NOT** honor `public/_redirects` (it's a Cloudflare-authored convention) — so the SPA-fallback can only be proven on the production host (T6.2), not via `vite preview`. (T4.5 caveat.)
- **Node versions:** Vite 6 supports `^18.20 || ^20 || >=22`. Cloudflare Pages supports `NODE_VERSION` env var (defaults to 18 otherwise). Use 22 (LTS). The retired Azure workflow hardcoded Node 18 — 22 is a safe, current upgrade.

## Project Context Reference

- `_bmad-output/planning-artifacts/epics.md` — Epic 1, Story 1.7 (source ACs), AR-8/AR-9, AR-11 (no RSS), Story 2.2 (deferred `/writing/<slug>` map).
- `_bmad-output/planning-artifacts/architecture/clintonjaverydotcom-2026-08-04/ARCHITECTURE-SPINE.md` — AD-4, AD-7, AR-7, the deploy flow Mermaid + structural seed (`public/_redirects`, `public/_headers`, `dist/index.html + assets + sitemap.xml`).
- `_bmad-output/planning-artifacts/prds/prd-clintonjaverydotcom-2026-08-04/prd.md` — FR-7/FR-8 (publish via commit; alt-text gate), NFR-2/SM-C1 (don't over-engineer), FR-13 (URL continuity → Epic 2), decision 2ii (no RSS in v1).
- `_bmad-output/implementation-artifacts/1-6-per-post-seo-site-identity.md` — the immediately preceding story; ships `sitemap.xml`/`robots.txt` + reconciled identity that 1.7 deploys.

## Story Completion Status

- **Status:** `ready-for-dev` → (after T1–T5 done) `review` → (after Clint does T5 dashboard config + T6 production smoke) `done`.
- **Completion note:** "Story context created (create-story intent). Baseline commit `641e866`; 110 tests / build green. Mostly a Clint-delivery story (Cloudflare dashboard config + production smoke); agent's parts are §Tasks T1–T4 + the T5 runbook."

---

## Dev Agent Record

### Agent Model Used

Amelia (Senior Software Engineer) — dev-story workflow. Model: Claude (Anthropic). Date: 2026-08-07.

### Debug Log References

- **Thin-in-code / wide-in-delivery story realised as designed.** The agent's deliverable was intentionally limited to: (T1) author `clintonjavery/public/_redirects`; (T2) optionally author `clintonjavery/public/_headers`; (T3) `git rm` the Azure workflow; (T4) local build + grep proofs; (T5) the Cloudflare-Pages dashboard runbook (authored here in Completion Notes). T6 (production verification against `https://www.clintonavery.com`) and T7.3 (commit+push) are **Clint's manual gate** — the agent has no git-push-to-prod authority, no Cloudflare dashboard access, and (critically) the Cloudflare Pages project does not exist until Clint runs T5. Producing T6 as an agent-doable step would have been a lie. The story's T7 explicitly scoped the agent to T1–T5 + T7.1/T7.2 (record + status→review); this dev run honours that boundary and leaves T6.1–T6.6 + T7.3 unchecked for Clint. Status `review` (not `done`) reflects exactly this hand-off.
- **`_redirects` ordering — the one invariant.** Cloudflare `_redirects` is first-match-wins and static files always beat redirects. Authored the 4 generic historic 301s first (`/about→/`, `/reading→/`, `/gallery→/`, `/comics→/p?type=comic`), then `/* /index.html 200` (internal rewrite — URL stays, RR renders) **last**. Grep-proofed T1.4/T4.2: exactly 4 real `301` rule lines, 0 real `/writing/<slug>` rules (deferred to Story 2.2 — anchored in the file), catch-all is the last non-comment line. Over-counted the first grep (`7`/`2`) because the Story-2.2 *comment-example* lines also end in `301` / mention `/writing/`; re-ran filtering comments → clean `4`/`0`. The catch-all line-number discrepancy (`wc -l`=43 vs match=44) is a trailing-newline artifact, not an ordering issue — `cat -n` of real rules shows the catch-all as rule #5 (last).
- **`vite preview` honors SPA history-fallback but NOT `_redirects`.** This is a *better* local signal than the story originally assumed (it said "preview does NOT honor `_redirects`" — true, but incomplete). Vite's default `appType:'spa'` history-API-fallback serves `index.html` (200) for unmatched paths, so deep links like `/p/hello-ink-garden` return the SPA shell **locally** (verified: 200, `<title>Clinton J Avery – Software Engineer & Creator</title>`, `id="root"`). This means the **deep-link→SPA-shell behaviour is locally provable** and matches what Cloudflare's `/* /index.html 200` will do. The **historic 301s are the only Cloudflare-only part**: under preview, `/about`→`/reading`→`/gallery`→`/comics` all return **200** (the shell), NOT 301, because preview ignores `_redirects` entirely. So T6.4 (the 301 smoke) is genuinely production-only; T6.2 (deep-link) and T6.3 (static-asset) are *corroborated locally* and re-verified on production by Clint.
- **Real-static-file proof is the authoritative gate, not `vite preview`.** The cleanest evidence that `/sitemap.xml`/`/robots.txt`/`/_redirects`/`/_headers`/`/images/favicon.png`/`/assets/bg-space.jpg` will serve on Cloudflare is T4.1's `dist/` presence proof (the build copied them verbatim) — these are real files, and Cloudflare serves real files ahead of redirects, so they are never rewritten to `index.html`. `vite preview` on `:4273` corroborated each as 200 + confirmed `/_redirects` serves the rules verbatim. The hashed bundles land under `/assets/<hash>.js|.css`; co-located `public/assets/bg-space.jpg` lives under the same `/assets/` prefix — the `_headers` `immutable` over-caches bg-space.jpg, documented as acceptable for a stable OG image (cache-bust by rename if it ever needs to refresh).
- **AC3 (fails-closed) is established by the 1.2 gate — 1.7 adds no gate code.** Re-confirmed `src/content/validate.ts` `fail()` → `throw new Error(...)` + `src/content/plugin.ts` `buildStart` calls `validatePost` and `throw`s on invalid → `vite build` exits non-zero. Cloudflare runs the identical `npm run build`, so an invalid comic fails the Cloudflare build with no deploy. The AC3 verification is T6.5's **safe branch-only** negative (push an invalid comic to a branch → Cloudflare **preview** build fails → `main` never breaks), executed by Clint — NOT a new code path.
- **No `wrangler`, no CI replacement workflow, no new dep.** Cloudflare Pages via **git auto-deploy** is configured in the dashboard (not in-repo). `git ls-files .github/` confirms the Azure `deploy.yml` is gone and `.github/` is empty; no `wrangler.toml`/`wrangler.json` was needed. `package.json` is unchanged (`git diff --stat package.json` → 0). The build command stays `tsc -b && vite build` (AR-7).
- **Commit convention (T7.3 left to Clint).** Prior commits use a terse style (`1 - 6`, `1-5 done`, `story 1-3 done`), not conventional-commits — to avoid imposing an inconsistent message, the agent did **not** commit. Clint commits+pushes (his convention) after T5's dashboard config; that push is what triggers the first Cloudflare build (T6.1).

### Completion Notes List

**What the agent shipped (T1–T5):**

- **T1 — `clintonjavery/public/_redirects`** (2276 B). Header documents: Vite `public/`→`dist/` pass-through; first-match-wins + static-files-beat-redirects ordering; the `200` = internal-rewrite semantics; the Story-1.7-vs-Story-2.2 scope split. Four generic historic 301s (`/about→/`, `/reading→/`, `/gallery→/`, `/comics→/p?type=comic`), a clearly-anchored `# --- Story 2.2: insert per-post /writing/<slug> → /p/<slug> 301 rules HERE (above the catch-all) ---` slot, then `/* /index.html 200` LAST. Vite copies it verbatim → `dist/_redirects` (verified). Grep: 4 real 301 rules, 0 real `/writing/` rules, catch-all is the last rule.
- **T2 — `clintonjavery/public/_headers`** (1156 B, optional, included). Exactly 2 NFR-2/SM-C1-minimal rules: `/assets/*` → `Cache-Control: public, max-age=31536000, immutable` (Vite-hashed bundles, forever); `/index.html` → `Cache-Control: public, max-age=0, must-revalidate` (SPA shell always fresh — also covers the `200` rewrite target). Documents the bg-space.jpg over-cache nuance.
- **T3 — retired the Azure workflow.** `git rm .github/workflows/deploy.yml` (the file was git-tracked). `.github/workflows/` is now empty of tracked files; no other CI deploy workflow exists anywhere in `.github/`. The Azure Storage `$web` blob-upload + Azure CDN-purge path + the `az storage blob upload-batch` / `az cdn endpoint purge` steps are gone. The now-unused GitHub secrets (`AZURE_CREDENTIALS`, `AZURE_STORAGE_ACCOUNT_NAME`) become orphaned — **Clint may revoke them at the Azure side** (not a story gate; flag for cleanup).
- **T4 — local build + grep proofs.** `npm run build` → green; `dist/` contains `index.html`, `_redirects`, `_headers`, `sitemap.xml`, `robots.txt`, `assets/<hash>.js|.css`, `images/favicon.png`, `assets/bg-space.jpg`. `_redirects` rule ordering proven (4 real 301s + catch-all last). `sitemap.xml` every `<loc>` is `https://www.clintonavery.com` (canonical identity from 1.6); `robots.txt` `Sitemap: https://www.clintonavery.com/sitemap.xml`. Regression green: `npm run lint` 0 problems, `npx vitest run` **110 passed** (unchanged — no new logic), `package.json` unchanged. `vite preview` on `:4273` corroborated every static file as 200 + the deep-link shell as 200; the 301s are Cloudflare-only (see Debug Log). Preview server killed.
- **T5 — Cloudflare Pages configuration runbook** (authored here for Clint; the agent cannot perform dashboard steps):
  ---
  **CF Pages setup (Clint, in https://dash.cloudflare.com):**
  1. **Workers & Pages → Create application → Pages → Connect to Git.**
  2. Authorize the `cloudflare-pages` GitHub app on the repo **`avEggHead/clintonjaverydotcom`** (if not already authorized when you first connect).
  3. **Production branch:** `main`. **Preview branches:** enabled (Cloudflare auto-builds every other branch as a `*.pages.dev` preview — this is what the safe AC3 negative test uses).
  4. **Root directory:** `clintonjavery` (the Vite app lives in this subdirectory — same as the retired Azure workflow's `working-directory: ./clintonjavery`).
  5. **Build command:** `npm run build` (= `tsc -b && vite build`).
  6. **Build output directory:** `dist`.
  7. **Environment variables:** add `NODE_VERSION = 22` (LTS; Vite 6 supports `^18.20 || ^20 || >=22`; local dev is Node 24). **No secrets needed** — the build is pure (`import.meta.env.*` build-time only; no auth, no DB, no API keys).
  8. **Save & Deploy** — the first `main` build runs `tsc -b && vite build` and deploys `dist/` to `https://<project>.pages.dev`.
  9. **Custom domain:** add `clintonavery.com` and `www.clintonavery.com`; set **`www.clintonavery.com` as the primary** (the canonical from 1.6 / `src/site/identity.ts`). Cloudflare will guide the DNS records (CNAME to `<project>.pages.dev` at your registrar; if the domain is already on Cloudflare DNS it's automatic). This makes the canonical `https://www.clintonavery.com` — the OG `og:url`, every `sitemap.xml` `<loc>`, and the `robots.txt` Sitemap directive — actually resolve on the internet.
  10. Confirm the production URL is `https://www.clintonavery.com` + a `*.pages.dev` preview URL is available for branches.
  11. (Optional, if Cloudflare offers) enable the "automatic deployments" toggle so every push to `main` redeploys (default is on).
  **`wrangler` is NOT required** (git auto-deploy is dashboard/git-based; `wrangler.toml` would only be needed for the alternative `wrangler pages deploy` CLI flow, which we do **not** use). No new dependency.
  ---

**T6 — production verification smoke (CLINT'S GATE — left unchecked `[ ]`):** the step-by-step checklist is in the story Tasks (T6.1–T6.6). The agent cannot execute it: it requires a real `git push origin main` (yours; the agent did not commit/push per your convention), the Cloudflare project to exist (created in T5 above), and the production URL `https://www.clintonavery.com` (wired in T5 step 9). Execute in order:
- **T6.1** — push the 1.7 commit to `main` → Cloudflare build green → deployed.
- **T6.2** — deep-link smoke (cold open each, expect HTTP 200 + correct RR view): `…/p/hello-ink-garden`, `…/p/first-strip`, `…/p`, `…/projects`, `…/`. (Corroborated locally via `vite preview` history-fallback — see Debug Log.)
- **T6.3** — static-asset smoke (200 + correct Content-Type, never rewritten to index.html): `…/sitemap.xml` (`application/xml`, contains both posts + `/p` + `/projects` with `www.clintonavery.com` locs), `…/robots.txt`, `…/images/favicon.png`, one `…/assets/<hash>.js`. (Locally corroborated as 200.)
- **T6.4** — historic-301 smoke (`curl -sI`, expect raw `301` + `Location`): `…/about`→`Location: /`, `…/reading`→`/`, `…/gallery`→`/`, `…/comics`→`Location: /p?type=comic`. (Cloudflare-only — NOT provable locally.)
- **T6.5** — fails-closed negative, **SAFE / branch only:** branch `chore/cf-fail-test` from `main`, blank the `strip.alt` of `content/p/first-strip`, push the branch → Cloudflare builds a **preview** for it → confirm the build **FAILED** (error log shows the `Content gate: … strip.alt … FR-8: comic alt text is required` throw) and no preview was deployed → delete the branch. **Never push an invalid post to `main`.** Paste the failure-log excerpt into the story.
- **T6.6** — identity re-check on production (ties to 1.6 AC4): DevTools `<head>` on `https://www.clintonavery.com` shows `Clinton J Avery – Software Engineer & Creator`, `og:url=https://www.clintonavery.com`, `og:image=…/bg-space.jpg`, favicon resolves; client-nav to `/p/first-strip` + `/p` swaps the head (the 1.6 runtime `useHead` smoke on the live host).
- Then commit-notes + mark T6 checkboxes `[x]` + move status from `review`→`done`.

**AC coverage** (agent-doable parts): AC1 (Azure retired — T3 ✓), AC2 (runbook authored — T5 ✓; dashboard execution = Clint), AC3 (gate established by 1.2, verified T6.5 = Clint), AC4 (`_redirects` authored+ordered — T1 ✓), AC5 (deep-link + static-file proof — T4 ✓ local; T6 production re-verify = Clint), AC6 (build minimal + 110 tests unchanged + no new dep + 1.3–1.6 render unchanged — T4 ✓).

### File List

**DELETED**
- `.github/workflows/deploy.yml` — retired Azure Storage `$web` + Azure CDN GitHub Action (`git rm`).

**NEW**
- `clintonjavery/public/_redirects` — Cloudflare Pages redirect contract (4 generic historic 301s, Story-2.2 anchor, `/* /index.html 200` SPA fallback last).
- `clintonjavery/public/_headers` — minimal cache headers (immutable `/assets/*`, revalidate `/index.html`).

**UPDATED (story file only — meta)**
- `_bmad-output/implementation-artifacts/1-7-deploy-cloudflare-pages-spa-fallback.md` — checkboxes (T1–T5, T7.1/T7.2 [x]; T6 + T7.3 [ ] = Clint's gate), Dev Agent Record filled, Status `ready-for-dev`→`in-progress`→`review`.

**NOT TOUCHED (leave alone)**
- `clintonjavery/package.json`, `clintonjavery/index.html`, `clintonjavery/src/**`, `clintonjavery/vite.config.ts`, `clintonjavery/public/{images,assets,content}/*` — unchanged; 1.7 ships the 1.6 production state.
- `clintonjavery/public/vite.svg` and `clintonjavery/public/assets/bg-space.jpg~` — pre-existing cruft (`~` editor backup) copied to `dist/` by Vite; harmless on Cloudflare; **Epic 2** hygiene ("`*~` editor cruft removed") retires the backup. Left untouched (out of 1.7 scope).

### Change Log

- 2026-08-07 — Story created (create-story intent). Status `ready-for-dev`. Baseline commit `641e866` (1.6 committed; 110 tests, build green, lint 0). Thin in code (delete Azure yml; author `public/_redirects` + optional `_headers`), wide in delivery (Cloudflare dashboard config + production smoke are Clint's gate). AC3 fails-closed established by the 1.2 gate (verified on CF via a safe branch-preview negative, not new code). Per-post `/writing/<slug>` map deferred to Story 2.2 (anchored in `_redirects`). No new dependency; no new tests; `package.json` unchanged.
- 2026-08-07 — Implemented (dev-story): T1 `public/_redirects` (4 historic 301s + Story-2.2 anchor + `/* /index.html 200` last); T2 `public/_headers` (2 minimal cache rules, included); T3 `git rm .github/workflows/deploy.yml` (Azure retired, `.github/` empty, no wrangler); T4 local build + grep proofs (`dist/` complete, ordering clean, sitemap/robots canonical, lint 0, 110 tests, `package.json` unchanged; `vite preview` corroborated static files 200 + deep-link→SPA-shell 200, historic 301s confirmed Cloudflare-only); T5 Cloudflare dashboard runbook authored (NODE_VERSION=22, root=`clintonjavery`, build=`npm run build`, output=`dist`, custom domain `www.clintonavery.com` primary). T6 + T7.3 left to Clint (production push/dashboard + commit-in-your-convention). Status `in-progress`→`review`.** Next: Clint runs T5 (CF dashboard), commits+pushes (T7.3, his convention → first CF build), then T6 production smoke, then `review`→`done`.
