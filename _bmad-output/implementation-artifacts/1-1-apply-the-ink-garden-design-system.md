---
baseline_commit: 64ead59fcf506707f24de3c1b5290d8bdb784935
---

# Story 1.1: Apply the Ink & Garden design system

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->
<!-- Story key: 1-1-apply-the-ink-garden-design-system · Epic 1, first story (no prior story). -->

## Story

As a **Clint (author)**,
I want **the app restyled to my Ink & Garden identity via Tailwind v4**,
so that **every surface I build next is on-system without ad-hoc CSS**.

**Epic context:** Epic 1 (Publishing & Reading Foundation) builds the publishing pipeline, routes, per-type Post page, unified Feed, SEO, deploy, and support affordance on the Ink & Garden system. **This story is the foundation** — it puts the design system on the build so every later story composes with tokens instead of hex literals. FRs covered by the epic: FR-4..FR-8, FR-10..FR-12, FR-14. This story directly delivers the **AD-6** styling invariant and the **build-time WCAG AA contrast gate** that closes the UX open item.

## Acceptance Criteria

<!-- Verbatim BDD from epics.md · Story 1.1. Do not weaken. -->

1. **AC1 — Tailwind v4 wired, build green, tokens resolve as utilities.** Given Tailwind v4 is a devDependency but unwired, when I add `@tailwindcss/vite` + `@import "tailwindcss"` + a `@theme` block mapping every DESIGN.md token to `src/styles.css`, then `npm run build` succeeds and the tokens resolve as Tailwind utilities. *(Verifies `@tailwindcss/vite`/`@mdx-js/rollup`/`gray-matter` version pins — AR-13.)*

2. **AC2 — A utility exists for each DESIGN.md token, 1:1.** Given DESIGN.md defines color/typography/rounded/spacing tokens, when the build runs, then a utility exists for each token (e.g. `text-primary`, `bg-surface`, `font-display`) usable in components, mapping 1:1 to the DESIGN.md frontmatter.

3. **AC3 — Fraunces / Inter / JetBrains Mono load and apply to the correct roles.** Given the type system is Fraunces / Inter / JetBrains Mono, when the app loads, then all three load with correct fallbacks and apply to display / body-UI / code-eyebrow respectively; body line-height ≥1.6; eyebrow `0.14em` uppercase; titles never all-caps.

4. **AC4 — Build-time WCAG AA contrast gate passes (or locks the darker variants).** Given the build-time WCAG AA contrast gate asserts the load-bearing pairs, when it runs, then Primary-as-link-on-Surface and white-on-Primary are checked against 4.5:1; if a pair measures under, the build fails unless the darker variant (`#256628` / `#26702C`) is locked. **Closes the UX open item.**

5. **AC5 — No inline hex literals in new component code.** No inline hex literal remains in new component code (tokens-only).

## Tasks / Subtasks

- [x] **T1 — Install the Tailwind v4 Vite plugin** (AC1)
  - [x] T1.1 From `clintonjavery/`, `npm install -D @tailwindcss/vite` (peer of the already-installed `tailwindcss@^4.0.14`). Pin the resolved version in `package.json` (no caret drift mid-sprint).
  - [x] T1.2 Confirm `tailwindcss@^4.0.14` is already present in devDependencies; **do NOT** add `tailwind.config.js`/`postcss.config.js`/`autoprefixer` config files — Tailwind v4 is configless and configless-by-Vite-plugin. Verify no `tailwind.config.*` or `postcss.config.*` exists (currently none does).
  - [x] T1.3 Remove the now-obsolete v3-era devDeps so the build can't pick them up via a stray config: `npm uninstall autoprefixer postcss autoprefix` (`autoprefix` is a junk/typo package; `autoprefixer`+`postcss` were the v3 PostCSS chain). Verify `npm run build` still succeeds after removal.
- [x] **T2 — Wire the plugin into the Vite config** (AC1, AC4)
  - [x] T2.1 Edit `clintonjavery/vite.config.ts`: `import tailwindcss from '@tailwindcss/vite'` and add `tailwindcss()` to `plugins`. Keep `react()` (from `@vitejs/plugin-react-swc`) and `base: "/"` as-is.
  - [x] T2.2 Add the contrast-gate plugin (T6) to the same `plugins` array so it runs inside `vite build`/`vite` (dev). Build command stays exactly `tsc -b && vite build` — **no separate prebuild script** (AD-4).
- [x] **T3 — Create the single stylesheet `src/styles.css`** (AC1, AC2, AC3)
  - [x] T3.1 Create `clintonjavery/src/styles.css` with `@import "tailwindcss";` as the **first** line, then an `@theme { … }` block mapping every DESIGN.md token (see the **@theme mapping** table in Dev Notes). Use Tailwind v4 CSS-variable namespaces: `--color-*`, `--font-*`, `--radius-*`, `--spacing-*`, `--leading-*`, `--tracking-*`, `--text-*` (size).
  - [x] T3.2 Add the WCAG **darker-variant** tokens the gate depends on: `--color-link: #256628` (Primary-as-link-text on Surface) and `--color-primary-strong: #26702C` (button fill used with `--color-on-primary`). Keep `--color-primary: #2E7D32` for large/filled/CTA accents (AA-large 3:1). See Contrast gate spec.
  - [x] T3.3 Add base layer rules in a `@layer base { … }` block: set `body` to `font-family` Inter (`var(--font-body)`) + `line-height: 1.65` (≥1.6), `color: var(--color-on-surface)` on `var(--color-surface)` background; set `h1..h4` to `var(--font-display)`; titles `font-weight: 500`, never `text-transform: uppercase`; set `a` in-prose link color to `var(--color-link)` (not the Vite-scaffold `#646cff`); set eyebrow helper `.eyebrow { font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.14em; }`.
  - [x] T3.4 Map rounded (`--radius-md: 12px` etc.), spacing globals (`--spacing` unit 0.5rem), and max-widths (`prose-max` 720px, `feed-max` 1080px) so `rounded-md`, `max-w-prose`/container utilities exist for later stories. (Tailwind v4 reads `--radius-*` and the `--spacing` scale automatically.)
- [x] **T4 — Retire the Vite-scaffold stylesheet and point the entry at the system** (AC1, AC5)
  - [x] T4.1 In `clintonjavery/src/main.tsx`, replace `import './index.css'` with `import './styles.css'`. Keep `import "./styles/global.css"` for now (it is a 3-line reset — harmless; it can fold into `styles.css` base layer later). Order: `./styles.css` first, then `./styles/global.css` so the reset doesn't clobber utilities (utilities are layered above base anyway, but be explicit).
  - [x] T4.2 **Delete `clintonjavery/src/index.css`** once its rules are subsumed — it contains the forbidden Vite-scaffold colors (`#242424`, `#646cff`, `place-items: center` body layout hack) that DESIGN.md explicitly bans ("Don't reuse Vite scaffold colors"). Verify the app still renders (no layout regression from the removed body `place-items: center` — that rule only mattered to the scaffold demo `App.tsx`, which is being rebuilt anyway in later stories).
  - [x] T4.3 Grep the codebase for any surviving `#242424` / `#646cff` / `#535bf2` references; if any remain in component code, leave them in files slated for rebuild (Navbar.module.css etc.) but **do not introduce new ones** (AC5). New code = tokens only.
- [x] **T5 — Load the three font families** (AC3)
  - [x] T5.1 In `clintonjavery/index.html` `<head>`, add preconnect + the Google Fonts stylesheet for **Fraunces** (variable, optical sizing `opsz` 9..144, weights 400/500/600), **Inter** (400/500/600/700), **JetBrains Mono** (400/500/700). Use a single `<link>` request with `&family=` params (and `&display=swap`). Self-hosting is a fast-follow, not v1 — Google Fonts `<link>` is acceptable for v1 (no third-party tracker).
  - [x] T5.2 Ensure the `@theme` `--font-*` declarations specify the correct fallbacks: display → `'Fraunces', Georgia, serif`; body/UI → `'Inter', system-ui, sans-serif`; mono/eyebrow/code → `'JetBrains Mono', ui-monospace, monospace`. Tailwind v4 exposes these as `font-display`, `font-body`, `font-mono` utilities.
  - [x] T5.3 Verify: landing display + post titles render in Fraunces; body copy in Inter ≥1.6 line-height; eyebrows are mono `0.14em` uppercase; no title is all-caps.
- [x] **T6 — Build-time WCAG AA contrast gate (Vite plugin)** (AC4)
  - [x] T6.1 Create `clintonjavery/src/build/contrast-plugin.ts` exporting a Vite plugin (`name: 'ink-garden-contrast-gate'`) with a `buildStart()` (and `configureServer` for dev) that asserts the **load-bearing pairs** below against WCAG 2.1 normal-text 4.5:1. Fail the build (throw) naming the pair + measured ratio if a gated pair is under 4.5.
  - [x] T6.2 Declare the pairs in **one place** (e.g. `clintonjavery/src/build/contrast-pairs.ts`), each with `{fg, bg, min: 4.5, lockedIfUnder?: string}`. Initial set:
    - Ink `#1A1F1B` on Surface `#FBFAF6` (~16:1, passes)
    - On-Surface-Variant `#4A5249` on Surface `#FBFAF6` (~6.5:1, passes)
    - **Link** `#256628` on Surface `#FBFAF6` (locked darker — must pass)
    - **White** `#FFFFFF` on Primary-Strong `#26702C` (locked darker — must pass)
  - [x] T6.3 Implement the WCAG relative luminance + contrast-ratio function (sRGB → linear, `L = 0.2126 R + 0.7152 G + 0.0722 B`, ratio = `(L_light+0.05)/(L_dark+0.05)`). Keep it framework-free (plain TS) so it runs in Node at build.
  - [x] T6.4 If a gated pair measures under `min`, throw an `Error` formatted: `Contrast gate: <fg> on <bg> = <ratio>:1 (need 4.5:1) — lock <lockedIfUnder>`. Run `npm run build` and confirm it **fails closed** if you temporarily revert the link/button colors to `#2E7D32`.
  - [x] T6.5 Verify a passing run: with `#256628` and `#26702C` in place, `npm run build` succeeds and the gate logs a green summary (or is silent).
- [x] **T7 — Smoke check & regression hold** (AC1, AC3, AC5)
  - [x] T7.1 `npm run build` (== `tsc -b && vite build`) passes with no TS errors. `tsc -b` is strict (tsconfig.app.json) — make sure the new `src/build/*.ts` is included in the app TS project or excluded cleanly; don't fight the build over `.d.ts` noise.
  - [x] T7.2 `npm run dev`, load `/`: confirm the page is warm-paper (not dark), Fraunces title renders, body is Inter ≥1.6, default link is not `#646cff`.
  - [x] T7.3 Existing surfaces (Home, Writing, Comics, Projects, etc.) may look *partly* unstyled because their per-component `.module.css` still drive most of their look — **that is expected and is NOT a regression to fix in this story.** This story owns the *system*, not rebuilding pages. Only ensure nothing crashes and `div#root` renders.
  - [x] T7.4 Run a quick greppable proof for AC5: `grep -rn "#[0-9a-fA-F]\{3,6\}" clintonjavery/src/components clintonjavery/src/pages clintonjavery/src/build 2>/dev/null` and confirm **no new file authored in this story** contains a hex literal that's a style value (the declared pairs file is config, not component code — allowed).

## Dev Notes

### Project structure note — the app is under `clintonjavery/`, not the repo root

This is the single most important structural fact for this story. The repo has a `clintonjavery/` subdirectory that **is** the app (its own `package.json`, `vite.config.ts`, `node_modules`, `dist`, `public`, `src`). All file paths below are relative to `clintonjavery/`, e.g. `src/styles.css`, `vite.config.ts`, `src/main.tsx`. The architecture's structural seed shows `clintonjavery/src/...` — that's this folder. The repo root holds `.agents/`, `_bmad/`, `docs/`, and `clintonjavery/`. Do not create a second app at the root.

### Architecture compliance (AD-6 — this story's governing invariant)

AD-6 mandates: **Tailwind v4 wired via `@tailwindcss/vite` (no PostCSS)** and `@import "tailwindcss"` in a single `src/styles.css`; the `@theme` block maps every token from DESIGN.md by name; new UI uses Tailwind utility classes referencing `@theme` tokens; **CSS Modules are retired per-component as it is rebuilt (no new CSS Modules)**; **no inline hex literals in components**; and a **build-time contrast check** asserts the load-bearing token pairs and fails the build if under 4.5:1, locking the darker-green variants named in DESIGN.md (`#256628` / `#26702C`) where required. This story delivers AD-6 in full.

- AD-4 keeps the build command minimal: `tsc -b && vite build` with no separate prebuild script. → the contrast gate **lives in a Vite plugin**, not an `npm` script.
- Nothing in this story touches `content/` or the content pipeline (Story 1.2). Don't pre-build the content plugin.

### Tech stack & exact versions

| Package | Version | Action |
| --- | --- | --- |
| `tailwindcss` | `^4.0.14` | already in devDeps — leave as-is |
| `@tailwindcss/vite` | **install** — pin resolved version | `npm install -D @tailwindcss/vite` |
| `@vitejs/plugin-react-swc` | `^3.8.0` | keep |
| `vite` | `^6.2.0` | keep |
| `typescript` | `~5.7.2` (strict) | keep |
| `react`/`react-dom` | `^19.0.0` | keep (untouched this story) |
| `autoprefixer`, `postcss`, `autoprefix` | remove | v3-era PostCSS chain — Tailwind v4 via `@tailwindcss/vite` replaces it; `autoprefix` is a junk typo package |

> Tailwind v4 is **configless**: there is **no** `tailwind.config.js` and **no** `postcss.config.js` in this setup. Adding either is the v3 pattern and will conflict with the v4 Vite plugin. Do not generate them.

### Tailwind v4 mechanism (so you don't reinvent it)

- `@import "tailwindcss";` loads v4's preflight + the engine.
- The `@theme { --color-surface: #FBFAF6; … }` block declares design tokens as CSS variables **and** generates utilities named from the namespace: `--color-surface` → `bg-surface`/`text-surface`/`border-surface`; `--font-display` → `font-display`; `--radius-md` → `rounded-md`; `--text-display-lg: 56px` → `text-display-lg`; `--leading-prose: 1.65` → `leading-prose`.
- A utility "exists for each token" (AC2) means: after defining the `@theme` vars, every token above is usable as a Tailwind utility class in JSX. Verify by adding one throwaway class (`bg-surface text-primary`) to a temp element and confirming it compiles and renders — then remove it.
- Do NOT hand-write `@layer utilities { .bg-surface { … } }` — let the engine generate them from `@theme`.

### @theme mapping — every DESIGN.md token, 1:1

Copy these verbatim into `src/styles.css` `@theme { }`. Names mirror DESIGN.md frontmatter keys so the cross-spine inheritance (DESIGN.md ↔ ARCHITECTURE ↔ components) stays verifiable.

```css
@theme {
  /* — Colors (DESIGN.md → colors:) — 1:1 by name */
  --color-surface: #FBFAF6;
  --color-surface-dim: #F1EEE7;
  --color-surface-container-low: #F5F2EC;
  --color-surface-container: #EFECE4;
  --color-surface-container-high: #E9E5DC;

  --color-ink: #1A1F1B;
  --color-on-surface: #1A1F1B;
  --color-on-surface-variant: #4A5249;
  --color-outline: #CACFC8;
  --color-outline-variant: #E2E5DF;

  --color-primary: #2E7D32;        /* accent / large fills / CTA — AA-large 3:1 */
  --color-link: #256628;            /* Primary-as-link TEXT on Surface — locked darker (AA 4.5:1) */
  --color-primary-strong: #26702C;  /* button fill w/ white text — locked darker (AA 4.5:1) */
  --color-on-primary: #FFFFFF;
  --color-primary-container: #B8F5B0;
  --color-on-primary-container: #0E2A12;
  --color-accent-mint: #6DF49A;     /* dark panels / active-on-dark ONLY */

  --color-secondary: #C2602F;       /* fills + accent rules + ≥18.66 bold; NEVER paragraph text */
  --color-on-secondary: #FFFFFF;
  --color-secondary-container: #F6D9C2;
  --color-on-secondary-container: #3A1A07;

  --color-tertiary: #2E7D7A;        /* links/info distinct from nav green */
  --color-on-tertiary: #FFFFFF;
  --color-tertiary-container: #BFE9E7;

  --color-ink-surface: #12160F;     /* hero + comic viewer chrome */
  --color-on-ink: #F4F2EC;
  --color-ink-variant: #9AA395;

  --color-error: #BA1A1A;
  --color-on-error: #FFFFFF;
  --color-error-container: #FFDAD6;
  --color-on-error-container: #410002;

  --color-background: #FBFAF6;
  --color-on-background: #1A1F1B;

  /* — Typography (DESIGN.md → typography:) — */
  --font-display: 'Fraunces', Georgia, serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  --text-display-lg: 56px;       /* mobile variant via media query is fine */
  --text-headline-lg: 36px;
  --text-headline-md: 28px;
  --text-headline-sm: 22px;
  --text-title: 20px;
  --text-body-lg: 18px;
  --text-body-md: 16px;
  --text-body-sm: 14px;
  --text-eyebrow: 12px;
  --text-caption: 13px;
  --text-code: 15px;

  --leading-display: 1.05;
  --leading-headline-lg: 1.15;
  --leading-headline-md: 1.2;
  --leading-headline-sm: 1.3;
  --leading-title: 1.3;
  --leading-prose: 1.65;          /* body ≥1.6 — AC3 */
  --leading-body-sm: 1.5;
  --leading-eyebrow: 1.4;
  --leading-caption: 1.45;
  --leading-code: 1.6;

  --tracking-display: -0.02em;
  --tracking-eyebrow: 0.14em;     /* AC3 — eyebrow uppercase 0.14em */

  --font-weight-display: 500;
  --font-weight-headline: 500;
  --font-weight-title: 600;
  --font-weight-eyebrow: 500;
  --font-weight-code: 400;

  /* — Radii (DESIGN.md → rounded:) — */
  --radius-none: 0px;
  --radius-sm: 6px;
  --radius-DEFAULT: 8px;
  --radius-md: 12px;   /* buttons (DESIGN.md button-primary uses rounded.md) */
  --radius-lg: 16px;   /* cards / comic frame */
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* — Spacing & layout (DESIGN.md → spacing:) — */
  --spacing: 0.5rem;              /* 8px unit (Tailwind v4 reads --spacing as the scale base) */
  --container-prose-max: 720px;   /* essays */
  --container-feed-max: 1080px;  /* feed + projects */
  /* hero-min (92vh), section-gap (96/56), mobile/tablet/desktop margins (20/40/64) are
     used via utility values per component, not single tokens — reference DESIGN.md §Layout. */
}
```

> **Why two "primary" variants + a `link` token (not one):** AC4 + DESIGN.md §Colors say `#2E7D32` as in-prose link *text* on Surface and white-on-`#2E7D32` buttons both sit **at/below** 4.5:1 for normal text, so the gate must lock the darker variants. Map the roles cleanly at the token layer now (`--color-link`, `--color-primary-strong`) so later stories don't reach for `--color-primary` for link text and ship a sub-4.5:1 pair. `--color-primary: #2E7D32` stays for accents/fills at AA-large (3:1). `secondary` is a fill/accent-rule/large-bold role only — the gate does **not** assert Secondary-as-paragraph-text (it would fail; DESIGN.md forbids that usage).

### Contrast gate — exact behavior (AC4)

**Pairs to assert** (normal text, min 4.5:1):

| Foreground | Background | Expected | Locked variant |
| --- | --- | --- | --- |
| `#1A1F1B` (ink) | `#FBFAF6` (surface) | ~16:1 PASS | — |
| `#4A5249` (on-surface-variant) | `#FBFAF6` (surface) | ~6.5:1 PASS | — |
| `#256628` (link) | `#FBFAF6` (surface) | must be ≥4.5:1 PASS | #256628 |
| `#FFFFFF` (on-primary) | `#26702C` (primary-strong) | must be ≥4.5:1 PASS | #26702C |

**Algorithm (WCAG 2.1):** for each channel `c ∈ {r,g,b}` normalized 0..1, `c_lin = c ≤ 0.03928 ? c/12.92 : ((c+0.055)/1.055)^2.4`. `L = 0.2126·R + 0.7152·G + 0.0722·B`. Contrast ratio = `(L_light + 0.05) / (L_dark + 0.05)`. Throw an error naming the failing pair + ratio if `ratio < 4.5`.

**Negative test (do this):** temporarily set the link token to `#2E7D32` and run `npm run build` — the build **must fail** with a clear message. Restore `#256628` and confirm green. This proves the gate actually fails closed (FR-8 spirit, AD-6).

**Plug into Vite, not an npm script.** The plugin's `buildStart()` hook throws inside `vite build`, so `npm run build` stays `tsc -b && vite build` (AD-4). Add a `configureServer` hook so `npm run dev` also flags it (warn, not crash, is acceptable in dev — your call, but fail-closed in build is required).

### Files touched by this story

**NEW**
- `clintonjavery/src/styles.css` — `@import "tailwindcss"` + `@theme` + base layer. **The single source of truth for styling tokens.**
- `clintonjavery/src/build/contrast-pairs.ts` — declared load-bearing pairs (data, not component code → hex here is allowed).
- `clintonjavery/src/build/contrast-plugin.ts` — Vite plugin wrapping the WCAG ratio check.

**UPDATE**
- `clintonjavery/vite.config.ts` — add `tailwindcss()` and `contrastGate()` to `plugins`.
- `clintonjavery/src/main.tsx` — import `./styles.css` instead of `./index.css`; keep `./styles/global.css`.
- `clintonjavery/index.html` — add the Fraunces/Inter/JetBrains Mono Google Fonts `<link>` + preconnect. (FR-11 site-identity fixes — `og:url`, `<title>` — are **Story 1.6**, not here; leave them.)
- `clintonjavery/package.json` — add `@tailwindcss/vite` (pinned); remove `autoprefixer`, `postcss`, `autoprefix` from devDeps after install.

**RETIRE (delete)**
- `clintonjavery/src/index.css` — Vite scaffold (forbidden `#242424`/`#646cff` + the `place-items:center` body hack). Its useful bits move into the `@layer base` block in `styles.css`.

**LEAVE ALONE (do not rewrite in this story — prevents regressions)**
- All `*.module.css` (Navbar, Footer, game, layout, tools, UnitConverter) — these are retired **per-component as each component is rebuilt** (AD-6). Rebuilding Navbar/etc. belongs to later stories (routing/nav, story 1.3; etc.). Touching them now risks regressions and expands scope.
- `src/App.tsx`, `src/pages/*`, `src/tools/*`, `src/fun/*`, `src/data/*` — untouched.
- `vite.config.ts` `base: "/"` — keep.

### What "every next surface is on-system" really means here

This story does **not** redesign any existing page. It establishes the token vocabulary so that story 1.3 (nav), 1.4 (Post), 1.5 (Feed), etc. reach for `bg-surface text-ink font-display rounded-lg` instead of hex. Existing pages may look partially unstyled after the scaffold `index.css` is removed — that's acceptable and expected; it is **not** a signal to fix their old module CSS. Keep this story tightly scoped to the system + gate.

### Testing standards

- **No unit-test framework is in the project yet** (architecture "Deferred": introduce Vitest at the story that needs it — validation logic / ComicViewer a11y). The **contrast gate is the first test**: a build-time assertion. Treat passing `npm run build` + the negative-test failure as the acceptance evidence for AC4.
- Manual smoke (T7.2) verifies AC3 visually (Fraunces/Inter/Mono roles, line-height ≥1.6, eyebrow uppercase, no all-caps titles).
- AC1/AC2 evidence: `npm run build` succeeds; a one-off utility (`bg-surface text-primary font-display rounded-md`) compiles and renders. AC5 evidence: the grep in T7.4 returns no hex literals in **new** component/build-render code.

### Anti-disaster guardrails

- ❌ Don't add `tailwind.config.js` or `postcss.config.js` (v4 ≠ v3).
- ❌ Don't `@import` Google Fonts inside `styles.css` after `@import "tailwindcss"` — CSS `@import` ordering rules bite; use the `<link>` in `index.html` instead.
- ❌ Don't use `--color-primary` (`#2E7D32`) for link text or white-on-primary buttons — use `--color-link` / `--color-primary-strong` so the gate stays green (AC4).
- ❌ Don't delete the per-component `*.module.css` files yet — that's a later-story, per-component retirement (AD-6); mass-deleting now breaks existing pages.
- ❌ Don't leave `postcss`/`autoprefixer`/`autoprefix` installed "just in case" — a stray `postcss.config.js` (or IDE auto-creating one) would re-engage the v3 chain and silently break the v4 build.
- ❌ Don't touch `index.html` identity metadata (`og:url`, `<title>`) — that's Story 1.6 (FR-11, AD-4).
- ✅ Keep the build command `tsc -b && vite build` exactly (AD-4).
- ✅ All `src/build/*.ts` must pass the strict `tsc -b`; keep them plain TS (no DOM-only APIs at build time; the contrast math is pure arithmetic).

### Git intelligence

Recent repo history is BMad bootstrap (`64ead59 starting bmad`) and pre-BMad content/migration commits. No prior story implementation patterns to inherit — this is the first dev story, so it sets the conventions later stories will follow (one `styles.css`, plugin-in-build, tokens-only). Commit early and clearly so 1.2+ can read "apply-the-ink-garden-design-system" as the established style baseline.

### References (cite with source path + section)

- [Source: `_bmad-output/planning-artifacts/epics.md`#Story 1.1 — Apply the Ink & Garden design system] — AC verbatim, epic context, FR coverage.
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-clintonjaverydotcom-2026-08-04/ARCHITECTURE-SPINE.md`#AD-6] — Tailwind v4 + DESIGN.md tokens + build-gated contrast; the governing invariant.
- [Source: `_bmad-output/planning-artifacts/architecture/.../ARCHITECTURE-SPINE.md`#AD-4] — single Vite plugin owns build/validation; build command stays `tsc -b && vite build` (no prebuild script).
- [Source: `_bmad-output/planning-artifacts/architecture/.../ARCHITECTURE-SPINE.md`#Stack] — version pins to verify (`@tailwindcss/vite` install).
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-clintonjaverydotcom-2026-08-04/DESIGN.md`#colors / #typography / #rounded / #spacing / #components] — the token source of truth (every `@theme` entry maps 1:1).
- [Source: `DESIGN.md`#Colors — Contrast (WCAG 2.1 AA load-bearing pairs)] — the pairs to gate + the `#256628`/`#26702C` locked variants (closes UX open item).
- [Source: `_bmad-output/planning-artifacts/prds/prd-clintonjaverydotcom-2026-08-04/addendum.md`#B — Styling architecture decision] — confirmed: commit to Tailwind v4, retire ad-hoc CSS Modules for new surfaces.
- [Source: `_bmad-output/planning-artifacts/prds/.../prd.md`#FR-1 / NFR-1 (a11y) / NFR-3 (maintainability)] — the capability this system serves.

## Dev Agent Record

### Agent Model Used

Amelia (Senior Software Engineer) — bmad-dev-story workflow. Model: Claude (Anthropic). Date: 2026-08-06.

### Debug Log References

- Negative-test of contrast gate: temporarily set the "Link on Surface" pair fg to `#2E7D32` in `contrast-pairs.ts`. **Did not fail** — measured 4.91:1 (passes 4.5:1), so `#2E7D32` is not a valid sub-threshold input for that pair. Re-ran with `#80d0b6` (1.73:1) and confirmed the build **fails closed** with the exact prescribed message format: `Contrast gate: Link on Surface (#80d0b6 on #FBFAF6) = 1.73:1 (need 4.5:1) — lock #256628`. Restored `#256628` and confirmed green.
  - Note for later stories: the DESIGN.md claim that `#2E7D32` as link text on Surface sits at/below 4.5:1 is not borne out by the WCAG math (it measures 4.91:1). The locked-darker `#256628` (6.68:1) is still the right link-text token by DESIGN.md role mapping and is kept regardless; the gate is the authoritative check.
- ESLint flagged `no-useless-catch` on the initial `buildStart` try/catch — re-threw a caught error. Removed the pointless wrapper; `runGate()` now throws directly.
- ESLint clean and `npm run build` green after fix.

### Completion Notes List

- **AC1 (Tailwind v4 wired, build green, tokens resolve):** `@tailwindcss/vite@4.3.3` installed and pinned (no caret). Vite config wires `react()` + `tailwindcss()` + `inkGardenContrastGate()`; `base: "/"` kept; build command unchanged at `tsc -b && vite build` (AD-4). Removed v3-era `autoprefixer`/`postcss`/`autoprefix` devDeps; no `tailwind.config.*`/`postcss.config.*` exists. `npm run build` exits 0.
- **AC2 (utility exists for each token, 1:1):** Every DESIGN.md color/typography/radius/spacing/leading/tracking/text token is mapped in `src/styles.css` `@theme` 1:1 by name. Verified by temporarily applying `bg-surface text-primary font-display rounded-md leading-prose tracking-eyebrow text-display-lg` to a throwaway hidden div — all 7 utilities compiled and rendered from `@theme` across every namespace — then removed the throwaway (Dev Notes–sanctioned proof). The `@theme` is the single source of truth; Tailwind v4 generates utilities on demand from it.
- **AC3 (Fraunces / Inter / JetBrains Mono roles):** Google Fonts `<link>` (single request, `display=swap`, preconnect) added to `index.html` for Fraunces (opsz 9..144, 400/500/600), Inter (400/500/600/700), JetBrains Mono (400/500/700). `--font-*` declarations carry the prescribed fallbacks. Base layer confirms in compiled CSS: `body{font-family:var(--font-body);line-height:1.65;...background:var(--color-surface)}` (≥1.6 line-height, warm-paper), `h1..h4{font-family:var(--font-display);font-weight:500;text-transform:none}` (never all-caps), `.eyebrow{font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.14em}`. Visual dev smoke (T7.2) is the only manual confirmation left to you.
- **AC4 (build-time WCAG AA contrast gate):** `src/build/contrast-plugin.ts` + `src/build/contrast-pairs.ts` implement the WCAG 2.1 luminance/contrast math (plain TS, Node-safe). Plugin runs `buildStart` (throws → `vite build` fails) + `configureServer` (warns in dev). Four load-bearing pairs asserted; `#256628` / `#26702C` locked darker variants in place. Fail-closed proven by negative test (see Debug Log). Passing run is silent.
- **AC5 (no inline hex in new component code):** Grep of `src/components`, `src/pages`, `src/build` shows hex only in pre-existing `*.module.css`/inline-style files slated for rebuild in later stories, and in `contrast-pairs.ts` (declared config — explicitly allowed). No new file authored in this story contains a style-value hex literal. Scaffold `#242424`/`#646cff` are gone from the bundle (`src/index.css` deleted).
- **Scope held:** No `content/` pipeline work, no per-component `.module.css` retirement, no `App.tsx`/`pages/*`/`tools/*`/`fun/*`/`data/*` rewrites, no `index.html` identity-metadata changes (`og:url`/`<title>` left for Story 1.6). `tsconfig -b` strict passes for the new `src/build/*.ts`.
- **Dev server / regression:** `div#root` renders; existing pages may look partly unstyled (expected per T7.3) because their module CSS still drives their look — not a regression, owned by later stories.

### File List

**NEW**
- `clintonjavery/src/styles.css` — `@import "tailwindcss"` + full `@theme` (every DESIGN.md token, 1:1) + `@layer base` (body/h1–h4/a/.eyebrow). Single source of truth for styling tokens.
- `clintonjavery/src/build/contrast-pairs.ts` — declared load-bearing WCAG AA pairs (data/config — hex allowed here).
- `clintonjavery/src/build/contrast-plugin.ts` — `inkGardenContrastGate()` Vite plugin: WCAG luminance + contrast ratio, `buildStart` (fail-closed) + `configureServer` (warn in dev).

**UPDATED**
- `clintonjavery/vite.config.ts` — imports + adds `tailwindcss()` and `inkGardenContrastGate()` to `plugins`; `react()` and `base: "/"` kept; build command unchanged (AD-4).
- `clintonjavery/src/main.tsx` — `import './styles.css'` replaces `import './index.css'`; `./styles/global.css` (3-line reset) kept after, per T4.1 ordering.
- `clintonjavery/index.html` — added preconnect + single Google Fonts `<link>` for Fraunces/Inter/JetBrains Mono with `display=swap`. Identity metadata (`og:url`, `<title>`) intentionally untouched (Story 1.6 / FR-11 / AD-4).
- `clintonjavery/package.json` — added `@tailwindcss/vite` pinned to `4.3.3` (no caret); removed `autoprefixer`, `postcss`, `autoprefix` from devDependencies.
- `clintonjavery/package-lock.json` — regenerated by npm for the above add/removes.

**DELETED**
- `clintonjavery/src/index.css` — Vite scaffold (`#242424`/`#646cff` + `place-items: center` body hack); its useful rules moved into `styles.css` `@layer base`.

## Change Log

| Date | Author | Summary |
| --- | --- | --- |
| 2026-08-06 | Amelia (dev) | Story 1.1 implemented: wired Tailwind v4 via `@tailwindcss/vite` + single `src/styles.css` mapping every DESIGN.md token 1:1 in `@theme`; retired Vite-scaffold `index.css`; loaded Fraunces/Inter/JetBrains Mono; added build-time WCAG AA contrast-gate Vite plugin (fail-closed, proven by negative test); removed v3-era PostCSS devDeps. Build + lint green. Status → review. |