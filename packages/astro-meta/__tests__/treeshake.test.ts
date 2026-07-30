import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { execFileSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Tree-shaking guardrail for `@refraction-ui/astro`.
 *
 * The Astro meta ships raw, module-granular source (one folder per embedded
 * package, `sideEffects: false`, an entry of pure re-export statements), so
 * unlike the React meta there is no single-file impure bundle to split. The
 * failure mode that actually bites consumers is different: every module in
 * the re-export graph must still be RESOLVED at consumer build time (long
 * before tree-shaking runs), so a single statically-analyzable
 * `import('optional-peer')` anywhere in the graph fails the consumer's whole
 * build when that peer is not installed. `posthog-js` and
 * `@microsoft/applicationinsights-web` (optional peers of the embedded
 * analytics sinks) did exactly that — a consumer importing one component
 * could not `astro build` at all.
 *
 * Two layers of lock-in:
 *
 *  1. Static invariants over the shipped dist: the entry is pure re-exports
 *     (the property that makes the graph tree-shakeable), and NO module may
 *     reference a bare specifier other than the declared `astro` peer —
 *     optional vendor SDKs must stay non-statically-analyzable (see the
 *     `*Specifier` consts in the analytics sinks).
 *
 *  2. A real consumer probe: `astro build` a throwaway site (in a temp dir,
 *     WITHOUT the optional peers installed) whose only page imports a single
 *     component from the meta, then assert the build succeeds and the server
 *     bundle contains that component — and nothing from the rest of the
 *     library.
 */

const testDir = dirname(fileURLToPath(import.meta.url))
const packageDir = join(testDir, '..')
const distDir = join(packageDir, 'dist')

const SHIPPED_EXTENSIONS = ['.ts', '.tsx', '.astro', '.js', '.cjs', '.mjs']

function listShippedFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...listShippedFiles(path))
      continue
    }
    if (SHIPPED_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
      files.push(path)
    }
  }
  return files
}

/** Collect every literal module specifier a file references. */
function referencedSpecifiers(text: string): string[] {
  // Strip comments first: prose like "a literal `import('posthog-js')`" or
  // `you can't wrap from "5 — strongly agree"` must not match the patterns
  // below. (Line comments are stripped only at line start so `https://…`
  // strings survive.)
  const code = text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
  const specs: string[] = []
  const patterns = [
    // static import / export ... from 'x' ([^;] spans multiline clauses)
    /(?:^|[^.\w])(?:import|export)\s[^;]*?from\s*['"]([^'"]+)['"]/g,
    // side-effect import 'x'
    /(?:^|[^.\w])import\s+['"]([^'"]+)['"]/g,
    // dynamic import('x') — literal only; non-literal is unanalyzable by
    // consumer bundlers too, which is exactly what optional peers need
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    // require('x')
    /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ]
  for (const re of patterns) {
    for (const match of code.matchAll(re)) specs.push(match[1])
  }
  return specs
}

/** Bare specifiers the shipped source may reference statically: the declared
 * `astro` peer, its subpaths and its virtual (`astro:*`) modules. */
function isAllowedBareSpecifier(spec: string): boolean {
  return spec === 'astro' || spec.startsWith('astro/') || spec.startsWith('astro:')
}

beforeAll(() => {
  if (!existsSync(distDir)) {
    execFileSync('node', ['build.mjs'], { cwd: packageDir, stdio: 'inherit' })
  }
})

describe('@refraction-ui/astro tree-shaking', () => {
  it('entry is a pure re-export module (no impure top-level code)', () => {
    const entry = readFileSync(join(distDir, 'index.ts'), 'utf8')
    // Strip block + line comments, then every remaining statement must be a
    // re-export (`export * from`, `export { … } from`, `export type … from`)
    // of an embedded relative path — anything else executes at import time
    // and would poison tree-shaking for every consumer.
    const stripped = entry
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
    const statements = stripped
      .split(/(?<=['"])\s*\n/)
      .map((s) => s.trim())
      .filter(Boolean)
    expect(statements.length).toBeGreaterThan(100)
    for (const statement of statements) {
      expect(statement).toMatch(
        /^export\s+(?:type\s+)?(?:\*|\{[\s\S]*\})\s+from\s*['"]\.\//,
      )
    }
  })

  it('ships NO statically-referenced bare specifier besides the astro peer', () => {
    const offenders: string[] = []
    for (const file of listShippedFiles(distDir)) {
      const text = readFileSync(file, 'utf8')
      for (const spec of referencedSpecifiers(text)) {
        if (spec.startsWith('.') || isAllowedBareSpecifier(spec)) continue
        offenders.push(`${file.replace(distDir + '/', '')} -> ${spec}`)
      }
    }
    // Optional vendor SDKs (e.g. `posthog-js`,
    // `@microsoft/applicationinsights-web`) must never appear here: a literal
    // specifier is resolved at consumer build time and fails the build when
    // the peer is not installed. Keep them behind a non-analyzable
    // `import(specifierConst)` like the analytics sinks do.
    expect(offenders).toEqual([])
  })

  describe('consumer probe (real astro build, optional peers NOT installed)', () => {
    let siteDir: string

    beforeAll(() => {
      // Assemble the smallest possible consumer: one page importing ONE
      // component from the meta, the meta copied in as an installed package,
      // astro itself linked (it is the declared peer). Deliberately NO
      // `posthog-js` / `@microsoft/applicationinsights-web` — a consumer who
      // never opted into the analytics client SDKs does not have them.
      siteDir = mkdtempSync(join(tmpdir(), 'astro-meta-treeshake-'))
      mkdirSync(join(siteDir, 'src', 'pages'), { recursive: true })
      mkdirSync(join(siteDir, 'node_modules', '@refraction-ui'), {
        recursive: true,
      })
      writeFileSync(
        join(siteDir, 'package.json'),
        JSON.stringify({ name: 'astro-meta-treeshake-probe', type: 'module' }),
      )
      cpSync(distDir, join(siteDir, 'node_modules', '@refraction-ui', 'astro', 'dist'), {
        recursive: true,
      })
      cpSync(
        join(packageDir, 'package.json'),
        join(siteDir, 'node_modules', '@refraction-ui', 'astro', 'package.json'),
      )
      symlinkSync(
        join(packageDir, '..', '..', 'node_modules', 'astro'),
        join(siteDir, 'node_modules', 'astro'),
        'dir',
      )
      writeFileSync(
        join(siteDir, 'src', 'pages', 'index.astro'),
        `---\nimport { Pagination } from '@refraction-ui/astro'\n---\n<html><body>\n<Pagination page={2} totalPages={5} />\n</body></html>\n`,
      )
      // Minimal adapter so `output: 'server'` retains the server bundle.
      writeFileSync(
        join(siteDir, 'stub-entry.mjs'),
        `export function createExports() {\n  return { default: () => new Response('stub') }\n}\n`,
      )
      writeFileSync(
        join(siteDir, 'astro.config.mjs'),
        `import { defineConfig } from 'astro/config'\n` +
          `export default defineConfig({\n` +
          `  output: 'server',\n` +
          `  adapter: {\n` +
          `    name: 'stub-adapter',\n` +
          `    hooks: {\n` +
          `      'astro:config:done': ({ setAdapter }) => {\n` +
          `        setAdapter({\n` +
          `          name: 'stub-adapter',\n` +
          `          serverEntrypoint: new URL('./stub-entry.mjs', import.meta.url).pathname,\n` +
          `          supportedAstroFeatures: {},\n` +
          `        })\n` +
          `      },\n` +
          `    },\n` +
          `  },\n` +
          `})\n`,
      )
    })

    afterAll(() => {
      rmSync(siteDir, { recursive: true, force: true })
    })

    it(
      'builds standalone and bundles only the imported component server-side',
      () => {
        // Run the real consumer toolchain as a subprocess: the astro CLI in
        // the probe site, exactly as an end user's `astro build` would run.
        const astroBin = join(
          packageDir,
          '..',
          '..',
          'node_modules',
          'astro',
          'bin',
          'astro.mjs',
        )
        execFileSync(process.execPath, [astroBin, 'build'], {
          cwd: siteDir,
          stdio: 'pipe',
          timeout: 110_000,
        })

        const chunksDir = join(siteDir, 'dist', 'server', 'chunks')
        const bundleText = [
          join(siteDir, 'dist', 'server', 'entry.mjs'),
          ...readdirSync(chunksDir).map((f) => join(chunksDir, f)),
        ]
          .filter((f) => existsSync(f))
          .map((f) => readFileSync(f, 'utf8'))
          .join('\n')

        // The imported component IS in the server bundle …
        expect(bundleText).toContain('data-rfr-pagination')
        // … and nothing from the rest of the library rides along. One marker
        // per unrelated area: another component family, a compound component
        // name, the analytics sinks, and the optional vendor SDKs.
        for (const marker of [
          'data-rfr-tabs',
          'data-rfr-chart',
          'KanbanBoard',
          'createPostHogSink',
          'startSessionReplay',
          'posthog-js',
          'applicationinsights',
        ]) {
          expect(bundleText).not.toContain(marker)
        }
      },
      120_000,
    )
  })
})
