// Site footer landmark (AC5). Carries identity + copyright on every page, and
// the `support-pill` (UX-DR-15) in the footer area of CONTENT pages only —
// Post pages (`/p/:slug`) and the Feed (`/p`) — so it never competes with the
// primary nav and never duplicates on the Landing (Epic 3 builds its own
// footer section). Never a top-level nav item (FR-12).
//
// Route-scoped via `useLocation`: the pill renders iff `pathname === '/p'` or
// starts with `/p/`. The link target is `SUPPORT_URL` (identity.ts) — the
// Venmo URL the de-routed Contribute page pointed at — so dropping Contribute
// from navigation does not break the Support link target (FR-12). Tailwind v4
// + @theme tokens only (AD-6).

import { useLocation } from 'react-router-dom';
import SupportPill from './SupportPill';

export default function SiteFooter() {
  const { pathname } = useLocation();
  const showSupport = pathname === '/p' || pathname.startsWith('/p/');

  return (
    <footer className="mt-12 border-t border-outline-variant bg-surface-container-low">
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