import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

// Sticky top nav (UX-DR-6 / AC3, AC4). Ink-underline active state (not a pill),
// condenses on scroll, collapses to a menu button <=640px that closes on
// Escape / route change / outside-click. Tailwind v4 + @theme tokens only (AD-6).

const CONDENSE_AT = 40; // px scrolled → condense
const UNCONDENSE_AT = 10; // px scrolled → un-condense. Hysteresis dead zone 30px
  // is larger than the header's max height change (~20px from py-4→py-1.5 + wordmark),
  // so the shrink can't drop scrollY back across the un-condense point → no oscillation.

export default function TopNav() {
  const [condensed, setCondensed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Condense on scroll (passive; instant under prefers-reduced-motion via motion-safe).
  useEffect(() => {
    const onScroll = () =>
      setCondensed((c) => {
        const y = window.scrollY;
        return c ? y >= UNCONDENSE_AT : y > CONDENSE_AT;
      });
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the menu on route change (AC4).
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close on Escape + outside-click (AC4).
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const onPointer = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (panelRef.current?.contains(t) || buttonRef.current?.contains(t)) return;
      setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [menuOpen]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'inline-flex items-center min-h-[44px] px-2 border-b-2 font-body text-sm transition-colors',
      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
      isActive
        ? 'text-ink border-primary'
        : 'text-on-surface-variant border-transparent hover:text-ink',
    ].join(' ');

  return (
    <header
      className={[
        'sticky top-0 z-50 border-b border-outline-variant bg-surface/95 backdrop-blur',
        'motion-safe:transition-all',
        condensed ? 'py-1.5' : 'py-3 sm:py-4',
      ].join(' ')}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex w-full max-w-[1100px] items-center justify-between px-4"
      >
        <Link
          to="/"
          aria-label="Clinton J Avery — home"
          className={[
            'font-display font-medium text-ink',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
            condensed ? 'text-lg' : 'text-xl sm:text-2xl',
            'motion-safe:transition-all',
          ].join(' ')}
      >
          Clinton J Avery
        </Link>

        {/* Desktop links (>=640px) */}
        <div className="hidden sm:flex sm:items-center sm:gap-5">
          <NavLink to="/p" className={navLinkClass}>
            Feed
          </NavLink>
          <NavLink to="/projects" className={navLinkClass}>
            Projects
          </NavLink>
        </div>

        {/* Menu button (<=640px) */}
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="nav-menu-panel"
          aria-label="Toggle navigation menu"
          className={[
            'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-outline-variant px-2',
            'text-ink sm:hidden',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
          ].join(' ')}
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </nav>

      {/* Mobile panel (<=640px) */}
      {menuOpen && (
        <div
          ref={panelRef}
          id="nav-menu-panel"
          className="border-t border-outline-variant bg-surface px-4 py-2 sm:hidden"
        >
          <div className="flex flex-col">
            <NavLink to="/p" className={navLinkClass}>
              Feed
            </NavLink>
            <NavLink to="/projects" className={navLinkClass}>
              Projects
            </NavLink>
          </div>
        </div>
      )}
    </header>
  );
}