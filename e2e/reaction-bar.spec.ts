import { test, expect, type Locator } from '@playwright/test'

const AGREE_REACTORS = 'You, Dev Patel and 3 others reacted with Agree'

// In dev the first click can land before hydration and be a no-op: repeat the
// action until its end state holds. The assertion itself is never relaxed.
async function clickUntil(target: Locator, assertion: () => Promise<void>) {
  await expect(async () => {
    await target.click()
    await assertion()
  }).toPass({ timeout: 15_000 })
}

test('who reacted, the overflow and the picker work by pointer and keyboard', async ({
  page,
  isMobile,
}) => {
  await page.goto('/components/reaction-bar')
  await page.waitForLoadState('networkidle')
  const example = page.getByTestId('reaction-bar-work-chat-example')
  const agree = example.getByRole('button', { name: 'Agree 5 reactions, you reacted', exact: true })
  const tooltip = example.getByRole('tooltip')

  // Who reacted: the pill is described by its tooltip, which is hidden until
  // hover or keyboard focus, and Escape dismisses it.
  await expect(agree).toHaveAccessibleDescription(AGREE_REACTORS)
  await expect(tooltip).toHaveCount(0)
  if (!isMobile) {
    await expect(async () => {
      await page.mouse.move(0, 0)
      await agree.hover()
      await expect(tooltip).toHaveText(AGREE_REACTORS, { timeout: 1_000 })
    }).toPass({ timeout: 15_000 })
    await page.keyboard.press('Escape')
    await expect(tooltip).toHaveCount(0)
    await page.mouse.move(0, 0)
  }
  await expect(async () => {
    await agree.blur()
    await agree.focus()
    await expect(tooltip).toHaveText(AGREE_REACTORS, { timeout: 1_000 })
  }).toPass({ timeout: 15_000 })
  await page.keyboard.press('Escape')
  await expect(tooltip).toHaveCount(0)
  await expect(agree).toBeFocused()

  // Overflow: "+2" reveals the rest in place, and a keyboard user stays on
  // the button, which now collapses the bar.
  const more = example.getByRole('button', { name: 'Show 2 more reactions', exact: true })
  const done = example.getByRole('button', { name: 'Done 1 reaction', exact: true })
  await expect(more).toHaveAttribute('aria-expanded', 'false')
  await expect(done).toHaveCount(0)
  await more.focus()
  await page.keyboard.press('Enter')
  await expect(done).toBeVisible()
  const less = example.getByRole('button', { name: 'Show less', exact: true })
  await expect(less).toHaveAttribute('aria-expanded', 'true')
  await expect(less).toBeFocused()

  // A tooltip stays on screen: near the far edge of a narrow viewport it
  // lines up with its pill's end edge instead.
  await done.focus()
  await expect(tooltip).toHaveText('Someone who left reacted with Done')
  const box = await tooltip.boundingBox()
  const viewport = page.viewportSize()
  expect(box && viewport).toBeTruthy()
  expect(box!.x).toBeGreaterThanOrEqual(0)
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width)
  await page.keyboard.press('Escape')
  await expect(tooltip).toHaveCount(0)

  // The add button opens the picker the page supplies; a choice adds the
  // reaction and focus returns to the add button, as it does on Escape.
  const add = example.getByRole('button', { name: 'Add reaction', exact: true })
  const search = example.getByRole('searchbox', { name: 'Search emojis' })
  await clickUntil(add, () => expect(search).toBeFocused({ timeout: 1_000 }))
  await search.fill('fire')
  const fire = example.getByRole('button', { name: 'fire 🔥', exact: true })
  await fire.scrollIntoViewIfNeeded()
  await fire.click()
  await expect(search).toHaveCount(0)
  await expect(
    example.getByRole('button', { name: '🔥 1 reaction, you reacted', exact: true }),
  ).toBeVisible()
  await expect(add).toBeFocused()

  await add.click()
  await expect(search).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(search).toHaveCount(0)
  await expect(add).toBeFocused()
})
