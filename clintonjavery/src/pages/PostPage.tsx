import { Suspense, lazy, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { posts } from '../content';
import { findPost, formatPostDate, stripRetrySrc } from './postPage-utils';

// Story 1.4 — the real per-type Post page at /p/:slug (replaces 1.3's
// PostPlaceholder). Essay → compiled MDX body in the prose-max reading column;
// Comic → single Strip <img alt> in the dark ink-surface stage at fit (zoom/pan
// is Epic 5), with title/date/caption/afterword on the paper surface below.
// AD-1: consumes only the emitted content-index (`../content`); never globs
// `content/` directly. Tailwind v4 + @theme tokens only — no CSS Modules, no
// inline hex (AD-6).

/** Essay skeleton — shown for the one microtask the eager body importer suspends. */
function EssaySkeleton() {
  return (
    <div aria-hidden="true" className="mt-8 space-y-3">
      <div className="h-4 w-3/4 rounded bg-surface-container" />
      <div className="h-4 w-full rounded bg-surface-container" />
      <div className="h-4 w-5/6 rounded bg-surface-container" />
    </div>
  );
}

/** On-brand not-found (AC5): "This one's not here." + links to Feed + Projects. */
function NotFound() {
  return (
    <div className="mx-auto w-full max-w-prose-max px-4 py-16">
      <h1 className="font-display text-3xl text-ink">This one's not here.</h1>
      <p className="mt-4 font-body text-base text-on-surface-variant">
        No post lives at this URL.
      </p>
      <p className="mt-8 font-body text-base text-on-surface-variant">
        Try the{' '}
        <Link
          to="/p"
          className="font-body text-link underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:transition-colors"
        >
          Feed
        </Link>{' '}
        or{' '}
        <Link
          to="/projects"
          className="font-body text-link underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:transition-colors"
        >
          Projects
        </Link>
        .
      </p>
    </div>
  );
}

/** Essay Post render (AC1): lazy MDX body in the prose-max reading column. */
function EssayPostView({
  title,
  date,
  body,
}: {
  title: string;
  date: string;
  body: () => Promise<{ default: React.ComponentType }>;
}) {
  // Stable across re-renders for the same post so React doesn't remount the body.
  const Body = useMemo(() => lazy(() => body()), [body]);
  return (
    <article className="mx-auto w-full max-w-prose-max px-4 py-12 sm:py-16">
      <h1 className="font-display text-3xl text-ink sm:text-4xl">{title}</h1>
      <p className="mt-2 font-body text-sm text-on-surface-variant">
        <time dateTime={date}>{formatPostDate(date)}</time>
      </p>
      <div className="prose mt-8">
        <Suspense fallback={<EssaySkeleton />}>
          <Body />
        </Suspense>
      </div>
    </article>
  );
}

/** Comic Strip image with the AC6 load-failure/retry state (alt stays in AT). */
function ComicStrip({
  image,
  alt,
}: {
  image: string;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const retry = () => {
    setFailed(false);
    setRetryKey((k) => k + 1);
  };

  return (
    <div className="bg-ink-surface">
      {/* The <img> stays mounted (with alt) even when failed so its alt text
       * remains available to AT; sr-only hides it from sighted users then. */}
      {/* zoom/pan = Epic 5 (Story 5.1); this story renders fit only */}
      <img
        src={stripRetrySrc(image, retryKey)}
        alt={alt}
        loading="eager"
        onError={() => setFailed(true)}
        className={
          failed
            ? 'sr-only'
            : 'block h-auto w-full' // edge-to-edge, no rounded mask on the artwork
        }
      />
      {failed && (
        <div
          role="alert"
          className="flex min-h-[40vh] flex-col items-center justify-center gap-5 px-6 py-16 text-center"
        >
          <p className="font-body text-lg text-on-ink">
            Couldn&apos;t load the strip. Refresh?
          </p>
          <button
            type="button"
            onClick={retry}
            className="inline-flex min-h-[44px] items-center rounded-md border border-on-ink/50 px-5 font-body text-base text-on-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

/** Comic Post render (AC2/AC3): dark stage Strip + title/date/caption/afterword. */
function ComicPostView({
  title,
  date,
  strip,
  caption,
  notes,
}: {
  title: string;
  date: string;
  strip: { image: string; alt: string };
  caption?: string;
  notes?: string;
}) {
  return (
    <article className="mx-auto w-full max-w-feed-max">
      {/* dark ink-surface stage — the Strip only, edge-to-edge (no rounded mask) */}
      <ComicStrip image={strip.image} alt={strip.alt} />
      {/* title / date / caption / afterword — paper surface below (AA-safe) */}
      <div className="px-4 py-8">
        <h1 className="font-display text-3xl text-ink sm:text-4xl">{title}</h1>
        <p className="mt-1 font-body text-sm text-on-surface-variant">
          <time dateTime={date}>{formatPostDate(date)}</time>
        </p>
        {caption && (
          <p className="mt-4 border-l-2 border-secondary pl-4 font-body text-base text-on-surface-variant">
            {caption}
          </p>
        )}
        {notes && (
          <p className="mt-4 font-body text-base text-on-surface-variant">
            {notes}
          </p>
        )}
      </div>
    </article>
  );
}

export default function PostPage() {
  const { slug } = useParams();
  const post = findPost(posts, slug);

  if (!post) return <NotFound />;

  if (post.type === 'essay') {
    return (
      <EssayPostView
        title={post.title}
        date={post.date}
        body={post.body}
      />
    );
  }

  return (
    <ComicPostView
      title={post.title}
      date={post.date}
      strip={post.strip}
      caption={post.caption}
      notes={post.notes}
    />
  );
}