import { test, expect } from '@playwright/test'

const themes = ['refraction', 'luxe', 'warm', 'signal', 'pulse', 'mono']

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

    // Open theme switcher and select theme
    await page.click('[data-testid="theme-switcher"]') // may need to adjust selector
    await page.click(`text=${theme.charAt(0).toUpperCase() + theme.slice(1)}`)
    await page.waitForTimeout(500) // wait for theme transition

    await expect(page).toHaveScreenshot(`button-theme-${theme}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    })
  })
}
