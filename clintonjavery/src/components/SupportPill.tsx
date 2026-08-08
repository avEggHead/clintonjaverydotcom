// Support call-to-action pill (Story 1.8 / FR-12 / UX-DR-15). Lives in the
// footer landmark of content pages (Post pages + Feed) — rendered there by
// `SiteFooter`; NEVER a top-level nav item. Links the Venmo destination
// directly (`SUPPORT_URL` from identity.ts) so the Contribute page being
// dropped from navigation never breaks the Support link target.
//
// Styling is UX-DR-15: `secondary-container` background + `on-secondary-container`
// text + `full` radius. Tailwind v4 + @theme tokens only — no CSS Modules, no
// inline hex (AD-6). Min 44px touch target; meaning carried by the text label,
// not color (NFR-1). External link → `target=_blank` + `rel=noopener noreferrer`,
// with a visually-hidden "(opens in a new tab)" cue for AT users.

import { SUPPORT_URL } from '../site/identity';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

export default function SupportPill() {
  return (
    <a
      href={SUPPORT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-[44px] items-center rounded-full bg-secondary-container px-5 py-2 font-body text-sm font-semibold text-on-secondary-container motion-safe:transition-colors hover:brightness-95 ${focusRing}`}
    >
      Support the site
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}