import { defineConfig } from 'astro/config'
import { fileURLToPath } from 'node:url'
export default defineConfig({ devToolbar: { enabled: false }, server: { port: 7361 }, vite: { server: { fs: { allow: [fileURLToPath(new URL('../../..', import.meta.url))] } } } })
