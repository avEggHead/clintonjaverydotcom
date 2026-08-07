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

/** Twitter Card type (large image preview for strips/photos). */
export const TWITTER_CARD = 'summary_large_image';