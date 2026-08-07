import { Link } from 'react-router-dom';

// `/` — minimal placeholder linking to `/p` (AC6). The full Landing is Epic 3.
export default function LandingPlaceholder() {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-on-surface-variant eyebrow">
        Ink &amp; Garden
      </p>
      <h1 className="mt-3 font-display text-3xl text-ink sm:text-4xl">
        Clinton J Avery
      </h1>
      <p className="mt-4 max-w-prose font-body text-base leading-relaxed text-on-surface-variant">
        The rebuild is underway. The landing page arrives in Epic 3; for now,
        head to the feed to read what&apos;s published.
      </p>
      <p className="mt-6">
        <Link
          to="/p"
          className="inline-flex min-h-[44px] items-center rounded-md bg-primary-strong px-5 font-body text-sm font-semibold text-on-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          Go to the feed
        </Link>
      </p>
    </div>
  );
}