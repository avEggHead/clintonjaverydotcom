// Ink & Garden — shared button class strings (Epic 4 / Story 4.2, Tailwind v4 +
// @theme tokens, AD-6). Used by the re-skinned in-app tools + the Project show
// page — all light-surface, so the focus ring is `outline-primary`. The dark
// Landing hero CTAs keep their own inline `outline-on-ink` variant (see
// Landing.tsx); these strings are for light surfaces only.
//
// Tailwind v4 scans .ts files for class candidates, so the utilities below are
// detected (same mechanism Feed's `cardBase`/`focusRing` rely on).

export const buttonPrimary =
  'inline-flex min-h-[44px] items-center justify-center rounded-md bg-primary-strong px-5 font-body text-sm font-semibold text-on-primary transition-[filter] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

export const buttonGhost =
  'inline-flex min-h-[44px] items-center justify-center rounded-md border border-outline-variant bg-surface px-5 font-body text-sm font-semibold text-ink transition-colors hover:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

/** Shared form-field styling for the re-skinned tools (input/select/textarea). */
export const field =
  'min-h-[44px] w-full rounded-md border border-outline-variant bg-surface px-3 py-2 font-body text-body-md text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';