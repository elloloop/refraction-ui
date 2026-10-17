import { test, expect, type Locator, type Page } from '@playwright/test'

// The toaster in a real browser, at desktop width (chromium) and phone width
// (mobile): a gutter on both sides that keeps every toast on screen, the
// bottom-right corner once the width is capped, and tinted toasts that hide
// whatever is behind them.

/** `inset-x-4` / `bottom-4` at the default 16px root font size. */
const GUTTER_PX = 16
/** `max-w-sm` (24rem). */
const MAX_WIDTH_PX = 384
/** Sub-pixel layout rounding. */
const TOLERANCE_PX = 1

const SUCCESS_MESSAGE = 'Operation completed successfully!'

async function showSuccessToast(page: Page): Promise<Locator> {
  await page.goto('/components/toast')
  await page.waitForLoadState('networkidle')
  const trigger = page.getByRole('button', { name: 'Success', exact: true })
  const toast = page
    .locator('[data-rfr-toaster] [data-rfr-toast]')
    .filter({ hasText: SUCCESS_MESSAGE })
    .first()
  // In dev the first click can land before hydration; click again until the
  // toast shows, as a user would. The assertion itself is not relaxed.
  await expect(async () => {
    await trigger.click()
    await expect(toast).toBeVisible({ timeout: 2_000 })
  }).toPass({ timeout: 15_000 })
  return toast
}

function expectNear(actual: number, expected: number) {
  expect(Math.abs(actual - expected), `${actual} is within ${TOLERANCE_PX}px of ${expected}`).toBeLessThanOrEqual(
    TOLERANCE_PX,
  )
}

test('toast: the toaster keeps its gutters and every toast stays on screen', async ({ page }) => {
  const toast = await showSuccessToast(page)
  const viewport = page.viewportSize()!
  const toaster = (await page.locator('[data-rfr-toaster]').boundingBox())!

  expectNear(viewport.width - (toaster.x + toaster.width), GUTTER_PX)
  expectNear(viewport.height - (toaster.y + toaster.height), GUTTER_PX)

  if (viewport.width - 2 * GUTTER_PX <= MAX_WIDTH_PX) {
    // Phone width: the screen minus a gutter on each side.
    expectNear(toaster.x, GUTTER_PX)
    expectNear(toaster.width, viewport.width - 2 * GUTTER_PX)
  } else {
    // Wider screens: capped, and held at the bottom right.
    expectNear(toaster.width, MAX_WIDTH_PX)
  }

  const box = (await toast.boundingBox())!
  expect(box.x).toBeGreaterThanOrEqual(GUTTER_PX - TOLERANCE_PX)
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width - GUTTER_PX + TOLERANCE_PX)
})

test('toast: a tinted toast is opaque', async ({ page }) => {
  const toast = await showSuccessToast(page)

  const surface = await toast.evaluate((el) => {
    const style = getComputedStyle(el)
    // Paint the computed background color and read its alpha back, which
    // works for any color syntax the browser serializes (rgb, oklab, ...).
    const ctx = document.createElement('canvas').getContext('2d')!
    ctx.fillStyle = style.backgroundColor
    ctx.fillRect(0, 0, 1, 1)
    return { alpha: ctx.getImageData(0, 0, 1, 1).data[3], image: style.backgroundImage }
  })

  expect(surface.alpha, 'background color alpha (0-255)').toBe(255)
  // The tint is still there, layered over the opaque color.
  expect(surface.image).toContain('linear-gradient')
})

test('toast: a long unbroken message wraps and keeps the dismiss button in view', async ({ page }) => {
  await page.goto('/components/toast')
  await page.waitForLoadState('networkidle')
  const trigger = page.getByRole('button', { name: 'Persistent', exact: true })
  // "Persistent" never auto-dismisses, so the toast stays while it is measured.
  const toast = page.locator('[data-rfr-toaster] [data-rfr-toast]').filter({ hasText: 'stays until dismissed' }).first()
  await expect(async () => {
    await trigger.click()
    await expect(toast).toBeVisible({ timeout: 2_000 })
  }).toPass({ timeout: 15_000 })

  // Swap in a message with no break opportunities, as a long URL would be.
  const longMessage = `https://example.com/${'a'.repeat(160)}`
  await toast.evaluate((el, text) => {
    el.firstElementChild!.textContent = text
  }, longMessage)
  const longToast = page.locator('[data-rfr-toaster] [data-rfr-toast]').filter({ hasText: longMessage })
  const dismiss = longToast.getByRole('button', { name: 'Dismiss' })

  const viewport = page.viewportSize()!
  const toastBox = (await longToast.boundingBox())!
  const dismissBox = (await dismiss.boundingBox())!
  expect(dismissBox.x + dismissBox.width).toBeLessThanOrEqual(toastBox.x + toastBox.width)
  expect(toastBox.x + toastBox.width).toBeLessThanOrEqual(viewport.width - GUTTER_PX + TOLERANCE_PX)
  await expect(dismiss).toBeInViewport()
})
