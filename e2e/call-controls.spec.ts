import { expect, test, type Locator, type Page } from '@playwright/test'

// Reduced motion is a browser-context option, not a test option of its own.
test.use({ contextOptions: { reducedMotion: 'reduce' } })

/** The dock of a docs section, found by the section's heading. */
function dockIn(page: Page, heading: string): Locator {
  return page
    .locator('section', { has: page.getByRole('heading', { name: heading, exact: true }) })
    .getByRole('toolbar', { name: 'Call controls' })
}

test('the dock shows every group on a wide dock and moves by arrow keys', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'The wide layout needs a dock wider than 600 px.')
  await page.goto('/components/call-controls')
  const dock = dockIn(page, 'Call dock')

  for (const name of ['Audio and video', 'Call actions', 'Panels']) {
    await expect(dock.getByRole('group', { name })).toBeVisible()
  }
  await expect(dock.getByRole('button', { name: 'More controls' })).toBeHidden()

  const mic = dock.getByRole('button', { name: 'Microphone', exact: true })
  const camera = dock.getByRole('button', { name: 'Camera', exact: true })
  await expect(mic).toHaveAttribute('aria-pressed', 'true')
  await expect(camera).toHaveAttribute('aria-pressed', 'false')
  await expect(dock.getByRole('button', { name: 'Chat (3)' })).toBeVisible()

  await mic.focus()
  await expect(mic).toHaveCSS('box-shadow', /rgb/)
  await page.keyboard.press('ArrowRight')
  await expect(camera).toBeFocused()
  await page.keyboard.press('Space')
  await expect(camera).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByText('Mic on · camera on', { exact: false })).toBeVisible()

  await page.keyboard.press('End')
  await expect(dock.getByRole('button', { name: 'Leave call' })).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(mic).toBeFocused()
})

test('a narrow dock collapses into More controls and runs its rows by keyboard', async ({ page }) => {
  await page.goto('/components/call-controls')
  const frame = page.getByTestId('call-controls-narrow-frame')
  const dock = frame.getByRole('toolbar', { name: 'Call controls' })

  await expect(dock.getByRole('group', { name: 'Call actions' })).toBeHidden()
  await expect(dock.getByRole('group', { name: 'Panels' })).toBeHidden()
  await expect(dock.getByRole('button', { name: 'Microphone', exact: true })).toBeVisible()
  await expect(dock.getByRole('button', { name: 'Leave call' })).toBeVisible()

  // Nothing in the dock spills out of its 360 px frame. Both boxes are read
  // in one pass, so a scroll in between cannot skew them.
  const frameAndDock = await frame.evaluate((element) => {
    const bar = element.querySelector('[role="toolbar"]')!
    return { frame: element.getBoundingClientRect().toJSON(), dock: bar.getBoundingClientRect().toJSON() }
  })
  expect(frameAndDock.dock.left).toBeGreaterThanOrEqual(frameAndDock.frame.left)
  expect(frameAndDock.dock.right).toBeLessThanOrEqual(frameAndDock.frame.right)

  const more = dock.getByRole('button', { name: 'More controls' })
  await expect(more).toHaveAttribute('aria-expanded', 'false')
  await more.focus()
  await page.keyboard.press('Enter')
  await expect(more).toHaveAttribute('aria-expanded', 'true')
  const panel = dock.getByRole('group', { name: 'More controls' })
  await expect(panel).toBeVisible()

  // The panel opens above the dock and stays within the page's width. Opening
  // it scrolls it into view, so read every box in one pass.
  const open = await dock.evaluate((bar) => {
    const panelElement = bar.querySelector('[data-call-controls-panel]')!
    return {
      panel: panelElement.getBoundingClientRect().toJSON(),
      dock: bar.getBoundingClientRect().toJSON(),
      pageWidth: document.documentElement.clientWidth,
    }
  })
  expect(open.panel.bottom).toBeLessThanOrEqual(open.dock.top)
  expect(open.panel.left).toBeGreaterThanOrEqual(0)
  expect(open.panel.right).toBeLessThanOrEqual(open.pageWidth)

  const share = panel.getByRole('button', { name: 'Share screen' })
  await expect(share).toBeFocused()
  await expect(share).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  const captions = panel.getByRole('button', { name: 'Captions' })
  await expect(captions).toBeFocused()
  await expect(captions).toHaveAttribute('aria-pressed', 'true')
  await expect(frame.getByText(/captions on/)).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(panel).toBeHidden()
  await expect(more).toBeFocused()
  await expect(frame.getByText(/captions on/)).toHaveCount(0)

  await page.keyboard.press('Enter')
  await expect(panel).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  await expect(more).toBeFocused()
})

test('a device menu in the mic slot opens and picks a device', async ({ page }) => {
  await page.goto('/components/call-controls')
  const dock = dockIn(page, 'Device menus')
  const options = dock.getByRole('button', { name: 'Microphone options' })
  await options.click()
  await expect(options).toHaveAttribute('aria-expanded', 'true')
  await page.getByRole('menuitemradio', { name: 'USB headset' }).click()
  await expect(options).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByText('USB headset · FaceTime HD camera')).toBeVisible()
  // The slot is its own control: the mic toggle did not change.
  await expect(dock.getByRole('button', { name: 'Microphone', exact: true })).toHaveAttribute('aria-pressed', 'true')
})
