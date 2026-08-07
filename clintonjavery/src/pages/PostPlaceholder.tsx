import { useParams } from 'react-router-dom';
import { posts } from '../content';

// `/p/:slug` — content-derived (AD-5 / AC1). The component reads the slug param
// and looks the post up in the emitted content-index (no hand-registered route).
// The real per-type Post page (MDX essay body / comic Strip + viewer) is 1.4.
export default function PostPlaceholder() {
  const { slug } = useParams();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="mx-auto w-full max-w-[1100px] px-4 py-16">
        <h1 className="font-display text-2xl text-ink sm:text-3xl">
          Not here yet.
        </h1>
        <p className="mt-4 font-body text-base text-on-surface-variant">
          No post matches <span className="font-mono">{slug}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-on-surface-variant eyebrow">
        {post.type === 'comic' ? 'Comic' : 'Essay'}
      </p>
      <h1 className="mt-2 font-display text-2xl text-ink sm:text-3xl">
        {post.title}
      </h1>
      <p className="mt-2 font-body text-sm text-on-surface-variant">{post.date}</p>
      <p className="mt-6 font-body text-base text-on-surface-variant">
        The full per-type post page arrives in Story 1.4.
      </p>
    </div>
  );
}