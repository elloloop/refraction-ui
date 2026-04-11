import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: false, // Start with false to ensure build passes, same as React
  sourcemap: true,
  clean: true,
  treeshake: true,
  // Bundle all @refraction-ui/* workspace packages into the output.
  noExternal: [/@refraction-ui\//],
  external: ['astro', 'astro/runtime/server'],
})
