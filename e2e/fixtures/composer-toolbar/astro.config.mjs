import { defineConfig } from 'astro/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
export default defineConfig({
  devToolbar: { enabled: false },
  vite: { css: { postcss: { plugins: [(await import('tailwindcss')).default({ config: path.join(root, '.storybook/tailwind.config.cjs') }), (await import('autoprefixer')).default()] } } },
})
