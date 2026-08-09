// Ink & Garden — Project card (Epic 4 / Story 4.1 / UX-DR-12).
//
// `surface-container-low` card: project title, one-line summary (`body-sm`),
// stack chips, and live + source affordances. In-site `liveUrl` (`/…`) renders
// as an RR `<Link>` to `/projects/:slug` (UX-DR-12); an external `liveUrl`
// opens in a new tab with `rel="noopener noreferrer"` (Story 4.2 AC). A DEAD
// link (no `liveUrl` / no `sourceUrl`) is de-emphasised — a muted, NON-clickable
// label — but the card stays (title/summary/stack remain as the proof point,
// UX-DR-16). Subtle hover lift on `pointer:fine` only (no lift on touch), and
// never under `prefers-reduced-motion`. Tailwind v4 + @theme tokens (AD-6).

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { ProjectEntry } from '../data/projects';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

const externalAnchor =
  'inline-flex min-h-[44px] items-center rounded-md px-3 py-1.5 font-body text-body-sm font-medium text-link underline underline-offset-4';

function LiveAffordance({ entry }: { entry: ProjectEntry }): ReactNode {
  const { liveUrl } = entry;
  if (!liveUrl) {
    // UX-DR-16 — de-emphasised, NOT clickable. Card stays as the proof point.
    return <span className="text-sm text-on-surface-variant/50">No live demo</span>;
  }
  if (liveUrl.startsWith('/')) {
    // In-site tool — RR Link to /projects/:slug (UX-DR-12), client-side nav.
    return (
      <Link to={liveUrl} className={`${externalAnchor} ${focusRing}`}>
        Live demo →
      </Link>
    );
  }
  // External live demo — new tab, noopener (Story 4.2 AC).
  return (
    <a
      href={liveUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${externalAnchor} ${focusRing}`}
    >
      Live demo ↗
    </a>
  );
}

function SourceAffordance({ entry }: { entry: ProjectEntry }): ReactNode {
  const { sourceUrl } = entry;
  if (!sourceUrl) {
    return <span className="text-sm text-on-surface-variant/50">No source</span>;
  }
  return (
    <a
      href={sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${externalAnchor} ${focusRing}`}
    >
      Source ↗
    </a>
  );
}

export function ProjectCard({ entry }: { entry: ProjectEntry }) {
  return (
    <article className="flex h-full flex-col gap-4 rounded-lg border border-outline-variant bg-surface-container-low p-5 transition-[transform,box-shadow] duration-200 motion-safe:pointer-fine:hover:-translate-y-0.5 motion-safe:pointer-fine:hover:shadow-md">
      <div>
        {/* Card title is an <h2> — the page <h1> is "Projects" (one h1/page, NFR-1). */}
        <h2 className="font-display text-headline-sm text-ink">{entry.title}</h2>
        <p className="mt-2 line-clamp-2 font-body text-body-sm text-on-surface-variant">
          {entry.summary}
        </p>
      </div>

      {/* Stack chips */}
      <ul aria-label="Tech stack" className="flex flex-wrap gap-1.5">
        {entry.stack.map((tech) => (
          <li
            key={tech}
            className="rounded-full bg-secondary-container px-3 py-1 text-xs text-on-secondary-container"
          >
            {tech}
          </li>
        ))}
      </ul>

      {/* Live + source affordances */}
      <div className="mt-auto flex flex-wrap items-center gap-4">
        <LiveAffordance entry={entry} />
        <SourceAffordance entry={entry} />
      </div>
    </article>
  );
}