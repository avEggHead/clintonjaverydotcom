// Ink & Garden — site URL/description/canonical helpers (Story 1.6, T1.2).
// Pure + isomorphic (no `document`, no `import.meta`). The verifiable SEO
// layer; the DOM useHead effect consumes these via head-meta.ts.
//
// `siteUrl` is a parameter (not imported from identity.ts) so the helpers are
// unit-testable with arbitrary hosts and decoupled from the identity file.

import type { Post } from '../content/schema';

/**
 * Resolve a pathOrUrl to an absolute URL using the site URL as a base.
 * - already-absolute `http(s)://…` → unchanged
 * - `/slash-root` → `${siteUrl}${path}`
 * - relative `strip.png` → normalized to `/strip.png` then `${siteUrl}/strip.png`
 * - a trailing slash is stripped (except for the bare root `/`).
 */
export function toAbsoluteUrl(pathOrUrl: string, siteUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

  let path = pathOrUrl;
  if (!path.startsWith('/')) path = '/' + path; // normalize relative → slash-root
  if (path.length > 1 && path.endsWith('/')) path = path.replace(/\/+$/, '');
  if (path === '/') return siteUrl;
  return `${siteUrl}${path}`;
}

/**
 * Resolve a Post's Open Graph image.
 * - Comic (AC2): the Strip image, unless `ogImage` overrides.
 * - Essay (AC3): `ogImage` if provided, else the site default.
 * Never throws.
 */
export function postOgImage(post: Post, defaultOg: string): string {
  if (post.type === 'comic') return post.ogImage ?? post.strip.image;
  return post.ogImage ?? defaultOg;
}

/**
 * Resolve a Post's meta/og:description with an on-brand fallback.
 * - Essay: `excerpt` → fallback.
 * - Comic: `caption` → `notes` → fallback.
 */
export function postDescription(post: Post, fallback: string): string {
  if (post.type === 'essay') return post.excerpt ?? fallback;
  return post.caption ?? post.notes ?? fallback;
}

/** Per-Post canonical URL: `${siteUrl}/p/<slug>`. */
export function postCanonical(slug: string, siteUrl: string): string {
  return `${siteUrl}/p/${slug}`;
}

/** Feed canonical URL: `${siteUrl}/p`. */
export function feedCanonical(siteUrl: string): string {
  return `${siteUrl}/p`;
}

/** Projects canonical URL: `${siteUrl}/projects`. */
export function projectsCanonical(siteUrl: string): string {
  return `${siteUrl}/projects`;
}