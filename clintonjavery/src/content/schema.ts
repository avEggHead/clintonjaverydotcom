// Ink & Garden — Post frontmatter schema.
// The authoritative data contract (ARCHITECTURE-SPINE AD-2; PRD addendum §A).
// `slug` is derived from the filename stem (kebab-case) by the content plugin —
// never authored in frontmatter (a mismatch throws, see validate.ts).

import type { ComponentType } from 'react';

export type PostType = 'essay' | 'comic';
export type PostStatus = 'draft' | 'published';
export type PostAccess = 'free' | 'premium'; // reserved — future paywall (addendum §I), not built

/** Frontmatter parsed by gray-matter before validation. Loose on purpose. */
export interface RawFrontmatter {
  title?: unknown;
  date?: unknown;
  type?: unknown;
  slug?: unknown;
  excerpt?: unknown;
  status?: unknown;
  tags?: unknown;
  ogImage?: unknown;
  // comic-only
  strip?: unknown;
  caption?: unknown;
  notes?: unknown;
  // reserved
  access?: unknown;
  [key: string]: unknown;
}

/** Shared metadata fields present on every published Post. */
export interface PostBase {
  /** URL slug — kebab-case filename stem. */
  slug: string;
  title: string;
  /** ISO 8601 `YYYY-MM-DD`. Drives Feed order (FR-5). */
  date: string;
  type: PostType;
  /** Optional; meta description fallback (used by Story 1.6 SEO). */
  excerpt?: string;
  /** `published` is the default; `draft` posts are excluded from the index (AC5). */
  status: PostStatus;
  /** Optional tags (schema reserves; feature deferred). */
  tags?: string[];
  /** Optional OG image; defaults to strip image for comics (used by 1.6). */
  ogImage?: string;
  /** Reserved for a future paywall (default `free`) — not gated in v1. */
  access: PostAccess;
}

/** Essay Post — MDX body, lazily compiled by @mdx-js/rollup. */
export interface EssayPost extends PostBase {
  type: 'essay';
  /**
   * Lazy importer resolving to the compiled MDX default export (a React
   * component). The Post page (Story 1.4) renders it as `<Body />`. The
   * importer is emitted by the content plugin via an eager `import.meta.glob`
   * over the essay (`.mdx`) files in `content/p`.
   */
  body: () => Promise<{ default: ComponentType }>;
}

/** Comic Post — single strip image + required alt text (FR-8). No body. */
export interface ComicPost extends PostBase {
  type: 'comic';
  strip: { image: string; alt: string };
  caption?: string;
  notes?: string;
}

/** The one shape any consumer of the content-index uses (AD-2). */
export type Post = EssayPost | ComicPost;

/** Metadata-only view (no lazy body importer) — handy for Feed/SEO listings. */
export type PostMeta = Omit<EssayPost, 'body'> | ComicPost;