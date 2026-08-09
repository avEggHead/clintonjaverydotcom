// Landing (`/`) — the site front door (Epic 3, Story 3.1 + 3.2).
//
// Story 3.1 — full-bleed dark `ink-surface` hero (≥92vh): eyebrow + one-line
// Fraunces identity + lede + ONE primary CTA (→ Feed) + a secondary ghost
// (→ Projects). Identity-first About-in-the-hero (UX-DR-3 / FR-1). The
// "action photograph" layer is sourced via HERO_PHOTO (identity.ts); until
// sourced, an ambient gradient holds the space. Mint reserved for dark-panel
// energy (eyebrow + "build things").
//
// Story 3.2 — scroll narrative below the hero (PRD addendum §D / UX-DR-4):
//   "What's new" (Latest slot — Story 3.3 fills the 3 newest cards here),
//   "The work" (Feed teaser → /p + type-filter shortcuts /p?type=essay|comic),
//   "What I build" (Projects teaser → /projects).
// Each scrolls into view via Reveal (IntersectionObserver, Landing-only, AC3);
// a focus-revealed skip-to-section control (first in tab order on `/`) lets
// keyboard/AT users reach each section without scrolling (AC4). The Landing
// footer is the global SiteFooter (Story 3.2 AC5 re-enables the support-pill
// on `/`), carrying identity + copyright + the pill.
import { Link } from 'react-router-dom';
import { buildHeadMeta } from '../site/head-meta';
import { useHead } from '../head/useHead';
import { HERO_PHOTO } from '../site/identity';
import { posts } from '../content';
import Reveal from '../components/Reveal';
import { PostCard } from '../components/PostCard';

export default function Landing() {
  useHead(buildHeadMeta({ kind: 'home' }));

  return (
    <>
      {/* Skip-to-section control (AC4) — visually hidden until focused, mirrors
       * the global SkipLink pattern so it costs nothing above the fold and is
       * the first focusable thing a keyboard/AT user reaches on `/`. */}
      <nav
        aria-label="Jump to section"
        className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-16 focus-within:left-3 focus-within:z-[100] focus-within:flex focus-within:items-center focus-within:gap-3 focus-within:rounded-md focus-within:bg-ink focus-within:px-4 focus-within:py-2 focus-within:font-mono focus-within:text-sm focus-within:text-on-ink focus-within:shadow-lg focus-within:outline-none"
      >
        <span className="uppercase tracking-[0.14em] text-ink-variant">Jump to</span>
        <a href="#whats-new" className="rounded px-1 py-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-on-ink">Latest</a>
        <a href="#work" className="rounded px-1 py-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-on-ink">The work</a>
        <a href="#build" className="rounded px-1 py-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-on-ink">What I build</a>
        <a href="#site-footer" className="rounded px-1 py-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-on-ink">Footer</a>
      </nav>

      {/* ── Hero (Story 3.1) ─────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-ink-surface text-on-ink">
        <div aria-hidden className="absolute inset-0">
          {HERO_PHOTO ? (
            <img
              src={HERO_PHOTO}
              alt=""
              className="h-full w-full object-cover opacity-40"
              loading="eager"
              fetchPriority="high"
            />
          ) : (
            <div className="h-full w-full bg-linear-to-br from-primary/25 via-ink-surface to-ink-surface" />
          )}
        </div>
        <div className="relative mx-auto flex min-h-[92vh] max-w-feed-max flex-col justify-center gap-7 px-4 py-10 sm:gap-8 sm:px-6 sm:py-16">
          <span className="eyebrow text-eyebrow font-medium text-accent-mint">
            Writing · Comics · Projects
          </span>
          <h1 className="max-w-[18ch] font-display text-display-lg-mobile leading-display-mobile text-on-ink sm:text-display-lg sm:leading-display sm:tracking-display">
            I draw funny strips, write essays, and{' '}
            <em className="italic text-accent-mint">build things</em>.
          </h1>
          <p className="max-w-[52ch] font-body text-body-lg leading-prose text-ink-variant">
            A personal publishing studio for humorous comics and the occasional
            technical essay — plus the small tools I build along the way. New here
            every week.
          </p>
          <div className="flex flex-wrap items-center gap-3.5">
            <Link
              to="/p"
              className="inline-flex min-h-[44px] items-center rounded-md bg-primary-strong px-5 font-body text-sm font-semibold text-on-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-on-ink focus-visible:outline-offset-2"
            >
              Read the latest →
            </Link>
            <Link
              to="/projects"
              className="inline-flex min-h-[44px] items-center rounded-md border border-ink-variant px-5 font-body text-sm font-semibold text-on-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-on-ink focus-visible:outline-offset-2"
            >
              Explore Projects
            </Link>
          </div>
        </div>
      </section>

      {/* ── "What's new" (Latest) — Story 3.3 fills the 3 newest posts here ─ */}
      <Reveal id="whats-new" className="bg-surface">
        <div className="mx-auto w-full max-w-feed-max px-4 py-16 sm:px-6 sm:py-24">
          <span className="eyebrow text-eyebrow text-on-surface-variant">Latest</span>
          <h2 className="mt-2 font-display text-headline-sm text-ink sm:text-headline-lg">
            What&apos;s new
          </h2>
          <p className="mt-4 max-w-prose-max font-body text-body-lg leading-prose text-on-surface-variant">
            Freshest essays and comics, straight from the feed — the three newest
            posts appear here, newest first.
          </p>
          {/* Latest-3 strip (FR-3 / Story 3.3): the 3 newest published posts,
           * reverse-chrono, mixing essay + comic cards per type. `posts` is
           * already reverse-chrono + draft-excluded by the content-index build
           * gate (AD-1) — the same contract the Feed trusts. Newest card takes
           * the wider column (key-landing-hero mock, 1.4fr 1fr 1fr). */}
          <ul className="mt-8 grid gap-5 sm:grid-cols-[1.4fr_1fr_1fr]">
            {posts.slice(0, 3).map((post) => (
              <li key={post.slug}>
                <PostCard post={post} headingLevel={3} />
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link
              to="/p"
              className="font-body text-body-md text-link underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              See all in the Feed →
            </Link>
          </div>
        </div>
      </Reveal>

      {/* ── "The work" — Feed teaser (FR-2) ───────────────────────────── */}
      <Reveal id="work" className="bg-surface">
        <div className="mx-auto w-full max-w-feed-max px-4 py-16 sm:px-6 sm:py-24">
          <span className="eyebrow text-eyebrow text-on-surface-variant">The work</span>
          <h2 className="mt-2 font-display text-headline-sm text-ink sm:text-headline-lg">
            Writing &amp; comics, one at a time.
          </h2>
          <p className="mt-4 max-w-prose-max font-body text-body-lg leading-prose text-on-surface-variant">
            Essays on engineering, craft, and the occasional stubborn problem;
            humorous comics drawn in Krita. New here every week.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              to="/p"
              className="inline-flex min-h-[44px] items-center rounded-md bg-primary-strong px-5 font-body text-sm font-semibold text-on-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              Open the Feed →
            </Link>
            <Link
              to="/p?type=essay"
              className="font-body text-body-md text-link underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Browse essays
            </Link>
            <Link
              to="/p?type=comic"
              className="font-body text-body-md text-link underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Browse comics
            </Link>
          </div>
        </div>
      </Reveal>

      {/* ── "What I build" — Projects teaser (FR-2); tiles arrive in Epic 4 ─ */}
      <Reveal id="build" className="bg-surface">
        <div className="mx-auto w-full max-w-feed-max px-4 py-16 sm:px-6 sm:py-24">
          <span className="eyebrow text-eyebrow text-on-surface-variant">What I build</span>
          <h2 className="mt-2 font-display text-headline-sm text-ink sm:text-headline-lg">
            Small tools, made in the open.
          </h2>
          <p className="mt-4 max-w-prose-max font-body text-body-lg leading-prose text-on-surface-variant">
            Side projects and little experiments — built and shipped here, not
            just demoed. The portfolio grows as the tools do.
          </p>
          <div className="mt-8">
            <Link
              to="/projects"
              className="inline-flex min-h-[44px] items-center rounded-md bg-primary-strong px-5 font-body text-sm font-semibold text-on-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              Explore Projects →
            </Link>
          </div>
        </div>
      </Reveal>
    </>
  );
}