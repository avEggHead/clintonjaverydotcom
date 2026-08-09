// Ink & Garden — Post cards, shared by the Feed (`/p`, Story 1.5) and the
// Landing Latest strip (`/`, Story 3.3). Extracted from Feed.tsx so the
// Landing reuses the EXACT card shape — no card duplication (AD-1 spirit).
//
// One card per type: essay = title + date + excerpt (line-clamp-2); comic =
// strip image-forward + date + optional caption chip. Both are RR `<Link>` to
// `/p/<slug>` (client-side nav, FR-2). The essay card title is a heading; its
// rank is caller-controlled via `headingLevel` — `h2` on the Feed (page h1 is
// "Feed", one h1/page, NFR-1), `h3` on the Landing (nests under the section
// h2 "What's new"). Comic cards carry no visible title heading (image-forward
// design) — preserved from the Feed. Comic image keeps the 1.4-style
// load-failure retry. Tailwind v4 + @theme tokens only (AD-6).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ComicPost, Post } from '../content';
import { formatPostDate, stripRetrySrc } from '../pages/postPage-utils';

type HeadingLevel = 2 | 3;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

const cardBase = `block rounded-lg border border-outline-variant bg-surface transition-colors hover:border-outline ${focusRing}`;

export function PostCard({
  post,
  headingLevel = 2,
}: {
  post: Post;
  headingLevel?: HeadingLevel;
}) {
  return post.type === 'essay' ? (
    <EssayCard post={post} headingLevel={headingLevel} />
  ) : (
    <ComicCard post={post} />
  );
}

export function EssayCard({
  post,
  headingLevel = 2,
}: {
  post: Post;
  headingLevel?: HeadingLevel;
}) {
  const Tag = (`h${headingLevel}` as 'h2' | 'h3');
  return (
    <Link to={`/p/${post.slug}`} className={`${cardBase} p-5`}>
      <Tag className="font-display text-headline-sm text-ink">{post.title}</Tag>
      <p className="mt-1 text-sm text-on-surface-variant">
        {formatPostDate(post.date)}
      </p>
      {post.excerpt ? (
        <p className="mt-3 line-clamp-2 text-sm text-on-surface-variant">
          {post.excerpt}
        </p>
      ) : null}
    </Link>
  );
}

export function ComicCard({ post }: { post: ComicPost }) {
  return (
    <Link to={`/p/${post.slug}`} className={`${cardBase} overflow-hidden`}>
      <ComicCardImage post={post} />
      <div className="flex flex-wrap items-center gap-3 p-4">
        <time dateTime={post.date} className="text-sm text-on-surface-variant">
          {formatPostDate(post.date)}
        </time>
        {post.caption ? (
          <span className="rounded-full bg-secondary-container px-3 py-1 text-sm text-on-secondary-container">
            {post.caption}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

/** Comic card image — a fixed-height TOP SLICE preview of the strip (the card
 *  is a `<Link>` to `/p/<slug>`, so a click goes to the full zoom/pan
 *  ComicViewer). The `<img>` keeps full width (`w-full h-auto`); a
 *  `overflow-hidden` fixed-height viewport clips everything past the slice,
 *  so a tall strip shows its first panel/beginning with no width crop. A subtle
 *  bottom fade signals "more below — click in". The 1.4-style load-failure
 *  retry is preserved; on error the `<img>` stays `sr-only` so its `alt` stays
 *  in the a11y tree. */
function ComicCardImage({ post }: { post: ComicPost }) {
  const [failed, setFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  return (
    <div className="relative h-48 overflow-hidden sm:h-56">
      <img
        src={stripRetrySrc(post.strip.image, retryKey)}
        alt={post.strip.alt}
        onError={() => setFailed(true)}
        loading="lazy"
        className={failed ? 'sr-only' : 'block h-auto w-full'}
      />
      {/* bottom fade — "more below, click in" (decorative, not in a11y tree) */}
      {!failed ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-surface to-transparent"
        />
      ) : null}
      {failed ? (
        <div className="flex h-full w-full items-center justify-center bg-surface-container text-center">
          <div>
            <p className="text-sm text-on-surface-variant">
              Couldn&rsquo;t load the strip. Refresh?
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault(); // don't trigger the surrounding <Link>
                setFailed(false);
                setRetryKey((k) => k + 1);
              }}
              className={`mt-3 rounded-md border border-outline px-3 py-1.5 text-sm text-link ${focusRing}`}
            >
              Retry
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}