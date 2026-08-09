// Ink & Garden — per-route document-head metadata builder (Story 1.6, T1.3).
// Pure + isomorphic: buildHeadMeta returns a plain, serializable HeadMeta that
// the DOM useHead effect (src/head/useHead.ts) renders into document.head.
// AR-11: this builder is unit-tested; the DOM effect is manual smoke.
//
// AC1: every route emits <title>, meta description, og:title/description/image/
//      url, twitter:card (+ twitter:title/description for robustness).
// AC2/AC3: og:image resolution via postOgImage (strip for comics, ogImage/default
//      for essays).
// og:site_name + og:type + a <link rel="canonical"> are emitted for every input.

import type { Post } from '../content/schema';
import { AUTHOR, SITE_DESCRIPTION, SITE_TITLE, SITE_URL, DEFAULT_OG_IMAGE, TWITTER_CARD } from './identity';
import {
  feedCanonical,
  postCanonical,
  postDescription,
  postOgImage,
  toAbsoluteUrl,
} from './site-utils';

export interface MetaTag {
  /** Open Graph property key (`og:title`). Mutually exclusive with `name`. */
  property?: string;
  /** Standard/twitter meta name (`description`, `twitter:card`). Mutually exclusive with `property`. */
  name?: string;
  content: string;
}

export interface LinkTag {
  rel: string;
  href: string;
}

export interface HeadMeta {
  title: string;
  tags: MetaTag[];
  links: LinkTag[];
}

export type HeadInput =
  | { kind: 'home' }
  | { kind: 'feed'; canonical: string }
  | { kind: 'projects'; canonical: string }
  | { kind: 'project'; title: string; description: string; canonical: string }
  | { kind: 'post'; post: Post }
  | { kind: 'not-found' };

const DEFAULT_OG_ABS = toAbsoluteUrl(DEFAULT_OG_IMAGE, SITE_URL);

/** Build the base set of tags shared by every route (image/card/site_name). */
function baseTags(opts: {
  title: string;
  description: string;
  imageAbs: string;
  urlAbs: string;
  ogType: string;
  includeTwitterTitleDesc: boolean;
}): MetaTag[] {
  const tags: MetaTag[] = [
    { name: 'description', content: opts.description },
    { property: 'og:title', content: opts.title },
    { property: 'og:description', content: opts.description },
    { property: 'og:image', content: opts.imageAbs },
    { property: 'og:url', content: opts.urlAbs },
    { property: 'og:type', content: opts.ogType },
    { property: 'og:site_name', content: SITE_TITLE },
    { name: 'twitter:card', content: TWITTER_CARD },
  ];
  if (opts.includeTwitterTitleDesc) {
    tags.push({ name: 'twitter:title', content: opts.title });
    tags.push({ name: 'twitter:description', content: opts.description });
  }
  return tags;
}

/** Build the HeadMeta for the current route. Pure — no DOM, no side effects. */
export function buildHeadMeta(input: HeadInput): HeadMeta {
  switch (input.kind) {
    case 'home': {
      const tags = baseTags({
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        imageAbs: DEFAULT_OG_ABS,
        urlAbs: SITE_URL,
        ogType: 'website',
        includeTwitterTitleDesc: true,
      });
      return { title: SITE_TITLE, tags, links: [{ rel: 'canonical', href: SITE_URL }] };
    }

    case 'feed': {
      const title = `Feed · ${AUTHOR}`;
      const tags = baseTags({
        title,
        description: SITE_DESCRIPTION,
        imageAbs: DEFAULT_OG_ABS,
        urlAbs: input.canonical,
        ogType: 'website',
        includeTwitterTitleDesc: false,
      });
      return { title, tags, links: [{ rel: 'canonical', href: input.canonical }] };
    }

    case 'projects': {
      const title = `Projects · ${AUTHOR}`;
      const tags = baseTags({
        title,
        description: SITE_DESCRIPTION,
        imageAbs: DEFAULT_OG_ABS,
        urlAbs: input.canonical,
        ogType: 'website',
        includeTwitterTitleDesc: false,
      });
      return { title, tags, links: [{ rel: 'canonical', href: input.canonical }] };
    }

    case 'project': {
      const title = `${input.title} · ${AUTHOR}`;
      const tags = baseTags({
        title,
        description: input.description,
        imageAbs: DEFAULT_OG_ABS,
        urlAbs: input.canonical,
        ogType: 'website',
        includeTwitterTitleDesc: true,
      });
      return { title, tags, links: [{ rel: 'canonical', href: input.canonical }] };
    }

    case 'post': {
      const { post } = input;
      const title = post.title;
      const description = postDescription(post, SITE_DESCRIPTION);
      const imageAbs = toAbsoluteUrl(postOgImage(post, DEFAULT_OG_IMAGE), SITE_URL);
      const urlAbs = postCanonical(post.slug, SITE_URL);
      const tags = baseTags({
        title,
        description,
        imageAbs,
        urlAbs,
        ogType: 'article',
        includeTwitterTitleDesc: true,
      });
      return {
        title,
        tags,
        links: [{ rel: 'canonical', href: urlAbs }],
      };
    }

    case 'not-found': {
      const title = `Not found · ${AUTHOR}`;
      const tags = baseTags({
        title,
        description: SITE_DESCRIPTION,
        imageAbs: DEFAULT_OG_ABS,
        urlAbs: SITE_URL,
        ogType: 'website',
        includeTwitterTitleDesc: false,
      });
      // Keep missing slugs OUT of the index (and out of social cards).
      tags.push({ name: 'robots', content: 'noindex' });
      return { title, tags, links: [{ rel: 'canonical', href: SITE_URL }] };
    }
  }
}

// Re-export the canonical helpers so route components import from one place
// (e.g. Feed computes its absolute canonical via feedCanonical + toAbsoluteUrl,
// mirroring the shareable pageHref URL).
export { feedCanonical, postCanonical };