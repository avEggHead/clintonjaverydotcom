---
baseline_commit: 4bd14f9 1 - 7
---

# Story 2.1: Migrate existing essay posts to the content model

Status: review

## Story

As a **Clint (author)**,
I want my existing essay posts moved into the new `content/p/` Post model intact,
So that nothing I've written is lost and the catalogue is live on the new pipeline.

**Epic 2, Story 2.1** (`_bmad-output/planning-artifacts/epics.md`, Story 2.1) — covers **FR-13** (100% of existing posts reachable + visually intact post-rebuild, SM-2 / NFR-7) and the first half of FR-15's payload (clearing the path away from the hardcoded `src/data/posts.tsx` data module so content is file-based). This is the **prerequisite** for Story 2.2 (the per-post `/writing/<slug> → /p/<slug>` 301 redirect map — it needs the final slugs this story establishes).

## ⚠️ Open item surfaced before dev (not a gate for THIS story — flagged for the record)

The Epic 2.1 AC in `epics.md` says **"all 16 records"** compile. The source file `clintonjavery/src/data/posts.tsx` contained exactly **15** `slug` records (verified by `grep -c 'slug:\s*"'` = 15), and no other post data source exists (`gallery.tsx` holds 27 Gallery-page images, not posts). Clint confirmed to proceed = **15 is the true current catalogue**; the "16" in the spec is a doc/count discrepancy, not a 16th file the migration missed. **This is recorded here so Epic 2's "16 essays" language can be reconciled later; it does not gate 2.1.**

## Acceptance Criteria (from epics.md Story 2.1) + status

1. **AC1 — each `Post` record → `content/p/<slug>.mdx` with frontmatter `title`, `date` (ISO, converted from the display string), `type: essay`, `slug` (filename), + body preserving text/heading-structure/inline-images moved to content-referenced paths.** ✓ — 15 `.mdx` files authored in `clintonjavery/content/p/`. `date` converted display→ISO `YYYY-MM-DD` (real calendar date, validated by `validate.ts`'s ISO regex + calendar check). No inline images existed in any source post (verified: `grep -nE '!\[|\.png|\.jpg' src/data/posts.tsx` = empty), so the "inline images moved to content-referenced paths" sub-clause is vacuously satisfied. The original posts had **no markdown headings** (plain pre-wrap prose), so "heading structure preserved" = no headings were dropped.
2. **AC2 — all 16 [sic, actually 15] records compile into the `content-index` with no missing required fields; build passes.** ✓ — `npm run build` green; `buildCollection` emits 17 published posts (15 migrated + the 2 Epic-1 sample fixtures `hello-ink-garden`/`first-strip`) → all 15 migrated essays compile through `@mdx-js/rollup` (74 modules transformed) with zero missing-required-field throws. Proven via `dist/sitemap.xml` listing all 17 `/p/<slug>` locs in reverse-chrono.
3. **AC3 — each migrated post spot-checked before/after: text, heading structure, images preserved — no post dropped or visually broken (SM-2 / NFR-7).** ✓ (text-level, programmatically): a **word-multiset** verifier compares every migrated `.mdx` body token-for-token against the original `posts.tsx` content (recovered from `git show HEAD:...`) — **0 mismatches across all 15** (200–652 distinct words each). The only deltas are non-word markdown tokens (code fences ```` ``` ````, inline-code backticks, `\` line-continuations) introduced to keep MDX compile-safe. The **visual** before/after is the human-review gate (needs a browser / live site) — left to Clint as `review`→`done`, see §Story Completion Status.
4. **AC4 — once migration is verified, the app reads from `content/` only; the hardcoded `src/data/posts.tsx` data module is removed (content is now file-based).** ✓ — `src/data/posts.tsx` **DELETED**. Its only two importers — the un-routed legacy pages `src/pages/Writing.tsx` and `src/pages/Post.tsx` (superseded by Epic-1's `Feed`/`PostPage`, confirmed not in `App.tsx`'s routes) — are **DELETED** with it so `tsc -b` has no dangling import. No other code referenced them (`grep`-proven). The app now reads Post data exclusively from `virtual:content-index` (AD-1 boundary intact). `apelld` `gallery.tsx`/`Gallery.tsx` are **left** — they are Story 2.3's scope (FR-15 hygiene), and `gallery.tsx` has its own consumer (`Gallery.tsx`) to retire together there.
5. **AC5** (per the epics spec, AC4/AC5 fire from 1.2's existing gate — drafts excluded / missing required fields fail the build): ✓ — `draft-wip.mdx` (a draft) is excluded from the index (verified by the updated `validate.test.ts` integration assertion + `buildCollection` returns 17, not 18). Essay-missing-required-field and comic-missing-alt throws remain covered by the unchanged 1.2 gate tests (110 green).

## Tasks / Subtasks

- [x] **Task 1 — Decide migration contract (discussed + confirmed with Clint before authoring 15 files)** [dev-agent + Clint]
  - [x] T1.1 **New slugs = kebab-case, filename-derived** (AC1), with an old→new mapping captured below for Story 2.2's 301s. Flagged titles-with-typos preserved **verbatim as-authored** to honor "preserved"; Clint may fix in place later.
  - [x] T1.2 **`date` ISO `YYYY-MM-DD`** (AC1). Two source dates lacked a day → "March 2025" `= 2025-03-01`, "June 2024" `= 2024-06-01` (1st-of-month). All others parsed from the display string. `validate.ts` confirms each is a real calendar date.
  - [x] T1.3 **`excerpt` ← old `preview`** (all 15 had one). `type: essay`. `status` omitted (defaults `published`).
  - [x] T1.4 **Body fidelity, markdown-normalized**: the old `Post.tsx` rendered `content` with `whiteSpace: pre-wrap` (line-by-line, leading tabs/spaces, blank-line paragraph breaks, bare non-clickable URLs, no markdown headings). MDX changes that semantics: 4-space indent → code block, bare `{`/`<…>` → **JSX = build-breaker**. So bodies are **normalized**: each source line → its own markdown paragraph (preserves the pre-wrap line structure); contiguous code-y runs (PowerShell + JSON, shell commands) → fenced ``` blocks; the one bare `<your local IP address>` URL → inline-code span. Bare URLs left bare (matches old non-clickable rendering). **Every word preserved** (T4 verifier).
  - [x] T1.5 Surfaced the **15-vs-16 count** to Clint before authoring (see ⚠ open item). Proceeded with 15.

- [x] **Task 2 — Author 15 `.mdx` files** (AC1/AC2) [dev-agent]
  - [x] T2.1 Wrote a provenance extractor `_bmad-output/implementation-artifacts/migrate-2-1.mjs` that parses the 15 records out of `src/data/posts.tsx` (verified: each body's template literal has **no internal backticks** — the file's 30 backticks = 15 open/close wrappers — so split-on-backtick is safe) and emits normalized `.mdx` per the T1 contract. Extract programmatically = zero paraphrase/transcription error.
  - [x] T2.2 Ran it → wrote 15 `clintonjavery/content/p/<new-slug>.mdx`.
  - [x] T2.3 **Hand-finished the 2 code-heavy posts** the extractor's naive per-line code-y detector mis-fenced:
        - `two-powershell-commands-of-domain-transfer.mdx` — the first PowerShell+JSON command was wrongly split across multiple fences (JSON interior lines like `"nameServers": [` have no braces, so the run-gatherer broke the block). Rewrote the body so each of the two PowerShell commands is **one fenced block** (the multi-line JSON `{ ... }` + `<placeholder>` content is literal inside the fence).
        - `run-a-model-locally.mdx` — step 8's shell command was glued to step 9's prose (step 9 contains `<your local IP address>` → code-y) into one fence. Split them: step 8 fenced alone; step 9 prose with the URL as an inline-code span `` `http://<your local IP address>:3000` ``.
  - [x] T2.4 Build-breaker scan over the other 13 posts: `grep -E '[{}]|</?[A-Za-z_]' *.mdx` (excluding 2,3) → **no hits**; `^> ` (blockquote) none; `^---$` only the frontmatter fences (+ the dialogues in-body divider, blank-surrounded → thematic-break `<hr>`, faithful). Clean.

- [x] **Task 3 — Build-verify with old module still present** (AC2) [dev-agent]
  - [x] T3.1 `npm run build` (with `posts.tsx` + Writing/Post still present) → green, 74 modules transformed, the 15 new MDX essays compiled. `dist/sitemap.xml` lists all 17 `/p/<slug>` locs reverse-chron (√AC2).

- [x] **Task 4 — Faithful-preservation proof (SM-2 / NFR-7)** (AC3) [dev-agent]
  - [x] T4.1 Wrote `_bmad-output/implementation-artifacts/verify-2-1.mjs`: recovers each original body from `git show HEAD:clintonjavery/src/data/posts.tsx`, tokenizes (split on non-word chars, lowercased) both old + new, compares word **multisets**. Result: **15 OK, 0 mismatch** — every word present, no drops/adds except non-word markdown tokens. This is the programmatic SM-2 evidence; the visual spot-check is the human gate.

- [x] **Task 5 — Remove the hardcoded data module + its dead importers (AC4)** [dev-agent]
  - [x] T5.1 `grep`-confirmed `data/posts` is imported only by `src/pages/Post.tsx` (line 2) and `src/pages/Writing.tsx` (line 1); both are un-routed (`App.tsx` routes only `/ /p /p/:slug /projects /projects/:slug`); neither page is imported anywhere else.
  - [x] T5.2 Deleted `src/data/posts.tsx`, `src/pages/Writing.tsx`, `src/pages/Post.tsx`. (Left `src/data/gallery.tsx` + `src/pages/Gallery.tsx` — Story 2.3 scope.)
  - [x] T5.3 Re-ran `npm run build` → green (no dangling import; `tsc -b` passes).

- [x] **Task 6 — Update the brittle sample-only test (AC2/AC5 regression guard)** [dev-agent]
  - [x] T6.1 `src/content/validate.test.ts`'s integration test asserted `slugs.toEqual(['hello-ink-garden', 'first-strip'])` (the 2-sample Epic-1 state) — now obsolete. Rewrote the assertion to the durable invariant: `toHaveLength(17)` + `arrayContaining` of all 17 slugs + a **reverse-chrono ordering loop** (each post's date ≤ previous, FR-5) + keep the `hello-ink-garden`/`first-strip` shape checks (essay `bodyPath` string; comic `strip.alt` > 0, no `bodyPath`) + `draft-wip` excluded. The two-newest-are-the-samples date assertions (`2026-08-06` / `2026-08-01`) still hold — kept.
  - [x] T6.2 `npx vitest run` → **110 passed** (unchanged count; one integration assertion swapped for the durable form, not a new behavior).

- [x] **Task 7 — Full regression sweep** (AC2/AC4) [dev-agent]
  - [x] T7.1 `npm run build` green; `npm run lint` **0 problems**; `npx vitest run` **110 passed**. `package.json` unchanged (`git diff --stat package.json` 0). The Feed (1.5), Post page (1.4), SEO/head + sitemap/robots (1.6), TopNav/landmarks (1.3) render unchanged; the Feed now lists 17 published posts (page 1 = 10 newest; page 2 = 7) — FR-5 pagination exercised by the catalogue growth.

- [x] **Task 8 — Story file & status** [dev-agent]
  - [x] T8.1 Filled the Dev Agent Record (Agent Model, Debug Log, Completion Notes, File List, Change Log). Marked agent-doable task checkboxes `[x]`.
  - [x] T8.2 Status → `review` (agent's parts done; the commit + the live visual before/after spot-check are Clint's gate — see §Story Completion Status).
  - [ ] T8.3 Commit left to Clint (his convention — prior Epic-1 commits: `1 - 7`, `1-5 done`). Suggested message: `feat(content): story 2.1 — migrate 15 essays to content/p + drop src/data/posts.tsx`.

## Old slug → new slug map (AUTHORITATIVE for Story 2.2's `/writing/<slug> → /p/<slug>` 301s)

Story 2.2 inserts one `301` per row into `clintonjavery/public/_redirects` above the `/* /index.html 200` catch-all (the `# --- Story 2.2: insert per-post … HERE ---` anchor planted in Story 1.7). The left side is the **old** (raw, often mixed-case / with spaces) slug; the right is the **new** kebab filename stem. (Cloudflare `_redirects` matches the path literally; old slugs with spaces would have served URL-encoded on the live site — Story 2.2 should emit the encoded form and/or test the actual inbound URLs.)

| # | old slug (writing path) | new slug (/p path) | ISO date |
|---:|---|---|---|
| 1 | `ApertusOpenSourceLLM` | `apertus-open-source-llm` | 2026-05-18 |
| 2 | `TwoPowershellCommandsofDomainTransfer` | `two-powershell-commands-of-domain-transfer` | 2026-04-23 |
| 3 | `Run a model locally to save tons of money` | `run-a-model-locally` | 2026-04-02 |
| 4 | `triple dt software engineering framework` | `triple-dt-software-engineering-framework` | 2026-02-09 |
| 5 | `dialogues with the robot troubleshooting` | `dialogues-with-the-robot` | 2025-06-09 |
| 6 | `creating a package` | `creating-a-package` | 2025-05-21 |
| 7 | `making things harder` | `making-things-harder` | 2025-05-08 |
| 8 | `Security and obscurity` | `security-and-obscurity` | 2025-05-02 |
| 9 | `books are good` | `books-are-good` | 2025-04-28 |
| 10 | `The paradoxical necessity` | `two-mindsets-of-engineering` | 2025-04-22 |
| 11 | `The dreaded on-call support rotation` | `three-concepts-for-support` | 2025-04-17 |
| 12 | `mass migration from the cloud` | `mass-migration-from-the-cloud` | 2025-04-08 |
| 13 | `tech improvments are only goood if they save money` | `values-beyond-the-bottom-line` | 2025-04-03 |
| 14 | `Where's the bottleneck` | `does-genai-remove-the-bottleneck` | 2025-03-01 |
| 15 | `bicycle-or-wheelchair` | `bicycle-or-wheelchair` | 2024-06-01 |

## Developer Context

### What this story is / isn't

- **Is:** a one-way **data migration** — 15 plain-text post records (`.tsx` template-literal strings, pre-wrap rendered) → 15 `.mdx` files on the build-time content pipeline, then delete the old module + dead importers. Build-safe markdown normalization (code fences / inline-code) so `@mdx-js/rollup` compiles. Verifiable: build + word-multiset.
- **Isn't:** new product code, new components, new schema, new tests-as-behavior. **No new runtime logic.** The only `src/` edit is `validate.test.ts`'s integration assertion (durable rewrite for the now-larger collection) and the **deletion** of `posts.tsx` + the two un-routed legacy pages.

### Why MDX-safety drove the normalization

The old `Post.tsx` rendered `post.content` as a **plain string** with `whiteSpace: pre-wrap` — no markdown parsing at all. The new pipeline compiles essays as **MDX** (markdown + JSX). Three classes of plain text become **build-breakers** in MDX and had to be fenced/escaped:

1. **`{` `}`** → a bare `{` starts a **JSX expression**; an unbalanced brace aborts `@mdx-js/rollup`. Source: the domain-transfer post's PowerShell `-Payload '{ "properties": { … } }'` JSON.
2. **`<word …>`** → parsed as a **JSX tag**; an unmatched `>` aborts with "Unexpected token". Source: `<subscription id>`, `<resource group>`, `<name servers provided by Cloudflare>`, `<your local IP address>`, `<domain name>`.
3. **4-space leading indent** → an **indented code block** (markdown), which would visually fragment prose the author wrote as a paragraph.

The normalization (fence code-y runs; inline-code the lone URL; each source line its own paragraph) preserves **every word** and keeps the build green. Proven by the T4 word-multiset verifier: 0/15 mismatches.

### Precisely what was deleted (and why each is safe)

- `src/data/posts.tsx` — exported `type Post` + the `posts[]` array. **Only** imported by `src/pages/{Writing,Post}.tsx` (grep-proven). (The content-pipeline `Post` type lives in `src/content/schema.ts` and is imported via `src/content/index.ts` — completely separate; no collision.)
- `src/pages/Writing.tsx` — the pre-Epic-1 writing index (its own pagination, `PAGE_SIZE=5`, its own styles). Superseded by `Feed` (`/p`, Story 1.5). Imported by nothing (App.tsx does not route it).
- `src/pages/Post.tsx` — the pre-Epic-1 single-post page (`whiteSpace: pre-wrap` renderer). Superseded by `PostPage` (`/p/:slug`, Story 1.4). Imported by nothing.

### What was deliberately NOT touched

- `src/data/gallery.tsx` + `src/pages/Gallery.tsx` → **Story 2.3** (FR-15 hygiene: retire `/gallery` + `gallery.tsx` "if no other code references them" — `Gallery.tsx` still references it, so both retire together there).
- The Epic-1 sample fixtures `content/p/hello-ink-garden.mdx` (essay) + `content/p/first-strip.md` (comic) + `content/p/draft-wip.mdx` (draft) → left in place. They are part of Epic-1's shipped samples, not the "existing catalogue" this story migrates.
- `public/_redirects` → untouched here; the per-post `/writing/<slug>` map is **Story 2.2**, inserted at the `# --- Story 2.2 … HERE ---` anchor Story 1.7 planted.
- `package.json` → unchanged (no new dependency — MDX/gray-matter already installed in 1.2).

## Architecture Compliance

- **AD-1 (content-index is the only Post data surface)** — strengthened: `src/data/posts.tsx` (a competing data source) is gone; the app reads `virtual:content-index` only.
- **AD-2 (schema = authoritative contract; slug = filename stem)** — honored: every migrated slug = filename stem; no `slug:` field authored in frontmatter (omitted → derived), per `validate.ts`.
- **AC1 of 1.2 (essay posts must be `.mdx`)** — the 15 files are `.mdx` (the plugin throws on a `.md` essay).
- **FR-13 / SM-2 / NFR-7 (100% reachable + visually intact)** — text-level proven by the T4 word-multiset verifier (0/15); the reached-URL half is the union of `/p/<new-slug>` (sitemap) + the new `/p/<slug>` page (Story 1.4) that reads `virtual:content-index`. Old `/writing/<old-slug>` URLs are reconcile in Story 2.2 (not this story).
- **FR-14 (client-side nav)** — unaffected; new slugs are reachable via RR7's `/p/:slug` (content-derived route) as designed in 1.3.
- **AR-11 (defer: test framework)** — Vitest already present (introduced in 1.2); this story reuses it (no new test framework).

## Library / Framework Requirements

**Nothing new.** Reuses the stack erected in Epic 1: Vite 6, React 19, `@mdx-js/rollup` (v1.2), `gray-matter`, Tailwind v4, Vitest 4.1.10. `package.json` unchanged (`git diff --stat` = 0).

## File Structure Requirements

**`clintonjavery/content/p/` — NEW (15):** `apertus-open-source-llm.mdx`, `bicycle-or-wheelchair.mdx`, `books-are-good.mdx`, `creating-a-package.mdx`, `dialogues-with-the-robot.mdx`, `does-genai-remove-the-bottleneck.mdx`, `making-things-harder.mdx`, `mass-migration-from-the-cloud.mdx`, `run-a-model-locally.mdx`, `security-and-obscurity.mdx`, `three-concepts-for-support.mdx`, `triple-dt-software-engineering-framework.mdx`, `two-mindsets-of-engineering.mdx`, `two-powershell-commands-of-domain-transfer.mdx`, `values-beyond-the-bottom-line.mdx`.

**`clintonjavery/src/` — DELETED (3):** `data/posts.tsx`, `pages/Writing.tsx`, `pages/Post.tsx`.
**`clintonjavery/src/` — UPDATED (1):** `content/validate.test.ts` (the integration assertion rewritten to the durable order-presence form — see T6).

**`_bmad-output/implementation-artifacts/` — NEW (provenance, not shipped):** `migrate-2-1.mjs` (extractor), `verify-2-1.mjs` (word-multiset verifier), `2-1-migrate-existing-essay-posts.md` (this file).

**`clintonjavery/dist/` (build output):** rebuilt — `sitemap.xml` now 17 `/p/<slug>` locs; `robots.txt`, `index.html`, `assets/*` (hashes stable because no source-code change to the bundle logic — the 15 MDX compile into the build graph but are lazy-loaded, so the main `index-*.js` hash DID change to include the eager glob paths). `package.json` unchanged.

## Testing Requirements

- **No new behavior → no new unit tests.** The suite stays at **110** (the integration assertion in `validate.test.ts` was rewritten, not added). Build + lint + tests all green.
- **The build IS a test** for MDX-compile-safety (AC2): `npm run build` compiles all 15 `.mdx` through `@mdx-js/rollup`; any `{`/`<…>` that slipped through would fail the build (it didn't).
- **The word-multiset verifier** (`verify-2-1.mjs`) is the SM-2/NFR-7 programmatic gate (0/15 mismatch).
- **The human visual before/after spot-check** (SM-2) is the remaining gate — needs a browser / the live site (Clint); see §Story Completion Status.

## Previous Story Intelligence (from 1.7)

- **Story 1.7 parked the Story-2.2 anchor.** `public/_redirects` has a `# --- Story 2.2: insert per-post /writing/<slug> → /p/<slug> 301 rules HERE (above the catch-all) ---` comment slot. This story's slug map (above) is exactly what 2.2 consumes there.
- **`posts.tsx` removal was always the 2.1 exit criterion** (the 1.7 file's "Deferred" / "Previous Story Intelligence" notes flagged that the per-post redirect map needs the final slugs "once the 16 [15] essays are migrated"). This story hands those slugs off.
- **`vite preview` does NOT honor `_redirects`** (1.7 learning) — irrelevant here (no redirect work in 2.1), but note: a local deep-link to `/p/<new-slug>` renders via `vite preview`'s SPA fallback; the OLD `/writing/<old-slug>` path is Cloudflare-only → Story 2.2's production smoke.
- **Fails-closed gate (1.2) unchanged.** Removing `posts.tsx` doesn't touch `validate.ts`/`plugin.ts`'s `throw new Error(...)` `buildStart` gate; an invalid post still fails the build (the Comic-only alt-gate tests, 110 green, confirm).

## Git Intelligence

- **Baseline (this story):** `4bd14f9` (`1 - 7`). Working tree was clean at start.
- **Changes (uncommitted, ready for Clint to commit in his convention):**
  - **DELETED:** `clintonjavery/src/data/posts.tsx`, `clintonjavery/src/pages/Writing.tsx`, `clintonjavery/src/pages/Post.tsx`.
  - **MODIFIED:** `clintonjavery/src/content/validate.test.ts`.
  - **NEW:** 15 `clintonjavery/content/p/*.mdx`; `_bmad-output/implementation-artifacts/{migrate-2-1,verify-2-1}.mjs`; this story file.
- **Commit convention:** prior Epic-1 commits are terse (`1 - 7`, `1-5 done`, `story 1-3 done`), not conventional-commits — by Nov 2026 operative at 1.7, the agent left the commit to Clint. Same here. Suggested message: `feat(content): story 2.1 — migrate 15 essays to content/p + drop src/data/posts.tsx`.
- **`src/data/posts.tsx` was git-tracked** — its deletion will show as a `D` in `git status`; `git add -A` stages it. The new `.mdx` files are untracked (`??`) until added.

## Latest Technical Information

- **`@mdx-js/rollup` JSX-sensitivity**: MDX 2 treats `{` `/` `<word>` as JSX; provider-less compile (no `providerImportSource`, per `vite.config.ts`'s 1.2 fix) — prose is styled via `.prose` CSS, so fenced-code blocks render as `<pre><code>`. This is why the PowerShell/JSON *had* to be fenced (not left as pre-wrap text).
- **gray-matter**: the `.mdx` frontmatter `date: "2026-05-18"` (quoted ISO string) parses to a string; `validate.ts`'s `ISO_DATE_RE` + real-calendar check enforces it.
- **The content plugin** (`buildCollection`) globs `content/p/*.{md,mdx}` **top-level files only** (`fs.readdirSync` with `filter(e => e.isFile())`), so essay files live directly in `content/p/` and their per-post image subdirs (e.g. `content/p/hello-ink-garden/hero.png`) are skipped — confirmed compatible (no images needed for the 15 essays anyway).

## Project Context Reference

- `_bmad-output/planning-artifacts/epics.md` — Epic 2, Story 2.1 (5 ACs), FR-13/FR-15, the FR-13 coverage note "16 essays".
- `_bmad-output/implementation-artifacts/1-7-deploy-cloudflare-pages-spa-fallback.md` — the Story-2.2 `_redirects` anchor + the "slugs land when migrated" deferral.
- `_bmad-output/planning-artifacts/architecture/.../ARCHITECTURE-SPINE.md` — AD-1 (content-index only), AD-2 (schema/derived slug).
- `clintonjavery/src/content/{schema,validate,plugin}.ts` — the contract the 15 `.mdx` had to satisfy.

## Story Completion Status

- **Status:** `ready-for-dev` → `in-progress` → **`review`**.
- **Agent-done (T1–T7, T8.1/T8.2):** 15 `.mdx` authored + build/lint/test green + word-multiset preservation proven (0/15) + `posts.tsx`/`Writing.tsx`/`Post.tsx` deleted with no dangling imports.
- **Clint's gate (to move `review` → `done`):**
  1. **Commit** (his convention) — `git add -A && git commit` with the suggested message (or his).
  2. **Visual before/after spot-check (SM-2 / NFR-7)** — open a few posts on `npm run dev` (or the live site once pushed) and eyeball that text/headings/images render intact (the dialogues `<hr>` divider, the PowerShell fenced blocks, the poem's line breaks). The programmatic gate already proves no text dropped; this is the human "not visually broken" confirmation.
  3. **Reconcile the 15-vs-16 count** in Epic 2's language (doc fix, not a code gate) — or point at the 16th essay if it exists elsewhere and was missed.
- **Next story:** 2.2 (the `public/_redirects` `/writing/<slug> → /p/<slug>` 301 map from the table above).

---

## Dev Agent Record

### Agent Model Used

Amelia (Senior Software Engineer) — create-story + dev-story combined run. Model: Claude (Anthropic). Date: 2026-08-08.

### Debug Log References

- **15-vs-16 surfaced and resolved before authoring.** `grep -c 'slug:\s*"' src/data/posts.tsx` = 15 (not 16). No alternate post source (gallery = images). Asked Clint; he confirmed proceed with 15 ("Go"). The "16" discrepancy is recorded as a doc-open-item, not a missed file — it does not gate 2.1.
- **Extraction over transcription.** The 15 bodies are long (200–652 distinct words). Hand-transcribing would risk paraphrase. Verified the file has exactly 30 backticks = 15 open/close template-literal wrappers (no internal backticks in any body), so a regex split-on-backtick is safe. Wrote `migrate-2-1.mjs` to parse the 15 records and emit normalized `.mdx` — zero transcription risk.
- **Naive per-line code-y detection mis-fenced 2 posts; hand-finished.** `isCodey(line)` (`{`/`}` or `<tag`-like or a known shell token) correctly fenced 13/15 prose posts cleanly. But: (a) post 2's multiline PowerShell+JSON command got split — the JSON interior (`"nameServers": [`) has no braces so the run-gatherer ended the fence mid-command and emitted `"/nameServers": [`/`]` as loose prose paragraphs (ugly + broke the JSON). Fix: rewrote post 2's body so each PowerShell command is one fenced block. (b) post 3 step-8 shell command glued to step-9 prose (step-9's `http://<your local IP address>` is code-y) into one fence. Fix: split into step-8 fenced + step-9 prose with the URL as an inline-code span. Both fixes verified by the build (green) + the word-multiset verifier (0/15 — the `\` line-continuations + inline-code backticks are non-word tokens, so the multiset still matches).
- **The 13 prose posts are build-breaker-free.** `grep -E '[{}]|</?[A-Za-z_]' *.mdx` (excluding 2,3) → no hits; no `^>` blockquote starts; the only `^---$` lines are frontmatter fences (+ the dialogues in-body divider, blank-surrounded → `<hr>`, which is faithful to the original visual separator). Markdown `*`/`_` emphasis tokens that DO appear (the math lines like `15 tokens/sec * 60 sec / min`) are space-surrounded → literal asterisks, not emphasis (verified the build + no italic artifacts matter for fidelity — and even if markdown re-flowed an asterisk, the word-multiset is unaffected).
- **Test was sample-brittle; rewritten for durability not behavior.** `validate.test.ts` asserted `slugs.toEqual(['hello-ink-garden','first-strip'])` — the 2-sample Epic-1 state. With 17 published posts that fails. Rewrote to the real invariant: `toHaveLength(17)` + `arrayContaining(17 slugs)` + a reverse-chrono ordering loop (FR-5) + kept the two-newest-date + shape + draft-excluded checks. One assertion swapped; suite count stays 110; no new logic.
- **Why not also delete `gallery.tsx`/`Gallery.tsx`?** They are FR-15 hygiene = Story 2.3 scope ("retire `/gallery` + `gallery.tsx` if no other code references them"). `Gallery.tsx` still imports `gallery.tsx`, so they retire together; deleting either here would be scope-creep and break the other. Left for 2.3.
- **Commit left to Clint (convention).** Prior commits are terse (`1 - 7`, `1-5 done`); the 1.7 agent deliberately did not impose conventional-commits. Same here: status `review`, commit + visual spot-check are Clint's `review`→`done` gate.

### Completion Notes List

- **15 `.mdx` authored** in `clintonjavery/content/p/` with `title` (verbatim), `date` (ISO; two no-day dates → 1st-of-month), `type: essay`, `excerpt` (= old `preview`). Filenames = kebab-case new slugs. No `slug:` field (derived from filename). See the authoritative old→new map above (feeds 2.2).
- **Fidelity:** each source line → its own markdown paragraph (preserves the pre-wrap line structure the author wrote); code-y runs fenced; the lone in-prose URL with `<>` inline-coded. Word-multiset verifier (`verify-2-1.mjs`) = 15/15 identical multisets, 0 differences — SM-2/NFR-7 satisfied at the text level.
- **Removal:** `src/data/posts.tsx` + un-routed `src/pages/Writing.tsx` + `src/pages/Post.tsx` deleted (the only `posts.tsx` importers). App reads `virtual:content-index` only (AD-1). `gallery.tsx`/`Gallery.tsx` left for 2.3.
- **Regression:** `npm run build` green (74 modules, sitemap 17 locs); `npm run lint` 0; `npx vitest run` 110 passed; `package.json` unchanged.
- **Provenance scripts kept** in `_bmad-output/implementation-artifacts/` (`migrate-2-1.mjs`, `verify-2-1.mjs`) — outside the app, document the migration, re-runnable.

### File List

**NEW (15, app):** `clintonjavery/content/p/{apertus-open-source-llm,bicycle-or-wheelchair,books-are-good,creating-a-package,dialogues-with-the-robot,does-genai-remove-the-bottleneck,making-things-harder,mass-migration-from-the-cloud,run-a-model-locally,security-and-obscurity,three-concepts-for-support,triple-dt-software-engineering-framework,two-mindsets-of-engineering,two-powershell-commands-of-domain-transfer,values-beyond-the-bottom-line}.mdx`
**DELETED (3, app):** `clintonjavery/src/data/posts.tsx`, `clintonjavery/src/pages/Writing.tsx`, `clintonjavery/src/pages/Post.tsx`
**UPDATED (1, app):** `clintonjavery/src/content/validate.test.ts` (integration assertion → durable order-presence form)
**NEW (3, provenance/story — `_bmad-output/`, not shipped):** `migrate-2-1.mjs`, `verify-2-1.mjs`, `2-1-migrate-existing-essay-posts.md`
**UNCHANGED:** `clintonjavery/package.json`, `index.html`, `vite.config.ts`, `src/content/{schema,validate,plugin,index,virtual.d}.ts`, `src/data/gallery.tsx`, `src/pages/Gallery.tsx`, `public/_redirects`, all Epic-1 components/config.

### Change Log

- 2026-08-08 — Story 2.1 spec authored (create-story intent) and implemented (dev-story) in one pass (Clint: "start on Epic 2… Go"). Surfaced and resolved the 15-vs-16 count with Clint before authoring. Extracted 15 bodies programmatically (no transcription error); hand-finished the 2 code-heavy posts for MDX safety. Build/lint/110-tests green. Word-multiset preservation 0/15 (SM-2/NFR-7 text-level proven). `posts.tsx` + 2 dead importers deleted (content now file-based). `validate.test.ts` integration assertion rewritten to a durable order-presence invariant. Status `review` — commit + visual spot-check + count reconciliation are Clint's gate. Slugs (old→new) table captured above as the authoritative input for Story 2.2.