// Pure-helper unit tests for head-meta (Story 1.6, T1.3) — the verifiable
// SEO layer. buildHeadMeta returns a plain, serializable HeadMeta that the
// DOM useHead effect renders. AR-11: the DOM effect itself is manual smoke.

import { describe, it, expect } from 'vitest';
import type { ComicPost, EssayPost } from '../content';
import { buildHeadMeta } from './head-meta';
import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION, DEFAULT_OG_IMAGE, AUTHOR } from './identity';

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

const essayWithOg: EssayPost = { ...essayNoOg, slug: 'e2', ogImage: '/content/p/e2/card.jpg' };

/* helpers — find tags by key */
const tagByProperty = (tags: { property?: string; name?: string; content: string }[], key: string) =>
  tags.find((t) => t.property === key);
const tagByName = (tags: { property?: string; name?: string; content: string }[], key: string) =>
  tags.find((t) => t.name === key);

describe('buildHeadMeta — home', () => {
  const head = buildHeadMeta({ kind: 'home' });

  it('uses the site title as <title>', () => {
    expect(head.title).toBe(SITE_TITLE);
  });

  it('emits description + og:description = site description', () => {
    expect(tagByName(head.tags, 'description')?.content).toBe(SITE_DESCRIPTION);
    expect(tagByProperty(head.tags, 'og:description')?.content).toBe(SITE_DESCRIPTION);
  });

  it('emits og:title = site title', () => {
    expect(tagByProperty(head.tags, 'og:title')?.content).toBe(SITE_TITLE);
  });

  it('emits absolute og:image = default OG image absolutized', () => {
    expect(tagByProperty(head.tags, 'og:image')?.content).toBe(`${SITE_URL}${DEFAULT_OG_IMAGE}`);
  });

  it('emits og:url = site URL and og:type = website', () => {
    expect(tagByProperty(head.tags, 'og:url')?.content).toBe(SITE_URL);
    expect(tagByProperty(head.tags, 'og:type')?.content).toBe('website');
  });

  it('emits og:site_name and twitter:card', () => {
    expect(tagByProperty(head.tags, 'og:site_name')?.content).toBe(SITE_TITLE);
    expect(tagByName(head.tags, 'twitter:card')?.content).toBe('summary_large_image');
  });

  it('emits a canonical <link> to the site URL', () => {
    expect(head.links.find((l) => l.rel === 'canonical')?.href).toBe(SITE_URL);
  });
});

describe('buildHeadMeta — post (essay, no ogImage)', () => {
  const head = buildHeadMeta({ kind: 'post', post: essayNoOg });

  it('uses the Post title as <title> (never the generic site title)', () => {
    expect(head.title).toBe('Hello, Ink & Garden');
    expect(head.title).not.toBe(SITE_TITLE);
  });

  it('emits og:title = post title', () => {
    expect(tagByProperty(head.tags, 'og:title')?.content).toBe('Hello, Ink & Garden');
  });

  it('emits description + og:description = excerpt (essay)', () => {
    const d = essayNoOg.excerpt;
    expect(tagByName(head.tags, 'description')?.content).toBe(d);
    expect(tagByProperty(head.tags, 'og:description')?.content).toBe(d);
  });

  it('emits og:image = site default (essay has no ogImage), absolutized', () => {
    expect(tagByProperty(head.tags, 'og:image')?.content).toBe(`${SITE_URL}${DEFAULT_OG_IMAGE}`);
  });

  it('emits og:url = post canonical and og:type = article', () => {
    expect(tagByProperty(head.tags, 'og:url')?.content).toBe(`${SITE_URL}/p/hello-ink-garden`);
    expect(tagByProperty(head.tags, 'og:type')?.content).toBe('article');
  });

  it('emits twitter:title + twitter:description mirroring og', () => {
    expect(tagByName(head.tags, 'twitter:title')?.content).toBe('Hello, Ink & Garden');
    expect(tagByName(head.tags, 'twitter:description')?.content).toBe(essayNoOg.excerpt);
  });

  it('emits a canonical <link> = post canonical', () => {
    expect(head.links.find((l) => l.rel === 'canonical')?.href).toBe(
      `${SITE_URL}/p/hello-ink-garden`,
    );
  });
});

describe('buildHeadMeta — post (essay WITH ogImage)', () => {
  const head = buildHeadMeta({ kind: 'post', post: essayWithOg });

  it('uses ogImage (override) absolutized, not the site default', () => {
    expect(tagByProperty(head.tags, 'og:image')?.content).toBe(
      `${SITE_URL}${essayWithOg.ogImage}`,
    );
  });
});

describe('buildHeadMeta — post (comic)', () => {
  const head = buildHeadMeta({ kind: 'post', post: comicNoOg });

  it('uses the comic title as <title>', () => {
    expect(head.title).toBe('First Strip');
  });

  it('uses the strip image as og:image (no ogImage override), absolutized', () => {
    expect(tagByProperty(head.tags, 'og:image')?.content).toBe(
      `${SITE_URL}${comicNoOg.strip.image}`,
    );
  });

  it('uses the caption as description (comic fallback chain: caption > notes)', () => {
    expect(tagByName(head.tags, 'description')?.content).toBe(comicNoOg.caption);
  });

  it('emits og:url = /p/<slug> and og:type = article', () => {
    expect(tagByProperty(head.tags, 'og:url')?.content).toBe(`${SITE_URL}/p/first-strip`);
    expect(tagByProperty(head.tags, 'og:type')?.content).toBe('article');
  });
});

describe('buildHeadMeta — feed', () => {
  it('title is "Feed · <author>"', () => {
    const head = buildHeadMeta({ kind: 'feed', canonical: `${SITE_URL}/p` });
    expect(head.title).toBe(`Feed · ${AUTHOR}`);
  });

  it('emits absolute og:url = the provided (normalised) canonical', () => {
    const head = buildHeadMeta({ kind: 'feed', canonical: `${SITE_URL}/p?type=comic&page=2` });
    expect(tagByProperty(head.tags, 'og:url')?.content).toBe(`${SITE_URL}/p?type=comic&page=2`);
    expect(head.links.find((l) => l.rel === 'canonical')?.href).toBe(
      `${SITE_URL}/p?type=comic&page=2`,
    );
  });

  it('uses site default og:image and website og:type', () => {
    const head = buildHeadMeta({ kind: 'feed', canonical: `${SITE_URL}/p` });
    expect(tagByProperty(head.tags, 'og:image')?.content).toBe(`${SITE_URL}${DEFAULT_OG_IMAGE}`);
    expect(tagByProperty(head.tags, 'og:type')?.content).toBe('website');
  });
});

describe('buildHeadMeta — project', () => {
  const head = buildHeadMeta({
    kind: 'project',
    title: 'Time Zone Converter',
    description: 'Convert a moment between any two time zones with Luxon.',
    canonical: `${SITE_URL}/projects/time-zone-converter`,
  });

  it('title is "<entry title> · <author>"', () => {
    expect(head.title).toBe(`Time Zone Converter · ${AUTHOR}`);
  });

  it('emits description = entry summary + og:url/canonical = provided', () => {
    expect(tagByName(head.tags, 'description')?.content).toBe(
      'Convert a moment between any two time zones with Luxon.',
    );
    expect(tagByProperty(head.tags, 'og:url')?.content).toBe(`${SITE_URL}/projects/time-zone-converter`);
    expect(head.links.find((l) => l.rel === 'canonical')?.href).toBe(`${SITE_URL}/projects/time-zone-converter`);
  });

  it('uses site default og:image + website og:type, no robots noindex', () => {
    expect(tagByProperty(head.tags, 'og:image')?.content).toBe(`${SITE_URL}${DEFAULT_OG_IMAGE}`);
    expect(tagByProperty(head.tags, 'og:type')?.content).toBe('website');
    expect(tagByName(head.tags, 'robots')).toBeUndefined();
  });
});

describe('buildHeadMeta — projects', () => {
  it('title is "Projects · <author>"', () => {
    const head = buildHeadMeta({ kind: 'projects', canonical: `${SITE_URL}/projects` });
    expect(head.title).toBe(`Projects · ${AUTHOR}`);
  });

  it('emits absolute og:url + canonical = the provided canonical', () => {
    const head = buildHeadMeta({ kind: 'projects', canonical: `${SITE_URL}/projects` });
    expect(tagByProperty(head.tags, 'og:url')?.content).toBe(`${SITE_URL}/projects`);
    expect(head.links.find((l) => l.rel === 'canonical')?.href).toBe(`${SITE_URL}/projects`);
  });

  it('uses site default og:image + website og:type, no robots noindex', () => {
    const head = buildHeadMeta({ kind: 'projects', canonical: `${SITE_URL}/projects` });
    expect(tagByProperty(head.tags, 'og:image')?.content).toBe(`${SITE_URL}${DEFAULT_OG_IMAGE}`);
    expect(tagByProperty(head.tags, 'og:type')?.content).toBe('website');
    expect(tagByName(head.tags, 'robots')).toBeUndefined();
  });
});

describe('buildHeadMeta — not-found', () => {
  const head = buildHeadMeta({ kind: 'not-found' });

  it('title is "Not found · <author>"', () => {
    expect(head.title).toBe(`Not found · ${AUTHOR}`);
  });

  it('emits a robots noindex meta', () => {
    expect(tagByName(head.tags, 'robots')?.content).toBe('noindex');
  });

  it('points og:url + canonical at the site URL (not the missing slug)', () => {
    expect(tagByProperty(head.tags, 'og:url')?.content).toBe(SITE_URL);
    expect(head.links.find((l) => l.rel === 'canonical')?.href).toBe(SITE_URL);
  });
});