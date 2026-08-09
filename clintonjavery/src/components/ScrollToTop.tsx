// Scroll-to-top on client-side route change (UX bug fix, Epic 1/2 follow-up).
// With a plain <BrowserRouter> (not a data router) there is no
// ScrollRestoration, so clicking a <Link> changes the URL but the viewport
// stays at the old scrollY — a post opened from the Feed lands mid-page.
// This resets the scroll to the top whenever `pathname` changes.
//
// Keyed on `pathname` ONLY (not `search`): the Feed's pagination + type-filter
// are search-param changes on the same `/p` route and intentionally keep their
// position (AC6 "no churn"); per-post navigation is a pathname change and
// scrolls to top. `window.scrollTo(0,0)` is instant (no animation), so it is
// safe under prefers-reduced-motion. The hash-link SkipLink (#main) does not
// change pathname, so it is unaffected (the browser handles the hash jump).

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}