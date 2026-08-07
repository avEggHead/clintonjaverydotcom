// Unit tests for the PostPage pure helpers (Story 1.4 / AC1, AC2, AC5, AC6).
// Vitest node env — same harness as src/content/validate.test.ts (AR-11:
// component rendering tests are deferred; these helpers are pure, no DOM).
//
// Covers: findPost (AC5 not-found branch), formatPostDate (AC1/AC2 date
// display, UTC-stable so TZ never shifts the day), stripRetrySrc (AC6
// image-load-failure retry cache-bust).

import { describe, expect, it } from 'vitest';
import type { Post } from '../content';
import { findPost, formatPostDate, stripRetrySrc } from './postPage-utils';

function essay(slug: string): Post {
  return {
    slug,
    title: 'T',
    date: '2026-08-06',
    type: 'essay',
    status: 'published',
    access: 'free',
    body: () => Promise.resolve({ default: () => null }),
  };
}

describe('findPost', () => {
  it('returns the post whose slug matches (AC5 positive path)', () => {
    const list: Post[] = [essay('a'), essay('b'), essay('c')];
    expect(findPost(list, 'b')?.slug).toBe('b');
  });

  it('returns undefined when no slug matches (AC5 not-found branch)', () => {
    const list: Post[] = [essay('a')];
    expect(findPost(list, 'nope')).toBeUndefined();
  });

  it('returns undefined for an empty collection', () => {
    expect(findPost([], 'anything')).toBeUndefined();
  });
});

describe('formatPostDate', () => {
  it('formats an ISO date as "Month D, YYYY" (AC1 essay date)', () => {
    expect(formatPostDate('2026-08-06')).toBe('August 6, 2026');
  });

  it('formats the comic fixture date (AC2 comic date)', () => {
    expect(formatPostDate('2026-08-01')).toBe('August 1, 2026');
  });

  it('handles single-digit days and months without extra padding', () => {
    expect(formatPostDate('2025-01-07')).toBe('January 7, 2025');
  });

  it('is UTC-stable — never shifts the displayed day across timezones', () => {
    // Parse as UTC, not local, so a 2026-08-01 never renders as July 31 in a
    // negative-offset TZ. The exact assertion guards the day + month.
    expect(formatPostDate('2026-12-31')).toBe('December 31, 2026');
    expect(formatPostDate('2026-01-01')).toBe('January 1, 2026');
  });
});

describe('stripRetrySrc', () => {
  const src = '/content/p/first-strip/strip.png';

  it('returns the src unchanged on the first attempt (key 0, AC2 happy path)', () => {
    expect(stripRetrySrc(src, 0)).toBe(src);
  });

  it('appends ?retry=N to bust the cache on retry (AC6)', () => {
    expect(stripRetrySrc(src, 1)).toBe('/content/p/first-strip/strip.png?retry=1');
    expect(stripRetrySrc(src, 2)).toBe('/content/p/first-strip/strip.png?retry=2');
  });

  it('appends with & when the src already has a query string', () => {
    const withQuery = '/content/p/first-strip/strip.png?v=1';
    expect(stripRetrySrc(withQuery, 3)).toBe(
      '/content/p/first-strip/strip.png?v=1&retry=3',
    );
  });

  it('does not append a query when key is 0 even if a query exists', () => {
    const withQuery = '/x/y.png?v=1';
    expect(stripRetrySrc(withQuery, 0)).toBe(withQuery);
  });
});