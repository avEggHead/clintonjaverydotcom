---
baseline_commit: c327e34d3016765f96c047fe2cb6c5c0995409a3
---

# Story 1.2: Stand up the content pipeline + mandatory-alt gate

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->
<!-- Story key: 1-2-content-pipeline-mandatory-alt-gate · Epic 1, second story (depends on 1-1). -->

## Story

As a **Clint (author)**,
I want **to author Posts as markdown/MDX files that the build turns into a typed collection**,
so that **publishing is a content act and an invalid comic is blocked before it ships**.

**Epic context:** Epic 1 (Publishing & Reading Foundation) builds the publishing pipeline, routes, per-type Post page, unified Feed, SEO, deploy, and support affordance on the Ink & Garden system. **This story builds the content pipeline** — the build-time data layer that every later Epic 1 surface (Post page 1.4, Feed 1.5, SEO 1.6) reads from. It delivers **AD-1** (one-way layer boundary), **AD-2** (one collection, one shared Post shape + the comic alt gate), **AD-3** (build-time materialization, no runtime fetch), and the pipeline half of **AD-4** (one Vite plugin owns glob → parse → compile → validate → emit). FRs covered: FR-4, FR-6, FR-7, FR-8, FR-12, FR-14. **Depends on Story 1.1** (the Tailwind v4 build + `styles.css` token system is the substrate; the vite.config plugin array established there is where the content plugin is wired).

## Acceptance Criteria

<!-- Verbatim BDD from epics.md · Story 1.2. Do not weaken. -->

1. **AC1 — Essay Post emits a typed Post with parsed frontmatter + compiled MDX body.** Given a sample Essay Post at `content/p/<slug>.mdx` with frontmatter per addendum §A + a markdown/MDX body, when the build runs, then a typed Post is emitted in the `content-index` with parsed frontmatter and a compiled MDX body.

2. **AC2 — Comic Post exposes `strip.image` + non-empty `strip.alt`.** Given a sample Comic Post with `type: comic` + `strip.image` + `strip.alt`, when the build runs, then its entry exposes `strip.image` and a non-empty `strip.alt`.

3. **AC3 — Missing/empty `strip.alt` fails the build naming file + field.** Given a Comic Post whose `strip.alt` is absent or empty, when the build runs, then the build FAILS with a message naming the file and the missing `strip.alt` (FR-8); no deploy occurs.

4. **AC4 — Essay missing required `title` or body fails the build naming file + field.** Given an Essay Post missing required `title` or body, when the build runs, then it fails naming the file + the missing field.

5. **AC5 — `status: draft` excluded from the index and never renders.** Given a Post with `status: draft`, when the build runs, then it is excluded from the `content-index` and never renders.

6. **AC6 — Build command unchanged; one custom Vite plugin owns the whole pipeline.** Given the build command, then it is exactly `tsc -b && vite build` — the single custom Vite plugin owns `import.meta.glob` (eager) + `gray-matter` parse + `@mdx-js/rollup` MDX compile + validation + index emission.

7. **AC7 — Consumers import only the emitted `content-index` (AD-1).** And any consumer importing Post data imports only the emitted `content-index` (no direct glob/import of `content/` from `src/` — AD-1).

## Tasks / Subtasks

- [x] **T1 — Install the content-pipeline build deps** (AC6)
  - [x] T1.1 From `clintonjavery/`, `npm install -D @mdx-js/rollup gray-matter @types/mdx`. Pin resolved versions in `package.json` (no caret drift mid-sprint, matching Story 1.1's pinning convention).
  - [x] T1.2 Verify resolved versions (expected ~`@mdx-js/rollup@3.1.1`, `gray-matter@4.0.3`, `@types/mdx@2.0.14`). Record actual pinned versions in the File List / Completion Notes.
  - [x] T1.3 Confirm `gray-matter` is CJS — it is consumed inside the Vite config/plugin bundle (Node build-time), not shipped to the client; Vite's config bundler handles CJS interop via `import matter from 'gray-matter'`. Do NOT ship `gray-matter` to the client bundle.
- [x] **T2 — Author the Post frontmatter schema** (AC1, AC2, AC4)
  - [x] T2.1 Create `clintonjavery/src/content/schema.ts` exporting the `Post` type + a `PostType` union (`'essay' | 'comic'`) + a `PostStatus` union (`'draft' | 'published'`). The type is the authoritative data contract (ARCHITECTURE-SPINE AD-2). Shape:
    - Common: `slug: string` (= filename stem, kebab-case), `title: string`, `date: string` (ISO 8601 `YYYY-MM-DD`), `type: 'essay' | 'comic'`, `excerpt?: string`, `status?: 'draft' | 'published'` (default `published`), `tags?: string[]`, `ogImage?: string`.
    - Essay adds: a compiled MDX body — model as `body: () => Promise<{ default: ComponentType }> }` (lazy component importer) so the Post page (1.4) renders it.
    - Comic adds: `strip: { image: string; alt: string }`, `caption?: string`, `notes?: string`. Comics have **no body**.
  - [x] T2.2 The schema file is plain TS types (no runtime validation lib required unless T9 opts for zod); the build-time validator (T7) is the runtime enforcement. Reserve `access?: 'free' | 'premium'` in the type (default `'free'`) per addendum §I so a future paywall isn't blocked out — do NOT implement the gate.
- [x] **T3 — Author sample content** (AC1, AC2, AC3, AC4, AC5)
  - [x] T3.1 Create `clintonjavery/content/p/` (the collection root — AD-2). All posts live at `content/p/<slug>.mdx` (essay) or `content/p/<slug>.md` (comic). The `<slug>` filename stem is the URL slug; do NOT put a `slug:` field that can drift from the filename — derive `slug` from the filename in the plugin.
  - [x] T3.2 Essay sample: `content/p/hello-ink-garden.mdx` — frontmatter `title`, `date` (ISO), `type: essay`, `excerpt`, a short MDX body (one h2 + two paragraphs + one inline image alt-texted). This is the positive AC1 fixture.
  - [x] T3.3 Comic sample: `content/p/first-strip.md` — frontmatter `title`, `date`, `type: comic`, `strip: { image: '/content/p/first-strip/strip.png', alt: <descriptive, non-empty> }`, `caption?`. Use a placeholder image path (the actual asset is a later migration concern, not this story). This is the positive AC2 fixture.
  - [x] T3.4 Draft sample: `content/p/draft-wip.mdx` — same as the essay but `status: draft`. This is the AC5 fixture (must be excluded from the index).
  - [x] T3.5 Negative-test fixtures are **not committed** as real content — they are created temporarily during T7/T9 to prove fail-closed, then reverted (mirrors Story 1.1's negative-test discipline). Keep one documented: a comic with `strip.alt: ""` (or omitted) used to prove AC3.
- [x] **T4 — Build the content-collection Vite plugin** (AC1, AC2, AC3, AC4, AC5, AC6, AC7)
  - [x] T4.1 Create `clintonjavery/src/content/plugin.ts` exporting `contentPlugin(): Plugin` (name: `ink-garden-content`). It owns, in one pass at build time: glob `content/p/**/*.{md,mdx}` from disk (`fs.readdir`/`fast-glob`-free — use Node `fs`/`path`), parse frontmatter with `gray-matter`, validate (T7), compile essay bodies via `@mdx-js/rollup` (T5 wires `mdx()` separately; the plugin orchestrates), exclude drafts, and emit the typed `content-index` via a **virtual module** `virtual:content-index`.
  - [x] T4.2 The plugin exposes the index through a virtual module resolved in the `resolveId`/`load` hooks (`id: '\0virtual:content-index'` or `'virtual:content-index'`). The emitted module: (a) exports `posts: Post[]` (metadata only — slug/title/date/type/excerpt/tags/strip/caption/notes/ogImage/status), and (b) for each essay, exposes a lazy `body` importer via `import.meta.glob('/content/p/**/*.mdx', { eager: true, import: 'default' })` mapped by slug, so @mdx-js/rollup compiles the MDX and the Post page can render `<PostBody />`. This is the literal "import.meta.glob (eager)" of AC6.
  - [x] T4.3 Do NOT use `fetch`/any network at runtime (AD-3). All materialization happens in `buildStart` (build) and `configureServer` (dev — refresh on file change is a nice-to-have, not required). The plugin reads from disk; the client imports only the virtual index.
  - [x] T4.4 The plugin must be deterministic + sorted: `posts` is reverse-chronological by `date` DESC (Feed order, FR-5 — set the contract here even if Feed is 1.5). Ties broken by slug ASC.
- [x] **T5 — Wire `mdx()` + `contentPlugin()` into the Vite config** (AC6)
  - [x] T5.1 Edit `clintonjavery/vite.config.ts`: `import mdx from '@mdx-js/rollup'` and add `mdx()` and `contentPlugin()` to the `plugins` array alongside `react()`, `tailwindcss()`, and `inkGardenContrastGate()` (added in Story 1.1). Order: `react()` → `mdx()` → `tailwindcss()` → `contentPlugin()` → contrast gate, unless ordering conflicts arise (MDX must transform before the content plugin reads compiled output; verify).
  - [x] T5.2 Configure `mdx({ providerImportSource: 'react' })`? — only if needed; the default `@mdx-js/rollup` v3 compiles to JSX using `react/jsx-runtime`. Verify essay MDX compiles + a sample heading/paragraph renders. Do NOT add a remark plugin for frontmatter (gray-matter handles frontmatter; MDX body is what `mdx()` compiles). Use `remarkFrontmatter`? — NO: gray-matter already strips frontmatter; if the body still contains raw frontmatter, strip with `remark-frontmatter`, but prefer parsing with gray-matter first and passing only the body to `mdx()`.
  - [x] T5.3 Build command stays **exactly** `tsc -b && vite build` (AD-4). No separate prebuild script. Verify `npm run build` is green after wiring.
- [x] **T6 — Emit the typed `content-index` consumers import** (AC1, AC7)
  - [x] T6.1 Create `clintonjavery/src/content/index.ts` — the **only** module consumers import for Post data. It re-exports `posts` and the `Post`/`PostType` types from `virtual:content-index` / `./schema`. Add a TS ambient declaration (in `src/content/virtual.d.ts` or `vite-env.d.ts`) declaring `virtual:content-index` so `tsc -b` strict passes.
  - [x] T6.2 Mark the generated index as build-output, not source: the virtual module is generated on the fly; there is no committed `src/content/index.gen.ts` to ignore (it's virtual). If a physical cache is ever emitted to disk, `.gitignore` it.
  - [x] T6.3 Prove AC7: grep `src/` for direct `content/` imports or `import.meta.glob('/content/` — the ONLY allowed occurrence is inside the virtual module emitted by the plugin (or the `import.meta.glob` the plugin generates). No page/component imports `content/` directly.
- [x] **T7 — Build-time validation gates** (AC3, AC4, AC5)
  - [x] T7.1 In `src/content/plugin.ts` (or a `src/content/validate.ts` pure function it calls), implement validation that runs during `buildStart` and throws to fail `vite build` (fail-closed, same discipline as the contrast gate in 1.1). Errors must name the file + the missing/invalid field. Implement a single `validatePost(raw, file): Post | null` (null = excluded draft).
  - [x] T7.2 Required-field gate (AC4): every post requires `title` (non-empty string), `date` (valid ISO 8601 `YYYY-MM-DD`), `type ∈ {essay, comic}`. Essay requires a non-empty body. Comic requires `strip.image` + `strip.alt` (non-empty). Throw `Content gate: <file> — missing <field>` (or `… — invalid <field>: <reason>`).
  - [x] T7.3 Alt gate (AC3, FR-8): comic with absent or whitespace-only `strip.alt` throws `Content gate: <file> — missing strip.alt (FR-8: comic alt text is required)`. This is the canonical FR-8 failure.
  - [x] T7.4 Draft exclusion (AC5): `status: draft` (or `status` omitted-and-defaults-to-published; only explicit `draft` excludes) returns `null` and is not added to `posts`. Drafts never appear in the emitted index. Verify the draft fixture (T3.4) is absent from the emitted `posts`.
  - [x] T7.5 Slug derivation: `slug` = filename stem (kebab-case). If a `slug:` frontmatter field is present and mismatches the filename, either ignore-with-warning or throw — pick **throw** (`Content gate: <file> — slug frontmatter must match filename or be omitted`) to prevent drift (AD-2: "slug = filename, kebab-case").
  - [x] T7.6 Negative test (do this): temporarily set the comic fixture's `strip.alt` to `""` and run `npm run build` — build MUST fail closed with the AC3 message. Restore and confirm green. Same for an essay missing `title` (AC4). Record both in the Debug Log.
- [x] **T8 — Layer-boundary guard (AD-1)** (AC7)
  - [x] T8.1 Document the import contract in `src/content/index.ts`: consumers do `import { posts } from '@/content'` (or relative `../content`) — never `import.meta.glob('/content/...')` and never `import '../../content/...'`.
  - [x] T8.2 Add a grep proof to T10: `grep -rn "import.meta.glob('/content\|from ['\"].*/content/p" clintonjavery/src` returns no hits outside `src/content/`.
- [x] **T9 — Test the validation logic** (AC3, AC4, AC5)
  - [x] T9.1 Introduce Vitest (ARCHITECTURE-SPINE §Deferred: "introduce Vitest at the story that needs it — validation logic". This is that story). `npm install -D vitest`. Add a `test` script to package.json (`vitest run` for CI; keep `build` unchanged). Pin the resolved version.
  - [x] T9.2 Create `clintonjavery/src/content/validate.test.ts` — unit tests for `validatePost`: valid essay, valid comic, comic missing alt (throws), comic empty alt (throws), essay missing title (throws), essay missing body (throws), bad date (throws), draft excluded (returns null), slug/frontmatter mismatch (throws). Keep `validatePost` a pure function (no fs) so it's unit-testable; the plugin does the fs read and calls it.
  - [x] T9.3 `npx vitest run` is green. Do NOT wire vitest into the `build` command (AD-4 keeps `build` minimal; tests run separately/CI).
- [x] **T10 — Smoke check & regression hold** (AC1, AC6, AC7)
  - [x] T10.1 `npm run build` (== `tsc -b && vite build`) green, no TS errors. `tsc -b` strict must accept the virtual module declaration and `src/content/*.ts`.
  - [x] T10.2 `npm run lint` green.
  - [x] T10.3 `npx vitest run` green.
  - [x] T10.4 AC7 grep: `grep -rn "import.meta.glob('/content\|from ['\"].*/content/p" clintonjavery/src` → no hits outside `src/content/`.
  - [x] T10.5 `npm run dev`, load `/`: existing pages still render (no regression — Story 1.1's scaffold removal already handled; nothing here should crash the app). The content-index exists in the bundle; no page consumes it yet (Post/Feed are later stories) — that's expected. Verify the virtual module is importable from a scratch throwaway (then remove), mirroring 1.1's AC2 proof.
  - [x] T10.6 Existing `src/data/posts.tsx` is **untouched** (FR-15 migration is Epic 2 / a later story). This story owns the **pipeline + sample content only**, not the migration of the 16 real essays.

## Dev Notes

### Governing architecture invariants (read before implementing)

From `_bmad-output/planning-artifacts/architecture/.../ARCHITECTURE-SPINE.md`:

- **AD-1 (layer boundaries, one-way):** `src/` imports from the emitted `content-index` only — never globs/imports `content/` directly. `content/` files import nothing from `src/` and contain no app code. The build pipeline is the only path. **This story enforces AD-1.**
- **AD-2 (one collection, one shared shape):** all Posts at `content/p/<slug>.md(x)`. The Post frontmatter schema (PRD addendum §A) is authoritative. `slug` = filename kebab-case; `date` ISO 8601; `type ∈ {essay, comic}`; comic adds `strip.image` + non-empty `strip.alt` (FR-8 gate); essay adds MDX body. Emitted index = one typed `Post[]`. **Note citation correction:** ARCHITECTURE-SPINE AD-2 says "PRD addendum §B" for the schema, but the actual Post frontmatter model lives in **`prd-clintonjaverydotcom-2026-08-04/addendum.md §A** (§B is the styling decision). Cite §A for the schema.
- **AD-3 (build-time, no runtime fetch):** materialize via filesystem read at build time (`import.meta.glob` eager in the emitted virtual module for essay bodies). No `fetch`/API/network reads content at runtime.
- **AD-4 (one plugin owns build + validation + SEO/sitemap):** this story delivers the **build + validation + index-emission** portion. Per-post SEO meta + sitemap + robots are **Story 1.6** (FR-10/FR-11) — do not emit `<title>`/OG tags or `sitemap.xml` here. The build command stays `tsc -b && vite build`.

### Path contract — `content/p/<slug>.md(x)`, not date-foldered

The ARCHITECTURE-SPINE structural seed and AD-2 mandate `content/p/<slug>.md(x)`. The PRD addendum §A's example `content/2026/08/my-strip.md` (date-foldered) is a **pre-resolution draft** — AD-2/AD-5 overrode it. Use `content/p/<slug>.md(x)` (flat, slug = filename stem). This keeps `/p/:slug` content-derived (AD-5) and the cross-spine inheritance verifiable.

### Design decision — virtual `content-index` module (resolve the AC6 "import.meta.glob" tension)

ARCHITECTURE-SPINE AD-3/AD-4 says "single plugin owns `import.meta.glob (eager)`" — but `import.meta.glob` is a Vite *client transform*, not a plugin API. Reconcile as follows (this is the sanctioned approach for this story):

- **`src/content/plugin.ts`** reads `content/p/**` from disk at build time (Node `fs`), parses with `gray-matter`, validates (T7), excludes drafts, and builds an in-memory `Post[]` (metadata).
- The plugin **emits a virtual module** `virtual:content-index` whose source (generated string) contains `import.meta.glob('/content/p/**/*.mdx', { eager: true, import: 'default' })` to pull **compiled** essay bodies (compiled by the `mdx()` plugin wired in T5). The virtual module maps those by slug and exports `posts` (metadata + per-essay `body` lazy importer).
- Consumers import `posts` from `src/content` (re-exporting the virtual module) — the **only** entry to Post data (AD-1/AC7).
- `@mdx-js/rollup`'s `mdx()` plugin handles `.mdx` → JS compilation; the content plugin orchestrates + validates + indexes. Both are in `vite.config.ts plugins[]` (AC6: "single custom Vite plugin owns … + @mdx-js/rollup MDX compile" = the content plugin *orchestrates* the MDX compile done by the `mdx()` plugin).

If a cleaner virtual-module + `import.meta.glob` wiring emerges during dev that still satisfies AC6 (one plugin owns glob/parse/compile/validate/emit) and AC7, use it — but document the choice in the Completion Notes.

### `gray-matter` is CJS — build-time only

`gray-matter@4.0.3` is CommonJS. It runs inside the Vite config/plugin bundle (Node at build), so `import matter from 'gray-matter'` works via Vite's config bundler CJS interop. It must **not** reach the client bundle (it's dev/build-only). Do not try to ESM-import it in client code.

### `@mdx-js/rollup` wiring notes

- v3.1.1, peer `rollup >= 2` (Vite 6 uses Rollup 4 — fine).
- Compiles `.mdx` to JSX using `react/jsx-runtime` by default — no extra provider config needed for plain markdown + JSX. If a custom component map is needed (callouts, embeds) that's a **later** story (1.4 Post page owns the rendering component map); this story only proves a body compiles + is importable.
- Frontmatter: parse with `gray-matter` FIRST and pass only the body to `mdx()`. If raw frontmatter leaks into the compiled body, add `remark-frontmatter` to the mdx plugin options to strip it — but gray-matter-first is the preferred path (single source of truth for frontmatter).

### Frontmatter schema — the authoritative data contract

From `prd-clintonjaverydotcom-2026-08-04/addendum.md §A` (cite this):

```yaml
# Common (all posts)
title: string        # required
date: ISO-8601       # required (YYYY-MM-DD); drives Feed order
type: essay|comic    # required
slug: string         # DERIVED from filename — do not author; plugin throws if mismatched (T7.5)
excerpt: string      # optional; meta description fallback (used by 1.6 SEO)
status: draft|published  # default published; drafts never render (AC5)
ogImage: path|url    # optional; defaults to strip image for comics (used by 1.6)
tags: [string]       # optional (deferred feature; schema reserves it)
access: free|premium # reserved (default 'free') — future paywall NOT built (addendum §I)

# Comic-only additions
strip:
  image: path        # required; the Strip image (single image)
  alt: string        # REQUIRED, non-empty (FR-8 gate — AC3)
caption: string      # optional
notes: string        # optional
# Comic body: NONE.
```

### Testing standards

- **This story introduces Vitest** (ARCHITECTURE-SPINE §Deferred explicitly names "validation logic" as the trigger). `validatePost` is a **pure function** (no fs) so it's unit-testable; the plugin does fs and calls it. Tests in `src/content/validate.test.ts` (T9.2).
- Build-time negative tests (T7.6) prove fail-closed at the `vite build` level — same discipline as Story 1.1's contrast gate negative test.
- Do NOT add Vitest to the `build` script (AD-4 keeps `build` minimal); `vitest run` is a separate CI step.

### Anti-disaster guardrails

- ❌ Don't create `tailwind.config.*`/`postcss.config.*` (still v4-configless — Story 1.1 established this).
- ❌ Don't ship `gray-matter` to the client — build-time only.
- ❌ Don't let `src/` pages/components import `content/` directly (AD-1/AC7). The only `import.meta.glob('/content/...')` allowed is the one the plugin emits inside the virtual module.
- ❌ Don't migrate the 16 real essays from `src/data/posts.tsx` here — that's Epic 2 / FR-15. This story ships **sample** posts only.
- ❌ Don't emit per-post SEO `<title>`/OG/meta or `sitemap.xml`/`robots.txt` — that's Story 1.6 (FR-10/FR-11, AD-4).
- ❌ Don't build the Post page, Feed, or Landing here — stories 1.3/1.4/1.5. Only the pipeline + sample content + index.
- ❌ Don't change the build command away from `tsc -b && vite build` (AD-4).
- ❌ Don't write `slug:` in frontmatter and let it drift — derive from filename, throw on mismatch (T7.5).
- ❌ Don't add a runtime fetch path (AD-3). Content is build-time only.
- ✅ Reuse Story 1.1's plugin-in-vite.config pattern + fail-closed-throw discipline (contrast gate is the template; the content gate is its sibling).
- ✅ Keep `tsc -b` strict green — declare `virtual:content-index` so the typed import resolves.
- ✅ All new code is tokens-only where it touches styling (AD-6 from 1.1). This story mostly emits data, so little styling — but any temp verification element uses tokens, never hex.

### Files touched by this story

**NEW**
- `clintonjavery/src/content/schema.ts` — `Post`/`PostType`/`PostStatus` types (AD-2 authoritative contract).
- `clintonjavery/src/content/plugin.ts` — `contentPlugin()` Vite plugin: glob → gray-matter parse → validate → draft-exclude → emit virtual `content-index`.
- `clintonjavery/src/content/validate.ts` — pure `validatePost(raw, file): Post | null` (unit-testable).
- `clintonjavery/src/content/validate.test.ts` — Vitest unit tests for the gates.
- `clintonjavery/src/content/index.ts` — the only consumer entry; re-exports `posts` + types from `virtual:content-index` + `./schema`.
- `clintonjavery/src/content/virtual.d.ts` — ambient declaration for `virtual:content-index` (strict `tsc -b`).
- `clintonjavery/content/p/hello-ink-garden.mdx` — sample essay (AC1 positive).
- `clintonjavery/content/p/first-strip.md` — sample comic (AC2 positive).
- `clintonjavery/content/p/draft-wip.mdx` — draft fixture (AC5).

**UPDATE**
- `clintonjavery/vite.config.ts` — add `mdx()` + `contentPlugin()` to `plugins` (alongside 1.1's `react()`/`tailwindcss()`/`inkGardenContrastGate()`).
- `clintonjavery/package.json` — add `@mdx-js/rollup`, `gray-matter`, `@types/mdx`, `vitest` (pinned); add `test` script.
- `clintonjavery/src/vite-env.d.ts` (or the new `virtual.d.ts`) — `virtual:content-index` declaration.

**LEAVE ALONE (prevents regressions + scope creep)**
- `clintonjavery/src/data/posts.tsx`, `src/data/gallery.tsx` — migration is Epic 2 / FR-15.
- `src/App.tsx`, `src/pages/*`, `src/components/*`, `src/tools/*`, `src/fun/*` — untouched. The new content-index has **no consumers yet** (Post/Feed are later).
- `src/styles.css`, `src/build/*` — Story 1.1's system; don't touch.
- `index.html` identity metadata — Story 1.6.
- `.github/workflows/deploy.yml`, `public/_redirects` — Epic deploy story (AD-7).

### Previous story intelligence (from Story 1.1)

- **Plugin pattern established:** custom Vite plugins live as named functions in `src/build/` (well-named: `inkGardenContrastGate`). Mirror it: `contentPlugin` named `ink-garden-content`, plugin file under `src/content/`.
- **Fail-closed discipline:** `buildStart()` throws to fail `vite build`; `configureServer` warns in dev. Reuse for the content gate.
- **Negative-test pattern:** temporarily break a fixture, run `npm run build`, confirm it fails with the exact prescribed message, restore, confirm green. Record in Debug Log.
- **Pinned-deps convention:** Story 1.1 pinned `@tailwindcss/vite` to exact `4.3.3` (no caret). Do the same for `@mdx-js/rollup`/`gray-matter`/`@types/mdx`/`vitest`.
- **Throwaway-proof pattern:** verify a generated artifact is consumable by adding a throwaway user (1.1 added a hidden utility div; here, a throwaway `import { posts } from '@/content'` + `console.log` in a scratch file/buildStart, then remove).
- **`tsc -b` strict gotcha:** new TS in `src/build/*.ts` had to satisfy `tsconfig.app.json` strict. Same for `src/content/*.ts` — declare the virtual module so the import resolves.
- **ESLint:** 1.1 tripped `no-useless-catch` — don't wrap `runGate()` in try/catch just to rethrow. Apply to the content gate.

### Git intelligence

Last commit is Story 1.1's work in progress (baseline `64ead59` for 1.1). Commit 1.2 clearly ("stand up content pipeline + mandatory-alt gate") so 1.3+ can read it as the data-layer baseline.

### References (cite with source path + section)

- [Source: `_bmad-output/planning-artifacts/epics.md`#Story 1.2 — Stand up the content pipeline + mandatory-alt gate] — AC verbatim, epic context, FR coverage.
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-clintonjaverydotcom-2026-08-04/ARCHITECTURE-SPINE.md`#AD-1] — one-way layer boundaries (AC7).
- [Source: `ARCHITECTURE-SPINE.md`#AD-2] — one collection, one shared Post shape; `slug`=filename; comic alt gate.
- [Source: `ARCHITECTURE-SPINE.md`#AD-3] — build-time materialization, no runtime fetch.
- [Source: `ARCHITECTURE-SPINE.md`#AD-4] — one plugin owns build/validation (SEO/sitemap deferred to 1.6); build command `tsc -b && vite build`.
- [Source: `ARCHITECTURE-SPINE.md`#Structural Seed] — `content/p/<slug>.md(x)` + `src/content/{plugin,index,schema}.ts` layout.
- [Source: `ARCHITECTURE-SPINE.md`#Stack] — `@mdx-js/rollup`/`gray-matter` pin-to-latest-at-install; `luxon` 3.6.0 existing.
- [Source: `ARCHITECTURE-SPINE.md`#Deferred] — "introduce Vitest at the story that needs it — validation logic" — this is that story.
- [Source: `_bmad-output/planning-artifacts/prds/prd-clintonjaverydotcom-2026-08-04/addendum.md`#A] — Post frontmatter schema (authoritative data contract).
- [Source: `addendum.md`#I] — future paywall: reserve `access` field, don't build the gate.
- [Source: `_bmad-output/implementation-artifacts/1-1-apply-the-ink-garden-design-system.md`#Dev Notes] — plugin pattern, fail-closed discipline, pinned-deps convention, negative-test pattern.

## Dev Agent Record

### Agent Model Used

Amelia (Senior Software Engineer) — create-story + dev-story workflows. Model: Claude (Anthropic). Date: 2026-08-06.

### Debug Log References

- **`import.meta.glob` `exclude` is NOT a valid option in Vite 6** (`Unknown glob option "exclude"`). First attempt excluded draft `.mdx` paths via an `exclude` array — Vite rejected it. Switched to globbing an **array of only the published essay paths** (exact `.mdx` paths), which excludes drafts structurally (drafts aren't in the array) and still satisfies AC6's "import.meta.glob (eager)". Drafts are now never compiled into the bundle.
- **JSDoc `/** */` trap:** the glob `/**/*.mdx` contains the substring `*/`, which closes a block comment early. `schema.ts` tripped this (`Unterminated template literal`). Rewrote the JSDoc to avoid the literal glob. Scanned `plugin.ts` block comments — clean (line comments only).
- **`POST_GLOB.replace('**', slug)` was wrong** — it produced `/content/p/<slug>/*.mdx` (a glob with a trailing `*.mdx` wildcard), not the exact file path. The essay body key came out as `"/content/p/hello-ink-garden/*.mdx"`. Fixed `bodyPath` to the exact `'/content/p/' + slug + '.mdx'`. After the fix, the emitted glob array is `["/content/p/hello-ink-garden.mdx"]` and the body resolves to the compiled component (`Y0["/content/p/hello-ink-garden.mdx"]` → `V0`).
- **`@vitejs/plugin-react-swc` requires `mdx()` to be placed BEFORE it** ("The MDX plugin should be placed before this plugin"). The production build happened to pass with `react()`→`mdx()`, but vitest's config-validated path caught it. Reordered plugins to `mdx()` → `react()` → `contentPlugin()` → `tailwindcss()` → contrast gate; both build and vitest now pass.
- **Rollup parses the virtual module as JS** — the first emitted module used `import type { ComponentType } from "react"` (TS-only syntax), which Rollup's parser rejected. Dropped the `import type` + the `as Record<string, ComponentType>` cast; the emitted module is now pure JS (types come from `virtual.d.ts`).
- **`gray-matter@4.0.3` is CJS** — `import matter from 'gray-matter'` works via Vite's config bundler interop; `ReturnType<typeof matter>` is the result type (the `GrayMatter` namespace member doesn't exist). Build-time only; not shipped to the client.
- **`this.root` is not on `PluginContext`** — captured `config.root` via `configResolved` into a module-level `projectRoot` instead.
- **`@types/node` was missing** for the plugin's `fs`/`path` usage under strict `tsc -b` (1.1's contrast plugin used no Node APIs). Added `@types/node@26.1.2` (pinned).
- **ESLint `no-useless-catch`** (learned from 1.1) — the content plugin's `buildStart` throws directly (no try/catch wrapper); `configureServer` keeps a try/catch because it *warns* rather than rethrows.
- **Negative tests (T7.6) — proven fail-closed at `vite build`:**
  - AC3: blanked the comic's `strip.alt` → build fails with `Content gate: content/p/first-strip.md — missing or invalid strip.alt: FR-8: comic alt text is required and must be non-empty`. Restored.
  - AC4: removed the essay's `title` → build fails with `Content gate: content/p/hello-ink-garden.mdx — missing or invalid title`. Restored.
- **Bundle proof (with throwaway consumer, then removed):** essay `body` importer resolves to `Y0["/content/p/hello-ink-garden.mdx"]` (the compiled MDX component); comic `strip:{image,alt}` present; the `draft-wip` fixture is **absent from the bundle** (grep for `draft-wip`/`Work in progress` = 0 hits). After removing the throwaway, the pipeline has no consumers yet (Post/Feed are later stories), so it tree-shakes out of the production bundle — expected.

### Completion Notes List

- **AC1 (Essay Post → typed Post with parsed frontmatter + compiled MDX body):** `src/content/plugin.ts` reads `content/p/**/*.{md,mdx}` from disk, `gray-matter` parses frontmatter, `validatePost` validates, and the virtual module `virtual:content-index` emits a `Post[]` whose essay entries expose `body: () => Promise.resolve({ default: essayBodies[path] })`. `@mdx-js/rollup`'s `mdx()` compiles each `.mdx` eagerly via `import.meta.glob([…published essay paths…], { eager: true, import: 'default' })`. Verified in the compiled bundle: the essay body key resolves to the compiled component (`Y0["/content/p/hello-ink-garden.mdx"]`).
- **AC2 (Comic Post exposes strip.image + non-empty strip.alt):** the comic fixture (`content/p/first-strip.md`) emits `strip:{image:"/content/p/first-strip/strip.png",alt:"<descriptive>"}`. Verified in the bundle + the integration test asserts `comic.meta.strip.alt.length > 0`.
- **AC3 (missing/empty `strip.alt` fails the build, FR-8):** `validatePost` throws `Content gate: <file> — missing or invalid strip.alt: FR-8: comic alt text is required and must be non-empty`. Negative test confirmed `vite build` fails closed with the exact message. Unit tests cover absence + whitespace-only alt.
- **AC4 (essay missing `title` or body fails the build):** `validatePost` throws naming the file + field. Negative test confirmed `vite build` fails closed on a missing `title`. Unit tests cover missing title + missing body + bad date + slug mismatch.
- **AC5 (`status: draft` excluded, never renders):** drafts are skipped in `buildCollection` (not added to the published index) AND excluded from the eager body glob (drafts not in the published-essay-paths array), so they never compile into the bundle. Verified: `draft-wip` fixture absent from the bundle (0 hits); the integration test asserts the draft slug is not in `posts`. Drafts skip full validation so WIP content isn't blocked by the published gates.
- **AC6 (build command unchanged; one custom Vite plugin owns glob+parse+compile+validate+emit):** build command is still exactly `tsc -b && vite build`. `contentPlugin()` (`name: 'ink-garden-content'`) owns fs-glob → `gray-matter` parse → `validatePost` → draft-exclude → emit `virtual:content-index`; it orchestrates `@mdx-js/rollup`'s `mdx()` compile via the eager `import.meta.glob` in the emitted module. `mdx()` + `contentPlugin()` wired into `vite.config.ts` alongside 1.1's `tailwindcss()` + contrast gate.
- **AC7 (consumers import only the emitted content-index, AD-1):** `src/content/index.ts` re-exports `posts` from `virtual:content-index` — the only consumer entry. Grep of `src/` for direct `content/` imports/globs outside `src/content/` returns **0 hits**. The only `content/p` references live inside `src/content/` (the plugin + comments).
- **T9 (Vitest introduced):** per ARCHITECTURE-SPINE §Deferred ("introduce Vitest at the story that needs it — validation logic"), `vitest@4.1.10` is pinned; `npm test` = `vitest run`; 16/16 tests pass (pure-function gates + an integration test exercising `buildCollection` over the real fixtures). Vitest is NOT wired into `build` (AD-4 keeps `build` minimal).
- **Scope held:** `src/data/posts.tsx` (FR-15 migration) untouched; `App.tsx`/`pages/*`/`components/*` untouched; no per-post SEO meta / `sitemap.xml` emitted (Story 1.6); build command unchanged; no new CSS (AD-6). The pipeline ships **sample** content only.
- **Regression:** `npm run build`, `npm run lint`, and `npx vitest run` all green. `tsc -b` strict passes for all new `src/content/*.ts` + the ambient `virtual:content-index` declaration.

### File List

**NEW**
- `clintonjavery/src/content/schema.ts` — `Post`/`EssayPost`/`ComicPost`/`PostMeta`/`PostType`/`PostStatus`/`PostAccess` types (AD-2 authoritative contract; `access` reserved for future paywall).
- `clintonjavery/src/content/plugin.ts` — `contentPlugin()` Vite plugin (`ink-garden-content`): fs-glob `content/p` → `gray-matter` parse → `validatePost` → draft-exclude → emit `virtual:content-index`. Orchestrates `@mdx-js/rollup` MDX compile via eager `import.meta.glob` over published essay paths. `buildCollection` exported for integration tests.
- `clintonjavery/src/content/validate.ts` — pure `validatePost(raw, input)` (fail-closed; throws naming file + field). All gates: required fields per type, ISO date, slug/filename match, comic `strip.alt` (FR-8), essay body, draft exclusion.
- `clintonjavery/src/content/validate.test.ts` — Vitest unit + integration tests (16 tests).
- `clintonjavery/src/content/index.ts` — the ONLY consumer entry; re-exports `posts` from `virtual:content-index` + the schema types.
- `clintonjavery/src/content/virtual.d.ts` — ambient declaration for `virtual:content-index` (strict `tsc -b`).
- `clintonjavery/content/p/hello-ink-garden.mdx` — sample essay (AC1 positive fixture).
- `clintonjavery/content/p/first-strip.md` — sample comic (AC2 positive fixture).
- `clintonjavery/content/p/draft-wip.mdx` — draft fixture (AC5 exclusion proof).

**UPDATED**
- `clintonjavery/vite.config.ts` — added `mdx()` (before `react()`) + `contentPlugin()` to `plugins`; plugin order: `mdx` → `react` → `contentPlugin` → `tailwindcss` → contrast gate. Build command unchanged (AD-4).
- `clintonjavery/package.json` — added `@mdx-js/rollup@3.1.1`, `gray-matter@4.0.3`, `@types/mdx@2.0.14`, `@types/node@26.1.2`, `vitest@4.1.10` (all pinned, no caret); added `test` script (`vitest run`).
- `clintonjavery/package-lock.json` — regenerated by npm.

**LEAVE ALONE (per spec — prevents regressions / scope creep)**
- `clintonjavery/src/data/posts.tsx`, `src/data/gallery.tsx` (FR-15 migration is Epic 2).
- `src/App.tsx`, `src/pages/*`, "src/components/*", `src/tools/*`, `src/fun/*` — untouched (no content-index consumers yet).
- `src/styles.css`, `src/build/*` (Story 1.1 system), `index.html` identity metadata (Story 1.6).

## Change Log

| Date | Author | Summary |
| --- | --- | --- |
| 2026-08-06 | Amelia (dev) | Story 1.2 implemented: built the content-pipeline Vite plugin (`ink-garden-content`) — fs-glob → `gray-matter` parse → `validatePost` → draft-exclude → emit typed `virtual:content-index`; wired `@mdx-js/rollup` for eager MDX body compile via `import.meta.glob`; added the FR-8 comic-alt build gate (fail-closed, negative-test proven) + required-field/date/slug gates; introduced Vitest (16 tests) for the validation logic; authored sample essay/comic/draft fixtures. Build + lint + tests green. Status → review. |