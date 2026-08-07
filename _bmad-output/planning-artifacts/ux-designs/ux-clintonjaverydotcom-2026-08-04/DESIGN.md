---
name: Ink & Garden
description: Visual identity for clintonjavery.com — a maker's publishing studio (writing + gag-a-day comics + project portfolio).
status: final
created: 2026-08-04
updated: 2026-08-04
sources:
  - "{planning_artifacts}/prds/prd-clintonjaverydotcom-2026-08-04/prd.md"
colors:
  # Surfaces — warm paper studio
  surface: '#FBFAF6'
  surface-dim: '#F1EEE7'
  surface-container-low: '#F5F2EC'
  surface-container: '#EFECE4'
  surface-container-high: '#E9E5DC'
  # Ink (the maker's mark)
  ink: '#1A1F1B'
  on-surface: '#1A1F1B'
  on-surface-variant: '#4A5249'
  outline: '#CACFC8'
  outline-variant: '#E2E5DF'
  # Primary — Deep Green (refined heritage #297f39)
  primary: '#2E7D32'
  on-primary: '#FFFFFF'
  primary-container: '#B8F5B0'
  on-primary-container: '#0E2A12'
  accent-mint: '#6DF49A'      # electric mint, used on dark + active
  # Secondary — Warm Sketch (#d88639 refined) for "fresh/comic" accents
  secondary: '#C2602F'
  on-secondary: '#FFFFFF'
  secondary-container: '#F6D9C2'
  on-secondary-container: '#3A1A07'
  # Tertiary — Ink Teal (#79dfc9 family deepened) for links/info
  tertiary: '#2E7D7A'
  on-tertiary: '#FFFFFF'
  tertiary-container: '#BFE9E7'
  # Dark hero panels (Landing hero, comic viewer chrome)
  ink-surface: '#12160F'
  on-ink: '#F4F2EC'
  ink-variant: '#9AA395'
  # Semantic
  error: '#BA1A1A'
  on-error: '#FFFFFF'
  error-container: '#FFDAD6'
  on-error-container: '#410002'
  background: '#FBFAF6'
  on-background: '#1A1F1B'
typography:
  display-lg:
    fontFamily: 'Fraunces, Georgia, serif'
    fontSize: 56px
    fontWeight: '500'
    lineHeight: '1.05'
    letterSpacing: '-0.02em'
  display-lg-mobile:
    fontFamily: 'Fraunces, Georgia, serif'
    fontSize: 40px
    fontWeight: '500'
    lineHeight: '1.08'
  headline-lg:
    fontFamily: 'Fraunces, Georgia, serif'
    fontSize: 36px
    fontWeight: '500'
    lineHeight: '1.15'
  headline-md:
    fontFamily: 'Fraunces, Georgia, serif'
    fontSize: 28px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-sm:
    fontFamily: 'Fraunces, Georgia, serif'
    fontSize: 22px
    fontWeight: '500'
    lineHeight: '1.3'
  title:
    fontFamily: 'Inter, system-ui, sans-serif'
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: 'Inter, system-ui, sans-serif'
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.65'
  body-md:
    fontFamily: 'Inter, system-ui, sans-serif'
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.65'
  body-sm:
    fontFamily: 'Inter, system-ui, sans-serif'
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  eyebrow:
    fontFamily: 'JetBrains Mono, ui-monospace, monospace'
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: '0.14em'
  caption:
    fontFamily: 'Inter, system-ui, sans-serif'
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.45'
  code:
    fontFamily: 'JetBrains Mono, ui-monospace, monospace'
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.6'
rounded:
  none: 0px
  sm: 6px
  DEFAULT: 8px
  md: 12px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 20px
  margin-tablet: 40px
  margin-desktop: 64px
  section-gap: 96px
  section-gap-mobile: 56px
  prose-max: 720px
  feed-max: 1080px
  hero-min: 92vh
# Component token names mirror EXPERIENCE.md Component Patterns rows (1:1) for cross-spine inheritance.
components:
  button-primary:
    bg: '{colors.primary}'
    color: '{colors.on-primary}'
    radius: '{rounded.md}'
    padding: '0.75rem 1.5rem'
    fontFamily: '{typography.title.fontFamily}'
    fontWeight: '600'
  button-ghost:
    color: '{colors.primary}'
    border: '1px solid {colors.outline}'
    radius: '{rounded.md}'
  top-nav:
    color: '{colors.on-surface-variant}'
    active-color: '{colors.ink}'
    fontFamily: '{typography.title.fontFamily}'
  type-filter:
    container-bg: '{colors.surface-container}'
    active-bg: '{colors.ink-surface}'
    active-color: '{colors.on-ink}'
    radius: '{rounded.full}'
  post-card:
    bg: '{colors.surface}'
    border: '1px solid {colors.outline-variant}'
    radius: '{rounded.lg}'
    title: '{typography.headline-sm}'
  comic-card:
    bg: '{colors.surface}'
    border: '1px solid {colors.outline-variant}'
    radius: '{rounded.lg}'
  project-card:
    bg: '{colors.surface-container-low}'
    radius: '{rounded.lg}'
  support-pill:
    bg: '{colors.secondary-container}'
    color: '{colors.on-secondary-container}'
    radius: '{rounded.full}'
  comic-viewer:
    bg: '{colors.ink-surface}'
    on-chrome: '{colors.on-ink}'
    control-bg: 'rgba(18,22,15,0.6)'
  comic-caption:
    color: '{colors.on-surface-variant}'
    accent-rule: '{colors.secondary}'
  landing-hero:
    bg: '{colors.ink-surface}'
    on-hero: '{colors.on-ink}'
    accent: '{colors.accent-mint}'
  latest-strip:
    note: 'composite of post-card / comic-card, rendered 3-up on Landing'
  scroll-narrative-section:
    note: 'behavioral component — reveal on scroll into view, reduced-motion instant'
  pagination:
    color: '{colors.on-surface-variant}'
    active-color: '{colors.primary}'
---

## Brand & Style

This is the house style of a **maker's publishing studio** — one person who draws gag-a-day strips, writes essays, and builds things, and whose site should feel like *that*, not like a corporate portfolio or a tech-bro landing page. The posture is **Editorial-Maker**: warm, confident, generous of whitespace, hand-made and alive. Your Krita-drawn comics and your photographs are the visual heroes; the UI is the quiet frame that lets them land. Wit lives in the content, never in the chrome.

The style leans on a **paper-and-ink** surface (warm off-white, deep-green ink) with **electric-mint** energy drawn from your current accent — a green that has always been yours, refined. Dark panels (the hero, the comic viewer chrome) carry the mint as their spark so the strips pop against them. We are deliberately anti-hype: no gradients-for-the-sake-of-gradients, no streak counters, no exclamation marks in the UI, no "Welcome" dead-end hero. Calm, with a pulse.

## Colors

A refined green palette built on your existing heritage, on a warm paper ground:

- **Surface (#FBFAF6)** — warm paper, the studio canvas. Never pure white (clinical) and never the Vite-scaffold dark (tech default). Sets the "this is made by a person" tone.
- **Ink (#1A1F1B)** — near-black with a green undertone; the primary text and structural ink. Used for headlines, body, active nav.
- **Primary / Deep Green (#2E7D32)** — a refinement of your `#297f39`/`#0ba80e` family. Primary actions, active states, links-in-prose. *Not* used for large fills on body surfaces (too heavy); reserved as an accent and for CTAs.
- **Primary Container (#B8F5B0)** + **Accent Mint (#6DF49A)** — lifted from your `#6df49a`/`#c0ffc0`. The container is the light-green "fresh" surface (essay/comic "new" tags, comic chips); the mint is reserved for dark panels and active-on-dark states where it reads as energy.
- **Secondary / Warm Sketch (#C2602F)** — refined from your `#d88639`. The *comic* accent: used for comic-type tags, a little warmth on the funny-pages surfaces. Used sparingly so it stays fresh; *not* for essays.
- **Tertiary / Ink Teal (#2E7D7A)** — your `#79dfc9` deepened. Links and informational cues distinct from navigational green.
- **Ink Surface (#12160F)** — the dark hero + comic-viewer chrome; near-black green-tinted, with mint as its accent. Lets a strip's art carry the panel.
- **Error (#BA1A1A)** — standard, used for build-time errors surfaced in dev and for any runtime failure states.

**Contrast — WCAG 2.1 AA load-bearing pairs** (verify in implementation with a contrast tool; the spine declares the intent, the build measures it): Ink `#1A1F1B` on Surface `#FBFAF6` passes (~16:1); On-Surface-Variant `#4A5249` on Surface passes for body text (~6.5:1). **Verify before ship — borderline/failed and likely need darkening:** Primary `#2E7D32` as in-prose link text on Surface (~4.4:1, at/below the 4.5:1 AA normal-text threshold — darken to `#256628` for link text if it measures under); white On-Primary on a Primary button fill (borderline — darken Primary to `#26702C` for button use if under); any Secondary `#C2602F` as *paragraph* text on Surface fails AA at the 17px caption size, so Secondary is reserved for fills (chip backgrounds, accent rules) and ≥18.66px-bold large text. The **comic-caption** follows this rule: rendered in `{colors.on-surface-variant}` with a `{colors.secondary}` *left accent rule*, never as a Secondary fill.

Color is restrained: a strip or a photograph is what your eye lands on. The interface uses ink, paper, and one accent at a time. `[CONFIRMED: warm-light default surface, dark reserved for the Landing hero + the comic viewer chrome (author, 2026-08-04).]`

## Typography

Two voices, the same author:

- **Fraunces** is the maker's *speaking* voice — a variable serif with optical sizing and a bit of swagger. It carries the landing display, post titles (essay *and* comic), and section headlines. It reads editorial enough for an essay and characterful enough to sit next to a gag strip. Display/large uses tighter leading + slight negative tracking so the headline reads as one block.
- **Inter** is the *working* voice — body copy, navigation, UI labels, microcopy. Quiet, legible, gets out of Fraunces's way.
- **JetBrains Mono** is the *craft* voice — eyebrow/section labels (tracked-out uppercase), code blocks in technical essays, and the small caption tags on a comic. Signals "this is made by a programmer who also draws."

Rules: body line-height ≥1.6 for reading comfort; eyebrows always `0.14em` uppercase; titles never all-caps; never set long body copy in Fraunces. `[CONFIRMED: Fraunces + Inter + JetBrains Mono (author, 2026-08-04).]`

## Layout & Spacing

A fluid, content-first grid that adapts the column to the content:

- **Reading column** — essays render in a centered `prose-max (720px)` column for optimal line length; the comic strip and the viewer live wider.
- **Feed & grids** — `feed-max (1080px)` for the Feed list and Projects; mobile single-column, ≥768 two-up, ≥1024 three-up for project cards; feed cards stay single-column (chronological list, not a wall).
- **Landing** — full-bleed hero (`hero-min 92vh`) then centered scroll narrative sections; max content width per section follows the content (strips can bleed wider than prose).
- **Spacing** — `unit 8px`; mobile side margin `20px`, tablet `40px`, desktop `64px`; `section-gap 96px` (56 on mobile) lets the reader pause between surfaces — editorial breathing, not crammed.

## Elevation & Depth

**Tonal layering first, shadows second.** Containers are distinguished from paper by stepping the surface tokens (`surface → surface-container-low → surface-container`) before any shadow. Shadows, when used, are a soft ambient lift tinted with ink (`rgba(26,31,27,0.08)`, 20px+ blur, low opacity) — a glow, not a drop. Borders are 1px `outline-variant`, a ghost line. Cards lift subtly on hover only (pointer:fine); no lift on touch (no dangling hover state). The comic viewer chrome is flat-dark — no shadow, the art is the depth.

## Shapes

**Soft and confident.** `rounded.lg (16px)` for cards and the comic frame; `rounded.md (12px)` for buttons; `rounded.full` for chips, the type filter, and the support pill. The strip image itself is displayed edge-to-edge with no rounded mask on the artwork (the art is the art — its own edges rule), inside a `rounded.lg` container; a `4px` catch is available if a slight frame is ever needed. `[CONFIRMED: edge-to-edge, no rounded mask on the artwork (author, 2026-08-04).]`

## Components

- **Primary button** — solid `{colors.primary}` fill, `{colors.on-primary}` text, `12px` radius, generous horizontal padding; ghost variant = ink text, 1px outline. Used for the one primary CTA on a surface (e.g., landing "Explore Projects →"), never more than one above the fold per section.
- **Nav** — minimal top bar: wordmark left, `Feed · Projects` right, collapsing to a menu `≤640px`. Links `{on-surface-variant}` → ink on active/hover; active state uses an ink underline, not a pill background.
- **Type filter** — a pill-segmented control (All / Essays / Comics) sitting above the Feed; active segment flips to `{colors.ink-surface}` fill + `{colors.on-ink}` text. URL-driven so a link can pre-select "Comics."
- **Post card (essay)** — title in `{typography.headline-sm}`, date + reading cues in `{typography.caption}`, 1-line excerpt; image optional. Calm, list-like; the title is the magnet.
- **Comic card** — the strip image forward, minimal chrome (date + optional caption chip in `{colors.secondary}`). The image is the card.
- **Project card** — `{colors.surface-container-low}`, project title, one-line summary (`{typography.body-sm}`), stack chips, and a live/source affordance. Hover (pointer:fine) reveals a subtle lift.
- **Comic viewer (page chrome)** — dark `{colors.ink-surface}` stage around the strip; zoom/pan controls are `{colors.on-ink}` glyphs on `rgba(18,22,15,0.6)` chips, bottom-right, appearing on hover/tap (auto-hide after inactivity).
- **Support pill** — `{colors.secondary-container}` / `{colors.on-secondary-container}`, full radius, sits in the footer area of content pages. Never a top-level nav item.
- **Pagination** — prev/next + page numbers, ink-variant text, active page in `{colors.primary}`. Shareable per-page URLs.

## Do's and Don'ts

**Do**
- Let your art and photographs be the largest thing on the surfaces they appear on.
- Keep one accent active at a time; let paper and ink carry the rest.
- Use Fraunces for the "voice" moments (titles, display) and Inter for everything functional.
- Respect the reading column for essays; bleed wider for comics.
- Keep motion quiet and respect `prefers-reduced-motion`.

**Don't**
- Don't use a "Welcome"-style hero with no identity or path — the hero must route.
- Don't use the mint bright green as a large fill on the paper surface (it's for dark panels + active states).
- Don't set a comic strip inside a heavy chrome — the art owns the frame.
- Don't add streak counters, autoplay carousels, exclamation UI, or hover-only disclosure.
- Don't reuse Vite scaffold colors (`#242424`, `#646cff`) — they read as "didn't finish the design."
- Don't pull full-page reloads via raw `<a href>` for in-app routes (architecture/PRD FR-14).