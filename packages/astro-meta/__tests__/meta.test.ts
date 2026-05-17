import { describe, it, expect, beforeAll } from 'vitest'
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Guardrail for `@refraction-ui/astro` — the per-framework Astro meta.
 *
 * This is the missing invariant that let the package drift: the published
 * artifact must be fully SELF-CONTAINED. Every `@refraction-ui/*` package the
 * meta depends on (private framework adapters, headless cores, the analytics
 * sinks, AND `@refraction-ui/shared`) must be embedded as copied source with
 * its imports rewritten to relative paths.
 *
 * Astro components are authored as `.astro` single-file components — a format
 * the consumer's own Astro toolchain compiles, NOT JavaScript that tsup/esbuild
 * can bundle. So unlike the React meta (which ships compiled `dist/*.js` +
 * embedded `.d.ts`), the Astro meta ships raw `.astro`/`.ts`/`.tsx` source with
 * every cross-package import rewritten to a relative path inside `dist/`. The
 * self-contained invariant is therefore expressed over the shipped source:
 * NO shipped module may `import`/`export ... from` / dynamic `import()` /
 * `require()` a bare `@refraction-ui/*` specifier.
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

beforeAll(() => {
  if (!existsSync(distDir)) {
    execFileSync('node', ['build.mjs'], { cwd: packageDir, stdio: 'inherit' })
  }
})

describe('@refraction-ui/astro (meta package)', () => {
  it('produces a dist/ with the generated entry', () => {
    expect(existsSync(distDir)).toBe(true)
    expect(existsSync(join(distDir, 'index.ts'))).toBe(true)
  })

  it('embeds @refraction-ui/shared instead of referencing it', () => {
    // shared must be copied in as source; the meta must NOT keep a runtime
    // reference to the (about-to-be-private) `@refraction-ui/shared` package.
    expect(existsSync(join(distDir, 'shared', 'index.ts'))).toBe(true)
  })

  it('embeds the private analytics sink packages (GA4 / Azure / PostHog)', () => {
    for (const sink of [
      'analytics-sink-ga4',
      'analytics-sink-app-insights',
      'analytics-sink-posthog',
    ]) {
      expect(existsSync(join(distDir, sink, 'index.ts'))).toBe(true)
    }
    // The optional, lazy PostHog session-replay entry must also be embedded
    // so the `@refraction-ui/analytics-sink-posthog/replay` subpath does not
    // leak through the astro-analytics adapter.
    expect(
      existsSync(join(distDir, 'analytics-sink-posthog', 'replay.ts'))
    ).toBe(true)
  })

  it('ships NO bare @refraction-ui/* import, export, dynamic import or require', () => {
    const offenders: string[] = []

    for (const file of listShippedFiles(distDir)) {
      const text = readFileSync(file, 'utf8')

      if (
        /(?:^|[^.\w])(?:import|export)\s[^;]*?from\s*['"]@refraction-ui\//.test(
          text
        ) ||
        /\bimport\s*\(\s*['"]@refraction-ui\//.test(text) ||
        /\brequire\s*\(\s*['"]@refraction-ui\//.test(text) ||
        /(?:^|[^.\w])import\s+['"]@refraction-ui\//.test(text)
      ) {
        offenders.push(file.replace(distDir + '/', ''))
      }
    }

    expect(offenders).toEqual([])
  })

  it('surfaces the analytics sink factories through the embedded adapter', () => {
    const adapter = readFileSync(
      join(distDir, 'astro-analytics', 'index.ts'),
      'utf8'
    )

    for (const name of [
      'createGA4Sink',
      'createAppInsightsSink',
      'createPostHogSink',
      'startSessionReplay',
    ]) {
      expect(adapter).toContain(name)
    }
    // ...but only via embedded relative paths, never the private specifier.
    expect(adapter).not.toMatch(/from\s*['"]@refraction-ui\//)
  })
})
