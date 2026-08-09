# Addendum — clintonjavery.com Reimagining

Depth that belongs downstream (PRD / architecture / solution design) or earned a place but didn't fit the brief's 1–2 page shape. Derived from the brainstorm and the brief's confirmed decisions; not a separate consensus, just the working detail.

## A. Content authoring pipeline (confirmed: git + markdown/MDX, no CMS)

**Decision:** Authoring is plain files in a `content/` directory, version-controlled in the same repo, deployed automatically by Cloudflare Pages on commit. No headless CMS, no database.

**Post model (frontmatter + body):**
- `type: essay` — markdown/MDX body; supports rich styling control (headings, images, code blocks, callouts, embeds).
- `type: comic` — an ordered list of image panels (src, alt, optional caption/notes); minimal/no long-form body, but optional intro/afterword text.
- Common frontmatter: `title`, `date`, `type`, `slug`, `excerpt`, `tags` (open), `status` (draft/published), `ogImage`.

**Comics, specifically.** A comic is rendered from its panel set — each panel an image with alt text and optional caption — so both authored styling and accessibility (alt) are first-class. Captions/lettering may live in the image or as overlay text (open for PRD: in-image vs text-overlay lettering model).

**Why this and not a CMS:** zero running cost, zero platform lock-in, full version history, automatable, and a comic and an essay are equally "a new file." Migrating away later means moving files, not exporting a database.

## B. Information architecture (confirmed)

```
Landing  (hero = action-oriented photography; scroll narrative = About + section links)
   ├── Feed      (unified Writing + Comics, chronological, type filter: essay/comic/all)
   └── Projects  (portfolio; absorbs former Tools + Fun/Games)
```
Top-level nav surfaces **Feed** and **Projects**; the Landing is the entry identity. Contribute is an in-content affordance, not a route. Reading/Fun/Tools/Form/About-as-a-page are gone as top-level concepts.

## C. Existing content & functionality preservation (constraint)

- All existing blog posts in `src/data/posts.tsx` migrate to the new file model, content + styling fidelity intact. Migration is a mechanical transform (TSX post record → markdown file with matched frontmatter), but per-post visual review is expected.
- Existing functionality retained where it rehomess: Tools (TimeZoneConverter, TextAnalyzer, EffortSlider, UnitConverter) and Fun (BalloonPopper, BalloonPopperV2 — de-duplicate to one) become **Projects entries** with live links, not deleted.
- The current `Reading` route (commented out of the navbar) is retired; its content, if any, is folded into Projects or dropped per PRD.
- Standalone Gallery images (non-comic) are out of scope; not migrated as a section.

## D. Hosting & identity (corrected facts)

- **Hosting:** Cloudflare Pages wired to the GitHub repo (auto-deploy on `main`). No longer Azure Static Web Apps.
- **Domain:** `clintonavery.com`. Action: reconcile `index.html` `og:url`, `<title>`, and OG card metadata (currently `clintonavery.dev` / "Clinton Avery") to the correct identity.
- **Stack kept:** React 19 + TypeScript + Vite 6 + React Router 7. Styling architecture is an open decision (brief recommends finishing the Tailwind v4 adoption).

## E. Cheap technical wins to sweep in (not the headline)

- Replace raw `<a href>` navbar links with React Router `<Link>` (eliminate full-page-reload navigation).
- De-duplicate `BalloonPopper` / `BalloonPopperV2` to a single project entry.
- Remove editor cruft (`public/assets/bg-space.jpg~`).
- Reconcile domain/title/OG metadata (above).
- Delete/clean stale local branches (`funSection`, `gameOverChangesInGame`, `newToolWordCounter`, `wordscramble`, `post`, `postCloudMigration`).

## F. Open questions for PRD / architecture

1. Feed pagination strategy + how "latest" surfaces on the Landing.
2. Tailwind v4 commit vs CSS Modules (recommend: commit to Tailwind v4).
3. In-image vs text-overlay comic lettering/caption model; alt-text discipline.
4. Tags/categories beyond `type`.
5. Minimum-viable subscribe/follow path (email and/or RSS) — in-scope or fast-follow.
6. Per-content SEO/OG metadata (title, description, social-preview image), especially for shareable comics.
7. Projects content model fields (stack, screenshots, live link, source link, one-liner, date).
8. Migration procedure + per-post QA for the existing backlog.