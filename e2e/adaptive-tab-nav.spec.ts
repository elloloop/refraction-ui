import { test, expect, type Page } from '@playwright/test'

// Behaviour of the docs-site demo. The pixels are covered by components.spec.ts;
// these tests drive the real CSS, the keyboard and the breakpoint.
async function openDemo(page: Page, width: number) {
  await page.setViewportSize({ width, height: 844 })
  await page.goto('/components/adaptive-tab-nav/')
  const nav = page.getByRole('navigation', { name: 'Sections', exact: true })
  const tab = (name: string) => nav.getByRole('button', { name, exact: true })
  // A click handler only works once the page has hydrated.
  await expect(async () => {
    await tab('Inbox').click()
    await expect(tab('Inbox')).toHaveAttribute('aria-current', 'page', { timeout: 500 })
  }).toPass({ timeout: 15_000 })
  await tab('Home').click()
  await expect(tab('Home')).toHaveAttribute('aria-current', 'page')
  return { nav, tab }
}

const position = (page: Page, name: string) =>
  page
    .getByRole('navigation', { name, exact: true })
    .evaluate((element) => {
      const rect = element.getBoundingClientRect()
      return {
        position: getComputedStyle(element).position,
        top: Math.round(rect.top),
        bottom: Math.round(rect.bottom),
        left: Math.round(rect.left),
        width: Math.round(rect.width),
        paddingBottom: Number.parseFloat(getComputedStyle(element).paddingBottom),
      }
    })

test('adaptive tab nav: the tabs work from the keyboard, in order', async ({ page, isMobile }) => {
  const { tab } = await openDemo(page, 1280)
  // WebKit on a phone does not move focus between buttons with Tab, so there
  // the test focuses each tab itself and checks Enter and Space only.
  const next = async (name: string) => {
    if (isMobile) await tab(name).focus()
    else await page.keyboard.press('Tab')
    await expect(tab(name)).toBeFocused()
  }
  await tab('Home').focus()
  await next('Inbox')
  await page.keyboard.press('Enter')
  await expect(tab('Inbox')).toHaveAttribute('aria-current', 'page')
  await expect(tab('Home')).not.toHaveAttribute('aria-current', 'page')
  await next('Settings')
  await page.keyboard.press('Space')
  await expect(tab('Settings')).toHaveAttribute('aria-current', 'page')
  await expect(tab('Settings')).toBeFocused()
  if (!isMobile) {
    await page.keyboard.press('Shift+Tab')
    await expect(tab('Inbox')).toBeFocused()
  }
  // A page outside every section lights no tab.
  await page.getByRole('button', { name: 'Profile', exact: true }).click()
  await expect(page.locator('[data-slot="adaptive-tab-nav-item"][aria-current="page"]')).toHaveCount(0)
})

test('adaptive tab nav: inline in the top bar when wide, docked to the bottom when narrow', async ({ page }) => {
  const { tab } = await openDemo(page, 1280)
  const wide = await position(page, 'Sections')
  expect(wide.position).toBe('static')
  const header = await page.locator('header').filter({ has: tab('Home') }).boundingBox()
  expect(wide.top).toBeGreaterThanOrEqual(Math.floor(header!.y))
  expect(wide.bottom).toBeLessThanOrEqual(Math.ceil(header!.y + header!.height))

  // The same element docks when the viewport narrows, without a reload.
  await page.setViewportSize({ width: 390, height: 844 })
  await expect.poll(async () => (await position(page, 'Sections')).position).toBe('fixed')
  const narrow = await position(page, 'Sections')
  expect(narrow).toMatchObject({ bottom: 844, left: 0, width: 390 })
  expect(narrow.paddingBottom).toBeGreaterThanOrEqual(12)
  const heights = await page
    .locator('[data-slot="adaptive-tab-nav-item"]')
    .evaluateAll((items) => items.map((item) => Math.round(item.getBoundingClientRect().height)))
  for (const height of heights) expect(height).toBeGreaterThanOrEqual(44)
  const widths = await page
    .locator('[data-slot="adaptive-tab-nav-item"]')
    .evaluateAll((items) => items.map((item) => Math.round(item.getBoundingClientRect().width)))
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1)
  await tab('Inbox').click()
  await expect(tab('Inbox')).toHaveAttribute('aria-current', 'page')

  await page.setViewportSize({ width: 1280, height: 844 })
  await expect.poll(async () => (await position(page, 'Sections')).position).toBe('static')
  await expect(tab('Inbox')).toHaveAttribute('aria-current', 'page')
})
