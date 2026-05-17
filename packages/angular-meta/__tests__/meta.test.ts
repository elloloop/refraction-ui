import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Guardrail for `@refraction-ui/angular` — the per-framework Angular meta.
 *
 * This mirrors the intent of `packages/react-meta/__tests__/meta.test.ts`:
 * catch drift between what the meta promises and what it ships.
 *
 * IMPORTANT — why this differs from the React/Astro guardrails:
 *
 *   The React meta ships a fully self-contained build (tsup bundles every
 *   `@refraction-ui/*` package into `dist/*.js` + an embed step inlines the
 *   `.d.ts`). A self-contained build of an *Angular* library via tsup/esbuild
 *   is NOT cleanly achievable, for two independent, fundamental reasons:
 *
 *     1. esbuild cannot emit Angular's `design:paramtypes` decorator metadata.
 *        Components such as `@refraction-ui/angular-table-of-contents`
 *        (`constructor(private el: ElementRef, ...)`) rely on type-based
 *        constructor DI. esbuild explicitly prints
 *        "You have emitDecoratorMetadata enabled but @swc/core was not
 *        installed, skipping swc plugin" and drops the metadata, so DI breaks
 *        at the consumer's runtime (Angular `NG0204`). The only esbuild remedy
 *        (`@swc/core`) is a new external dependency the gold-standard
 *        react-meta does not use.
 *     2. Bundling a multi-component Angular library into a single esbuild
 *        output bypasses the Angular compiler (Ivy partial compilation / the
 *        Angular Package Format). The community-standard tool for this is
 *        `ng-packagr` + `@angular/compiler-cli` — also new external deps,
 *        not installed.
 *
 *   Until that build story is resolved (tracked separately), the most this
 *   guardrail can enforce is the SOURCE-LEVEL wiring invariant: every adapter
 *   the meta promises is declared as a workspace dependency and re-exported,
 *   and the analytics sink factories are reachable through the adapter chain.
 *   The self-contained-artifact assertion is intentionally `it.skip`-ped with
 *   the blocker recorded inline, so the gap is visible (not silently lost) and
 *   trivially flipped to `it(...)` once a real Angular build lands.
 */

const testDir = dirname(fileURLToPath(import.meta.url))
const packageDir = join(testDir, '..')
const repoRoot = join(packageDir, '..', '..')

const metaPkg = JSON.parse(
  readFileSync(join(packageDir, 'package.json'), 'utf8')
) as { devDependencies?: Record<string, string> }

const metaIndex = readFileSync(join(packageDir, 'src', 'index.ts'), 'utf8')

function referencedAdapters(): string[] {
  const out = new Set<string>()
  for (const m of metaIndex.matchAll(
    /from\s+['"](@refraction-ui\/angular-[a-z-]+)['"]/g
  )) {
    out.add(m[1])
  }
  return [...out]
}

describe('@refraction-ui/angular (meta package)', () => {
  it('re-exports the analytics adapter (sink fan-out entry point)', () => {
    expect(metaIndex).toMatch(
      /export \* from ['"]@refraction-ui\/angular-analytics['"]/
    )
  })

  it('every re-exported adapter is a declared workspace devDependency', () => {
    const devDeps = metaPkg.devDependencies ?? {}
    const missing = referencedAdapters().filter((name) => !(name in devDeps))
    expect(missing).toEqual([])
  })

  it('surfaces the GA4/Azure/PostHog sink factories through angular-analytics', () => {
    const adapter = readFileSync(
      join(repoRoot, 'packages', 'angular-analytics', 'src', 'index.ts'),
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
  })

  it('angular-analytics declares the private sink packages as dependencies', () => {
    const pkg = JSON.parse(
      readFileSync(
        join(repoRoot, 'packages', 'angular-analytics', 'package.json'),
        'utf8'
      )
    ) as { dependencies?: Record<string, string> }
    const deps = pkg.dependencies ?? {}

    for (const sink of [
      '@refraction-ui/analytics-sink-ga4',
      '@refraction-ui/analytics-sink-app-insights',
      '@refraction-ui/analytics-sink-posthog',
    ]) {
      expect(deps[sink]).toBeDefined()
    }
  })

  // BLOCKED: a self-contained tsup/esbuild bundle of the Angular meta is not
  // cleanly achievable (decorator metadata + Angular compiler — see the file
  // header). Kept visible as a skipped invariant rather than silently dropped.
  it.skip('ships a self-contained dist with NO @refraction-ui/* references', () => {
    const distDir = join(packageDir, 'dist')
    expect(existsSync(distDir)).toBe(true)
    const indexJs = readFileSync(join(distDir, 'index.js'), 'utf8')
    expect(indexJs).not.toMatch(/from ['"]@refraction-ui\//)
  })
})
