import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Shared harness for the Astro adapter render tests.
 *
 * The meta build (`build.mjs`) copies every adapter's `src/` — including the
 * `.astro` single-file components — into `packages/astro-meta/dist/<pkg>/`.
 * These tests compile those copied components through the Astro vite plugin
 * (see `vitest.config.ts`) and render them SSR-side with the Container API
 * (`astro/container`). Rendering the meta's dist — rather than the per-package
 * sources — means the suite exercises exactly what consumers install.
 */

export const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..')
export const distDir = join(packageDir, 'dist')

/** Slot content sentinel asserted by fixtures with `expectSlotContent`. */
export const SLOT_SENTINEL = 'rfr-smoke-slot-content'

/**
 * Marker every non-placeholder component is expected to carry unless a fixture
 * says otherwise: a `data-rfr-*` / `rfr-` / `refraction-` hook, an ARIA role,
 * a `data-slot`, a non-empty class attribute, or a semantic root element.
 */
export const DEFAULT_MARKER_RE =
  /data-rfr-|refraction-|\brfr-|\brole=|data-slot|class="[^"]|<(script|svg|button|input|nav|footer|header|aside|textarea|select|table|form|ul|ol|a|img|video|audio|label|main|section|dialog)[\s>]/

export interface PrimaryComponent {
  /** Adapter package folder, e.g. `astro-tabs`. */
  pkg: string
  /** Primary `.astro` file inside `dist/<pkg>/`, e.g. `Tabs.astro`. */
  file: string
}

/** `astro-tabs` -> `Tabs` (mirrors `scripts/generate-astro-stories.mjs`). */
function pascal(folder: string): string {
  return folder
    .replace(/^astro-/, '')
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
}

/**
 * One primary component per adapter package: the `.astro` file matching the
 * package name, else the first one alphabetically (same rule the story
 * generator uses). `overrides` may pin a different file per package.
 */
export function discoverPrimaries(
  overrides: Record<string, string> = {}
): PrimaryComponent[] {
  const primaries: PrimaryComponent[] = []
  for (const entry of readdirSync(distDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith('astro-')) continue
    const dir = join(distDir, entry.name)
    const astroFiles = readdirSync(dir)
      .filter((f) => f.endsWith('.astro'))
      .sort()
    if (astroFiles.length === 0) continue
    const override = overrides[entry.name]
    if (override && !astroFiles.includes(override)) {
      throw new Error(
        `Fixture override ${entry.name}/${override} not found in dist (${astroFiles.join(', ')})`
      )
    }
    const file =
      override ??
      astroFiles.find((f) => f === `${pascal(entry.name)}.astro`) ??
      astroFiles[0]
    primaries.push({ pkg: entry.name, file })
  }
  return primaries
}

/** Build the meta dist once per vitest run when it is missing (turbo normally
 * runs `build` first via the task graph; this keeps bare `vitest` runs green). */
export function ensureDistBuilt(): void {
  if (!existsSync(distDir)) {
    execFileSync('node', ['build.mjs'], { cwd: packageDir, stdio: 'inherit' })
  }
}
