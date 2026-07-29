import { test, expect } from '@playwright/test'

const themes = ['refraction', 'luxe', 'warm', 'signal', 'pulse', 'mono']

// Must match STORAGE_KEY in docs-site/src/components/theme-switcher.tsx —
// a successful selection persists the theme key there, which makes it a
// deterministic end-state to assert on (the dropdown closes on select, so
// the option's aria-selected can't be checked after the fact).
const THEME_STORAGE_KEY = 'rfr-theme-preset'

// In dev the first click can land before hydration and be a no-op. Retry the
// action until the expected end state holds — like a user clicking again when
// nothing happens. The assertion itself is never relaxed.
async function retryUntil(action: () => Promise<void>, assertion: () => Promise<void>) {
  await expect(async () => {
    await action()
    await assertion()
  }).toPass({ timeout: 15_000 })
}

test('homepage', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot('home.png', { fullPage: true })
})

// Screenshot the button page under each theme
for (const theme of themes) {
  test(`button page with ${theme} theme`, async ({ page }) => {
    await page.goto('/components/button')
    await page.waitForLoadState('networkidle')

    const switcher = page.locator('[data-testid="theme-switcher"]')
    const themeName = theme.charAt(0).toUpperCase() + theme.slice(1)
    const option = page.locator(`[role="listbox"] [role="option"]:has-text("${themeName}")`)
    await retryUntil(
      async () => {
        // The trigger toggles, so only click it while the dropdown is closed —
        // otherwise a retry would close the listbox a previous attempt opened.
        if ((await switcher.getAttribute('aria-expanded')) !== 'true') {
          await switcher.click()
        }
        // The option only exists while the dropdown is open; a short timeout
        // lets toPass retry instead of stalling on a pre-hydration no-op.
        await option.click({ timeout: 2_000 })
      },
      async () => {
        const saved = await page.evaluate((key) => localStorage.getItem(key), THEME_STORAGE_KEY)
        expect(saved).toBe(theme)
      },
    )

    await expect(page).toHaveScreenshot(`button-theme-${theme}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })
}
