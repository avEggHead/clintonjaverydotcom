// Site footer landmark (AC5). Carries identity + copyright on every page, plus
// the `support-pill` (UX-DR-15) on the Landing (Story 3.2 AC5), the Feed, and
// Post pages — never on Projects. Never a top-level nav item (FR-12). One pill,
// one place; never competes with the primary nav (no full nav duplicate).
//
// Route-scoped via `useLocation`: the pill renders iff `pathname === '/'`,
// `pathname === '/p'`, or starts with `/p/`. The link target is `SUPPORT_URL`
// (identity.ts) — the Venmo URL the de-routed Contribute page pointed at — so
// dropping Contribute from navigation can not break the Support link target
// (FR-12). Tailwind v4 + @theme tokens only (AD-6). `id="site-footer"` lets the
// Landing's skip-to-section control jump + focus it (Story 3.2 / AC4).

import { useLocation } from 'react-router-dom';
import SupportPill from './SupportPill';

export default function SiteFooter() {
  const { pathname } = useLocation();
  const showSupport =
    pathname === '/' || pathname === '/p' || pathname.startsWith('/p/');

  return (
    <footer id="site-footer" className="mt-12 border-t border-outline-variant bg-surface-container-low">
      <div className="mx-auto w-full max-w-[1100px] px-4 py-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-on-surface-variant">
            © {new Date().getFullYear()} Clinton J Avery
          </p>
          {showSupport && <SupportPill />}
        </div>
      </div>
    </footer>
  );
}