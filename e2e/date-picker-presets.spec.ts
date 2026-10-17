import { test, expect, type Locator, type Page } from '@playwright/test'

// The React DatePicker presets on the docs page: reached and chosen from the
// keyboard, with translated and caller-defined presets, against a fixed clock.

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

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(SATURDAY)
  await page.goto('/components/date-picker')
  await page.waitForLoadState('networkidle')
})

test('presets follow the input in the tab order and are chosen with Enter or Space', async ({ page, browserName }) => {
  const next = nextKey(browserName)
  const example = page.getByTestId('date-picker-presets-default')
  const input = example.getByLabel('Due date')
  const group = example.getByRole('group', { name: 'Date shortcuts' })
  const selected = example.getByTestId('date-picker-presets-default-selected')

  // In dev the first key press can land before hydration and do nothing, so
  // repeat it until the choice shows, as a reader would.
  await expect(async () => {
    await tabOutOf(page, input, next)
    await expect(group.getByRole('button', { name: 'Today' })).toBeFocused({ timeout: 1_000 })
    await page.keyboard.press(next)
    await expect(group.getByRole('button', { name: 'Tomorrow' })).toBeFocused({ timeout: 1_000 })
    await page.keyboard.press('Enter')
    await expect(selected).toHaveText('Sunday, October 18, 2026', { timeout: 1_000 })
  }).toPass({ timeout: 15_000 })
  await expect(input).toHaveValue('2026-10-18')

  await page.keyboard.press(next)
  await expect(group.getByRole('button', { name: 'Next week' })).toBeFocused()
  await page.keyboard.press('Space')
  await expect(selected).toHaveText('Monday, October 19, 2026')
  await expect(input).toHaveValue('2026-10-19')
})

test('caller-defined presets resolve from the reader’s date', async ({ page }) => {
  const example = page.getByTestId('date-picker-presets-own')
  const selected = example.getByTestId('date-picker-presets-own-selected')
  await expect(async () => {
    await example.getByRole('button', { name: 'Next Friday' }).click()
    await expect(selected).toHaveText('Friday, October 23, 2026', { timeout: 1_000 })
  }).toPass({ timeout: 15_000 })
  await example.getByRole('button', { name: 'In two weeks' }).click()
  await expect(selected).toHaveText('Saturday, October 31, 2026')
})

test('translated labels name the presets and their group', async ({ page }) => {
  const example = page.getByTestId('date-picker-presets-es')
  const group = example.getByRole('group', { name: 'Atajos de fecha' })
  await expect(group.getByRole('button')).toHaveText(['Hoy', 'Mañana', 'La próxima semana'])
  const selected = example.getByTestId('date-picker-presets-es-selected')
  await expect(async () => {
    await group.getByRole('button', { name: 'Mañana' }).click()
    await expect(selected).toHaveText('domingo, 18 de octubre de 2026', { timeout: 1_000 })
  }).toPass({ timeout: 15_000 })
})
