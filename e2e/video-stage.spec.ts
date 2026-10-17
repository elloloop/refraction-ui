import { expect, test } from '@playwright/test'

test.use({ reducedMotion: 'reduce' })

test('tile options pin, maximize and return focus by keyboard', async ({ page }, testInfo) => {
  await page.goto('/components/video-stage')
  const stage = page.getByRole('group', { name: 'Team call' })
  await expect(stage).toHaveAttribute('data-mode', 'grid')

  const trigger = stage.getByRole('button', { name: 'Options for Pia Berg' })
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(trigger).toHaveCSS('box-shadow', /rgb/)

  const spotlight = stage.getByRole('button', { name: 'Spotlight Pia Berg' })
  if (testInfo.project.name === 'chromium') {
    // The actions follow the trigger in the tab order.
    await page.keyboard.press('Tab')
    await expect(spotlight).toBeFocused()
  } else {
    await spotlight.focus()
  }
  // Escape closes the actions and returns to the trigger.
  await page.keyboard.press('Escape')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(trigger).toBeFocused()

  // Pin: Pia takes the stage and focus follows her tile.
  await page.keyboard.press('Enter')
  await spotlight.focus()
  await page.keyboard.press('Enter')
  await expect(stage).toHaveAttribute('data-mode', 'spotlight')
  await expect(stage.locator('[data-video-stage-region="stage"]')).toHaveAttribute('data-participant-id', 'pia')
  await expect(page.getByText('Pinned: Pia Berg.')).toBeVisible()
  const stageTrigger = stage.getByRole('button', { name: 'Options for Pia Berg' })
  await expect(stageTrigger).toBeFocused()

  // Maximize: the tile covers the stage and focus moves to Minimize.
  await page.keyboard.press('Enter')
  await stage.getByRole('button', { name: 'Maximize Pia Berg' }).focus()
  await page.keyboard.press('Enter')
  const minimize = stage.getByRole('button', { name: 'Minimize' })
  await expect(minimize).toBeFocused()
  await expect(stage).toHaveAttribute('data-zoomed', 'true')
  const stageBox = await stage.boundingBox()
  const zoomBox = await stage.locator('[data-video-stage-region="zoom"]').boundingBox()
  expect(zoomBox && stageBox && Math.abs(zoomBox.width - stageBox.width) < 1).toBe(true)
  expect(zoomBox && stageBox && Math.abs(zoomBox.height - stageBox.height) < 1).toBe(true)

  // Escape leaves the zoom with focus back on Pia's options.
  await page.keyboard.press('Escape')
  await expect(stage).toHaveAttribute('data-zoomed', 'false')
  await expect(stageTrigger).toBeFocused()

  // Unpin returns to the grid.
  await page.keyboard.press('Enter')
  await stage.getByRole('button', { name: 'Unpin Pia Berg' }).focus()
  await page.keyboard.press('Enter')
  await expect(stage).toHaveAttribute('data-mode', 'grid')
  await expect(page.getByText('Nobody is pinned.')).toBeVisible()
  await expect(trigger).toBeFocused()
})

test('a paged grid scrolls a page with its next and previous buttons', async ({ page }) => {
  await page.goto('/components/video-stage')
  const stage = page.getByRole('group', { name: 'Large call' })
  const previous = stage.getByRole('button', { name: 'Previous participants' })
  const next = stage.getByRole('button', { name: 'More participants' })
  await expect(previous).toBeDisabled()
  await next.click()
  await expect(previous).toBeEnabled()
})

test('the stage adapts to its own size', async ({ page }) => {
  await page.goto('/components/video-stage')
  const narrow = page.getByRole('group', { name: 'Presentation on a narrow stage' })
  await expect(narrow).toHaveAttribute('data-narrow', 'true')
  await expect(narrow.locator('[data-placement]')).toHaveAttribute('data-placement', 'bottom')
  await expect(page.getByRole('group', { name: 'Paged grid on a narrow stage' }).locator('[data-shape]')).toHaveAttribute(
    'data-shape',
    'paged-vertical',
  )
  // The presentation example sits beside its rail only when the stage is wide enough.
  const presentation = page.getByRole('group', { name: 'Presentation', exact: true })
  const box = await presentation.boundingBox()
  const expected = box && box.width >= 600 && box.width >= box.height ? 'side' : 'bottom'
  await expect(presentation.locator('[data-placement]')).toHaveAttribute('data-placement', expected)
})
