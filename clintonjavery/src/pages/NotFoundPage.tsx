// Ink & Garden — catch-all page for unmatched paths (Story 2.3).
// RR7 has no built-in 404; without a <Route path="*"> an unknown path blank-
// pages — Cloudflare's SPA fallback only rewrites *edge* 404s to index.html,
// and React Router then renders nothing for an unknown client-side path. This
// route renders the shared on-brand NotFound and sets a noindex <head> so
// arbitrary junk URLs stay out of the index. PostPage reuses the same <NotFound>
// presentation for a valid `/p/:slug` that has no matching post.
import { useHead } from '../head/useHead';
import { buildHeadMeta } from '../site/head-meta';
import NotFound from './NotFound';

export default function NotFoundPage() {
  useHead(buildHeadMeta({ kind: 'not-found' }));
  return <NotFound />;
}