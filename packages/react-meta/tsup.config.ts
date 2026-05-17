import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/theme.ts', 'src/form.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  // RSC: the `'use client'` directive lives at the top of each source entry
  // (src/index.ts, src/theme.ts, src/form.ts), NOT here as an esbuild
  // `banner`. A banner string is injected post-bundle and then dropped by
  // this `treeshake` (Rollup) pass as a side-effect-free expression; a real
  // source-level directive is recognised and hoisted to the bundle top so
  // `@refraction-ui/react` is safe to import from a Next.js Server Component.
  // Bundle all @refraction-ui/* workspace packages into the output.
  // Only external deps (React and RHF for the form subpath) remain as peer deps.
  noExternal: [/@refraction-ui\//],
  external: ['react', 'react-dom', 'react-hook-form'],
})
