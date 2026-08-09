---
baseline_commit: edfda00 epic 1 complete 1.8 done
---

# Story 2.2: Historic redirect map for migrated post URLs

Status: review

## Story

As a **reader with an old `/writing/<slug>` link (or a search engine)**,
I want it to resolve to the new `/p/<slug>`,
So that no previously-indexed post 404s.

**Epic 2, Story 2.2** (`_bmad-output/planning-artifacts/epics.md`, Story 2.2) — covers **FR-13**'s URL-continuity half: turns the old `/writing/<slug>` catalogue into Cloudflare Pages 301s landing on the new `/p/<slug>` posts, so previously-indexed inbound links redirect instead of blank-paging. The **slug fidelity** it needed landed in Story 2.1 (the authoritative old→new slug table in `2-1-migrate-existing-essay-posts.md`); this story consumes that table. It edits ONLY `clintonjavery/public/_redirects` (the routing contract AR-9 / Story 1.7 ship) — no app code.

## ⚠ Legacy-route audit surfaced gaps NOT covered by this story (flagged for your decision)

While verifying the 15 sources, I diffed the **legacy live routing** (commit `64ead59`, the head just before the Epic-1 rewrite) against the current `App.tsx` + the existing `_redirects`. Three legacy routes are NOT redirected and would therefore hit the SPA fallback (`/* /index.html 200`) and render **blank** (RR7 has no catch-all `<Route path="*">`, so an unmatched path renders `null`, not the Landing):

1. **`/writing` (bare — the legacy Writing *list* page)** → **I ADDED this** as `/writing /p 301` in the generic 1.7 block. It is the parent of the 15 per-slug rules and clearly renames to the Feed; leaving it out would blank-page the indexed index URL. (Flagged here only for visibility — it is in the diff.) **Unambiguous target (`/p`); added.**
2. **`/support` (legacy Contribute page; `64ead59` had `Route path="/support" → Contribute`)** → **NOT redirected; FLAGGED.** The target is *ambiguous* because of Story 1.8's scoping: the `support-pill` renders only on `/p` and `/p/:slug` (not on `/`). So `/support → /` would land the user on a page *without* the Support CTA visible in its footer, while `/support → /p` lands on the Feed (where the pill IS visible) but is semantically odd. Options:
   - `/support /p 301` (Feed — the nearest page where the pill shows), or
   - `/support / 301` (home — the "renamed everything-is-home" convention of `/about` `/reading` `/gallery`), or
   - re-scope the `support-pill` to the global footer (then `/support / 301` makes sense), or
   - accept the blank page (low-traffic legacy route).
   This is genuinely a product call, so I did NOT add it silently — **your call**. Recommend folding the decision into Story 2.3 (hygiene) or a 1.8 follow-up. See §Open question.
3. **`/fun` and `/tools` (+ their `/fun/<slug>` / `/tools/<slug>` sub-routes, incl. `/tools/timezone`, `/tools/textanalyzer`, `/tools/effortestimator`, `/tools/unitconverter`, `/fun/balloon-popper`, `/fun/balloon-popperv2`)** → **deferred to Epic 4** (the Projects migration / FR-9), exactly as the existing `_redirects` comment already records (`/tools/<slug> → /projects/<slug>` and `/fun/<slug> → /projects/<slug>` "when the Projects migration lands"). These legacy routes also blank-page today and are out of 2.2 scope; tracked for Epic 4. (2.3 first collapses the two `BalloonPopper` implementations to one, so the `balloon-popperv2` legacy URL has no v2 to even redirect to until then.)

The beer legacy route inventory (`64ead59`): `/`, `/projects`, `/comics`, `/writing`, `/writing/:slug`, `/reading`, `/gallery`, `/fun`, `/tools`, `/tools/*`, `/support`, `/about`, `/fun/balloon-popper(s|v2)`. Coverage now: `/`(Landing ✓), `/projects`(✓), `/reading` `/gallery` `/about` `/comics`(1.7 301s ✓), `/writing` + `/writing/:slug`(2.2 301s ✓), `/support`(❗ flagged), `/fun*` `/tools*`(Epic 4).

## Acceptance Criteria (from epics.md Story 2.2) + status

1. **AC1 — Given the export of prior `/writing/<slug>` URLs, when authoring `public/_redirects`, then a `301 /writing/<slug> → /p/<slug>` rule is added for each migrated slug, positioned above the `/* /index.html 200` catch-all from Story 1.7.** ✓ — 15 rules added in the `# --- Story 2.2 …` block, which sits between the generic 1.7 block and the SPA fallback (verified by reading the file). Source = the prior live `/writing/<slug>` for each of the 15 migrated essays; destination = the new kebab slug = its `content/p/<slug>.mdx` filename. **Every 301 destination maps to a real `content/p/<slug>.mdx`** (cross-checked programmatically). Positioned strictly above `/* /index.html 200`. (FIRST-MATCH-WINS respected: the 15 `/writing/<x>` sources are specific paths, distinct from the generic `/about` `/reading` `/gallery` `/comics` `/writing` lines above them and the `/*` catch-all below.)
2. **AC2 — Given an old `/writing/<slug>` link, when opened, then Cloudflare returns a 301 to `/p/<slug>` and the Post renders.** ✓ (form + deploy: rules are well-formed and the destination exists). **Caveat:** `vite preview` does NOT honor `_redirects` (a 1.7 learning), so the 301→render chain can only be verified on the Cloudflare deploy — it is the **human gate** (see §Story Completion Status). The rules are well-formed (3 tokens, no literal spaces in source) and the destination slugs are real `.mdx` files, so on Cloudflare the chain is `(301 /writing/<slug>) → /p/<slug> → SPA fallback → React Router /p/:slug → PostPage renders`.
3. **AC3 — And the prior-URL list, when checked against the live site, then no prior post URL 404s (FR-13).** ✓ (within this story's scope): the 15 prior `/writing/<slug>` URLs each now resolve (301) to a live `/p/<slug>`. FR-13's "no previously-indexed post URL 404s" is satisfied for the post catalogue. (Related legacy routes `/support`, `/fun*`, `/tools*` are flagged above; they are not post URLs.)

## Tasks / Subtasks

- [x] **Task 1 — Reconstruct the exact prior `/writing/<slug>` URLs** (AC1) [dev-agent]
  - [x] T1.1 Confirmed the legacy LIVE routing from `git show 64ead59:clintonjavery/src/App.tsx` (the head just before the Epic-1 rewrite): `<Route path="/writing" → Writing/` and `<Route path="/writing/:slug" → Post/>`. So the prior per-post URLs are `/writing/<slug>`.
  - [x] T1.2 Confirmed the old `Writing.tsx` (pre-deletion, `git show cea4588^`) built the links with `<Link to={`/writing/${post.slug}`}>` using the **raw** slug string (spaces + mixed-case + apostrophe preserved). React Router `<Link>` does not percent-encode, so the DOM `<a href>` was the raw string; browsers encode path **spaces** to `%20` on navigation (and leave mixed-case + `'` literal, since `'` is a valid path sub-delim) — that percent-encoded form is what search engines indexed.
  - [x] T1.3 Decided the `_redirects` **source encoding**: spaces → `%20` (a literal space breaks the line parser); mixed-case + the `Where's` apostrophe kept **literal** (valid URL path chars, never browser-encoded → matches the indexed form). Documented in the file's block header comment.

- [x] **Task 2 — Author the 15 rules + close the bare-index gap** (AC1) [dev-agent]
  - [x] T2.1 In the 1.7 generic block, added `/writing /p 301` (bare Writing list → Feed) — the parent route of the 15; without it the indexed `/writing` index URL blank-pages (see §gaps #1).
  - [x] T2.2 Replaced the Story-2.2 placeholder comment block with the 15 per-post rules, ordered reverse-chron (mirroring the 2.1 migration table), single-space-delimited (canonical `_redirects` format). Preserved the Epic-4 `\fun`/`/tools` deferral note below them.

- [x] **Task 3 — Verify well-formedness + destination existence** (AC1/AC2) [dev-agent]
  - [x] T3.1 Ran `npm run build` → green (1.93s); `dist/_redirects` emitted (4401 B) — Vite copies `public/` verbatim to `dist/`, so Cloudflare serves exactly this file.
  - [x] T3.2 Programmatically parsed `dist/_redirects`: **21 total rules, 15 per-post `/writing/<slug>` rules, 0 malformed** (every rule line is exactly 3 whitespace-separated tokens; no literal space in source or dest; status ∈ {200, 301}; every per-post 301 destination `/p/<slug>` maps to an existing `content/p/<slug>.mdx`).

- [x] **Task 4 — Regression sweep** [dev-agent]
  - [x] T4.1 `npm run lint` 0 problems; `npx vitest run` 110 passed (no app code changed → suite unaffected). `package.json` unchanged.

- [x] **Task 5 — Story file & status** [dev-agent]
  - [x] T5.1 Status → `review` (the 301→render chain is only verifiable on the Cloudflare deploy → human gate; the rules are well-formed + destinations exist, which is all that can be proven locally).

## Developer Context

### Why source-encoding matters (and why I didn't use literal slugs)

Cloudflare `_redirects` is **whitespace-delimited**: `from  to  status`. A source path with a literal space (e.g. `/writing/creating a package`) would be mis-parsed as 4 tokens. So spaces MUST be percent-encoded as `%20` in the file. Meanwhile, the **indexed** URL the browser produced from the old `<Link to={\`/writing/${slug}\`}>` is exactly the percent-encoded form (`/writing/creating%20a%20package`) — so `%20` source matches the inbound request, not a paraphrased version. Mixed-case (`ApertusOpenSourceLLM`, `Security`, `The`) and the apostrophe (`Where's`) are valid URL path characters browsers never encode, so they are kept **literal** to match the indexed form (encoding them to `%27`/lower-casing would NOT match). This is the only encoding that is simultaneously file-parseable and matches the prior live URLs.

### Why I re-verified against `git show 64ead59` instead of trusting the spec's "16 essays"

The 2.1 record already flagged the 15-vs-16 count. For 2.2 the priority is the *route* fidelity, so I confirmed the actual legacy routing (`/writing/:slug`) and the actual link-builder (`Writing.tsx` `<Link to={`/writing/${slug}`}>`), not any doc. The 15 sources here are the 15 real `post.slug` values from the pre-deletion `src/data/posts.tsx` (`git show cea4588^`), matching the 2.1 migration table exactly.

### The `/* /index.html 200` fallback is NOT a safety net for missed redirects

A subtle point worth recording: RR7's `App.tsx` has **no catch-all route** (`<Route path="*">`) — the routes are exactly `/`, `/p`, `/p/:slug`, `/projects`, `/projects/:slug`. So while Cloudflare's `/* /index.html 200` ensures NO request 404s at the edge (it rewrites everything to `index.html`), an unmatched path that reaches the SPA renders **blank** (all `<Route>` fail to match → `<Routes>` renders `null`), NOT the Landing. This is why a missed redirect is worse than a "soft 404": the user sees a blank page. It's also why closing the bare `/writing` gap mattered. A true safety net would add a `<Route path="*">` NotFound page — that is a **separate** improvement (could be a 2.3 hygiene item or its own story), flagged here, not implemented in 2.2.

### What this story deliberately did NOT do

- **Did NOT redirect `/support`, `/fun*`, `/tools*`.** `/support`: ambiguous target + product call (see §gaps #2), left for your decision. `/fun*` + `/tools*`: explicitly deferred to Epic 4 per the existing comment.
- **Did NOT add a RR7 catch-all `<Route path="*">`** for unmatched SPA paths (would improve the safety net). Out of 2.2 scope; flagged in §Context.
- **Did NOT change `package.json` or any `src/` file.** Pure `_redirects` edit.
- **Did NOT trust the spec's "16" count.** Used the 15 real legacy slugs.

## Architecture Compliance

- **AR-9 (Cloudflare `_redirects` is the routing contract; first-match-wins; `/* /index.html 200` LAST)** — the 15 rules + the new `/writing` rule are inserted strictly above the SPA fallback; they are specific paths that never collide with the catch-all. Ordering rules in the file header are unchanged and still hold.
- **FR-13 (100% of prior post URLs reachable)** — reachable for the 15 essays (301 → live `/p/<slug>`); the post catalogue's URL continuity is satisfied. (Non-post legacy routes flagged.)
- **AD-5 (route shell)** — unchanged; `App.tsx` not touched.

## Library / Framework Requirements

**Nothing.** No code changes; `package.json` unchanged.

## File Structure Requirements

- **MODIFIED (1):** `clintonjavery/public/_redirects` — added the 15 per-post `/writing/<slug> → /p/<slug>` 301 rules (Story 2.2 block) + the bare `/writing /p 301` rule (generic block, gap #1).
- **UNCHANGED:** all `src/`, all `content/`, `package.json`, `vite.config.ts`. The build emits the updated file to `dist/_redirects` (4401 B).

## Testing Requirements

- **No new tests.** `_redirects` is a plain-text config the content pipeline/RR do not load at test time. Proven by:
  - build green → `dist/_redirects` emitted verbatim;
  - a parser pass: 21 rules, 15 per-post, 0 malformed, every 301 destination = a real `content/p/<slug>.mdx`;
  - the **Cloudflare production smoke test** is the human gate (1.7 learning: `vite preview` ignores `_redirects`).

## Previous Story Intelligence (from 1.7 / 2.1)

- **1.7 planted the slot.** The `# --- Story 2.2 … insert per-post … HERE ---` placeholder + the ordering rules header are exactly what this story filled. 1.7 also recorded the `vite preview` ↔ `_redirects` limitation that drives this story's `review`-gate.
- **2.1 handed the slug map.** The authoritative old→new table in `2-1-migrate-existing-essay-posts.md` is the source the 15 rules encode (verified the pre-deletion `posts.tsx` slugs match that table).
- **2.1 corrected the "16"→15.** This story encodes exactly 15 per-post rules, consistent with 2.1's reconciliation.

## Git Intelligence

- **Baseline (this story):** `edfda00` (`epic 1 complete 1.8 done`) — Clint committed Story 1.8 between the 2.1 work and this story (Epic 1 is now `done` in the repo).
- **Changes (mine, uncommitted):** `clintonjavery/public/_redirects` (M) — the only working-tree change.
- **Commit convention:** prior commits `1 - 7`, `2 - 1`, `epic 1 complete 1.8 done`. Suggested: `feat(redirects): story 2.2 — /writing/<slug> → /p/<slug> 301 map + /writing → /p`. Or his terse `2 - 2`.

## Latest Technical Information

- **Cloudflare Pages `_redirects`** is Netlify-style: 4 fields optional but `[from to status [force!]]`; here every rule is the 3-token form. First-match-wins; static files in `dist/` beat rules; `200` is an internal rewrite (URL preserved, no client hop), `301` is a real redirect (browser URL changes to `to`). The 15 essay rules use `301` (permanent) so search engines update their index to `/p/<slug>`.
- **`from` path matching** is against the request path; `%20` in the source token matches the percent-encoded request URI the browser produces for a spaced slug. (If, in the smoke test, a spaced slug does NOT 301, the likely cause would be Cloudflare decoding the `from` token but not the request — extremely unlikely; report and re-encode to match observed behavior.)
- **Vite `public/` copy:** `vite build` copies every file in `public/` to `dist/` **with no transform**, so `_redirects` ships byte-for-byte. Confirmed: 4401 B in both `public/_redirects` and `dist/_redirects`.

## Story Completion Status

- **Status:** `in-progress` → **`review`**.
- **Agent-done (T1–T5):** 15 well-formed per-post rules + the bare-`/writing` gap-closer, destinations cross-checked to real files, build/lint/test green, file documented.
- **Clint's gate (`review` → `done`):**
  1. **Production smoke test** (the 301→render chain is only verifiable on Cloudflare, since `vite preview` ignores `_redirects`). After deploy, run e.g.:
     - `curl -sI https://www.clintonavery.com/writing/creating%20a%20package | grep -iE 'HTTP|location'` → expect `HTTP/… 301` + `location: /p/creating-a-package`.
     - `curl -sI https://www.clintonavery.com/writing/Where's%20the%20bottleneck` → `301` → `/p/does-genai-remove-the-bottleneck`.
     - `curl -sI https://www.clintonavery.com/writing/ApertusOpenSourceLLM` → `301` → `/p/apertus-open-source-llm`.
     - `curl -sI https://www.clintonavery.com/writing` → `301` → `/p`.
     Then open one redirected `/p/<slug>` in a browser → the Post renders.
  2. **Decide the `/support` flag** (§gaps #2) — and whether to add a RR7 `<Route path="*">` NotFound safety net (§Context). Both are adjacent improvements; neither blocks 2.2.
  3. **Commit** (your convention) — suggested message above. Only `clintonjavery/public/_redirects` is staged.
- **Epic 2 status after 2.2:** 2.1 ✓ (committed `cea4588`), 2.2 ✓ (this, `review`), → **Story 2.3** (technical hygiene: collapse the two BalloonPopper implementations to one; retire the routed-but-dead `/reading` `/gallery` + `gallery.tsx`; remove `*~` editor cruft — and, if you take the flag, the `/support` redirect + a NotFound catch-all route fit naturally there).

---

## Dev Agent Record

### Agent Model Used

Amelia (Senior Software Engineer). Model: Claude (Anthropic). Date: 2026-08-08.

### Debug Log References

- **Baseline changed between stories.** On revisit, the repo head was `edfda00 epic 1 complete 1.8 done` — Clint committed Story 1.8 (and Epic 1 is now `done`); the 2.1-in-tree comic-strip changes were also resolved. Working tree clean. Used `edfda00` as the 2.2 baseline.
- **Reconstructed the real prior URLs, not the spec's.** `git show 64ead59:App.tsx` confirmed `/writing` + `/writing/:slug`; `git show cea4588^:Writing.tsx` confirmed `<Link to={`/writing/${slug}`}>` with raw slugs. So the 15 sources are the 15 real legacy `post.slug` values, percent-encoded for spaces only.
- **Encoding: `%20` for spaces, literal case + apostrophe.** A literal space breaks the `_redirects` line parser; `%20` is both file-valid and matches the browser-encoded indexed URL. Case + `'` are valid path chars browsers never encode → kept literal to match what got indexed.
- **Bare `/writing` gap, closed.** The legacy Writing *list* page (`/writing`) is the parent of the 15 slugs; without a redirect it blank-pages (RR7 has no catch-all). Added `/writing /p 301` to the 1.7 generic block.
- **`/support` gap, flagged not fixed.** Legacy `64ead59` routed `/support → Contribute`; that route is gone (1.8). The target is ambiguous because 1.8 route-scoped the `support-pill` to `/p`+`/p/:slug` (not `/`). Did NOT silently add — product call. Options in §gaps #2.
- **`/fun*`/`/tools*` left for Epic 4** (the existing `_redirects` comment already defers those to the Projects migration).
- **Noted the SPA-fallback-is-not-a-safety-net subtlety.** `/* /index.html 200` prevents *edge* 404s, but RR7 has no `<Route path="*">`, so a missed redirect renders *blank*, not the Landing. Recorded as a flagged improvement (a NotFound catch-all), not implemented here.
- **Verification.** `npm run build` green (1.93s); `dist/_redirects` 4401 B emitted verbatim; parser pass: 21 rules / 15 per-post / 0 malformed / all 301 dests → real `.mdx`. lint 0, tests 110.

### Completion Notes List

- **`public/_redirects`** — added 15 `/writing/<slug> → /p/<slug> 301` rules (reverse-chron, single-space delim, `%20`-encoded spaces, literal case + apostrophe) in the Story 2.2 block above the SPA fallback; added `/writing /p 301` to the 1.7 generic block (bare-index gap). Both block headers document the encoding + ordering rationale.
- **No app code, content, package, or config changed** — pure routing-contract edit.
- **Cross-checked** every per-post 301 destination to an existing `content/p/<slug>.mdx`; build/lint/110-tests green.
- **Human gate = Cloudflare smoke test** (`vite preview` ignores `_redirects`): curl the old URLs → expect 301 → `/p/<slug>` → open → Post renders.

### File List

**MODIFIED (1):** `clintonjavery/public/_redirects`
**UNCHANGED:** all `src/`, all `content/`, `package.json`, `vite.config.ts` (build emits the updated `dist/_redirects`)

### Change Log

- 2026-08-08 — Story 2.2 implemented after 1.8 was committed (`edfda00`). Audited the legacy routing (`64ead59`) to reconstruct the exact prior `/writing/<slug>` URLs; encoded spaces `%20`, kept case/apostrophe literal. Added the 15 per-post 301s + closed the bare-`/writing` gap. Flagged (not silently fixed) the `/support` orphan, the Epic-4-deferred `/fun*`/`/tools*`, and the missing RR7 NotFound catch-all. Build/lint/test green; destinations cross-checked. Status `review` — Cloudflare smoke test + `/support` decision are Clint's gate. Epic 2 resumes at 2.3.