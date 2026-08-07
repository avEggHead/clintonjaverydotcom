// Ink & Garden — content-index entry. THE ONLY module consumers import for
// Post data (ARCHITECTURE-SPINE AD-1 / AC7). Re-exports the typed `posts`
// collection from the build-time virtual module + the schema types.
//
// Consumers must NEVER do `import.meta.glob('/content/...')` or import
// `content/...` directly — that breaks the one-way layer boundary.

export { posts } from 'virtual:content-index';
export type {
  Post,
  EssayPost,
  ComicPost,
  PostBase,
  PostMeta,
  PostType,
  PostStatus,
  PostAccess,
} from './schema';