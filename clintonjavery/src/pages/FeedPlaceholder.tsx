// `/p` — placeholder for the unified Feed (Story 1.5: list + type filter + pagination).
export default function FeedPlaceholder() {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-16">
      <h1 className="font-display text-2xl text-ink sm:text-3xl">Feed</h1>
      <p className="mt-4 max-w-prose font-body text-base leading-relaxed text-on-surface-variant">
        The unified feed &mdash; all published posts in reverse-chronological
        order with an All / Essays / Comics type filter and pagination &mdash;
        arrives in Story 1.5.
      </p>
    </div>
  );
}