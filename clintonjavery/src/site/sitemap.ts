// Ink & Garden — sitemap.xml + robots.txt builders (Story 1.6, T1.4/T2).
// Pure + isomorphic. The content plugin's generateBundle hook calls these and
// emitFile()s the results into dist/ (build-time, the one per-post SEO surface
// that is statically emittable for a SPA — see story Dev Notes).
//
// AC5: one <url> per published Post + the stable routes (root, /p, /projects),
// every <loc> + the Sitemap: directive on the canonical https://www.clintonavery.com.
// Drafts never appear — buildSitemap TRUSTS its input is already published-only
// (the 1.2 build gate owns draft exclusion; no status refilter here).

import type { PostMeta } from '../content/schema';

/** Escape the five XML-special characters for safe <loc> content. */
function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Stable routes emitted in every sitemap, in order: root, Feed, Projects. */
function stableRoutes(siteUrl: string): string[] {
  return [`${siteUrl}/`, `${siteUrl}/p`, `${siteUrl}/projects`];
}

/**
 * Build a valid sitemap.xml from the published content-index.
 * Posts are emitted reverse-chronologically as provided by the index; stable
 * routes follow. `<lastmod>` uses the Post's ISO date.
 */
export function buildSitemap(posts: PostMeta[], siteUrl: string): string {
  const lines: string[] = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

  // Stable routes first (home/entry, then Feed, then Projects).
  for (const loc of stableRoutes(siteUrl)) {
    lines.push('  <url>');
    lines.push(`    <loc>${escapeXml(loc)}</loc>`);
    lines.push('  </url>');
  }

  // One <url> per published Post (input is already reverse-chron + draft-excluded).
  for (const p of posts) {
    const loc = `${siteUrl}/p/${p.slug}`;
    lines.push('  <url>');
    lines.push(`    <loc>${escapeXml(loc)}</loc>`);
    lines.push(`    <lastmod>${p.date}</lastmod>`);
    lines.push('  </url>');
  }

  lines.push('</urlset>');
  lines.push(''); // trailing newline
  return lines.join('\n');
}

/**
 * Build robots.txt: allow all, point to the sitemap at the canonical URL.
 */
export function buildRobots(siteUrl: string): string {
  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${siteUrl}/sitemap.xml`, ''].join('\n');
}