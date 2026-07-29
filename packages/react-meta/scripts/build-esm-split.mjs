#!/usr/bin/env node
/**
 * build-esm-split.mjs — module-granular ESM build for `@refraction-ui/react`.
 *
 * Why this exists (tree-shaking):
 * tsup collapses all ~128 private react-* adapters into ONE dist/index.js.
 * That single module is full of impure top-level calls (`React.forwardRef`,
 * `cva`, `createContext`, …), and bundlers cannot drop unused impure
 * statements *within* a module — `sideEffects: false` only works at module
 * granularity. Result: `import { Button } from '@refraction-ui/react'`
 * bundled the entire library (~500 kB minified).
 *
 * This script emits the ESM build as one module per adapter
 * (dist/react-button.js, …) with shared headless cores auto-split into
 * chunks, then generates dist/index.js as pure re-export statements (the
 * exact export surface of src/index.ts, types stripped). Unused adapter
 * modules never enter a consumer's module graph, so `sideEffects: false`
 * tree-shakes them away — importing a single component now costs ~8 kB.
 *
 * The CJS build (dist/index.cjs) intentionally stays a single bundled file
 * (require() graphs are not tree-shaken), and d.ts emission is unchanged —
 * both still come from tsup.
 *
 * Runs AFTER `tsup` in the package build script (tsup `clean`s dist first,
 * and the adapter dists it depends on are built earlier by the turbo graph).
 */
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const pkgDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const requireFromMeta = createRequire(join(pkgDir, 'package.json'))
const ts = requireFromMeta('typescript')
// esbuild is not a direct dep of this package; borrow tsup's instance.
const requireFromTsup = createRequire(requireFromMeta.resolve('tsup'))
const esbuild = requireFromTsup('esbuild')

const srcFile = join(pkgDir, 'src', 'index.ts')
const distDir = join(pkgDir, 'dist')

// 1. Strip types from the source export surface (pure re-export module).
//    removeComments: dist must not carry the src doc comments (the meta
//    regression test asserts the built entry contains no 'react-hook-form'
//    string — the comments mention it; bundling used to strip them).
const srcText = readFileSync(srcFile, 'utf8')
let jsText = ts.transpileModule(srcText, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
    removeComments: true,
  },
}).outputText

// 2. Collect every adapter specifier (`export … from '@refraction-ui/react-x'`).
const SPECIFIER = /from\s+['"]@refraction-ui\/(react-[a-z0-9-]+)['"]/g
const shortNames = [...new Set([...jsText.matchAll(SPECIFIER)].map((m) => m[1]))].sort()
if (shortNames.length < 100) {
  throw new Error(`expected 100+ adapter specifiers in src/index.ts, found ${shortNames.length}`)
}

// 3. Bundle each adapter dist as an entry; shared deps split into chunks.
const entryPoints = {}
for (const short of shortNames) {
  const adapterDist = join(pkgDir, '..', short, 'dist', 'index.js')
  if (!existsSync(adapterDist)) {
    throw new Error(`missing adapter build: ${adapterDist} (run turbo build first)`)
  }
  entryPoints[short] = adapterDist
}

const result = await esbuild.build({
  entryPoints,
  bundle: true,
  splitting: true,
  format: 'esm',
  outdir: distDir,
  entryNames: '[name]',
  chunkNames: 'chunk-[hash]',
  // Keep parity with the tsup build's externals (+ react/jsx-runtime, which
  // the adapter dists import directly and tsup externalises automatically).
  external: ['react', 'react-dom', 'react/jsx-runtime', 'react-hook-form'],
  sourcemap: true,
  target: 'es2022',
  metafile: true,
  logLevel: 'warning',
})
if (result.errors.length > 0) {
  throw new Error(`esbuild split build failed: ${result.errors.length} errors`)
}

// 4. Generate dist/index.js: the same export surface, pointing at the
//    per-adapter modules. Kept as pure re-export statements so every
//    unused module stays droppable by consumer bundlers. This overwrites
//    tsup's single-file ESM bundle (kept in the tsup config only so d.ts
//    output is unchanged); its now-stale sourcemap is removed.
jsText = jsText.replace(SPECIFIER, (match, short) => match.replace(`@refraction-ui/${short}`, `./${short}.js`))
writeFileSync(join(distDir, 'index.js'), jsText.endsWith('\n') ? jsText : jsText + '\n')
if (existsSync(join(distDir, 'index.js.map'))) {
  rmSync(join(distDir, 'index.js.map'))
}

console.log(
  `[build-esm-split] wrote dist/index.js + ${shortNames.length} adapter entries, ` +
    `${Object.keys(result.metafile?.outputs ?? {}).length} total output files`,
)
