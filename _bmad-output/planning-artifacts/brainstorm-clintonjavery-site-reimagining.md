# Brainstorm — Reimagining clintonjavery.com

| | |
|---|---|
| **Topic** | Reimagining clintonjavery.com as a writing + comics-first publishing platform + project portfolio |
| **Date** | 2026-08-04 |
| **Facilitator** | Mary (Business Analyst) — Creative Partner mode |
| **Technique used** | First Principles Thinking (converged after foundational lens) |
| **Status** | Converged — ready for Product Brief → PRD handoff |
| **Canonical record** | `_bmad-output/brainstorming/brain-clintonjavery-site-reimagining-2026-08-04/.memlog.md` |
| **Next step** | `bmad-product-brief` (Mary), then hand to John (bmad-agent-pm) for the PRD |

---

## 1. Purpose & audiences (the "why")

The site has **one author, two visitor types**:

1. **Primary purpose — publishing platform.** A home for Clint to share **writing** and **weekly comics** on a cadence.
   - Visitor type A: **readers / fans** — come for the newest thing, want to follow.
2. **Secondary purpose — project portfolio.** Proof-of-competence for potential **clients / employers**.
   - Visitor type B: **evaluators** — want to see "he did that," fast.

**Monetization:** minor today (the existing Contribute page). A **future maybe** — premium articles/comics behind a paywall — is explicitly *out of scope* for this round but should not be designed *against*.

---

## 2. Current state (evidence snapshot, to ground the brief)

Standing facts about the existing site, established during analysis:

- **Stack:** React 19 + TypeScript + Vite 6 + React Router 7, CSS Modules, Tailwind v4 installed but not committed to. Inconsistent styling architecture.
- **Hosting (corrected):** now **Cloudflare Pages** wired to the GitHub repo (no longer Azure Static Web Apps). **Domain is `clintonavery.com`** (index.html still declares `clintonavery.dev` and title "Clinton Avery" — must be reconciled).
- **Top pain:** hard to add new content + limited styling control for writing, and comics are **not yet fully implemented**. Content is hardcoded in `.tsx` data files (`src/data/posts.tsx`, `src/data/gallery.tsx`) — publishing requires code + full redeploy.
- **Navbar bug:** uses raw `<a href>` anchors → full page reloads on every navigation (SPA benefit thrown away). High-impact, low-effort fix.
- **Orphans/cruft:** `Reading` route exists but is commented out of the navbar; duplicate `BalloonPopper` + `BalloonPopperV2`; stale local branches; editor backup files in `public/assets`.
- **Constraint to preserve:** all **existing blog posts must migrate intact**; retain as much existing working functionality as possible.

---

## 3. Bedrock decisions (the chosen direction)

First- Principles Thinking stripped the conventional "personal website" template down to bedrock and rebuilt it. Decisions endorsed in session:

1. **Information architecture collapsed to 4 surfaces:**
   - **Landing** — which *is* the About on top (no separate About page).
   - **One unified content feed** (Writing + Comics merged).
   - **Projects** — the portfolio.

2. **About melts into the Landing.** The landing opens with **action-oriented photography of Clint programming and talking to people**, then scrolls to reveal **additional action-oriented, eye-catching designs that link into each section**. The scrolling narrative carries the "who I am" job an About page used to do.

3. **Writing + Comics merge into a single unified content feed** with a **type filter** (essay / comic / all). They are not separate sections or routes — they are facets of one chronological stream. Rationale: one brand, one "follow," one feed to maintain, and the landing naturally surfaces "the latest thing I made" regardless of type.

4. **Tools + Fun (the games, converters) rehome as entries inside Projects.** Nothing is lost; the portfolio inherits proof-of-skill it was missing, legible to evaluators.

5. **Contribute dissolves into an *affordance*, not a page.** A Support button on content pages (and later a paywall component on premium pieces) — a donate/paywall destination embedded in the content itself, not a standalone route.

6. **Gallery (non-comic standalone art) is cut** for this round. Non-comic visual art is out of scope.

### Net IA

```
Landing  (hero = action-orientation; scroll narrative = About + section links)
   ├── Feed   (unified Writing + Comics, type-filtered, chronological)
   └── Projects (portfolio; absorbs former Tools + Fun)
```
Top-level nav: **Feed · Projects** (with Writing/Comics as filter views on Feed, and the Landing carrying identity). Contribute is an in-content affordance.

---

## 4. Out of scope (this round)

- Standalone Gallery / non-comic visual art section.
- About as a dedicated page.
- Reading, Fun, Tools, Contribute as **top-level** sections (their value is absorbed or dissolved above).
- Paywall / premium content monetization (acknowledged future; not designed against, not built now).
- Greenfield rebuild — this is a **rebuild on top of the existing app and existing posts**, not a throwaway.

---

## 5. Key insights (connections to carry forward)

- **The cadence constraint is architectural, not cosmetic.** The weekly comic will not survive a busy week if publishing is a code/deploy act. A content-first authoring path (markdown/MDX or similar) for *both* essays and comics is a core requirement, not a nice-to-have. This is the single biggest unlock for the primary purpose.
- **Two audiences, one funnel.** The Landing must serve *both* visitor types without splitting the site: the scroll narrative hooks the reader (latest work) and the evaluator (proof/credibility) in the same motion, then routes each to Feed (readers) or Projects (evaluators).
- **"Latest" belongs to no one section.** Because Writing and Comics are now one feed, the Landing's hero/scroll can feature "the newest thing I made" generically — the unified feed is what makes a high-impact landing sustainable (otherwise the hero would have to pick a section).
- **Styling control per content type** is a real requirement, not just authoring ease. Comics and essays need distinct presentation treatments (visual vs long-form prose) even within one feed — the content model must express "type" richly enough to drive per-type rendering and styling.
- **Cheap technical wins that should ride along:** React Router `<Link>` instead of anchor hrefs (kill full-reload nav); reconcile domain/title/OG metadata to `clintonavery.com`; clean orphaned routes, duplicate components, and editor cruft. These are not the headline but should be swept in.

---

## 6. Open questions for the Product Brief / PRD to resolve

1. **Content authoring pipeline** — markdown/MDX in-repo? A lightweight headless CMS? Where do comic image assets live and how is a comic post structured (panels, alt text, sequence)? This is the central design decision.
2. **Feed mechanics** — pagination vs infinite scroll; how "latest" surfaces on the Landing; tags/categories beyond the essay/comic type; archive/discovery of older work.
3. **Projects content model** — what makes a portfolio entry (tool/game reclaim vs case-study writeup); what metadata per entry (stack, screenshots, live link, source link, one-liner).
4. **Landing narrative & assets** — concrete scroll sections, the specific action photography to source/commission, motion/interactivity treatment, and how it stays maintainable.
5. **Styling architecture decision** — finish the Tailwind v4 adoption, stay CSS Modules, or a defined mix; the reimagining is a natural moment to commit.
6. **Follow / subscribe** — is there a "follow" (email/RSS) job for readers today, given the unified-cadence emphasis? Minimum viable subscription path?
7. **Preservation plan** — exact migration of existing posts (TSX → new content model) with content + styling fidelity; what existing functionality is retained vs rewritten.
8. **SEO / per-content metadata** — per-post titles, descriptions, OG cards, social-preview images (especially for shareable comics).

---

## 7. Synthesis — the one-line thesis

> Rebuild clintonjavery.com around **one Landing-that-is-the-About** funnelling two audiences into **one unified Writing+Comics feed** and **one Projects portfolio**, with a **content-first authoring pipeline** as the unlock that makes weekly publishing sustainable — preserving every existing post and absorbing today's scattered Tools/Fun into legible portfolio proof.