// Ink & Garden — build-time content validation gates (FR-8 / AC3, AC4, AC5).
// Pure function — no fs. The content plugin reads files and calls this.
// Throws on invalid; returns null for excluded drafts (AC5).

import type {
  PostAccess,
  PostMeta,
  PostStatus,
  PostType,
  RawFrontmatter,
} from './schema';

export interface ValidateInput {
  /** Filename stem (kebab-case) — the derived slug. */
  slug: string;
  /** Relative file path for error messages, e.g. `content/p/first-strip.md`. */
  file: string;
  /** Essay only: whether the gray-matter body (after frontmatter) is non-empty. */
  hasBody?: boolean;
}

export interface ValidateResult {
  meta: PostMeta;
  /** True when the post is a draft (excluded from the published index). */
  isDraft: boolean;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const POST_TYPES: PostType[] = ['essay', 'comic'];
const STATUSES: PostStatus[] = ['draft', 'published'];
const ACCESSES: PostAccess[] = ['free', 'premium'];

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function fail(file: string, field: string, reason?: string): never {
  const detail = reason ? `: ${reason}` : '';
  throw new Error(`Content gate: ${file} — missing or invalid ${field}${detail}`);
}

/**
 * Validate one parsed post. Throws on invalid content (fail-closed).
 * Returns `{ meta, isDraft }`; callers drop drafts from the published index.
 */
export function validatePost(
  raw: RawFrontmatter,
  input: ValidateInput,
): ValidateResult {
  const { slug, file } = input;

  // slug frontmatter (if authored) must match the filename stem — no drift (AD-2).
  if (raw.slug !== undefined && raw.slug !== slug) {
    fail(
      file,
      'slug',
      `frontmatter "${String(raw.slug)}" must match filename "${slug}" or be omitted`,
    );
  }

  // title — required, non-empty (AC4).
  if (!isNonEmptyString(raw.title)) {
    fail(file, 'title');
      }

  // date — required, ISO 8601 YYYY-MM-DD, real calendar date.
  if (!isNonEmptyString(raw.date) || !ISO_DATE_RE.test(raw.date)) {
    fail(file, 'date', 'must be ISO 8601 YYYY-MM-DD');
  }
  const [y, m, d] = raw.date.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (
    Number.isNaN(dt.getTime()) ||
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== m - 1 ||
    dt.getUTCDate() !== d
  ) {
    fail(file, 'date', 'not a real calendar date');
  }

  // type — required, ∈ {essay, comic}.
  if (!POST_TYPES.includes(raw.type as PostType)) {
    fail(file, 'type', 'must be "essay" or "comic"');
  }
  const type = raw.type as PostType;

  // status — default published; draft excludes from index (AC5).
  let status: PostStatus = 'published';
  if (raw.status !== undefined) {
    if (!STATUSES.includes(raw.status as PostStatus)) {
      fail(file, 'status', 'must be "draft" or "published"');
    }
    status = raw.status as PostStatus;
  }

  // access — reserved; default free (addendum §I).
  let access: PostAccess = 'free';
  if (raw.access !== undefined) {
    if (!ACCESSES.includes(raw.access as PostAccess)) {
      fail(file, 'access', 'must be "free" or "premium"');
    }
    access = raw.access as PostAccess;
  }

  // excerpt / ogImage / tags — optional, but if present must be the right shape.
  let excerpt: string | undefined;
  if (raw.excerpt !== undefined) {
    if (!isNonEmptyString(raw.excerpt)) fail(file, 'excerpt');
    excerpt = raw.excerpt;
  }
  let ogImage: string | undefined;
  if (raw.ogImage !== undefined) {
    if (!isNonEmptyString(raw.ogImage)) fail(file, 'ogImage');
    ogImage = raw.ogImage;
  }
  let tags: string[] | undefined;
  if (raw.tags !== undefined) {
    if (
      !Array.isArray(raw.tags) ||
      !raw.tags.every((t) => isNonEmptyString(t))
    ) {
      fail(file, 'tags', 'must be an array of non-empty strings');
    }
    tags = raw.tags as string[];
  }

  const base = {
    slug,
    title: raw.title as string,
    date: raw.date as string,
    type,
    status,
    access,
    excerpt,
    ogImage,
    tags,
  };

  if (type === 'essay') {
    // Essay body required (AC4).
    if (!input.hasBody) {
      fail(file, 'body', 'essay posts require a non-empty markdown/MDX body');
    }
    return { meta: { ...base, type: 'essay' }, isDraft: status === 'draft' };
  }

  // comic — strip.image + strip.alt required (AC2/AC3, FR-8).
  const stripRaw = raw.strip;
  if (
    !stripRaw ||
    typeof stripRaw !== 'object' ||
    Array.isArray(stripRaw)
  ) {
    fail(file, 'strip', 'must be an object with `image` and `alt`');
  }
  const stripObj = stripRaw as Record<string, unknown>;
  if (!isNonEmptyString(stripObj.image)) {
    fail(file, 'strip.image');
  }
  if (!isNonEmptyString(stripObj.alt)) {
    fail(
      file,
      'strip.alt',
      'FR-8: comic alt text is required and must be non-empty',
    );
  }
  let caption: string | undefined;
  if (raw.caption !== undefined) {
    if (!isNonEmptyString(raw.caption)) fail(file, 'caption');
    caption = raw.caption;
  }
  let notes: string | undefined;
  if (raw.notes !== undefined) {
    if (!isNonEmptyString(raw.notes)) fail(file, 'notes');
    notes = raw.notes;
  }

  return {
    meta: {
      ...base,
      type: 'comic',
      strip: { image: stripObj.image as string, alt: stripObj.alt as string },
      caption,
      notes,
    },
    isDraft: status === 'draft',
  };
}