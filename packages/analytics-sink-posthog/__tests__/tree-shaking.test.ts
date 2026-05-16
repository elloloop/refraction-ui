import { describe, it, expect } from 'vitest'
import { build } from 'tsup'
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Bundle a tiny consumer that imports ONLY the main entry, and assert the
 * optional session-replay module (and `posthog-js`/rrweb) is tree-shaken out
 * entirely — i.e. it is never on the event path and a consumer who does not
 * opt into replay pays zero bytes for it.
 */
async function bundle(entryContents: string): Promise<string> {
  const dir = mkdtempSync(join(tmpdir(), 'ph-sink-treeshake-'))
  try {
    const { writeFileSync } = await import('node:fs')
    const entry = join(dir, 'entry.ts')
    writeFileSync(entry, entryContents)
    await build({
      entry: [entry],
      outDir: dir,
      format: ['esm'],
      dts: false,
      sourcemap: false,
      treeshake: true,
      silent: true,
      // posthog-js is an optional peer reached only via dynamic import.
      external: ['posthog-js'],
      config: false,
    })
    const out = readdirSync(dir).find(
      (f) => f.endsWith('.js') || f.endsWith('.mjs'),
    )
    if (!out) throw new Error('no bundle produced')
    return readFileSync(join(dir, out), 'utf8')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

describe('tree-shaking — replay module is excluded when disabled', () => {
  it('main-entry-only consumer does not pull in the replay module', async () => {
    const code = await bundle(
      `import { createPostHogSink } from '${pkgRoot}/src/index.ts'\n` +
        `export const sink = createPostHogSink({ apiKey: 'k' })\n`,
    )
    // Replay-only identifiers must not appear in a sink-only bundle.
    expect(code).not.toContain('startSessionReplay')
    expect(code).not.toContain('startSessionRecording')
    expect(code).not.toContain('stopSessionRecording')
    expect(code).not.toContain('SessionReplayHandle')
    expect(code).not.toContain('enforceConsent')
  }, 60_000)

  it('http-only consumer does not statically bundle posthog-js', async () => {
    const code = await bundle(
      `import { createPostHogHttpSink } from '${pkgRoot}/src/index.ts'\n` +
        `export const sink = createPostHogHttpSink({ apiKey: 'k' })\n`,
    )
    // No static import of the browser library on the default path.
    expect(code).not.toMatch(/from\s*["']posthog-js["']/)
    expect(code).not.toMatch(/require\(\s*["']posthog-js["']\s*\)/)
  }, 60_000)

  it('the replay entry is a separate chunk a consumer must opt into', async () => {
    // Importing the replay entry explicitly does work — proving it exists,
    // just behind its own entry point and not the default one.
    const code = await bundle(
      `import { startSessionReplay } from '${pkgRoot}/src/replay.ts'\n` +
        `export const start = startSessionReplay\n`,
    )
    expect(code).toContain('startSessionReplay')
  }, 60_000)
})
