// Pure helpers for the PostPage (Story 1.4). No React, no DOM — unit-tested
// in postPage-utils.test.ts under the Vitest node harness (the rendering layer
// is verified visually per AR-11). Importing `../content` is type-only here so
// this module stays out of the content-index runtime graph until PostPage uses
// it.

import type { Post } from '../content';

/** Find a Post by slug in the content-index (AC5 not-found branch). */
export function findPost(list: Post[], slug: string | undefined): Post | undefined {
  if (!slug) return undefined;
  return list.find((p) => p.slug === slug);
}

/**
 * Format an ISO `YYYY-MM-DD` Post date as "Month D, YYYY" (AC1/AC2).
 * Parsed as UTC so a negative-offset viewer never sees the day shift
 * (e.g. 2026-08-01 rendering as July 31). No `luxon` — `Intl` is built-in.
 */
export function formatPostDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(dt);
}

/**
 * Build the Strip `<img src>` for a given retry attempt (AC6).
 * `key === 0` → the original src (no cache-bust). `key > 0` → appends
 * `?retry=N` (or `&retry=N` when a query already exists) so the browser
 * re-attempts the image load on Retry.
 */
export function stripRetrySrc(src: string, key: number): string {
  if (key <= 0) return src;
  const sep = src.includes('?') ? '&' : '?';
  return `${src}${sep}retry=${key}`;
}