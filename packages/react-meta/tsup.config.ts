import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/theme.ts', 'src/form.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  // Bundle all @refraction-ui/* workspace packages into the output.
  // Only external deps (React and RHF for the form subpath) remain as peer deps.
  noExternal: [/@refraction-ui\//],
  external: ['react', 'react-dom', 'react-hook-form'],
})
