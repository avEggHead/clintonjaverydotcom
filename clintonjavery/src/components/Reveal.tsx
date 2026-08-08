// Ink & Garden — scroll-reveal wrapper (Story 3.2 / UX-DR-4 / AC3).
// Used on the Landing scroll-narrative sections ONLY — never on Feed/Post
// (UX-MAXIM: don't hide content the user came for). Reveals the section once
// it enters the viewport (IntersectionObserver, fires once). Under
// `prefers-reduced-motion: reduce` the section shows instantly — no fade/slide.
// Fail-safe: the app is a JS SPA (no no-JS path), so opacity-0-until-reveal is
// acceptable.
//
// Each Reveal section carries `id` + `tabIndex={-1}` so the Landing's
// focus-revealed skip-to-section links can both scroll AND move focus to it
// (AC4 "reachable without scrolling" for keyboard/AT users).
import { useEffect, useRef, useState, type ReactNode } from 'react';

export default function Reveal({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reduced motion → show instantly (no observer, no transition).
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting === true) {
          setShown(true);
          io.disconnect(); // reveal once; stay shown
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id={id}
      ref={ref}
      tabIndex={-1}
      className={[
        'transition-all duration-500 ease-out motion-reduce:transition-none',
        shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className ?? '',
      ].join(' ')}
    >
      {children}
    </section>
  );
}