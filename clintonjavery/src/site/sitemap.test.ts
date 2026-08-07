// Pure-helper unit tests for sitemap/robots (Story 1.6, T1.4). The plugin's
// emitFile wiring is verified by `npm run build` producing dist/sitemap.xml +
// dist/robots.txt (T2.2); here we lock the XML/robots string shape.

import { describe, it, expect } from 'vitest';
import type { PostMeta } from '../content';
import { buildSitemap, buildRobots } from './sitemap';

const SITE = 'https://www.clintonavery.com';

const posts: PostMeta[] = [
  {
    slug: 'hello-ink-garden',
    title: 'Hello, Ink & Garden',
    date: '2026-08-06',
    type: 'essay',
    status: 'published',
    access: 'free',
    excerpt: 'A first post.',
  },
  {
    slug: 'first-strip',
    title: 'First Strip',
    date: '2026-08-05',
    type: 'comic',
    status: 'published',
    access: 'free',
    strip: { image: '/content/p/first-strip/strip.png', alt: 'A first strip.' },
  },
];

describe('buildSitemap', () => {
  const xml = buildSitemap(posts, SITE);

  it('is a well-formed urlset with the sitemap 0.9 namespace', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml.trim().endsWith('</urlset>')).toBe(true);
  });

  it('contains one <url> per published post with /p/<slug> loc + lastmod', () => {
    expect(xml).toContain(`<loc>${SITE}/p/hello-ink-garden</loc>`);
    expect(xml).toContain(`<lastmod>2026-08-06</lastmod>`);
    expect(xml).toContain(`<loc>${SITE}/p/first-strip</loc>`);
    expect(xml).toContain(`<lastmod>2026-08-05</lastmod>`);
  });

  it('contains the stable routes: root, /p, /projects', () => {
    expect(xml).toContain(`<loc>${SITE}/</loc>`);
    expect(xml).toContain(`<loc>${SITE}/p</loc>`);
    expect(xml).toContain(`<loc>${SITE}/projects</loc>`);
  });

  it('has exactly the expected number of <url> entries (3 stable + N posts)', () => {
    const urlCount = (xml.match(/<url>/g) ?? []).length;
    expect(urlCount).toBe(3 + posts.length);
  });

  it('uses the canonical site URL on every loc (no clintonavery.dev / clintonjavery.com)', () => {
    expect(xml).not.toContain('clintonavery.dev');
    expect(xml).not.toContain('clintonjavery.com');
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.every((l) => l.startsWith(SITE))).toBe(true);
  });

  it('escapes XML-special characters in locs', () => {
    const weird: PostMeta[] = [
      { slug: 'a&b<c>', title: 'T', date: '2026-01-01', type: 'essay', status: 'published', access: 'free' },
    ];
    const wxml = buildSitemap(weird, SITE);
    expect(wxml).toContain(`${SITE}/p/a&amp;b&lt;c&gt;`);
    expect(wxml).not.toContain(`<loc>${SITE}/p/a&b<c></loc>`);
  });

  it('trusts the index: never re-filters by status (input is already published-only)', () => {
    // If a draft somehow slipped into the input, buildSitemap emits it — the
    // 1.2 build gate owns draft exclusion. This test documents the contract.
    const mixed: PostMeta[] = [
      { slug: 'pub', title: 'T', date: '2026-01-02', type: 'essay', status: 'published', access: 'free' },
      { slug: 'draft-slip', title: 'T', date: '2026-01-01', type: 'essay', status: 'draft', access: 'free' },
    ];
    const mxml = buildSitemap(mixed, SITE);
    expect(mxml).toContain(`${SITE}/p/draft-slip`);
  });
});

describe('buildRobots', () => {
  const txt = buildRobots(SITE);

  it('allows all user agents', () => {
    expect(txt).toContain('User-agent: *');
    expect(txt).toContain('Allow: /');
  });

  it('points to the sitemap at the canonical URL', () => {
    expect(txt).toContain(`Sitemap: ${SITE}/sitemap.xml`);
  });

  it('does not reference the stale dev domain', () => {
    expect(txt).not.toContain('clintonavery.dev');
  });

  it('is a non-empty, trimmed string ending in a newline', () => {
    expect(txt.trim().length).toBeGreaterThan(0);
    expect(txt.endsWith('\n')).toBe(true);
  });
});