import { test, expect } from '@playwright/test'

for (const layout of ['wide', 'mobile', 'narrow panel'] as const) {
  test(`page header: actions respect available width (${layout})`, async ({ page }) => {
    await page.setViewportSize({ width: layout === 'mobile' ? 390 : 1280, height: 844 })
    await page.goto('/components/page-header')
    await page.evaluate(() => document.fonts.ready)
    const title = page.getByRole('heading', { name: 'Members', exact: true })
    const header = title.locator('..').locator('..')
    await expect(title).toBeVisible()
    if (layout === 'narrow panel') {
      // Constrain the component, not the viewport: embedded desktop panels must wrap too.
      await header.evaluate((element) => { element.style.width = '280px' })
    }
    await expect(async () => {
      const geometry = await header.evaluate((element) => {
        const text = element.firstElementChild!
        const actions = element.lastElementChild!
        const heading = text.querySelector('h1')!
        const textRect = text.getBoundingClientRect()
        const actionsRect = actions.getBoundingClientRect()
        const headingRect = heading.getBoundingClientRect()
        const containerRect = element.getBoundingClientRect()
        return {
          textBottom: textRect.bottom,
          textTop: textRect.top,
          textRight: textRect.right,
          actionsTop: actionsRect.top,
          actionsLeft: actionsRect.left,
          actionsRight: actionsRect.right,
          containerRight: containerRect.right,
          titleHeight: headingRect.height,
          titleLineHeight: Number.parseFloat(getComputedStyle(heading).lineHeight),
        }
      })
      expect(geometry.titleHeight).toBeLessThanOrEqual(geometry.titleLineHeight + 1)
      expect(geometry.actionsRight).toBeLessThanOrEqual(geometry.containerRight + 1)
      if (layout === 'wide') {
        expect(geometry.actionsTop).toBeLessThan(geometry.textBottom)
        expect(geometry.actionsLeft).toBeGreaterThanOrEqual(geometry.textRight)
      } else {
        expect(geometry.actionsTop).toBeGreaterThanOrEqual(geometry.textBottom)
      }
    }).toPass({ timeout: 5_000 })
  })
}
