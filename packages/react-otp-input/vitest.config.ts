import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // SSR tests run in node; the interaction suite opts into jsdom via a
    // per-file `// @vitest-environment jsdom` pragma.
    environment: 'node',
    passWithNoTests: true,
  },
})
