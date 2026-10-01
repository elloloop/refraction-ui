import { test, expect } from '@playwright/test'
import path from 'node:path'
test('shared display enhancement is idempotent and preserves code, URL attributes and editors', async ({ page }) => {
  test.setTimeout(90_000)
  await page.route('**/emoji/*.svg', route => route.abort())
  await page.goto('/components/markdown-renderer', { waitUntil: 'domcontentloaded' })
  const display = page.getByTestId('unicode-shared-display')
  await expect(display.locator('img')).toHaveCount(5)
  await expect(display.locator('p')).toHaveText('Message 🔥 👨‍👩‍👧‍👦 🇬🇧 1️⃣ 👍🏽 ✈︎')
  await expect(display.locator('code,pre,[contenteditable],textarea,svg').locator('img')).toHaveCount(0)
  await expect(display.locator('a')).toHaveAttribute('href', 'https://example.com/🔥')
  await expect(display.locator('textarea')).toHaveValue('draft 🔥')
  await expect.poll(() => display.locator('[data-rfr-emoji-text]').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).opacity === '1'))).toBe(true)
})

test('React markdown message paints supported artwork while preserving selectable text and literal code', async ({ page, context }, testInfo) => {
  test.setTimeout(90_000)
  await page.route('**/emoji/*.svg', async route => {
    const filename = new URL(route.request().url()).pathname.split('/').pop()!
    await route.fulfill({ path: path.resolve('packages/flutter/assets/twemoji', filename), contentType: 'image/svg+xml' })
  })
  await page.goto('/components/markdown-renderer', { waitUntil: 'domcontentloaded' })
  const before = page.getByTestId('unicode-message-before')
  const after = page.getByTestId('unicode-message-after')
  await after.scrollIntoViewIfNeeded()
  await expect(after.locator('img')).toHaveCount(6)
  await expect.poll(() => after.locator('img').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).opacity === '1'))).toBe(true)
  expect(await after.textContent()).toBe(await before.textContent())
  await expect(after.locator('code img')).toHaveCount(0)
  await expect(after.locator('a')).toHaveAttribute('href', 'https://example.com/path?emoji=🔥')
  const originalSelection = await before.evaluate(node => {
    const range = document.createRange(); range.selectNodeContents(node)
    const selection = window.getSelection()!; selection.removeAllRanges(); selection.addRange(range)
    return selection.toString()
  })
  await after.evaluate(node => {
    const range = document.createRange(); range.selectNodeContents(node)
    const selection = window.getSelection()!; selection.removeAllRanges(); selection.addRange(range)
  })
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+C' : 'Control+C')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(originalSelection)
  await page.evaluate(() => window.getSelection()?.removeAllRanges())
  await before.screenshot({ path: testInfo.outputPath('message-before.png') })
  await after.screenshot({ path: testInfo.outputPath('message-after.png') })
  await page.getByRole('button', { name: 'Update Unicode message' }).click()
  await expect(after.locator('img')).toHaveCount(3)
  await expect(after).toHaveText('Updated 👩‍💻 🇯🇵 2️⃣ · code 🔥')
  await page.getByRole('button', { name: 'Toggle message artwork' }).click()
  await expect(after.locator('img')).toHaveCount(0)
  expect(await after.textContent()).toBe(await before.textContent())
})


test('actual React conversation message consumes the shared artwork renderer', async ({ page }) => {
  test.setTimeout(90_000)
  await page.route('https://cdn.jsdelivr.net/**/svg/*.svg', async route => {
    const filename = new URL(route.request().url()).pathname.split('/').pop()!
    await route.fulfill({ path: path.resolve('packages/flutter/assets/twemoji', filename), contentType: 'image/svg+xml' })
  })
  await page.goto('/components/conversation', { waitUntil: 'domcontentloaded' })
  const message = page.locator('[data-message-id="m1"]').first()
  await message.scrollIntoViewIfNeeded()
  await expect(message.locator('[data-rfr-emoji-art]')).toHaveCount(5)
  await expect.poll(() => message.locator('[data-rfr-emoji-art]').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).opacity === '1'))).toBe(true)
  await expect(message.locator('code')).toHaveText('code 🔥')
  await expect(message.locator('code img')).toHaveCount(0)
})
