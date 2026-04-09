import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: false, // TODO: fix export name conflicts for DTS
  sourcemap: true,
  clean: true,
  treeshake: true,
  // Bundle all @refraction-ui/* workspace packages into the output.
  // Only external deps (react, monaco) remain as peer deps.
  noExternal: [/@refraction-ui\//],
  external: ['react', 'react-dom', '@monaco-editor/react'],
})
