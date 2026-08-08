// Ink & Garden — site identity (Story 1.6, FR-11).
// THE single source of truth for canonical site identity in shipped code.
// Isomorphic: no `document`, no `import.meta` — imported by BOTH the browser
// (head-meta.ts / useHead) AND the node-side Vite content plugin
// (plugin.ts → sitemap.xml / robots.txt). Do not duplicate these strings
// anywhere else in `src/` or `index.html` (the AC4 grep proof depends on it).
//
// Values confirmed by Clint on 2026-08-07. The Epic 1.6 AC text proposed
// `clintonjavery.com`; that is a FUTURE domain that will 301-redirect here.
// The PRD/addendum's `clintonavery.com` (no `www.`) and the live `index.html`'s
// stale `.dev` host are both wrong. These values win.

export const SITE_URL = 'https://www.clintonavery.com';

/** Author display name (the "J" is the FR-11 reconciliation — no bare "Clinton Avery"). */
export const AUTHOR = 'Clinton J Avery';

/** Site-wide <title> / og:title for the root + non-Post routes. */
export const SITE_TITLE = 'Clinton J Avery – Software Engineer & Creator';

/** Site-default meta description (~130 chars). Used as the og:description fallback. */
export const SITE_DESCRIPTION =
  'The personal website of Clinton J Avery — software engineer, creator, writer, and cartoonist. Essays, gag-a-day comics, and projects.';

/**
 * Site-default Open Graph image (slash-root; absolutized at render time).
 * `public/assets/bg-space.jpg` exists (220 KB). Clint will swap it later.
 */
export const DEFAULT_OG_IMAGE = '/assets/bg-space.jpg';

/**
 * Landing hero "action photograph" (Epic 3 / FR-1 / UX-DR-3). The brief calls
 * for action photography of Clint programming and talking to people — an asset
 * still to be sourced/commissioned. Until then, the hero renders an ambient
 * mint-tinted placeholder (the key-screen mock's treatment). Set this to a
 * slash-root path (e.g. '/images/clint-at-desk.jpg') to drop the real eager,
 * high-priority <img> in as the LCP element. Slash-root; served from public/.
 */
export const HERO_PHOTO: string | null = null;

/** Twitter Card type (large image preview for strips/photos). */
export const TWITTER_CARD = 'summary_large_image';

/**
 * Support destination (Story 1.8 / FR-12 / UX-DR-15). The `support-pill` CTA
 * links here directly — the same Venmo URL the (now de-routed) Contribute page
 * pointed at — so dropping the Contribute page from navigation can never break
 * the Support link target. External; opened in a new tab with `rel=noopener`.
 */
export const SUPPORT_URL = 'https://venmo.com/u/clintonjavery';