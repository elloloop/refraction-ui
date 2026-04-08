import { test, expect } from '@playwright/test'

const examples = [
  { name: 'teamspace', pages: ['', '/app', '/app/channels'] },
  { name: 'cortex', pages: ['', '/app', '/app/settings'] },
  { name: 'momento', pages: ['', '/app', '/app/profile', '/app/explore'] },
  { name: 'grandview', pages: ['', '/app', '/app/booking'] },
  { name: 'maison', pages: ['', '/app', '/app/product'] },
  { name: 'ember', pages: ['', '/app', '/app/reservation'] },
  { name: 'verve', pages: ['', '/app', '/app/product', '/app/cart'] },
  { name: 'insightiq', pages: ['', '/app', '/app/settings'] },
  { name: 'vitalink', pages: ['', '/app', '/app/appointments'] },
  { name: 'learnhub', pages: ['', '/app', '/app/course'] },
  { name: 'clearbank', pages: ['', '/app', '/app/transfer'] },
  { name: 'studiox', pages: ['', '/app', '/app/project'] },
]

for (const example of examples) {
  for (const pagePath of example.pages) {
    const testName = `example: ${example.name}${pagePath || ' (landing)'}`
    test(testName, async ({ page }) => {
      await page.goto(`/examples/${example.name}${pagePath}`)
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveScreenshot(
        `example-${example.name}${pagePath.replace(/\//g, '-') || '-landing'}.png`,
        { fullPage: true, maxDiffPixelRatio: 0.01 }
      )
    })
  }
}
