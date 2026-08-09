// Ink & Garden — runtime document-head manager (Story 1.6, T3).
// A small, dependency-free effect hook that applies a HeadMeta (built by
// src/site/head-meta.ts) to document.head on each client-side route change.
//
// DESIGN — no react-helmet / unhead (AC6: no new dep). AR-11: the pure
// buildHeadMeta is unit-tested; this DOM effect is the manual-review layer.
//
// RECONCILIATION — the hook OWNS the tags it manages (marked data-ig-head="1"):
//   - <meta> keyed by `property` (og:*) or `name` (description / twitter:* / robots)
//   - <link> keyed by `rel` (canonical)
// On each run it upserts (find-or-create) each tag — if the static index.html
// already declared an og:title/og:description/og:image/og:url/twitter:card, the
// hook TAKES IT OVER (updates content + marks it owned) rather than duplicating.
// It NEVER selects the static charset/viewport/font/favicon tags (different
// keys) — those persist untouched. On cleanup (unmount / before next run) the
// owned tags are removed; the next route's effect re-creates them. A hard
// refresh restores the static index.html tags (the no-JS fallback).
//
// useLayoutEffect (not useEffect) so document.title is correct before paint
// (no title-flash on navigation). No SSR in this app, so the SSR warning is N/A.

import { useLayoutEffect, useRef } from 'react';
import type { HeadMeta, LinkTag, MetaTag } from '../site/head-meta';

const OWNED_ATTR = 'data-ig-head';

function ensureMeta(tag: MetaTag): HTMLMetaElement {
  const selector = tag.property
    ? `meta[property="${tag.property}"]`
    : `meta[name="${tag.name}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    if (tag.property) el.setAttribute('property', tag.property);
    else el.setAttribute('name', tag.name as string);
    document.head.appendChild(el);
  }
  el.setAttribute('content', tag.content);
  el.setAttribute(OWNED_ATTR, '1');
  return el;
}

function ensureLink(link: LinkTag): HTMLLinkElement {
  const selector = `link[rel="${link.rel}"]`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', link.rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', link.href);
  el.setAttribute(OWNED_ATTR, '1');
  return el;
}

/**
 * Apply `meta` to document.head. Idempotent within a route: the effect only
 * re-runs when the serialized signature changes (filter/page/title/etc.), so a
 * re-render with the same meta is a no-op (no DOM churn). Reads the latest
 * `meta` via the effect closure captured on the render that changed the sig.
 */
export function useHead(meta: HeadMeta): void {
  const ownedRef = useRef<HTMLElement[]>([]);
  // Stable signature — re-applies only on a real change, not every render.
  const sig = `${meta.title}\u0001${JSON.stringify(meta.tags)}\u0001${JSON.stringify(meta.links)}`;

  useLayoutEffect(() => {
    // Remove previously owned tags (from a prior route / prior meta).
    for (const el of ownedRef.current) el.remove();

    const owned: HTMLElement[] = [];
    document.title = meta.title;
    for (const t of meta.tags) owned.push(ensureMeta(t));
    for (const l of meta.links) owned.push(ensureLink(l));
    ownedRef.current = owned;

    return () => {
      // Cleanup on unmount or before the next effect run.
      for (const el of ownedRef.current) el.remove();
    };
    // `meta` is read from the closure of the triggering render; the sig is the
    // dep so we don't re-run on identity-only changes (new object, same data).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);
}