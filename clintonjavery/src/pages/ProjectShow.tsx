// `/projects/:slug` — a single live Project entry (Epic 4 / Story 4.2 / FR-9).
//
// Looks the slug up in the typed Projects data; renders the project header
// (h1 title + one-line summary + stack chips + a source-repo link) and the
// live in-app tool itself (the entry's `component`) inside a bordered "demo"
// panel. An unknown slug → the on-brand NotFound + a `not-found` <head>
// (mirrors PostPage's missing-slug path). An external live demo (no in-site
// `component`) renders an "Open the live demo ↗" anchor instead. Head via the
// 1.6 `project` kind: title `<entry> · <author>`, description = summary,
// canonical `/projects/:slug`. Tailwind v4 + @theme tokens (AD-6).

import { Link, useParams } from 'react-router-dom';
import { findProject } from '../data/projects';
import NotFound from './NotFound';
import { buildHeadMeta } from '../site/head-meta';
import { useHead } from '../head/useHead';
import { toAbsoluteUrl } from '../site/site-utils';
import { SITE_URL } from '../site/identity';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

export default function ProjectShow() {
  const { slug } = useParams();
  const entry = slug ? findProject(slug) : undefined;

  // useHead before any return (rules of hooks). Unknown slug → not-found head.
  useHead(
    entry
      ? buildHeadMeta({
          kind: 'project',
          title: entry.title,
          description: entry.summary,
          canonical: toAbsoluteUrl(`/projects/${entry.slug}`, SITE_URL),
        })
      : buildHeadMeta({ kind: 'not-found' }),
  );

  if (!entry) {
    return <NotFound />;
  }

  const Tool = entry.component;

  return (
    <article className="mx-auto w-full max-w-[820px] px-4 py-12 sm:py-16">
      <header>
        <h1 className="font-display text-headline-lg text-ink">{entry.title}</h1>
        <p className="mt-4 max-w-prose font-body text-body-lg leading-prose text-on-surface-variant">
          {entry.summary}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
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
          {entry.sourceUrl ? (
            <a
              href={entry.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-body text-body-sm text-link underline underline-offset-4 ${focusRing}`}
            >
              Source ↗
            </a>
          ) : null}
        </div>
      </header>

      {/* The live demo — the in-app tool, or an external link, or a muted note. */}
      <section aria-label="Live demo" className="mt-10 rounded-lg border border-outline-variant bg-surface p-5 sm:p-6">
        {Tool ? (
          <Tool />
        ) : entry.liveUrl && entry.liveUrl.startsWith('http') ? (
          <a
            href={entry.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex min-h-[44px] items-center rounded-md bg-primary-strong px-5 font-body text-sm font-semibold text-on-primary ${focusRing}`}
          >
            Open the live demo ↗
          </a>
        ) : (
          <p className="font-body text-body-md text-on-surface-variant">
            No live demo for this project yet.
          </p>
        )}
      </section>

      <p className="mt-8">
        <Link
          to="/projects"
          className={`font-body text-body-md text-link underline underline-offset-4 ${focusRing}`}
        >
          ← All projects
        </Link>
      </p>
    </article>
  );
}