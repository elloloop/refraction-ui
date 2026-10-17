import { test, expect, type Locator, type Page } from '@playwright/test'

// Auto-follow on the docs demo: a call replayed one recogniser result at a
// time ("Next result"), in a panel short enough to scroll.

const LIVE_EDGE_TOLERANCE_PX = 24

async function open(page: Page): Promise<Locator> {
  await page.goto('/components/live-transcript')
  await page.waitForLoadState('networkidle')
  const panel = page.getByTestId('live-transcript-demo')
  await expect(panel).toBeVisible()
  return panel
}

function distanceFromBottom(panel: Locator): Promise<number> {
  return panel.evaluate((el) => el.scrollHeight - el.scrollTop - el.clientHeight)
}

async function expectAtLiveEdge(panel: Locator) {
  await expect
    .poll(() => distanceFromBottom(panel))
    .toBeLessThanOrEqual(LIVE_EDGE_TOLERANCE_PX)
}

/** The reader scrolls back to the top of the panel. */
async function scrollToTop(panel: Locator) {
  await panel.evaluate((el) => {
    el.scrollTop = 0
  })
  await expect(panel).toHaveAttribute('data-following', 'false')
}

test('live transcript: interim lines settle into finals at the live edge', async ({ page }) => {
  const panel = await open(page)
  const next = page.getByRole('button', { name: 'Next result' })
  await expectAtLiveEdge(panel)

  await next.click()
  const interim = panel.locator('[data-interim="true"]')
  await expect(interim).toHaveCount(1)
  await expect(interim).toContainText('who reviews')
  await expect(interim).toHaveAttribute('aria-live', 'off')
  await expectAtLiveEdge(panel)

  await next.click()
  await next.click()
  await expect(interim).toHaveCount(0)
  await expect(panel.getByText('Who reviews it first?', { exact: true })).toBeVisible()
  await expectAtLiveEdge(panel)
  await expect(page.getByRole('button', { name: 'Jump to live' })).toHaveCount(0)
})

test('live transcript: scrolling up pauses following and offers a jump to live', async ({ page }) => {
  const panel = await open(page)
  const next = page.getByRole('button', { name: 'Next result' })

  await scrollToTop(panel)
  const jump = panel.getByRole('button', { name: 'Jump to live' })
  await expect(jump).toBeVisible()

  // The control is held inside the visible area of the panel.
  const [panelBox, jumpBox] = await Promise.all([panel.boundingBox(), jump.boundingBox()])
  expect(panelBox && jumpBox).toBeTruthy()
  expect(jumpBox!.y).toBeGreaterThanOrEqual(panelBox!.y)
  expect(jumpBox!.y + jumpBox!.height).toBeLessThanOrEqual(panelBox!.y + panelBox!.height)

  // New lines do not pull the reader away from what they are reading.
  await next.click()
  await next.click()
  await expect(page.getByText('2 of 8 results')).toBeVisible()
  expect(await panel.evaluate((el) => el.scrollTop)).toBe(0)

  await jump.click()
  await expectAtLiveEdge(panel)
  await expect(panel).toHaveAttribute('data-following', 'true')
  await expect(jump).toHaveCount(0)

  await next.click()
  await expectAtLiveEdge(panel)
})

test('live transcript: scrolling back to the bottom resumes following', async ({ page }) => {
  const panel = await open(page)
  await scrollToTop(panel)
  await panel.evaluate((el) => {
    el.scrollTop = el.scrollHeight
  })
  await expect(panel).toHaveAttribute('data-following', 'true')
  await expect(panel.getByRole('button', { name: 'Jump to live' })).toHaveCount(0)
})

test('live transcript: jump to live keeps keyboard focus in the transcript', async ({ page }) => {
  const panel = await open(page)
  await scrollToTop(panel)
  const jump = panel.getByRole('button', { name: 'Jump to live' })
  await jump.focus()
  await page.keyboard.press('Enter')
  await expect(jump).toHaveCount(0)
  await expect(panel).toBeFocused()
  await expectAtLiveEdge(panel)
})

test('live transcript: jump to live does not animate under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const panel = await open(page)
  await scrollToTop(panel)
  // Measured in the same task as the click: an instant jump is already there.
  const distance = await panel.evaluate((el) => {
    el.querySelector<HTMLButtonElement>('button')?.click()
    return el.scrollHeight - el.scrollTop - el.clientHeight
  })
  expect(distance).toBeLessThanOrEqual(LIVE_EDGE_TOLERANCE_PX)
})
