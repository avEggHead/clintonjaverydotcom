# Runbook — Adding Content (Essays & Comics)

How to publish a new post on clintonjavery.com. The whole content pipeline is
build-time (no CMS, no DB): you write one file, the build validates it, the
post appears on the site.

> One-line summary: **write one file in `clintonjavery/content/p/`, run
> `npm run build`, fix any gate error, bump one test fixture if your post is
> the new newest, then `git commit`.**

Everything below is just the details.

---

## TL;DR workflow

```bash
cd clintonjavery
npm run dev          # live preview at http://localhost:5173  (write while it runs)
# …create the file in content/p/…
npm run build        # the content GATE — fails loudly on bad frontmatter
npm run test         # if your post is the new newest, fix 2 lines in validate.test.ts (↓)
git add -A && git commit -m "post: <slug>"
# then push to main → Cloudflare Pages deploys
```

---

## The two post shapes

|                 | **Essay** (a written post)              | **Comic** (a strip image)                        |
|-----------------|-----------------------------------------|--------------------------------------------------|
| File extension  | `.mdx` *(required — the body compiles)*   | `.md` *(no body; a `.mdx` would break the gate)* |
| Required fields | `title`, `date`, `type: essay`, body text | `title`, `date`, `type: comic`, `strip.image`, `strip.alt` |
| Body            | Markdown/MDX after the frontmatter        | none (the image *is* the content)                |
|Renders at       | `/p/<slug>`                              | `/p/<slug>` (the zoom/pan ComicViewer)            |

**The slug is the filename stem, kebab-case.** Never author `slug:` in the
frontmatter — if you write it and it mismatches the filename, the gate throws.
Just omit it. The filename *is* the URL: `my-new-post.mdx` → `/p/my-new-post`.

`status: draft` keeps a file out of the build entirely (no validation, never
ships) — use it for work-in-progress you want to commit without publishing.

---

## Copy-paste templates

### Essay — `content/p/my-new-essay.mdx`

```mdx
---
title: "My New Essay"
date: "2026-09-01"
type: essay
excerpt: "One line for the feed card + meta description."
tags: ["meta", "pipeline"]   # optional
---

The body is Markdown with MDX. Headings, paragraphs, lists, links, **bold**,
all render. The first paragraph surfaces as the feed card body.

<https://example.com>          # bare URL — fine
`{ not_a_var }`                 # braces/angle-brackets are JSX — fence them in
```

### Images in an essay

Two syntaxes (both render with `.prose img { max-width: 100% }`, so they're
responsive). Put the asset in a sibling folder named after the slug, then
reference it by that public path.

**Markdown image** (preferred):

```mdx
![Alt text, required for screen readers](/content/p/my-new-essay/diagram.png)
```

**JSX image** (when you need control — width, caption, inline style):

```mdx
<img src="/content/p/my-new-essay/diagram.png" alt="Alt text." style={{ maxWidth: 600 }} />
```

Asset layout:

```
clintonjavery/public/content/p/my-new-essay/diagram.png
                       └─ referenced in the body as the public path above
```

Same convention comics use. The existing sample essay `hello-ink-garden.mdx`
does exactly this with `/content/p/hello-ink-garden/hero.png`. General/reused
images also live in `public/images/` (e.g. `public/images/fox_pen.jpg`) →
reference as `/images/fox_pen.jpg`. Any raster (`.png`/`.jpg`/`.webp`) works.

### Comic — `content/p/my-new-comic.md`

```md
---
title: "My New Comic"
date: "2026-09-01"
type: comic
excerpt: "One line for the feed card."
strip:
  image: "/content/p/my-new-comic/strip.png"
  alt: "Describe the strip in words — required for screen readers (FR-8)."
caption: "Optional standfirst under the title."   # optional
notes: "Optional creator notes below the strip."  # optional
---
```

### Draft (either type) — add to the frontmatter

```yaml
status: draft
```

> A draft can be empty/WIP — the build skips it entirely (no gate), and it
> never appears in the feed or sitemap. The existing fixture is
> `content/p/draft-wip.mdx`.

---

## Comic strip images — where they live

The strip is a static asset published as-is. Put it in a sibling folder named
after the slug, then reference it by that public path:

```
clintonjavery/public/content/p/my-new-comic/strip.png
                       └─ frontmatter: image: "/content/p/my-new-comic/strip.png"
```

Look at the real one for reference:
`clintonjavery/public/content/p/first-strip/strip.png` (frontmatter in
`content/p/first-strip.md`). Any raster (`.png`/`.jpg`/`.webp`) works; the
viewer scales the image to the container width at fit and zooms 1:1 to its
natural pixels when toggled.

---

## The build gate — what it rejects

`npm run build` runs `tsc -b && vite build`; the content plugin reads every
file in `content/p/` and calls `validatePost`, which **throws** on:

- missing/empty `title` or `date`
- `date` not ISO `YYYY-MM-DD` (e.g. `09-01-2026`) or not a real calendar date (e.g. `2026-13-40`)
- `type` ≠ `essay` / `comic`
- a `slug:` in frontmatter that doesn't match the filename stem
- essay body empty (no content after the frontmatter)
- a comic missing `strip.image` or `strip.alt` — **alt text is mandatory (FR-8)**
- comments: sure, but no stale dates

Fix the frontmatter, re-run the build. The error message names the file and
field exactly, e.g. `Content gate: content/p/my-post.md — missing or invalid title`.

---

## The one test-fixture caveat (common gotcha)

`src/content/validate.test.ts` pins the *current* published collection. When
you add a new **published** post you'll usually need to touch it. The relevant
block is the test *emits published posts reverse-chronologically…* (~line 138):

1. **Count** — `expect(slugs).toHaveLength(17)` (~line 144) → bump by 1 each new
   published post.
2. **Slug list** — `expect.arrayContaining([…])` (~line 146) → add your new slug
   (kebab-case).
3. **Top-of-feed date** — `expect(posts[0].meta.date).toBe('2026-08-06')` (line 185)
   and `expect(posts[1].meta.date).toBe('2026-07-16')` (line 186).

Rule of thumb for #3, given the feed is **reverse-chron** (newest first):

| Your new post's date                | What to update            |
|-------------------------------------|---------------------------|
| newer than `2026-08-06`             | line 185 → your date       |
| between `2026-07-16` and `2026-08-06` (exclusive) | line 186 → your date |
| `2026-07-16` or older                | nothing (it lands below)  |

(If two posts share the exact same date, slug ASC is the tiebreak — stable.)

`npm test` failing on `posts[0].meta.date` is the signal you hit #3 — it's a
one-line fix, not a real failure of your content. This fence exists on purpose
to stop accidentally orphaning or reordering the feed.

---

## Editor tips that save gates

- MDX compiles to JSX. A literal `{` or `<Foo>` in prose is parsed as code —
  fence it: `` `{x}` ``, a fenced code block, or `&#123;`. Bare URLs and
  `<https://...>` autolinks are fine. The leading `---\n…\n---` frontmatter
  block is stripped from the rendered body automatically (`remark-frontmatter`
  wired in `vite.config.ts`); it never shows on the page.
- Quote the frontmatter `title:` and `excerpt:` if they contain `:` or `#`.
- One idea per file; one post per file. Markdown styling (headings, `**bold**`,
  lists, blockquote) renders in `whiteSpace: pre-wrap` per the old `Post.tsx`
  rendering — author paragraphs as you want them read.
- To unpublish, set `status: draft` (keeps the file/history, removes from feed)
  rather than deleting. Delete only if you intend a permanent removal.
- Cloudflare historic redirect map lives in `clintonjavery/public/_redirects`
  (e.g. old `/writing/p` → `/p`). You don't need this for *new* posts.

---

## Deploy

Push to `main`. Cloudflare Pages builds `clintonjavery` and serves it. Drafts
are excluded before the bundle, so a committed draft never reaches production.
Redirects (301) only take effect on the Cloudflare deploy — `npm run preview`
ignores `_redirects` (resolved learning).

> Need the heavy gates (architecture spine / story process)? Those live in
> `_bmad-output/planning-artifacts/`. This runbook is just the day-to-day.