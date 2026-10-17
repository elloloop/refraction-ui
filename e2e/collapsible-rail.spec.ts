import { test, expect, type Page } from '@playwright/test'

// Behaviour of the docs-site demo (the first rail on the page). The pixels are
// covered by components.spec.ts; these tests drive the real CSS and the hook.
const KEY = 'rfr-docs-collapsible-rail'

async function openDemo(page: Page, width: number) {
  await page.setViewportSize({ width, height: 844 })
  await page.goto('/components/collapsible-rail/')
  const rail = page.locator('[data-slot="collapsible-rail"]').first()
  return { rail, edge: rail.locator('[data-slot="rail-edge-toggle"]') }
}

test('collapsible rail: the edge control works from the keyboard and the width is remembered', async ({ page }) => {
  const { rail, edge } = await openDemo(page, 1280)
  // The hook opens the rail once it knows the viewport, i.e. after hydration.
  await expect(rail).toHaveAttribute('data-open', 'true')
  await expect(rail).toHaveAttribute('data-collapsed', 'false')
  await expect(edge).toHaveAccessibleName('Collapse navigation')
  await expect.poll(async () => Math.round((await rail.boundingBox())!.width)).toBe(208)

  await edge.focus()
  await page.keyboard.press('Enter')
  await expect(rail).toHaveAttribute('data-collapsed', 'true')
  await expect(edge).toHaveAttribute('aria-expanded', 'false')
  await expect(edge).toHaveAccessibleName('Expand navigation')
  await expect(edge).toBeFocused()
  await expect.poll(async () => Math.round((await rail.boundingBox())!.width)).toBe(56)
  expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBe('true')

  await page.reload()
  await expect(rail).toHaveAttribute('data-open', 'true')
  await expect(rail).toHaveAttribute('data-collapsed', 'true')
  await edge.focus()
  await page.keyboard.press('Space')
  await expect(rail).toHaveAttribute('data-collapsed', 'false')
  expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBe('false')
})

test('collapsible rail: on a narrow screen it is an overlay that takes and returns focus', async ({ page }) => {
  const { rail, edge } = await openDemo(page, 390)
  await expect(rail).toHaveAttribute('data-mobile', 'true')
  await expect(rail).toHaveAttribute('data-open', 'false')
  await expect(rail).toHaveAttribute('inert', '')
  // Closed means off screen, not just transparent.
  await expect
    .poll(async () => {
      const box = (await rail.boundingBox())!
      return Math.round(box.x + box.width)
    })
    .toBeLessThanOrEqual(0)

  const opener = page.getByRole('button', { name: 'Open navigation', exact: true }).first()
  await opener.focus()
  await page.keyboard.press('Enter')
  await expect(rail).toHaveAttribute('data-open', 'true')
  await expect(rail).not.toHaveAttribute('inert', '')
  await expect(edge).toBeFocused()
  await expect.poll(async () => Math.round((await rail.boundingBox())!.x)).toBe(0)

  await page.keyboard.press('Escape')
  await expect(rail).toHaveAttribute('data-open', 'false')
  await expect(opener).toBeFocused()

  await opener.click()
  await expect(rail).toHaveAttribute('data-open', 'true')
  const backdrop = page.getByRole('button', { name: 'Close navigation', exact: true })
  await backdrop.click({ position: { x: 340, y: 600 } })
  await expect(rail).toHaveAttribute('data-open', 'false')
  await expect(backdrop).toHaveCount(0)
  // Using the overlay never records a width for wide screens.
  expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBeNull()
})

test('collapsible rail: a closed overlay leaves from the reading-start edge in right-to-left text', async ({ page }) => {
  const { rail } = await openDemo(page, 390)
  await expect(rail).toHaveAttribute('data-mobile', 'true')
  await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'))
  await expect.poll(async () => Math.round((await rail.boundingBox())!.x)).toBeGreaterThanOrEqual(390)
  await page.getByRole('button', { name: 'Open navigation', exact: true }).first().click()
  await expect(rail).toHaveAttribute('data-open', 'true')
  await expect
    .poll(async () => {
      const box = (await rail.boundingBox())!
      return Math.round(box.x + box.width)
    })
    .toBe(390)
})
