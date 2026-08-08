// Landing (`/`) — the site front door (Epic 3, Story 3.1).
// Full-bleed dark `ink-surface` hero (≥92vh): eyebrow + one-line Fraunces
// identity + lede + ONE primary CTA (→ Feed) + a secondary ghost (→ Projects).
// Identity-first About-in-the-hero (UX-DR-3 / FR-1): no separate About page.
//
// The "action photograph" layer is a sourced asset (brief: action photography
// of Clint programming/talking to people). Until it's sourced, an ambient
// mint-tinted gradient (the key-screen mock's placeholder treatment) fills the
// layer; set HERO_PHOTO (identity.ts) to drop the real <img> in as the LCP
// element (eager, high-priority). No layout shift above the hero on initial
// render — the hero reserves ≥92vh, TopNav is sticky with a stable height.
// Mint is reserved for dark-panel energy (eyebrow + the "build things" em),
// never a large fill on the paper surface.
//
// Story 3.2 will append the scroll-narrative sections (Latest / Feed teaser /
// Projects teaser) below this hero; 3.3 fills the Latest strip. This file is the
// hero for now.
import { Link } from 'react-router-dom';
import { buildHeadMeta } from '../site/head-meta';
import { useHead } from '../head/useHead';
import { HERO_PHOTO } from '../site/identity';

export default function Landing() {
  useHead(buildHeadMeta({ kind: 'home' }));

  return (
    <section className="relative w-full overflow-hidden bg-ink-surface text-on-ink">
      {/* Action-photo layer (sourced asset): when HERO_PHOTO is set the eager
       * high-priority <img> is the LCP; until then an ambient gradient (the
       * key-screen mock's placeholder) holds the space. aria-hidden: decor. */}
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

      {/* ≥92vh stage; the identity block is centered so eyebrow + h1 + CTA
       * sit inside the first viewport at 320px (FR-1 / AC1). */}
      <div className="relative mx-auto flex min-h-[92vh] max-w-feed-max flex-col justify-center gap-7 px-4 py-10 sm:gap-8 sm:px-6 sm:py-16">
        <span className="eyebrow text-eyebrow font-medium text-accent-mint">
          Writing · Comics · Projects
        </span>

        <h1 className="max-w-[18ch] font-display text-display-lg-mobile leading-display-mobile text-on-ink sm:text-display-lg sm:leading-display sm:tracking-display">
          I draw funny strips, write essays, and{' '}
          <em className="italic text-accent-mint">build things</em>.
        </h1>

        <p className="max-w-[52ch] font-body text-body-lg leading-prose text-ink-variant">
          A personal publishing studio for gag-a-day comics and the occasional
          technical essay — plus the small tools I build along the way. New here
          every week.
        </p>

        <div className="flex flex-wrap items-center gap-3.5">
          {/* Exactly ONE button-primary above the fold (AC2) — routes to the Feed. */}
          <Link
            to="/p"
            className="inline-flex min-h-[44px] items-center rounded-md bg-primary-strong px-5 font-body text-sm font-semibold text-on-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-on-ink focus-visible:outline-offset-2"
          >
            Read the latest →
          </Link>
          {/* Secondary button-ghost → Projects (not a second primary; AC2). */}
          <Link
            to="/projects"
            className="inline-flex min-h-[44px] items-center rounded-md border border-ink-variant px-5 font-body text-sm font-semibold text-on-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-on-ink focus-visible:outline-offset-2"
          >
            Explore Projects
          </Link>
        </div>
      </div>
    </section>
  );
}