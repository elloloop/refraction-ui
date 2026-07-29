import { defineConfig } from 'tsup'

// The root ESM build from tsup (a single bundled dist/index.js) defeats
// tree-shaking (one module full of impure top-level `forwardRef`/`cva`
// calls — bundlers can only drop whole modules). It is kept here only for
// d.ts parity (tsup emits index.d.ts + index.d.cts); scripts/
// build-esm-split.mjs then OVERWRITES dist/index.js with the
// module-granular ESM build. The CJS root build stays bundled (require()
// graphs are not tree-shaken).
const shared = {
  dts: true,
  sourcemap: true,
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
} as const

export default defineConfig([
  {
    ...shared,
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    clean: true,
  },
  {
    ...shared,
    entry: ['src/theme.ts', 'src/form.ts'],
    format: ['esm', 'cjs'],
    // Never clean here — it would wipe the root build from the first config.
    clean: false,
  },
])
