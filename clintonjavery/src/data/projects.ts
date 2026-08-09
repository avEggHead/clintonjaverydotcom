// Ink & Garden — Projects data model (Epic 4 / FR-9 / PRD addendum §E).
//
// A typed array of Projects Entries — each exposing a live demo URL (in-site
// tool or external), a source repository URL, a one-line summary, and the
// tech stack. Existing tools/games (Time Zone Converter, Text Analyzer, Effort
// Estimator, Unit Converter, Balloon Popper) rehome as Entries whose
// `liveUrl` points to their in-app route `/projects/:slug` (the live tool is
// rendered there by Story 4.2). `sourceUrl` is a deep link to the file on
// GitHub (default branch `main`). Slugs are kebab-case. `date` is the file's
// first-commit date (honest "when shipped").
//
// Story 4.1 ships the data + the `/projects` list (cards link live/source).
// Story 4.2 wires each entry's `component` (the live tool) at `/projects/:slug`
// + the historic `/tools/:slug` + `/fun/:slug` → `/projects/:slug` 301s.

import type { ComponentType } from 'react';

export interface ProjectEntry {
  /** URL slug — kebab-case. Routes to `/projects/:slug`. */
  slug: string;
  title: string;
  /** One-line summary (rendered as `body-sm` on the card — PRD §E). */
  summary: string;
  /** Tech stack chips (PRD §E). */
  stack: string[];
  /** ISO `YYYY-MM-DD` — when shipped/added (first-commit date). */
  date: string;
  /** Live demo URL. In-site paths (`/…`) render as an RR `<Link>` to
   *  `/projects/:slug` (UX-DR-12); `http(s)://` URLs open in a new tab with
   *  `rel="noopener"` (Story 4.2 AC). Absent → affordance de-emphasised
   *  (muted, not clickable) but the card remains (UX-DR-16). */
  liveUrl?: string;
  /** Source repository URL (deep link to the file on GitHub). Absent → muted. */
  sourceUrl?: string;
  /** Optional screenshot paths (reserved — PRD §E; not rendered in v1). */
  screenshots?: string[];
  /** Optional pinning flag (reserved — PRD §E; not re-ordered in v1). */
  featured?: boolean;
  /** In-site live tool component — rendered as the live demo at
   *  `/projects/:slug` (Story 4.2). Absent for list-only entries (4.1). */
  component?: ComponentType;
}

const REPO = 'https://github.com/avEggHead/clintonjaverydotcom';
const src = (path: string): string => `${REPO}/blob/main/clintonjavery/${path}`;

export const projects: ProjectEntry[] = [
  {
    slug: 'time-zone-converter',
    title: 'Time Zone Converter',
    summary: 'Convert a moment between any two time zones with Luxon.',
    stack: ['React', 'Luxon'],
    date: '2025-03-28',
    liveUrl: '/projects/time-zone-converter',
    sourceUrl: src('src/tools/TimeZoneConverter.tsx'),
  },
  {
    slug: 'text-analyzer',
    title: 'Text Analyzer',
    summary: 'Live word, character, line, and punctuation counts as you type.',
    stack: ['React'],
    date: '2025-04-01',
    liveUrl: '/projects/text-analyzer',
    sourceUrl: src('src/tools/TextAnalyzer.tsx'),
  },
  {
    slug: 'effort-estimator',
    title: 'Effort Estimator',
    summary: 'Drag five effort dimensions to a Fibonacci-weighted estimate.',
    stack: ['React', 'Radix UI'],
    date: '2025-08-02',
    liveUrl: '/projects/effort-estimator',
    sourceUrl: src('src/tools/EffortSlider.tsx'),
  },
  {
    slug: 'unit-converter',
    title: 'Unit Converter',
    summary: 'Length, weight, and volume conversions across common units.',
    stack: ['React'],
    date: '2026-04-03',
    liveUrl: '/projects/unit-converter',
    sourceUrl: src('src/tools/UnitConverter.tsx'),
  },
  {
    slug: 'balloon-popper',
    title: 'Balloon Popper',
    summary: 'A tiny click-react game — pop balloons for points.',
    stack: ['React'],
    date: '2025-04-01',
    liveUrl: '/projects/balloon-popper',
    sourceUrl: src('src/fun/BalloonPopper.tsx'),
  },
];

/** Find a Projects Entry by slug. Returns `undefined` if not found — the
 *  caller (Story 4.2 show page) renders the shared NotFound for an unknown
 *  slug. */
export function findProject(slug: string): ProjectEntry | undefined {
  return projects.find((p) => p.slug === slug);
}