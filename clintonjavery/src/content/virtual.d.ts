// Ambient declarations for the content-pipeline virtual modules
// (generated at build time by src/content/plugin.ts). The virtual module
// `virtual:content-index` is the ONLY surface consumers import Post data
// through (AD-1). Type-only import resolves relative to this .d.ts file.

declare module 'virtual:content-index' {
  export const posts: import('./schema').Post[];
}