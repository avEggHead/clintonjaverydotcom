// Unit + integration tests for the build-time content gates (FR-8 / AC3, AC4, AC5).
// ARCHITECTURE-SPINE §Deferred: introducing Vitest at the story with validation
// logic — this is that story. `validatePost` is a pure function; an integration
// test exercises the plugin's `buildCollection` against the real fixtures.

import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { buildCollection } from './plugin';
import type { RawFrontmatter } from './schema';
import { validatePost } from './validate';

function essayRaw(over: Partial<RawFrontmatter> = {}): RawFrontmatter {
  return {
    title: 'A title',
    date: '2026-08-06',
    type: 'essay',
    ...over,
  };
}

function comicRaw(over: Partial<RawFrontmatter> = {}): RawFrontmatter {
  return {
    title: 'A strip',
    date: '2026-08-01',
    type: 'comic',
    strip: { image: '/x/y.png', alt: 'A descriptive alt.' },
    ...over,
  };
}

const validEssay = { slug: 'a', file: 'content/p/a.mdx', hasBody: true };
const validComic = { slug: 'b', file: 'content/p/b.md', hasBody: false };

describe('validatePost — essay', () => {
  it('accepts a valid essay', () => {
    const { meta, isDraft } = validatePost(essayRaw(), validEssay);
    expect(isDraft).toBe(false);
    if (meta.type !== 'essay') throw new Error('expected essay');
    expect(meta.slug).toBe('a');
    expect(meta.title).toBe('A title');
    expect(meta.date).toBe('2026-08-06');
    expect(meta.status).toBe('published');
    expect(meta.access).toBe('free');
  });

  it('fails when title is missing (AC4)', () => {
    expect(() => validatePost(essayRaw({ title: undefined }), validEssay)).toThrow(
      /content\/p\/a\.mdx — missing or invalid title/,
    );
  });

  it('fails when body is empty (AC4)', () => {
    expect(() =>
      validatePost(essayRaw(), { ...validEssay, hasBody: false }),
    ).toThrow(/missing or invalid body/);
  });

  it('fails on a malformed date', () => {
    expect(() => validatePost(essayRaw({ date: '08-06-2026' }), validEssay)).toThrow(
      /missing or invalid date/,
    );
  });

  it('fails on a non-existent calendar date', () => {
    expect(() => validatePost(essayRaw({ date: '2026-13-40' }), validEssay)).toThrow(
      /missing or invalid date/,
    );
  });

  it('throws on a slug/frontmatter mismatch (T7.5)', () => {
    expect(() =>
      validatePost(essayRaw({ slug: 'different' }), validEssay),
    ).toThrow(/must match filename/);
  });
});

describe('validatePost — comic', () => {
  it('accepts a valid comic and exposes strip.image + strip.alt (AC2)', () => {
    const { meta } = validatePost(comicRaw(), validComic);
    if (meta.type !== 'comic') throw new Error('expected comic');
    expect(meta.strip.image).toBe('/x/y.png');
    expect(meta.strip.alt).toBe('A descriptive alt.');
  });

  it('fails when strip.alt is absent (AC3 / FR-8)', () => {
    expect(() =>
      validatePost(
        comicRaw({ strip: { image: '/x/y.png' } }),
        validComic,
      ),
    ).toThrow(/missing or invalid strip\.alt: FR-8/);
  });

  it('fails when strip.alt is empty/whitespace (AC3 / FR-8)', () => {
    expect(() =>
      validatePost(
        comicRaw({ strip: { image: '/x/y.png', alt: '   ' } }),
        validComic,
      ),
    ).toThrow(/missing or invalid strip\.alt: FR-8/);
  });

  it('fails when strip.image is missing', () => {
    expect(() =>
      validatePost(comicRaw({ strip: { alt: 'x' } }), validComic),
    ).toThrow(/missing or invalid strip\.image/);
  });
});

describe('validatePost — drafts (AC5)', () => {
  it('flags a draft essay for exclusion (isDraft) and never renders', () => {
    const { isDraft } = validatePost(
      essayRaw({ status: 'draft' }),
      validEssay,
    );
    expect(isDraft).toBe(true);
  });

  it('flags a draft comic for exclusion', () => {
    const { isDraft } = validatePost(
      comicRaw({ status: 'draft' }),
      validComic,
    );
    expect(isDraft).toBe(true);
  });

  it('rejects an invalid status value', () => {
    expect(() =>
      validatePost(essayRaw({ status: 'archived' }), validEssay),
    ).toThrow(/missing or invalid status/);
  });
});

describe('buildCollection — integration over content/p fixtures', () => {
  // npm test runs from clintonjavery/; content/p holds the sample fixtures.
  const root = process.cwd();

  it('emits published posts reverse-chronologically, excluding drafts (AC1/AC2/AC5)', () => {
    const { posts } = buildCollection(root);
    // After Story 2.1 the collection is the 15 migrated essays + the 2 Epic-1
    // sample fixtures (essay `hello-ink-garden`, comic `first-strip`); the
    // `draft-wip` fixture is excluded (AC5). 17 published posts total.
    const slugs = posts.map((p) => p.meta.slug);
    expect(slugs).toHaveLength(17);
    expect(slugs).toEqual(
      expect.arrayContaining([
        'hello-ink-garden',
        'first-strip',
        'apertus-open-source-llm',
        'two-powershell-commands-of-domain-transfer',
        'run-a-model-locally',
        'triple-dt-software-engineering-framework',
        'dialogues-with-the-robot',
        'creating-a-package',
        'making-things-harder',
        'security-and-obscurity',
        'books-are-good',
        'two-mindsets-of-engineering',
        'three-concepts-for-support',
        'mass-migration-from-the-cloud',
        'values-beyond-the-bottom-line',
        'does-genai-remove-the-bottleneck',
        'bicycle-or-wheelchair',
      ]),
    );

    const essay = posts.find((p) => p.meta.slug === 'hello-ink-garden');
    expect(essay?.meta.type).toBe('essay');
    if (essay?.meta.type !== 'essay') throw new Error('essay');
    expect(typeof essay.bodyPath).toBe('string'); // lazy MDX importer path (AC1)

    const comic = posts.find((p) => p.meta.slug === 'first-strip');
    expect(comic?.meta.type).toBe('comic');
    if (comic?.meta.type !== 'comic') throw new Error('comic');
    expect(comic.meta.strip.alt.length).toBeGreaterThan(0); // AC2 / FR-8
    expect(comic.bodyPath).toBeUndefined(); // comics have no body

    // Reverse-chron (FR-5): each post's date is <= the previous (newest first).
    for (let i = 1; i < posts.length; i++) {
      expect(posts[i - 1].meta.date >= posts[i].meta.date).toBe(true);
    }
    // The two newest are the Epic-1 samples: essay (2026-08-06) then comic (2026-08-01).
    expect(posts[0].meta.date).toBe('2026-08-06');
    expect(posts[1].meta.date).toBe('2026-08-01');

    // The draft fixture never appears in the index.
    expect(posts.some((p) => p.meta.slug === 'draft-wip')).toBe(false);
  });

  it('fails closed when a comic is missing strip.alt (AC3)', () => {
    // Simulated fixture: build a temp invalid comic and validate via validatePost.
    expect(() =>
      validatePost(comicRaw({ strip: { image: '/x.png' } }), {
        slug: 'temp',
        file: 'content/p/temp.md',
        hasBody: false,
      }),
    ).toThrow(/FR-8/);
  });

  it('resolves the project root under clintonjavery/', () => {
    expect(path.basename(root)).toBe('clintonjavery');
  });
});