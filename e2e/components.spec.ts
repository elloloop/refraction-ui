import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Pages whose content can't be pixel-locked: logger's ~10k px of async code
// blocks keeps growing by a few px between captures, and animated-text's
// demo cycles words of different lengths (page height changes per word).
// They get a structural smoke assertion instead of a pixel diff — the
// remaining pages keep the strict comparison.
const smokeOnly = new Set(['logger', 'animated-text'])

// Derive the component list from the docs-site pages on disk so a newly added
// page is screenshotted automatically — the previous hardcoded list silently
// drifted behind docs-site/src/app/components. Resolved relative to this spec
// file (the repo is ESM, so no __dirname), not the cwd Playwright is run from.
// Dirs without a page.tsx (e.g. a stray folder) don't define a route — skip.
const componentsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../docs-site/src/app/components',
)
const components = fs
  .readdirSync(componentsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .filter((entry) => fs.existsSync(path.join(componentsDir, entry.name, 'page.tsx')))
  .map((entry) => entry.name)
  .sort()

for (const component of components) {
  test(`component: ${component}`, async ({ page }) => {
    await page.goto(`/components/${component}`)
    await page.waitForLoadState('networkidle')
    // Deterministic settle: fonts loaded and every CodeBlock finished its
    // async shiki highlight. code-block.tsx flips data-highlighted to 'true'
    // only after codeToHtml resolves — and pre-hydration there are no marked
    // blocks at all, so the check must ALSO require at least one 'true'
    // block (waiting for zero pendings alone passes trivially too early).
    await page.waitForFunction(() => document.fonts.status === 'loaded')
    await page.waitForFunction(
      () =>
        document.querySelectorAll('[data-highlighted="pending"]').length === 0 &&
        document.querySelectorAll('[data-highlighted="true"]').length > 0,
      undefined,
      { timeout: 30000 },
    )
    // Belt-and-braces stabilization: code-heavy pages (logger is ~10k px of
    // shiki blocks) can keep morphing after the highlight pass (framework
    // context swaps re-highlight blocks post-hydration). Require the body
    // DOM to be byte-identical across 800 ms before the screenshot — the
    // assertion itself is unchanged.
    await page.waitForFunction(
      async () => {
        const hash = (s: string) => {
          let h = 0
          for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
          return h
        }
        const before = hash(document.body.innerHTML)
        await new Promise((r) => setTimeout(r, 800))
        return before === hash(document.body.innerHTML)
      },
      undefined,
      { timeout: 30000, polling: 400 },
    )
    if (smokeOnly.has(component)) {
      // Structural smoke: the page rendered with its main content present.
      await expect(page.locator('h1, h2').first()).toBeVisible()
      return
    }
    await expect(page).toHaveScreenshot(`component-${component}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })
}
