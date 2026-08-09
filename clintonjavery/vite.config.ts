import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import { inkGardenContrastGate } from './src/build/contrast-plugin'
import { contentPlugin } from './src/content/plugin'

// https://vite.dev/config/
// AD-4 / AD-6: all build/validation gates run inside vite build/dev.
// Build command stays exactly "tsc -b && vite build" — no separate prebuild script.
// Order: mdx() (compile .mdx essay bodies) → react() → contentPlugin()
// (orchestrates glob/parse/validate/emit) → tailwindcss() → contrast gate.
//
// mdx() has NO `providerImportSource`: MDX 2 compiles provider-less (intrinsic
// elements + a local _components map). Setting it to `'react'` (a 1.2 mistake)
// made the compiled body do `import { useMDXComponents } from 'react'` — react
// doesn't export that, so `_provideComponents` was undefined and rendering the
// essay body threw `_provideComponents is not a function` (first exercised by
// Story 1.4's <Suspense><Body/></Suspense>; 1.2's tests only built the index,
// never rendered the MDX). We style essay prose via the `.prose` CSS rules, so
// no MDXProvider / component overrides are needed → no `@mdx-js/react` dep.
//
// `include` is a glob (not a regex) so only .mdx essays compile through mdx;
// the .md comic files (frontmatter-only, no body) are read directly by the
// content plugin and must NOT be passed to mdx().
export default defineConfig({
  plugins: [
    mdx({
      include: '**/*.mdx',
      // Strip the leading `---\n…\n---` frontmatter so it isn't rendered as
      // an <hr>+paragraph in the essay body. Metadata still comes from
      // gray-matter in the content plugin; remark-frontmatter just makes MDX
      // recognize & drop the block from the compiled body.
      remarkPlugins: [remarkFrontmatter],
    }),
    react(),
    contentPlugin(),
    tailwindcss(),
    inkGardenContrastGate(),
  ],
  base: '/'
})