import { test, expect } from '@playwright/test'
import path from 'node:path'
const text = 'Keyboard 🔥 ❤️‍🔥 👨‍👩‍👧‍👦 🇬🇧 1️⃣ · native 👍🏽 ✈︎'

test('Astro artwork preserves the existing core, caret, undo and native composition', async ({ page }, testInfo) => {
  await page.route('**/emoji/*.svg', async route => {
    const filename = new URL(route.request().url()).pathname.split('/').pop()!
    await route.fulfill({ path: path.resolve('packages/flutter/assets/twemoji', filename), contentType: 'image/svg+xml' })
  })
  await page.goto(`/?draft=${encodeURIComponent(text)}&native=1`)
  const surface = page.locator('#astro')
  await surface.screenshot({ path: testInfo.outputPath('astro-before.png') })
  await page.goto(`/?draft=${encodeURIComponent(text)}`)
  const field = surface.locator('textarea')
  await expect(field).toHaveValue(text)
  await expect(surface.locator('[data-emoji-mirror] img')).toHaveCount(5)
  await expect.poll(() => surface.locator('[data-emoji-mirror] img').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).opacity === '1'))).toBe(true)
  await surface.screenshot({ path: testInfo.outputPath('astro-after.png') })
  const family = '👨‍👩‍👧‍👦'
  // Start a fresh restored draft: WebKit groups adjacent typing/deletion undo.
  await page.goto(`/?draft=${encodeURIComponent(`A${family}`)}`)
  await field.focus()
  await field.evaluate(node => { const field = node as HTMLTextAreaElement; field.setSelectionRange(field.value.length, field.value.length) })
  await page.keyboard.press('ArrowLeft')
  expect(await field.evaluate(node => (node as HTMLTextAreaElement).selectionStart)).toBe(1)
  await page.keyboard.press('ArrowRight')
  expect(await field.evaluate(node => (node as HTMLTextAreaElement).selectionStart)).toBe(1 + family.length)
  await page.keyboard.press('Backspace')
  await expect(field).toHaveValue('A')
  const modifier = process.platform === 'darwin' ? 'Meta' : 'Control'
  await page.keyboard.press(`${modifier}+z`)
  await expect(field).toHaveValue(`A${family}`)
  await page.keyboard.press(`${modifier}+Shift+z`)
  await expect(field).toHaveValue('A')
  await field.fill(text)
  await field.dispatchEvent('compositionstart')
  await expect(surface.locator('[data-emoji-mirror] img')).toHaveCount(0)
  expect(await field.evaluate(node => node.style.color)).toBe('')
  await field.dispatchEvent('compositionend')
  await expect(surface.locator('[data-emoji-mirror] img')).toHaveCount(5)
  await field.fill(Array.from({ length: 20 }, (_, index) => `Wrapped line ${index} with repeated long text and repeated long text 🔥`).join('\n') + '\n')
  expect(await surface.evaluate(node => node.querySelector('[data-emoji-mirror]')!.clientWidth)).toBe(await field.evaluate(node => node.clientWidth))
  expect(await surface.evaluate(node => node.querySelector('[data-emoji-mirror]')!.scrollHeight)).toBe(await field.evaluate(node => node.scrollHeight))
  await field.evaluate(node => { node.scrollTop = node.scrollHeight; node.dispatchEvent(new Event('scroll')) })
  expect(await surface.evaluate(node => node.querySelector('[data-emoji-mirror]')!.scrollTop)).toBe(await field.evaluate(node => node.scrollTop))
})

test('Astro failed artwork stays native without changing canonical text', async ({ page }) => {
  await page.route('**/emoji/*.svg', route => route.abort())
  await page.goto(`/?draft=${encodeURIComponent(text)}`)
  const surface = page.locator('#astro')
  await expect(surface.locator('textarea')).toHaveValue(text)
  await expect(surface.locator('[data-rfr-emoji-text]')).toHaveCount(5)
  await expect.poll(() => surface.locator('[data-rfr-emoji-text]').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).opacity === '1'))).toBe(true)
})

test('Astro real clipboard copy and paste preserve complete Unicode with artwork', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Playwright WebKit cannot grant clipboard-write; editing/undo remain covered above.')
  await page.route('**/emoji/*.svg', route => route.abort())
  await page.goto(`/?draft=${encodeURIComponent(text)}`)
  const field = page.locator('#astro textarea')
  await field.focus()
  await field.press('ControlOrMeta+A')
  await field.press('ControlOrMeta+C')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(text)
  const next = 'Pasted 👨‍👩‍👧‍👦 🇬🇧 1️⃣ 👍🏽'
  await page.evaluate(value => navigator.clipboard.writeText(value), next)
  await field.press('ControlOrMeta+V')
  await expect(field).toHaveValue(next)
  await field.press('ControlOrMeta+Z')
  await expect(field).toHaveValue(text)
})

test('Astro private draft uses native Unicode by default without artwork requests', async ({ page }) => {
  const requests: string[] = []
  page.on('request', request => {
    const url = new URL(request.url())
    if (url.hostname === 'cdn.jsdelivr.net' || /^\/emoji\/.*\.svg$/.test(url.pathname)) requests.push(url.href)
  })
  await page.goto(`/?draft=${encodeURIComponent(text)}&default=1`)
  const surface = page.locator('#astro')
  await expect.poll(() => surface.locator('refraction-interactive-composer').evaluate(node => Boolean((node as HTMLElement & {api?: unknown}).api))).toBe(true)
  await expect(surface.locator('textarea')).toHaveValue(text)
  await expect(surface.locator('[data-emoji-mirror] img')).toHaveCount(0)
  expect(await surface.locator('textarea').evaluate(node => node.style.color)).toBe('')
  expect(requests).toEqual([])
})
