import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  devToolbar: { enabled: false },
  vite: {
    css: { postcss: { plugins: [tailwindcss(), autoprefixer()] } },
  },
})
