// Ink & Garden — on-brand not-found (Story 2.3, extracted from PostPage AC5).
// "This one's not here." + links to Feed + Projects. Presentational only —
// the owning route sets the not-found <head>: PostPage emits
// buildHeadMeta({ kind: 'not-found' }) for a missing slug; the catch-all route
// uses NotFoundPage (same head). Single render source so both code paths match.
import { Link } from 'react-router-dom';

export default function NotFound() {
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