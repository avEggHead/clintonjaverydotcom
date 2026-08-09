// Skip-to-content link — first-focusable element on every surface (UX-DR-17 / AC5).
// Visually hidden until focused; jumps to <main id="main">.
export default function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-on-ink focus:shadow-lg focus:outline-none"
    >
      Skip to content
    </a>
  );
}