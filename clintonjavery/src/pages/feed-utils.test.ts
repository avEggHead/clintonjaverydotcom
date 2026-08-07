// Unit tests for the Feed pure helpers (Story 1.5 / AC1, AC2, AC3, AC4, AC5).
// Vitest node env — same harness as src/content/validate.test.ts and
// src/pages/postPage-utils.test.ts (AR-11: component rendering tests are
// deferred; these helpers are pure, no DOM, no router).
//
// Covers: parseTypeParam (AC3/AC4 type URL param — invalid→all,
// case-insensitive), parsePageParam (AC2 page URL param — defensive ints),
// totalPages + paginatePosts (AC1/AC2/AC5 filter→slice, beyond-end = []),
// buildPageWindow (AC2 windowed page numbers + ellipsis), typeParamValue /
// pageParamValue (AC2/AC4 URL normalisation — all/page-1 → null = omit).

import { describe, expect, it } from 'vitest';
import type { Post } from '../content';
import {
  parseTypeParam,
  parsePageParam,
  totalPages,
  paginatePosts,
  buildPageWindow,
  typeParamValue,
  pageParamValue,
} from './feed-utils';

/** Build a minimal published Post of the given type (Feed helpers trust the
 *  index is already sorted + draft-excluded — they only filter by type). */
function post(slug: string, type: 'essay' | 'comic', date: string): Post {
  const base = {
    slug,
    title: 'T',
    date,
    status: 'published' as const,
    access: 'free' as const,
  };
  if (type === 'essay') {
    return { ...base, type: 'essay', body: () => Promise.resolve({ default: () => null }) };
  }
  return { ...base, type: 'comic', strip: { image: `/c/${slug}.png`, alt: 'alt' } };
}

/** A small reverse-chron sample: 2 essays + 1 comic, dates descending. */
function samplePosts(): Post[] {
  return [
    post('e2', 'essay', '2026-08-10'),
    post('c1', 'comic', '2026-08-06'),
    post('e1', 'essay', '2026-07-01'),
  ];
}

describe('parseTypeParam', () => {
  it('defaults to "all" when the param is missing (AC3/AC4 default)', () => {
    expect(parseTypeParam(undefined)).toBe('all');
    expect(parseTypeParam(null)).toBe('all');
  });

  it('accepts the three valid values (AC3/AC4)', () => {
    expect(parseTypeParam('all')).toBe('all');
    expect(parseTypeParam('essay')).toBe('essay');
    expect(parseTypeParam('comic')).toBe('comic');
  });

  it('normalises case and trims whitespace (URLs are forgiving)', () => {
    expect(parseTypeParam('COMIC')).toBe('comic');
    expect(parseTypeParam(' Essay ')).toBe('essay');
  });

  it('falls back to "all" for an unknown value (never throws)', () => {
    expect(parseTypeParam('bogus')).toBe('all');
    expect(parseTypeParam('')).toBe('all');
  });
});

describe('parsePageParam', () => {
  it('defaults to 1 when the param is missing (AC2 first page)', () => {
    expect(parsePageParam(undefined)).toBe(1);
    expect(parsePageParam(null)).toBe(1);
  });

  it('parses a positive integer page (AC2)', () => {
    expect(parsePageParam('2')).toBe(2);
    expect(parsePageParam('10')).toBe(10);
  });

  it('clamps non-positive / non-integer / junk to 1 (defensive)', () => {
    expect(parsePageParam('0')).toBe(1);
    expect(parsePageParam('-3')).toBe(1);
    expect(parsePageParam('abc')).toBe(1);
    expect(parsePageParam('2.9')).toBe(1);
  });

  it('returns out-of-range pages AS-IS — beyond-end is handled by the slice (AC5 never errors)', () => {
    // parsePageParam does NOT clamp the upper bound; paginatePosts yields [].
    expect(parsePageParam('99')).toBe(99);
  });
});

describe('totalPages', () => {
  it('is 0 for an empty collection', () => {
    expect(totalPages(0, 10)).toBe(0);
  });

  it('is 1 for 1..pageSize posts', () => {
    expect(totalPages(1, 10)).toBe(1);
    expect(totalPages(10, 10)).toBe(1);
  });

  it('steps up by pageSize (AC2 10/page)', () => {
    expect(totalPages(11, 10)).toBe(2);
    expect(totalPages(23, 10)).toBe(3);
  });
});

describe('paginatePosts', () => {
  it('returns page 1 of all posts in order for the all filter (AC1)', () => {
    const list = samplePosts();
    const { items, totalPages: tp } = paginatePosts(list, 'all', 1, 10);
    expect(items.map((p) => p.slug)).toEqual(['e2', 'c1', 'e1']);
    expect(tp).toBe(1);
  });

  it('filters to essays only (AC3 essay filter)', () => {
    const { items } = paginatePosts(samplePosts(), 'essay', 1, 10);
    expect(items.map((p) => p.slug)).toEqual(['e2', 'e1']);
  });

  it('filters to comics only (AC3/AC4 comic filter)', () => {
    const { items } = paginatePosts(samplePosts(), 'comic', 1, 10);
    expect(items.map((p) => p.slug)).toEqual(['c1']);
  });

  it('computes totalPages from the FILTERED count, not the whole list', () => {
    // 11 essays + 0 comics: comic view → 0 pages even though list is long.
    const big: Post[] = Array.from({ length: 11 }, (_, i) =>
      post(`e${i + 1}`, 'essay', '2026-08-01'),
    );
    const { totalPages: essayTp } = paginatePosts(big, 'essay', 1, 10);
    const { totalPages: comicTp, items } = paginatePosts(big, 'comic', 1, 10);
    expect(essayTp).toBe(2);
    expect(comicTp).toBe(0);
    expect(items).toEqual([]);
  });

  it('slices the second page correctly (AC2 10/page)', () => {
    const big: Post[] = Array.from({ length: 11 }, (_, i) =>
      post(`e${i + 1}`, 'essay', '2026-08-01'),
    );
    const page1 = paginatePosts(big, 'all', 1, 10);
    const page2 = paginatePosts(big, 'all', 2, 10);
    expect(page1.items).toHaveLength(10);
    expect(page2.items).toHaveLength(1);
    expect(page2.items[0].slug).toBe('e11');
  });

  it('returns [] for a page beyond the last populated one — never throws (AC5)', () => {
    const { items } = paginatePosts(samplePosts(), 'all', 99, 10);
    expect(items).toEqual([]);
  });

  it('does not re-filter by status — trusts the index (AC7 satisfied upstream)', () => {
    // Feed helpers take the index as published-only; status is not consulted.
    // (This is a guard comment, not a behavior we test for filtering; still,
    //  a draft slipped into the input would NOT be removed here.)
    const list = samplePosts();
    expect(paginatePosts(list, 'all', 1, 10).items).toHaveLength(3);
  });
});

describe('buildPageWindow', () => {
  it('returns a single page when there is only one', () => {
    expect(buildPageWindow(1, 1)).toEqual([1]);
  });

  it('renders all numbers when the total is small (no ellipsis)', () => {
    expect(buildPageWindow(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('windows the middle with ellipsis on both sides (AC2)', () => {
    expect(buildPageWindow(5, 10)).toEqual([1, '…', 4, 5, 6, '…', 10]);
  });

  it('elides only the right gap near the start', () => {
    expect(buildPageWindow(1, 10)).toEqual([1, 2, '…', 10]);
    expect(buildPageWindow(2, 10)).toEqual([1, 2, 3, '…', 10]);
  });

  it('elides only the left gap near the end', () => {
    expect(buildPageWindow(10, 10)).toEqual([1, '…', 9, 10]);
    expect(buildPageWindow(9, 10)).toEqual([1, '…', 8, 9, 10]);
  });
});

describe('typeParamValue', () => {
  it('normalises "all" to null = omit ?type= (clean URL)', () => {
    expect(typeParamValue('all')).toBeNull();
  });

  it('passes essay/comic through for ?type=', () => {
    expect(typeParamValue('essay')).toBe('essay');
    expect(typeParamValue('comic')).toBe('comic');
  });
});

describe('pageParamValue', () => {
  it('normalises page 1 to null = omit ?page= (clean URL)', () => {
    expect(pageParamValue(1)).toBeNull();
  });

  it('passes page > 1 through as a string', () => {
    expect(pageParamValue(2)).toBe('2');
    expect(pageParamValue(12)).toBe('12');
  });
});