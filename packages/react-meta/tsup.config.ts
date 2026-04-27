import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/theme.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  // Bundle all @refraction-ui/* workspace packages into the output.
  // Only external deps (react, monaco) remain as peer deps.
  noExternal: [/@refraction-ui\//],
  external: ['react', 'react-dom', '@monaco-editor/react', 'react-hook-form'],
  // tsup does not bundle CSS, so copy the default theme stylesheet to
  // dist/styles.css after the JS build completes. Consumers import it via
  // `import '@refraction-ui/react/styles.css'` (see package.json exports).
  onSuccess: 'cp src/styles.css dist/styles.css',
})
