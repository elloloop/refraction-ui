import { test, expect } from '@playwright/test'
import path from 'node:path'
import { unicodeEmojiHtml, hydrateUnicodeEmojiArtwork } from '../packages/emoji-picker/src/unicode-emoji'

const text = 'Keyboard: 🔥 ❤️ ❤️‍🔥 👩‍💻 👨‍👩‍👧‍👦 🇬🇧 1️⃣ 🏳️‍🌈 · native fallback: 👍🏽 ✈︎'

test('Unicode artwork preserves selectable text and handles failed assets', async ({ page, context }, testInfo) => {
  await page.route('**/emoji/*.svg', async route => {
    const filename = new URL(route.request().url()).pathname.split('/').pop()!
    await route.fulfill({ path: path.resolve('packages/flutter/assets/twemoji', filename), contentType: 'image/svg+xml' })
  })
  await page.route('**/missing-emoji/*.svg', route => route.abort())
  test.setTimeout(90_000) // Cold documentation compilation can exceed the default 30s.
  await page.goto('/components/emoji-picker', { waitUntil: 'domcontentloaded' })
  const artwork = page.getByTestId('unicode-after')
  await artwork.scrollIntoViewIfNeeded()
  const images = artwork.locator('img')
  await expect(images).toHaveCount(8)
  await expect.poll(() => images.evaluateAll(nodes => nodes.every(node => (node as HTMLImageElement).naturalWidth > 0))).toBe(true)
  await expect.poll(() => images.evaluateAll(nodes => nodes.every(node => getComputedStyle(node).opacity === '1'))).toBe(true)
  const selectable = await artwork.evaluate(node => {
    const range = document.createRange()
    range.selectNodeContents(node)
    const selection = window.getSelection()!
    selection.removeAllRanges()
    selection.addRange(range)
    return selection.toString()
  })
  expect(selectable).toBe(text)
  if (testInfo.project.name !== 'mobile') {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+C' : 'Control+C')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(text)
  }
  await page.evaluate(() => window.getSelection()?.removeAllRanges())
  const offline = page.getByTestId('unicode-offline')
  await offline.scrollIntoViewIfNeeded()
  await expect(offline).toHaveText(text)
  await expect.poll(() => offline.locator('img').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).opacity === '0'))).toBe(true)
  await expect.poll(() => offline.locator('img').evaluateAll(nodes => nodes.every(node => getComputedStyle(node.previousElementSibling!).opacity === '1'))).toBe(true)
  await page.getByTestId('unicode-before').screenshot({ path: testInfo.outputPath('unicode-before.png') })
  await artwork.screenshot({ path: testInfo.outputPath('unicode-after.png') })
})

// Astro SSR emits this shared HTML and calls this exact helper from its script.
// Exercise load/error behavior in a browser, in addition to actual Astro SSR tests.
test('shared SSR artwork hydration handles loaded and failed images', async ({ page }) => {
  await page.route('https://emoji.test/**', async route => {
    if (route.request().url().includes('/missing/')) return route.abort()
    const filename = new URL(route.request().url()).pathname.split('/').pop()!
    await route.fulfill({ path: path.resolve('packages/flutter/assets/twemoji', filename), contentType: 'image/svg+xml' })
  })
  await page.setContent(`<p id="loaded">${unicodeEmojiHtml(text, 'https://emoji.test/loaded')}</p><p id="failed">${unicodeEmojiHtml(text, 'https://emoji.test/missing')}</p>`)
  await page.addScriptTag({ content: `(${hydrateUnicodeEmojiArtwork.toString()})(document)` })
  const loaded = page.locator('#loaded')
  await expect(loaded).toHaveText(text)
  await expect.poll(() => loaded.locator('img').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).opacity === '1'))).toBe(true)
  await expect.poll(() => loaded.locator('[data-rfr-emoji-text]').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).opacity === '0'))).toBe(true)
  const failed = page.locator('#failed')
  await expect(failed).toHaveText(text)
  await expect.poll(() => failed.locator('img').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).opacity === '0'))).toBe(true)
  await expect.poll(() => failed.locator('[data-rfr-emoji-text]').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).opacity === '1'))).toBe(true)
})
