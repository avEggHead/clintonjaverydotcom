// Pure-helper unit tests for site-utils (Story 1.6, T1.2).
// URL normalization + per-post OG/description/canonical resolution — the
// verifiable layer (AR-11). The DOM useHead effect is NOT tested here.

import { describe, it, expect } from 'vitest';
import type { ComicPost, EssayPost } from '../content';
import {
  toAbsoluteUrl,
  postOgImage,
  postDescription,
  postCanonical,
  feedCanonical,
  projectsCanonical,
} from './site-utils';

const SITE = 'https://www.clintonavery.com';

const essayNoOg: EssayPost = {
  slug: 'hello-ink-garden',
  title: 'Hello, Ink & Garden',
  date: '2026-08-06',
  type: 'essay',
  status: 'published',
  access: 'free',
  excerpt: 'A first post on the new build-time content pipeline.',
  body: () => Promise.resolve({ default: () => null }),
};

const essayWithOg: EssayPost = { ...essayNoOg, slug: 'essay-og', ogImage: '/content/p/essay-og/card.jpg' };

const comicNoOg: ComicPost = {
  slug: 'first-strip',
  title: 'First Strip',
  date: '2026-08-05',
  type: 'comic',
  status: 'published',
  access: 'free',
  strip: { image: '/content/p/first-strip/strip.png', alt: 'A first comic strip.' },
  caption: 'A caption chip.',
  notes: 'An afterword.',
};

const comicWithOg: ComicPost = {
  ...comicNoOg,
  slug: 'comic-og',
  ogImage: '/content/p/comic-og/card.jpg',
};

const DEFAULT_OG = '/assets/bg-space.jpg';

describe('toAbsoluteUrl', () => {
  it('passes an already-absolute https URL through unchanged', () => {
    expect(toAbsoluteUrl('https://other.example/x', SITE)).toBe('https://other.example/x');
  });

  it('passes an already-absolute http URL through unchanged', () => {
    expect(toAbsoluteUrl('http://other.example/x', SITE)).toBe('http://other.example/x');
  });

  it('prefixes a slash-root path with the site URL', () => {
    expect(toAbsoluteUrl('/assets/bg-space.jpg', SITE)).toBe(`${SITE}/assets/bg-space.jpg`);
  });

  it('prefixes a slash-root content path with the site URL', () => {
    expect(toAbsoluteUrl('/content/p/first-strip/strip.png', SITE)).toBe(
      `${SITE}/content/p/first-strip/strip.png`,
    );
  });

  it('normalizes a relative path by prefixing a leading slash, then the site URL', () => {
    expect(toAbsoluteUrl('strip.png', SITE)).toBe(`${SITE}/strip.png`);
  });

  it('strips a trailing slash (except root) from the result', () => {
    expect(toAbsoluteUrl('/p/', SITE)).toBe(`${SITE}/p`);
  });

  it('keeps the root URL as the bare site URL (no trailing slash stripped past root)', () => {
    expect(toAbsoluteUrl('/', SITE)).toBe(SITE);
  });

  it('works with a siteUrl that itself has no trailing slash', () => {
    expect(toAbsoluteUrl('/x', 'https://example.com')).toBe('https://example.com/x');
  });
});

describe('postOgImage', () => {
  it('returns the strip image for a comic with no ogImage', () => {
    expect(postOgImage(comicNoOg, DEFAULT_OG)).toBe(comicNoOg.strip.image);
  });

  it('returns ogImage for a comic that defines it (override wins)', () => {
    expect(postOgImage(comicWithOg, DEFAULT_OG)).toBe(comicWithOg.ogImage);
  });

  it('returns the site default for an essay with no ogImage', () => {
    expect(postOgImage(essayNoOg, DEFAULT_OG)).toBe(DEFAULT_OG);
  });

  it('returns ogImage for an essay that defines it (override wins)', () => {
    expect(postOgImage(essayWithOg, DEFAULT_OG)).toBe(essayWithOg.ogImage);
  });
});

describe('postDescription', () => {
  it('returns the excerpt for an essay', () => {
    expect(postDescription(essayNoOg, 'FALLBACK')).toBe(essayNoOg.excerpt);
  });

  it('returns the fallback for an essay with no excerpt', () => {
    const e: EssayPost = { ...essayNoOg, excerpt: undefined };
    expect(postDescription(e, 'FALLBACK')).toBe('FALLBACK');
  });

  it('returns the caption for a comic (preferred over notes)', () => {
    expect(postDescription(comicNoOg, 'FALLBACK')).toBe(comicNoOg.caption);
  });

  it('returns notes for a comic with no caption', () => {
    const c: ComicPost = { ...comicNoOg, caption: undefined };
    expect(postDescription(c, 'FALLBACK')).toBe(comicNoOg.notes);
  });

  it('returns the fallback for a comic with neither caption nor notes', () => {
    const c: ComicPost = { ...comicNoOg, caption: undefined, notes: undefined };
    expect(postDescription(c, 'FALLBACK')).toBe('FALLBACK');
  });
});

describe('canonicals', () => {
  it('postCanonical builds /p/<slug>', () => {
    expect(postCanonical('hello-ink-garden', SITE)).toBe(`${SITE}/p/hello-ink-garden`);
  });

  it('feedCanonical builds /p', () => {
    expect(feedCanonical(SITE)).toBe(`${SITE}/p`);
  });

  it('projectsCanonical builds /projects', () => {
    expect(projectsCanonical(SITE)).toBe(`${SITE}/projects`);
  });
});