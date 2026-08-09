import { Suspense, lazy, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { posts } from '../content';
import { findPost, formatPostDate } from './postPage-utils';
import { buildHeadMeta } from '../site/head-meta';
import { useHead } from '../head/useHead';
import NotFound from './NotFound';
import ComicViewer from '../components/ComicViewer';

// Story 1.4 — the real per-type Post page at /p/:slug (replaces 1.3's
// PostPlaceholder). Essay → compiled MDX body in the prose-max reading column;
// Comic → single Strip <img alt> in the dark ink-surface stage at fit (zoom/pan
// is Epic 5), with title/date/caption/afterword on the paper surface below.
// AD-1: consumes only the emitted content-index (`../content`); never globs
// `content/` directly. Tailwind v4 + @theme tokens only — no CSS Modules, no
// inline hex (AD-6).
//
// Story 1.6 — per-Post document <head> (AC1/AC2/AC3): useHead applies a
// buildHeadMeta({kind:'post', post}) so <title>/og:*/twitter:*/canonical
// reflect THIS post, updated on client-side route change. The not-found path
// emits {kind:'not-found'} (noindex) so missing slugs stay out of the index.

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

/** Comic Post render (AC2/AC3): dark stage Strip + title/date/caption/afterword.
 *  Epic 5 / 5.1 — the stage is the ComicViewer: fit + full zoom/pan (FR-16). */
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
      {/* dark ink-surface stage — full fit + zoom/pan (Epic 5 / FR-16) */}
      <ComicViewer image={strip.image} alt={strip.alt} />
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

  // Story 1.6 — per-route <head>. Unconditional (hooks rule): a missing post
  // emits the not-found head (noindex); a found post emits its own metadata.
  useHead(
    post
      ? buildHeadMeta({ kind: 'post', post })
      : buildHeadMeta({ kind: 'not-found' }),
  );

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