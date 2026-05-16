import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      // Resolve the core package to its TS source so the conformance suite
      // round-trips the *actual* `http` sink without requiring a prior build.
      '@refraction-ui/analytics': fileURLToPath(
        new URL('../analytics/src/index.ts', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'node',
  },
})
