import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { inkGardenContrastGate } from './src/build/contrast-plugin'

// https://vite.dev/config/
// AD-4 / AD-6: Tailwind v4 + the contrast gate both run inside vite build/dev.
// Build command stays exactly "tsc -b && vite build" — no separate prebuild script.
export default defineConfig({
  plugins: [react(), tailwindcss(), inkGardenContrastGate()],
  base: "/"
})