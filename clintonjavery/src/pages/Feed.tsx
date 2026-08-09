// `/p` — the unified Feed (Story 1.5): all published Posts reverse-chron as
// per-type cards (essay: title + date + excerpt; comic: strip image-forward +
// date + optional caption chip), an All / Essays / Comics Type Filter
// (URL-driven `?type=`), 10-per-page pagination (URL-driven `?page=`,
// shareable), the on-brand empty/beyond-end states, and a calm cold-load
// skeleton. Zoom/pan is Epic 5; SEO is 1.6; support-pill is 1.8.
//
// Content-index contract (AD-1): imports `posts` ONLY from `../content`
// (the `virtual:content-index` re-export) — never `import.meta.glob('/content/...')`
// directly. `posts` is already reverse-chron (date DESC, slug ASC) and
// draft-excluded by the 1.2 build gate; the Feed trusts it and only filters
// by `type` + slices by page (AC7 is satisfied upstream — no status refilter).

import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { posts } from '../content';
import { PostCard } from '../components/PostCard';
import {
  buildPageWindow,
  paginatePosts,
  pageParamValue,
  parsePageParam,
  parseTypeParam,
  type TypeFilter,
  typeParamValue,
} from './feed-utils';
import { buildHeadMeta } from '../site/head-meta';
import { toAbsoluteUrl } from '../site/site-utils';
import { SITE_URL } from '../site/identity';
import { useHead } from '../head/useHead';

const PAGE_SIZE = 10;
const SKELETON_DELAY_MS = 150; // cold-load only — calm, no spinner churn (AC6)

const FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'essay', label: 'Essays' },
  { value: 'comic', label: 'Comics' },
];

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

/** Compose the shareable `/p…` search string for a (type, page) pair.
 *  `all` / page 1 are omitted (clean URL). Pure convenience over the
 *  `*ParamValue` normalisers — keeps one source of truth. */
function pageHref(type: TypeFilter, page: number): string {
  const params = new URLSearchParams();
  const t = typeParamValue(type);
  if (t) params.set('type', t);
  const pg = pageParamValue(page);
  if (pg) params.set('page', pg);
  const qs = params.toString();
  return qs ? `/p?${qs}` : '/p';
}

export default function Feed() {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = parseTypeParam(searchParams.get('type'));
  const page = parsePageParam(searchParams.get('page'));
  // Story 1.6 — per-route <head>: the Feed reflects the current filter/page in
  // og:url + canonical, mirroring the shareable pageHref URL (absolutized).
  useHead(buildHeadMeta({ kind: 'feed', canonical: toAbsoluteUrl(pageHref(type, page), SITE_URL) }));

  // Filter-then-slice. totalPages is from the FILTERED count (so a type with
  // 0 posts → 0 pages, never the whole-list count). (AC1/AC2/AC5)
  const { items, totalPages } = useMemo(
    () => paginatePosts(posts, type, page, PAGE_SIZE),
    [type, page],
  );
  const window = useMemo(
    () => buildPageWindow(page, totalPages),
    [page, totalPages],
  );

  // AC6 — cold-load skeleton only. Mount-once (empty deps) so filter/page
  // changes re-render instantly with NO skeleton re-flash ("without churn").
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setHydrated(true), SKELETON_DELAY_MS);
    return () => clearTimeout(id);
  }, []);

  // AC7 note: drafts are excluded by the content-index build gate; the Feed
  // does NOT re-filter by status — it trusts `posts` is published-only.

  const beyondEnd = totalPages >= 1 && page > totalPages;

  function selectFilter(next: TypeFilter) {
    // A filter change re-paginates from page 1 — never strand the user on a
    // now-empty page N. `all` + page 1 normalise to a clean `/p` URL.
    setSearchParams(pageHref(next, 1).slice(2)); // "/p?…" → "?…" for setSearchParams path
  }

  return (
    <div className="mx-auto w-full max-w-feed-max px-4 py-12 sm:py-16">
      <h1 className="font-display text-headline-md text-ink">Feed</h1>

      {/* Type filter — segmented control (radiogroup); URL-driven ?type=.
          Meaning is conveyed by text labels + aria-checked, not color (NFR-1). */}
      <div
        role="radiogroup"
        aria-label="Filter posts by type"
        className="mt-6 flex w-fit gap-1 rounded-full bg-surface-container p-1"
      >
        {FILTERS.map((f) => {
          const active = f.value === type;
          return (
            <button
              key={f.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => selectFilter(f.value)}
              className={`min-h-[44px] rounded-full px-4 py-2 text-sm font-semibold transition-colors ${focusRing} ${
                active
                  ? 'bg-ink-surface text-on-ink'
                  : 'text-on-surface-variant hover:text-ink'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* List area */}
      <div className="mt-8">
        {!hydrated ? (
          <Skeleton />
        ) : items.length === 0 ? (
          <EmptyState type={type} beyondEnd={beyondEnd} />
        ) : (
          <ul className="flex flex-col gap-5">
            {items.map((post) => (
              <li key={post.slug}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination — only when it paginates (totalPages > 1). Shareable URLs. */}
      {totalPages > 1 && (
        <Pagination type={type} page={page} totalPages={totalPages} window={window} />
      )}
    </div>
  );
}

/* ── States ── */

function EmptyState({ type, beyondEnd }: { type: TypeFilter; beyondEnd: boolean }) {
  if (beyondEnd) {
    // AC5 — pagination beyond the last populated page returns no items, never
    // an error. Offer a way back to the first populated page of this filter.
    return (
      <p className="py-16 text-center text-on-surface-variant">
        No posts on this page. <Link to={pageHref(type, 1)} className={`text-link underline ${focusRing}`}>Back to page 1</Link>
      </p>
    );
  }
  // AC5 — a filter with zero matches → on-brand copy. Filter stays usable.
  return (
    <p className="py-16 text-center text-on-surface-variant">
      No posts match that filter yet.
    </p>
  );
}

function Skeleton() {
  // AC6 — calm, STATIC skeleton (no shimmer animation → reduced-motion-safe by
  // default, UX-DR-18). One cold-load window, then the real cards populate.
  return (
    <ul aria-hidden="true" className="flex flex-col gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={i}
          className="rounded-lg border border-outline-variant bg-surface p-5"
        >
          <div className="h-5 w-2/3 rounded-md bg-surface-container" />
          <div className="mt-3 h-3 w-1/4 rounded-md bg-surface-container" />
          <div className="mt-4 h-3 w-full rounded-md bg-surface-container" />
          <div className="mt-2 h-3 w-5/6 rounded-md bg-surface-container" />
        </li>
      ))}
    </ul>
  );
}

/* ── Pagination ── */

function Pagination({
  type,
  page,
  totalPages,
  window,
}: {
  type: TypeFilter;
  page: number;
  totalPages: number;
  window: (number | '…')[];
}) {
  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center gap-1">
      {/* Prev */}
      {page > 1 ? (
        <Link
          to={pageHref(type, page - 1)}
          aria-label="Previous page"
          className={`min-h-[44px] rounded-md px-3 py-2 text-sm text-on-surface-variant hover:text-ink ${focusRing}`}
        >
          Prev
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="min-h-[44px] rounded-md px-3 py-2 text-sm text-on-surface-variant/50"
        >
          Prev
        </span>
      )}

      {/* Page numbers / ellipsis */}
      {window.map((entry, i) =>
        entry === '…' ? (
          <span
            key={`e${i}`}
            aria-hidden="true"
            className="px-2 text-on-surface-variant"
          >
            …
          </span>
        ) : entry === page ? (
          <span
            key={entry}
            aria-current="page"
            className="min-h-[44px] min-w-[44px] rounded-md px-3 py-2 text-center text-sm font-semibold text-link"
          >
            {entry}
          </span>
        ) : (
          <Link
            key={entry}
            to={pageHref(type, entry)}
            aria-label={`Page ${entry}`}
            className={`min-h-[44px] min-w-[44px] rounded-md px-3 py-2 text-center text-sm text-on-surface-variant hover:text-ink ${focusRing}`}
          >
            {entry}
          </Link>
        ),
      )}

      {/* Next */}
      {page < totalPages ? (
        <Link
          to={pageHref(type, page + 1)}
          aria-label="Next page"
          className={`min-h-[44px] rounded-md px-3 py-2 text-sm text-on-surface-variant hover:text-ink ${focusRing}`}
        >
          Next
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="min-h-[44px] rounded-md px-3 py-2 text-sm text-on-surface-variant/50"
        >
          Next
        </span>
      )}
    </nav>
  );
}