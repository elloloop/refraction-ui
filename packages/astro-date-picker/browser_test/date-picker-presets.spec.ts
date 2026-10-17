import { test, expect, type Locator, type Page } from '@playwright/test'

// The Astro DatePicker presets in a real browser: reached and chosen from the
// keyboard, resolved against the reader's clock, and bounded by min and max.

// Saturday 17 October 2026, mid-afternoon, on the reader's clock.
const SATURDAY = new Date(2026, 9, 17, 15, 0)

/**
 * The key that moves focus to the next control. Safari's Tab skips buttons
 * unless the user turns on "Press Tab to highlight each item"; Option-Tab
 * always reaches them.
 */
function nextKey(browserName: string): string {
  return browserName === 'webkit' ? 'Alt+Tab' : 'Tab'
}

function picker(page: Page, inputId: string) {
  const input = page.locator(`#${inputId}`)
  const preset = (name: string): Locator =>
    page.locator(`[data-rfr-datepicker-preset][aria-controls="${inputId}"]`, { hasText: name })
  return { input, preset }
}

/**
 * Press `key` until focus leaves a native date input. Its day, month and year
 * fields each take a Tab of their own before focus moves on.
 */
async function tabOutOf(page: Page, input: Locator, key: string): Promise<void> {
  await input.focus()
  for (let presses = 0; presses < 6; presses++) {
    if (!(await input.evaluate((el) => el === document.activeElement))) return
    await page.keyboard.press(key)
  }
  throw new Error('Focus never left the date input')
}

async function hasFocusRing(control: Locator): Promise<boolean> {
  return control.evaluate((el) => el.matches(':focus-visible') && getComputedStyle(el).boxShadow !== 'none')
}

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(SATURDAY)
})

test('presets follow the input in the tab order and are chosen with Enter or Space', async ({ page, browserName }) => {
  const next = nextKey(browserName)
  await page.goto('/')
  const due = picker(page, 'due')
  await expect(page.getByRole('group', { name: 'Date shortcuts' }).first()).toBeVisible()

  await tabOutOf(page, due.input, next)
  await expect(due.preset('Today')).toBeFocused()
  expect(await hasFocusRing(due.preset('Today'))).toBe(true)

  await page.keyboard.press(next)
  await expect(due.preset('Tomorrow')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(due.input).toHaveValue('2026-10-18')
  // The page's own change listener hears the preset like a typed date.
  await expect(page.locator('#due-change')).toContainText('2026-10-18')
  // Focus stays on the preset, so the reader can keep going.
  await expect(due.preset('Tomorrow')).toBeFocused()

  await page.keyboard.press(next)
  await expect(due.preset('Next week')).toBeFocused()
  await page.keyboard.press('Space')
  await expect(due.input).toHaveValue('2026-10-19')
})

test('a preset outside min and max is disabled and skipped by the keyboard', async ({ page, browserName }) => {
  await page.goto('/')
  const window = picker(page, 'window')
  await expect(window.preset('Today')).toBeDisabled()
  await expect(window.preset('Tomorrow')).toBeEnabled()
  await expect(window.preset('Next week')).toBeEnabled()

  await tabOutOf(page, window.input, nextKey(browserName))
  await expect(window.preset('Tomorrow')).toBeFocused()
})

test('a date-and-time picker keeps the time already chosen', async ({ page }) => {
  await page.goto('/')
  const meeting = picker(page, 'meeting')
  await expect(meeting.input).toHaveValue('2026-10-01T14:30')
  await meeting.preset('Next week').click()
  await expect(meeting.input).toHaveValue('2026-10-19T14:30')
})

test('translated and caller-defined presets show their labels and resolve', async ({ page }) => {
  await page.goto('/')
  const entrega = picker(page, 'entrega')
  await expect(page.getByRole('group', { name: 'Atajos de fecha' })).toBeVisible()
  await expect(entrega.preset('Mañana')).toBeVisible()
  await entrega.preset('En dos semanas').click()
  await expect(entrega.input).toHaveValue('2026-10-31')
})

test('a page left open past midnight resolves the preset against the new day', async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 17, 23, 59))
  await page.goto('/')
  const due = picker(page, 'due')
  await expect(due.preset('Today')).toBeEnabled()
  await page.clock.setFixedTime(new Date(2026, 9, 18, 0, 1))
  await due.preset('Today').click()
  await expect(due.input).toHaveValue('2026-10-18')
})
