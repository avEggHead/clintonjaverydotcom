---
title: "Product Brief: clintonjavery.com Reimagining"
status: draft
created: 2026-08-04
updated: 2026-08-04
---

# Product Brief: clintonjavery.com Reimagining

## Executive Summary

clintonjavery.com is being reimagined from a scattered personal site into a focused **writing-and-comics publishing platform with a project portfolio second**. The site has one job above all: let its single author — Clint — sustain a regular publishing cadence (writing and weekly-drawn comics) without the site itself becoming the obstacle. Today, adding any new content means editing TypeScript data files and shipping a full redeploy, which is precisely the friction that kills a weekly habit. The reimagining collapses the information architecture to three surfaces — a **Landing that *is* the About on top**, a **unified content feed** (Writing and Comics as facets of one stream, not separate sites), and **Projects** (which absorbs the existing tools and games as portfolio proof) — and replaces the code-deploy publishing model with a **git + markdown/MDX authoring pipeline** where a new essay or comic is just a new file and a commit. Every existing blog post migrates intact. The result is a site that serves two audiences — readers/fans who come for the next thing, and evaluators (clients/employers) who want to see competence fast — through one funnel, and that the author can actually keep alive.

The reason this matters now: the site already exists and works, but it has lapsed (last commit ~3 months ago) and its content model fights its own purpose. A focused rebuild on top of the existing React/Vite app — preserving assets, rethinking the architecture and the authoring path — turns a stalled site into a sustainable platform. Monetization (premium content behind a paywall) is a future *maybe*, not in scope; the design simply must not rule it out.

## The Problem

The author publishes two recurring content types — essays and comics — but today **every new post is an engineering act**: edit `.tsx` data files, commit, and trigger a full build/deploy. Styling that content is limited to what the hand-written data files allow, and comics, the higher-cadence ambition, aren't fully implemented yet. The cost of the status quo is the cadence itself: a busy week where authoring friction is too high is the week the habit dies, and a personal platform that goes quiet for months loses both its readers and its career signal. The site's information architecture makes this worse — eight-plus top-level sections (Reading, Gallery, Fun, Tools, Contribute, Comics, Writing, Projects, About) diffuse attention, the About page duplicates what the landing should do, and a navbar built on raw anchor links forces a full page reload on every click. Evaluators — the secondary audience — land on a "Welcome" home page that tells them almost nothing about who the author is or why to trust the work.

## The Solution

Rebuild around three surfaces fed by a content-first pipeline:

1. **Landing = About, on top of the funnel.** A high-impact hero of action-oriented photography (the author programming, talking to people) opens a scroll narrative that reveals who the author is and links each section. The Landing carries the "About" job an About page used to do, and funnels both audiences: readers toward the feed, evaluators toward Projects.

2. **One unified content feed.** Writing and Comics are not separate sections — they are facets of a single chronological stream, filterable by type (essay / comic / all). Publishing is **git + markdown/MDX, no CMS**: an essay is a new `type: essay` content file with a markdown body; a comic is a `type: comic` file with an ordered set of image panels plus caption/alt. A new post is a file + a commit; Cloudflare Pages auto-deploys. The feed replaces the parsing of two separate identities with one brand and one "latest," which is what makes a high-impact, sustainable landing possible — the hero can always feature "the newest thing I made," whatever type it is.

3. **Projects (portfolio).** The existing tools and games rehome here as portfolio entries (each with stack, live link, source link, one-liner) — proof of competence legible to evaluators, replacing the current "Welcome" dead-end.

A **Support affordance** (today: a Contribute-style button on content pages) is embedded in content rather than owning a page, and a future paywall component can be layered onto premium pieces without restructuring. The existing React 19 + Vite + React Router app is kept; the reimagining is architectural and content-model level, not a greenfield rewrite.

## What Makes This Different

This is not competing with publishing platforms or portfolio services; the differentiator is **honest and executional**: a personal site whose authoring cost is low enough that one person can actually sustain it, with the entire content base as portable, version-controlled plain files (no platform lock-in, no CMS to maintain, no database to run). The "moat" is the author's voice and the cadence that voice can maintain once friction is removed — and an open, git-backed file model that can be migrated, automated, or paid-walled later without re-architecture. There is no technical moat to fabricate; the bet is that removing the friction releases the cadence that already wants to happen.

## Who This Serves

- **Primary visitor — readers/fans:** arrive for the newest essay or comic; want to follow the stream. Success: a learner/follower finds the latest work in one click and can browse the archive filtered by type.
- **Secondary visitor — evaluators (potential clients/employers):** arrive to assess competence; want "he did that" quickly. Success: a decision-maker lands, sees proof in seconds via the Landing narrative, and reaches Projects with clear, linkable evidence (live demos, source).
- **The author (Clint):** the actual primary user of the *system*. Success: publishing two essays and two comics a month is friction-light enough that the habit survives a full schedule. *[ASSUMPTION: the author also values the practice of writing/drawing itself, not just its output.]*

## Success Criteria

For a personal site with career-signal stakes (not a lead-generation engine), success is measured in sustained habit and credibility, not conversions:

- **Cadence sustained:** 2 essays + 2 comics per month, held for at least 3 consecutive months, through a content pipeline that requires zero code edits to publish. *[ASSUMPTION: 3 months is the proof window that the cadence is durable, not a honeymoon.]*
- **Existing content preserved:** 100% of current blog posts migrated to the new content model with content and styling fidelity intact.
- **Evaluator speed:** an evaluator can reach a deployable, source-linked project example within ~2 clicks from the Landing.
- **Publishing is a content act:** adding any new essay or comic touches only a `content/` file + commit; no application code, no full-redeploy ceremony beyond the auto Cloudflare build.
- **Navigation fixed:** zero full-page-reload navigations within the app (React Router `<Link>` throughout).

## Scope

**In (first version):**
- New IA: Landing (About inline, scroll narrative + section links), unified Feed (Writing + Comics, type filter), Projects (absorbs Tools/Games).
- Git + markdown/MDX content pipeline; `type: essay` and `type: comic` post models.
- Migration of all existing posts to the new model, intact.
- Landing hero with action-oriented photography + scroll narrative.
- React Router `<Link>` navigation; reconcile domain/title/OG metadata to `clintonavery.com`.
- In-content Support affordance (Contribute-style).
- Stale-code/route/metadata cleanup pass.

**Out (this version):**
- Standalone Gallery / non-comic visual art.
- About as a dedicated page.
- `Reading`, `Fun`, `Tools`, `Contribute` as top-level sections (absorbed or dissolved).
- Paywall / premium content monetization (future; not designed against).
- Email/RSS "follow"/subscription as a built feature *[ASSUMPTION: deferred — a subscribe path may be a fast-follow; flagged for PRD]*.
- Active lead-generation tooling (inquiry CTAs, resume capture) — the portfolio is a signal, not a funnel.

## Vision

If it succeeds, in 2–3 years clintonjavery.com is the place Clint's weekly comic and essays live and accumulate — a self-curated body of work whose mere existence is the career signal, sustained because publishing is as easy as writing and drawing already are. The same git-backed file model that powers the feed can, when the moment comes, gate premium comics and essays behind a paywall with a component, not a rebuild; and because everything is open files on Cloudflare, it can grow, be automated, or be moved without ever becoming a platform the author is stuck on. The site stops being a thing he has to maintain and becomes a thing that simply records what he makes.

---

### Open decisions carried to the PRD (intentional)

These are flagged `[ASSUMPTION]` here and must be settled in the PRD / architecture, not the brief:

- `[ASSUMPTION]` **Feed mechanics** — pagination vs infinite scroll vs "latest + archive"; how "latest" surfaces on the Landing. *Recommendation: pagination + a Landing "latest" strip.*
- `[ASSUMPTION]` **Styling architecture** — finish the Tailwind v4 adoption (commit to Tailwind) given the site is mid-transition. *Recommendation: commit to Tailwind v4, retire ad-hoc CSS modules in the rebuild.*
- `[ASSUMPTION]` **Tags/categories** beyond essay/comic `type`.
- `[ASSUMPTION]` **Subscribe/follow** minimum-viable path (email/RSS) — in or fast-follow.
- Per-content SEO/OG metadata model.

### Source material & audit trail

- Brainstorm (canonical): `_bmad-output/brainstorming/brain-clintonjavery-site-reimagining-2026-08-04/.memlog.md`
- Brainstorm doc: `_bmad-output/planning-artifacts/brainstorm-clintonjavery-site-reimagining.md`
- This brief's audit log: `_bmad-output/planning-artifacts/briefs/brief-clintonjaverydotcom-2026-08-04/.memlog.md`
- Content-model + migration detail (downstream-ready): `addendum.md` (this folder)