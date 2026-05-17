import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Post-build: guarantee the RSC `'use client'` directive is the module's
// directive prologue in every published JS entry of @refraction-ui/react.
//
// Why a post-build step and not a source directive / esbuild `banner`:
// every entry (`.`, `./theme`, `./form`) re-exports React providers / hooks
// (createContext, useContext, …). Without a leading `"use client"`,
// importing `@refraction-ui/react` from a Next.js App Router Server
// Component (e.g. mounting a Provider in `app/layout.tsx`) fails
// `next build` with the "createContext only works in a Client Component"
// RSC error. tsup's pipeline strips both a source-level directive and an
// esbuild `banner` here: esbuild drops non-standard directives when
// bundling, and the `treeshake: true` (Rollup) pass removes a banner string
// as a side-effect-free expression. Rewriting the emitted files last is the
// only deterministic place. Mirrors scripts/embed-internal-types.mjs.

const distDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist')

// All published JS entries (see package.json `exports`). Shared chunks are
// imported by these so the boundary on the entry is sufficient.
const entries = [
  'index.js',
  'index.cjs',
  'theme.js',
  'theme.cjs',
  'form.js',
  'form.cjs',
]

// Already-present directive (any quote style, optional semicolon), allowing
// a leading BOM / whitespace / blank lines before it — idempotent.
const alreadyDirective = /^﻿?\s*(['"])use client\1\s*;?/

let patched = 0
for (const name of entries) {
  const file = resolve(distDir, name)
  let code
  try {
    code = await readFile(file, 'utf8')
  } catch (err) {
    if (err.code === 'ENOENT') continue // entry not emitted (e.g. format off)
    throw err
  }
  if (alreadyDirective.test(code)) continue
  await writeFile(file, `'use client';\n${code}`, 'utf8')
  patched += 1
}

console.log(
  `[ensure-use-client] prepended 'use client' to ${patched} entr${
    patched === 1 ? 'y' : 'ies'
  }`,
)
