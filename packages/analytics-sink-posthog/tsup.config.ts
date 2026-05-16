import { defineConfig } from 'tsup'

export default defineConfig({
  // Two independent entry points: the sink (always safe to import) and the
  // optional session-replay module. The replay entry is its own chunk so it
  // tree-shakes out entirely unless the consumer explicitly imports it.
  entry: ['src/index.ts', 'src/replay.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  // posthog-js is an optional peer, only ever reached via dynamic import.
  external: ['posthog-js'],
})
