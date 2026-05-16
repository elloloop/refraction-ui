import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  // Vendor SDK is an optional peer, loaded lazily via dynamic import only.
  external: ['@microsoft/applicationinsights-web'],
})
