# Story 3.3 — Landing "Latest" strip surfaces the newest content

**Status:** `review` · **Epic:** 3 (Landing — Identity & Funnel) · **FR:** FR-3

## What shipped

Filled the "What's new" Latest slot (the placeholder from 3.2) with the 3
newest published Posts, reverse-chrono, mixing essay + comic cards per type —
**completing Epic 3**.

### The strip (AC1 + AC4 + fewer-than-3)
`src/pages/Landing.tsx` now imports `posts` from `../content` (the
`virtual:content-index` re-export, AD-1) and renders `posts.slice(0, 3)` in a
responsive grid. `posts` is already reverse-chrono (date DESC, slug ASC) +
draft-excluded by the 1.2 build gate — the **same contract the Feed trusts**
(no re-filter, AC7-satisfied-upstream). `slice(0, 3)` on a short array returns
only what exists — **no empty slots** (fewer-than-3 AC). Grid: 1 column on
mobile, `sm:grid-cols-[1.4fr_1fr_1fr]` on `sm+` (the newest card takes the wider
column, per the key-landing-hero mock).

### Links to each Post (AC2)
Each card is a RR `<Link to={`/p/${post.slug}`}>` — client-side nav, no full
reload (FR-3 / FR-2). A secondary "See all in the Feed →" text link sits below
the grid → `/p` (the funnel seam from the Latest strip into the full Feed).

### Per-type cards (AC3 — composite `post-card` / `comic-card`)
The card shape is **extracted, not duplicated**: new `src/components/PostCard.tsx`
exports `PostCard` (dispatcher: essay → `EssayCard`, comic → `ComicCard`),
moved verbatim out of `Feed.tsx`. `Feed.tsx` now imports `PostCard` and renders
`<PostCard post={post} />` — the inline `Card`/`EssayCard`/`ComicCard`/
`ComicCardImage` definitions are **deleted** (grep confirms 0 inline defs
remain). The comic card keeps its 1.4-style load-failure retry (`sr-only` img +
retry tile). One card shape, two consumers — the Landing shows the exact same
cards the Feed does.

### Heading hierarchy
The essay card title is a heading whose **rank is caller-controlled** via a
`headingLevel` prop (default `2`): `h2` on the Feed (page h1 = "Feed"), `h3` on
the Landing (nests under the section h2 "What's new", under the hero h1).
Comic cards carry no visible title heading (image-forward design — preserved
from the Feed). One h1 per page maintained everywhere (NFR-1).

## Files

**Created:** `src/components/PostCard.tsx`
**Modified:** `src/pages/Feed.tsx` (uses shared `PostCard`; inline card defs
removed; unused `ComicPost`/`Post`/`formatPostDate`/`stripRetrySrc` imports
dropped), `src/pages/Landing.tsx` (Latest slot: 3-card grid + "See all" link;
imports `posts` + `PostCard`)

## The 3 newest (sanity)
`hello-ink-garden` (2026-08-06, **essay**), `first-strip` (2026-08-01,
**comic**), `apertus-open-source-llm` (2026-05-18, **essay**) — an
essay/comic/essay mix that exercises both card types. `draft-wip` (2026-08-10,
status: draft) is excluded by the build gate, so it does NOT appear despite the
newest date. ⚠️ Note: `hello-ink-garden` is your launch/announcement post — if
you'd rather it not be the "newest" on the Landing, that's a content decision
(unpublish/redate it), not a 3.3 code change.

## Verification (automated)
- **Build:** green (1.76s).
- **Lint:** 0 (no unused imports in Feed after the extraction).
- **Tests:** 110 pass. (Card render tests are out of scope per AR-11.)
- **AC grep audit:**
  - `posts.slice(0, 3)` + `sm:grid-cols-[1.4fr_1fr_1fr]` present (AC1/AC4).
  - `EssayCard`/`ComicCard` dispatched on `post.type === 'essay'` (AC3).
  - Both card `<Link to={`/p/${post.slug}`}>` (AC2).
  - Feed: `import { PostCard }` + `<PostCard post={post} />`, **0** inline
    `function Card|EssayCard|ComicCard|ComicCardImage` defs (no duplication).
  - Landing: `headingLevel={3}` on the strip cards (heading hierarchy).

## Review instructions (browser — ~5 min)

> `cd clintonjavery && npm run dev`, open `http://localhost:5173`.

1. **The strip:** scroll to "What's new". Three cards appear (essay / comic /
   essay): **hello-ink-garden** (widest, left on desktop), **first-strip**
   (comic — strip image card), **apertus-open-source-llm**. On mobile they
   stack (1 col); on `sm+` they're a 3-up row with the newest widest.
2. **Per-type shape:** the comic card is image-forward (strip + date + caption
   chip if any); the essay cards show title + date + 2-line excerpt. Same cards
   as the Feed.
3. **Links (AC2):** click each card → its Post page (client-side; back returns
   to the strip). Click "See all in the Feed →" → `/p`.
4. **Reveal still works (from 3.2):** the "What's new" section still
   fades/slides into view on scroll; reduced-motion still shows it instantly.
5. **Feed unchanged:** open `/p` — the Feed cards look + behave exactly as
   before (same shape, same retry-on-error for comics, h2 titles). No
   regression from the extraction.
6. **Heading outline (optional, DevTools accessibility tree):** on `/`, the
   outline is h1 (hero identity) → h2 ("What's new"/"The work"/"What I build")
   → h3 (the essay card titles). On `/p`, h1 ("Feed") → h2 (card titles).

## Gate to `done`
- Browser checks 1–5 pass (especially 1 — the 3 newest render in order — and 5
  — the Feed is unchanged after the extraction).
- Commit suggested `3 - 3`. Stage: `src/components/PostCard.tsx`,
  `src/pages/Feed.tsx`, `src/pages/Landing.tsx`.
- **This completes Epic 3** (3.1 hero + 3.2 scroll narrative + 3.3 Latest
  strip → FR-1, FR-2, FR-3 covered).

## Notes / decisions
- **Extracted cards rather than duplicating.** The BMad-dev move: one card
  shape in `PostCard.tsx`, consumed by both Feed and Landing. The extraction is
  behavior-preserving (Feed looks identical) — the only new capability is the
  `headingLevel` prop so the Landing cards can be h3 without changing the
  Feed's h2.
- **Newest card gets the wider column** (`1.4fr 1fr 1fr`) on `sm+`, matching the
  key-landing-hero mock's emphasis on the freshest post. On mobile it's a plain
  stack (no asymmetry at narrow widths).
- **`hello-ink-garden` surfaces as the newest.** It's a real published essay
  (2026-08-06), so the index correctly ranks it #1. Flagged above in case you
  want to curate that (content, not code).
- **Comic card has no visible title heading** — preserved from the Feed's
  image-forward design; the link's accessible name is the strip `alt`. Not
  changed by 3.3.

## Next
**Epic 3 is complete.** Epic 4 (Projects — Verifiable Proof) is next: re-wire
`src/tools/*` + `src/fun/BalloonPopper.tsx` as Projects entries (FR-9); add
`/tools/*` + `/fun/*` → `/projects/<slug>` 301s; retire orphaned `layout.module.css`
rules per AD-6.