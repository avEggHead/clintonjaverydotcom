// Pure helpers for the unified Feed (Story 1.5 / AC1, AC2, AC3, AC4, AC5, AC7).
// Vitest node env — no React, no DOM, no router (AR-11: render layer is
// verified by the manual visual smoke, not component tests).
//
// Content-index contract (do NOT re-sort / do NOT re-filter drafts): `posts`
// from `../content` is already sorted (date DESC, slug ASC) and draft-excluded
// by the 1.2 build gate. `paginatePosts` only filters by `type` then slices by
// page — it trusts its input is published-only in order (AC7 is satisfied
// upstream at the index layer, not here).

import type { Post } from '../content';

export type FeedFilter = 'all' | 'essay' | 'comic';

/** The Feed type filter result: `'all' | 'essay' | 'comic'`. */
export type TypeFilter = 'all' | 'essay' | 'comic';

/** Parse the `?type=` URL param. Missing/invalid/`'all'` → `'all'`.
 *  Case-insensitive, trims whitespace, never throws. (AC3/AC4) */
export function parseTypeParam(raw: string | null | undefined): TypeFilter {
  if (raw == null) return 'all';
  const v = raw.trim().toLowerCase();
  if (v === 'essay' || v === 'comic') return v;
  return 'all';
}

/** Parse the `?page=` URL param. Missing/invalid/`<1`/non-integer → `1`.
 *  Returns out-of-range pages AS-IS — `paginatePosts` yields `[]` beyond the
 *  last populated page (AC5 returns no items, never an error). */
export function parsePageParam(raw: string | null | undefined): number {
  if (raw == null) return 1;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) return 1;
  return n;
}

/** Total pages for `count` items at `pageSize` (AC2, 10/page). 0 for empty. */
export function totalPages(count: number, pageSize: number): number {
  if (count <= 0) return 0;
  return Math.ceil(count / pageSize);
}

/** Filter `posts` by `type` (or all), then slice page `page` at `pageSize`.
 *  `totalPages` is computed from the FILTERED count (so a type with 0 posts
 *  → 0 pages, never carries the whole-list page count). Returns `{ items,
 *  totalPages }`. A page beyond the last populated one returns `[]` (AC5). */
export function paginatePosts(
  posts: Post[],
  type: TypeFilter,
  page: number,
  pageSize: number,
): { items: Post[]; totalPages: number } {
  const filtered = type === 'all' ? posts : posts.filter((p) => p.type === type);
  const tp = totalPages(filtered.length, pageSize);
  const start = (page - 1) * pageSize;
  const items = start < 0 || start >= filtered.length ? [] : filtered.slice(start, start + pageSize);
  return { items, totalPages: tp };
}

/** Build a windowed page-number list: always show 1 and `last`, a radius-1
 *  window around `current`, and `'…'` where a gap of ≥3 pages is elided.
 *  Returns `(number | 'ellipsis')[]`. (AC2 prev/next + numbers.) */
export function buildPageWindow(
  current: number,
  last: number,
): (number | '…')[] {
  if (last <= 1) return last === 1 ? [1] : [];
  const pages = new Set<number>([1, last]);
  for (let p = current - 1; p <= current + 1; p++) {
    if (p >= 1 && p <= last) pages.add(p);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev !== 0 && p - prev >= 3) out.push('…');
    out.push(p);
    prev = p;
  }
  return out;
}

/** The `?type=` value to write for a `TypeFilter`. `'all'` → `null` = omit
 *  the param (clean `/p` URL). (AC2/AC4 URL normalisation.) */
export function typeParamValue(type: TypeFilter): string | null {
  return type === 'all' ? null : type;
}

/** The `?page=` value to write for a page. Page 1 → `null` = omit (clean
 *  `/p` URL). Page >1 → its string. (AC2/AC4 URL normalisation.) */
export function pageParamValue(page: number): string | null {
  return page === 1 ? null : String(page);
}