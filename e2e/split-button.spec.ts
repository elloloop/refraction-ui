import { test, expect, type Locator, type Page } from '@playwright/test'

// Behaviour of the SplitButton docs examples in a real browser: native key
// activation, menu keyboard flow, geometry, hit-testing and RTL. The page's
// pixels are covered by components.spec.ts.

async function gotoSplitButton(page: Page) {
  await page.goto('/components/split-button')
  await page.waitForLoadState('networkidle')
}

// In dev the first interaction can land before hydration and be a no-op.
// Retry the action until the expected end state holds; the assertion itself
// is never relaxed.
async function retryUntil(action: () => Promise<void>, assertion: () => Promise<void>) {
  await expect(async () => {
    await action()
    await assertion()
  }).toPass({ timeout: 15_000 })
}

function basic(page: Page) {
  const group = page.getByRole('group', { name: 'Save document' })
  return {
    group,
    action: group.getByRole('button', { name: 'Save', exact: true }),
    caret: group.getByRole('button', { name: 'More save options', exact: true }),
    status: group.locator('xpath=following-sibling::p[@aria-live="polite"]'),
  }
}

/** Wait until React has attached handlers: pressing the action updates the live region. */
async function hydrate(page: Page) {
  const { action, status } = basic(page)
  await retryUntil(
    () => action.click(),
    () => expect(status).toHaveText('Last action: Save', { timeout: 1_000 }),
  )
}

async function rect(locator: Locator) {
  const box = await locator.boundingBox()
  if (!box) throw new Error('element has no box')
  return { ...box, right: box.x + box.width, bottom: box.y + box.height }
}

/** The <button> that a press at (x, y) lands on, as its accessible name. */
async function buttonAt(page: Page, x: number, y: number) {
  return page.evaluate(
    ([px, py]) => {
      const button = document.elementFromPoint(px, py)?.closest('button')
      return button?.getAttribute('aria-label') ?? button?.textContent?.trim() ?? null
    },
    [x, y] as const,
  )
}

test.describe('split button', () => {
  let consoleErrors: string[]

  test.beforeEach(async ({ page }) => {
    consoleErrors = []
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })
    page.on('pageerror', (error) => consoleErrors.push(error.message))
    await gotoSplitButton(page)
    await hydrate(page)
  })

  test.afterEach(() => {
    expect(consoleErrors).toEqual([])
  })

  test('two buttons with their own names; the caret is a menu button', async ({ page }) => {
    const { group, action, caret } = basic(page)
    await expect(group.getByRole('button')).toHaveCount(2)
    await expect(action).toHaveAttribute('type', 'button')
    await expect(caret).toHaveAttribute('type', 'button')
    await expect(caret).toHaveAttribute('aria-haspopup', 'menu')
    await expect(caret).toHaveAttribute('aria-expanded', 'false')
    // Unnamed carets fall back to "More options" — the variants each name theirs.
    await expect(page.getByRole('button', { name: 'More secondary options' })).toBeVisible()
  })

  test('Enter and Space run the primary action without opening the menu', async ({ page }) => {
    const { action, caret, status } = basic(page)
    for (const key of ['Space', 'Enter']) {
      // Run a secondary action first, so the live region changes only if the key works.
      await caret.click()
      await page.getByRole('menuitem', { name: 'Save a copy' }).click()
      await expect(status).toHaveText('Last action: Save a copy')
      await action.focus()
      await page.keyboard.press(key)
      await expect(status).toHaveText('Last action: Save')
      await expect(page.getByRole('menu')).toBeHidden()
    }
  })

  test('ArrowDown on the caret opens the menu on its first item; Escape returns to the caret', async ({ page }) => {
    const { caret } = basic(page)
    await caret.scrollIntoViewIfNeeded()
    await caret.focus()
    const scrollBefore = await page.evaluate(() => window.scrollY)
    await page.keyboard.press('ArrowDown')
    const menu = page.getByRole('menu', { name: 'More save options' })
    await expect(menu).toBeVisible()
    await expect(caret).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('menuitem', { name: 'Save as draft' })).toBeFocused()
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore)
    await page.keyboard.press('ArrowDown')
    await expect(page.getByRole('menuitem', { name: 'Save a copy' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
    await expect(caret).toBeFocused()
  })

  test('Enter and Space on the caret open the menu; choosing an item runs it', async ({ page }) => {
    const { caret, status } = basic(page)
    for (const key of ['Enter', 'Space']) {
      await caret.focus()
      await page.keyboard.press(key)
      await expect(page.getByRole('menuitem', { name: 'Save as draft' })).toBeFocused()
      await page.keyboard.press('Escape')
      await expect(caret).toBeFocused()
    }
    await caret.press('Enter')
    await page.keyboard.press('End')
    await expect(page.getByRole('menuitem', { name: 'Save as template' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(status).toHaveText('Last action: Save as template')
    await expect(page.getByRole('menu')).toBeHidden()
    await expect(caret).toBeFocused()
  })

  test('both parts are Tab stops with a visible focus ring above the other part', async ({ page, isMobile }) => {
    // The mobile browser's default Tab traversal skips native buttons.
    test.skip(isMobile, 'sequential Tab access is a desktop behaviour')
    const { action, caret } = basic(page)
    await action.focus()
    await page.keyboard.press('Tab')
    await expect(caret).toBeFocused()
    const ring = await caret.evaluate((el) => {
      const style = getComputedStyle(el)
      return { boxShadow: style.boxShadow, zIndex: style.zIndex, focusVisible: el.matches(':focus-visible') }
    })
    expect(ring.focusVisible).toBe(true)
    expect(ring.boxShadow).not.toBe('none')
    expect(ring.zIndex).toBe('10')
    await page.keyboard.press('Shift+Tab')
    await expect(action).toBeFocused()
    expect(await action.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none')
  })

  test('the caret is a square as tall as the action, joined to it with square inner corners', async ({ page }) => {
    for (const name of ['Extra small', 'Small', 'Default', 'Large']) {
      const group = page.getByRole('group', { name: `${name} size`, exact: true })
      const action = await rect(group.getByRole('button', { name, exact: true }))
      const caret = await rect(group.getByRole('button', { name: `More ${name.toLowerCase()} options` }))
      expect(caret.height).toBeCloseTo(action.height, 0)
      expect(caret.width).toBeCloseTo(caret.height, 0)
      expect(caret.y).toBeCloseTo(action.y, 0)
      // Outline shares one border: the caret overlaps the action's by 1 px.
      expect(caret.x).toBeCloseTo(action.right - 1, 0)
    }
    const { action, caret } = basic(page)
    const corners = await Promise.all([
      action.evaluate((el) => [getComputedStyle(el).borderTopRightRadius, getComputedStyle(el).borderTopLeftRadius]),
      caret.evaluate((el) => [getComputedStyle(el).borderTopLeftRadius, getComputedStyle(el).borderTopRightRadius]),
    ])
    expect(corners[0][0]).toBe('0px')
    expect(corners[0][1]).not.toBe('0px')
    expect(corners[1][0]).toBe('0px')
    expect(corners[1][1]).not.toBe('0px')
    const [a, c] = await Promise.all([rect(action), rect(caret)])
    expect(c.x).toBeCloseTo(a.right, 0)
  })

  test('presses land on the right part, inside the 44 px target and at the seam', async ({ page }) => {
    const group = page.getByRole('group', { name: 'Reply, 28 px visual' })
    const caretLocator = group.getByRole('button', { name: 'More reply options' })
    await caretLocator.scrollIntoViewIfNeeded()
    const action = await rect(group.getByRole('button', { name: 'Reply', exact: true }))
    const caret = await rect(caretLocator)
    expect(caret.height).toBeCloseTo(28, 0)
    const midY = caret.y + caret.height / 2

    // Outside the caret's 28 px box, inside its 44 px target.
    expect(await buttonAt(page, caret.right + 6, midY)).toBe('More reply options')
    expect(await buttonAt(page, caret.x + caret.width / 2, caret.y - 4)).toBe('More reply options')
    expect(await buttonAt(page, action.x + action.width / 2, action.bottom + 4)).toBe('Reply')
    // Either side of the seam: the targets grow outward, so they never overlap.
    expect(await buttonAt(page, caret.x - 2, midY)).toBe('Reply')
    expect(await buttonAt(page, caret.x + 2, midY)).toBe('More reply options')
    // Inside a part's own box the button itself is topmost: the extender never covers the label.
    const topmost = await page.evaluate(
      ([px, py]) => document.elementFromPoint(px, py)?.tagName ?? null,
      [action.x + action.width / 2, midY] as const,
    )
    expect(topmost).toBe('BUTTON')

    // A real press beside the caret's visual box opens its menu.
    await page.mouse.click(caret.right + 6, midY)
    await expect(page.getByRole('menu', { name: 'More reply options' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(caretLocator).toBeFocused()
  })

  test('the menu opens under the control, aligned to its end edge, in LTR and RTL', async ({ page }) => {
    const { group, action, caret } = basic(page)
    const menu = page.getByRole('menu', { name: 'More save options' })

    await caret.click()
    await expect(menu).toBeVisible()
    let [m, c] = await Promise.all([rect(menu), rect(caret)])
    expect(m.y).toBeGreaterThanOrEqual(c.bottom)
    expect(m.x).toBeCloseTo(Math.max(0, c.right - m.width), 0)
    await page.keyboard.press('Escape')

    await group.evaluate((el) => el.setAttribute('dir', 'rtl'))
    const [a, cr] = await Promise.all([rect(action), rect(caret)])
    // Mirrored: the caret sits at the start (left) and the seam corners stay square.
    expect(cr.right).toBeCloseTo(a.x, 0)
    expect(await action.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe('0px')
    expect(await caret.evaluate((el) => getComputedStyle(el).borderTopRightRadius)).toBe('0px')
    await caret.click()
    await expect(menu).toBeVisible()
    ;[m, c] = await Promise.all([rect(menu), rect(caret)])
    expect(m.x).toBeCloseTo(c.x, 0)
  })

  test('disabled parts are disabled natively and do not open the menu', async ({ page }) => {
    const publish = page.getByRole('group', { name: 'Publish, disabled' })
    await expect(publish.getByRole('button', { name: 'Publish', exact: true })).toBeDisabled()
    await expect(publish.getByRole('button', { name: 'More publish options' })).toBeDisabled()

    const exportGroup = page.getByRole('group', { name: 'Export, options disabled' })
    await expect(exportGroup.getByRole('button', { name: 'Export', exact: true })).toBeEnabled()
    const exportCaret = exportGroup.getByRole('button', { name: 'More export options' })
    await expect(exportCaret).toBeDisabled()
    await exportCaret.click({ force: true })
    await expect(page.getByRole('menu')).toBeHidden()
  })

  test('the icon action toggles and the caret picks a device', async ({ page }) => {
    const group = page.getByRole('group', { name: 'Microphone' })
    const mute = group.getByRole('button', { name: 'Mute microphone' })
    const status = group.locator('xpath=following-sibling::p[@aria-live="polite"]')
    await expect(mute).toHaveAttribute('aria-pressed', 'false')
    await mute.click()
    await expect(mute).toHaveAttribute('aria-pressed', 'true')
    await expect(status).toHaveText('Muted · Built-in microphone')
    const caret = group.getByRole('button', { name: 'Microphone options' })
    const [m, c] = await Promise.all([rect(mute), rect(caret)])
    expect(m.width).toBeCloseTo(m.height, 0)
    expect(c.height).toBeCloseTo(m.height, 0)
    await caret.click()
    await page.getByRole('menuitem', { name: 'USB headset' }).click()
    await expect(status).toHaveText('Muted · USB headset')
    await expect(caret).toBeFocused()
  })
})
