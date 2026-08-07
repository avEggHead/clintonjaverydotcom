import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@mdx-js/rollup'
import { inkGardenContrastGate } from './src/build/contrast-plugin'
import { contentPlugin } from './src/content/plugin'

// https://vite.dev/config/
// AD-4 / AD-6: all build/validation gates run inside vite build/dev.
// Build command stays exactly "tsc -b && vite build" — no separate prebuild script.
// Order: react() → mdx() (compile .mdx essay bodies) → contentPlugin()
// (orchestrates glob/parse/validate/emit) → tailwindcss() → contrast gate.
export default defineConfig({
  plugins: [
    mdx({ include: /\.mdx$/, providerImportSource: 'react' }),
    react(),
    contentPlugin(),
    tailwindcss(),
    inkGardenContrastGate(),
  ],
  base: "/"
})