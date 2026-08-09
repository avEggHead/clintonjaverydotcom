// `/projects` — the Projects portfolio (Epic 4 / Story 4.1 / FR-9).
//
// Lists Projects Entries as cards: title, one-line summary (`body-sm`), stack
// chips, and live + source affordances. Responsive grid — 1 col `<768`, 2 col
// `768–1024`, 3 col `>=1024` (UX-DR-12). Subtle hover lift on `pointer:fine`
// only (handled in ProjectCard). Dead live/source links de-emphasised, not
// removed (UX-DR-16). The live tool for each in-site entry renders at
// `/projects/:slug` (Story 4.2) — until then the show route is the placeholder.
//
// Content-index contract (AD-1): imports `projects` from `../data/projects`
// (a typed module — Projects are code entries, not MDX content). Head via
// the 1.6 `projects` kind (canonical = /projects). Tailwind v4 + @theme (AD-6).

import { projects } from '../data/projects';
import { ProjectCard } from '../components/ProjectCard';
import { buildHeadMeta } from '../site/head-meta';
import { useHead } from '../head/useHead';
import { toAbsoluteUrl } from '../site/site-utils';
import { SITE_URL } from '../site/identity';

export default function Projects() {
  useHead(
    buildHeadMeta({
      kind: 'projects',
      canonical: toAbsoluteUrl('/projects', SITE_URL),
    }),
  );

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-12 sm:py-16">
      <h1 className="font-display text-headline-lg text-ink">Projects</h1>
      <p className="mt-4 max-w-prose font-body text-body-lg leading-prose text-on-surface-variant">
        Small tools and games built and shipped here — each one live and
        usable, with the source a click away. Pick one and take it for a spin.
      </p>

      <ul className="mt-10 grid list-none gap-5 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((entry) => (
          <li key={entry.slug} className="flex">
            <ProjectCard entry={entry} />
          </li>
        ))}
      </ul>
    </div>
  );
}