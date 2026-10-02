import { test, expect } from '@playwright/test'
import path from 'node:path'

test('composer keeps native caret, complete grapheme deletion, undo and clipboard text', async ({ page, context }, testInfo) => {
  test.setTimeout(90_000)
  await page.route('**/emoji/*.svg', async route => {
    const filename = new URL(route.request().url()).pathname.split('/').pop()!
    await route.fulfill({ path: path.resolve('packages/flutter/assets/twemoji', filename), contentType: 'image/svg+xml' })
  })
  await page.goto('/components/composer', { waitUntil: 'domcontentloaded' })
  const surface = page.getByTestId('unicode-composer-after')
  const field = surface.locator('textarea')
  await surface.scrollIntoViewIfNeeded()
  await expect(surface.locator('img')).toHaveCount(5)
  await expect.poll(() => surface.locator('img').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).opacity === '1'))).toBe(true)
  await page.getByTestId('unicode-composer-before').screenshot({ path: testInfo.outputPath('composer-before.png') })
  await surface.screenshot({ path: testInfo.outputPath('composer-after.png') })
  await field.fill('')
  await field.focus()
  const family = '👨‍👩‍👧‍👦'
  await page.keyboard.insertText(`A${family}`)
  await expect(field).toHaveValue(`A${family}`)
  await page.keyboard.press('ArrowLeft')
  expect(await field.evaluate(node => (node as HTMLTextAreaElement).selectionStart)).toBe(1)
  await page.keyboard.press('ArrowRight')
  expect(await field.evaluate(node => (node as HTMLTextAreaElement).selectionStart)).toBe(1 + family.length)
  // Start the deletion/undo check with a restored draft, separate from the
  // preceding typing transaction that WebKit may coalesce into one undo step.
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(surface.locator('img')).toHaveCount(5)
  await expect.poll(() => surface.locator('img').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).opacity === '1'))).toBe(true)
  await field.evaluate((node, restored) => {
    const input = node as HTMLTextAreaElement
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!
    setter.call(input, restored)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.focus()
    input.setSelectionRange(restored.length, restored.length)
  }, `A${family}`)
  await expect(field).toHaveValue(`A${family}`)
  await page.keyboard.press('Backspace')
  await expect(field).toHaveValue('A')
  const modifier = process.platform === 'darwin' ? 'Meta' : 'Control'
  await page.keyboard.press(`${modifier}+z`)
  await expect(field).toHaveValue(`A${family}`)
  await page.keyboard.press(`${modifier}+Shift+z`)
  await expect(field).toHaveValue('A')
  await field.fill('Copy 🔥 👨‍👩‍👧‍👦 🇬🇧 1️⃣ 👍🏽 ✈︎')
  if (testInfo.project.name !== 'mobile') {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.keyboard.press(`${modifier}+a`)
  await page.keyboard.press(`${modifier}+c`)
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await field.inputValue())
  }
  await field.dispatchEvent('compositionstart')
  await expect(surface.locator('img')).toHaveCount(0)
  expect(await field.evaluate(node => node.style.color)).toBe('')
  await field.dispatchEvent('compositionend')
  await expect(surface.locator('img')).toHaveCount(4)
  await field.fill(Array.from({ length: 30 }, (_, index) => `Line ${index} 🔥`).join('\n'))
  await field.evaluate(node => { node.scrollTop = node.scrollHeight; node.dispatchEvent(new Event('scroll')) })
  const scroll = await surface.evaluate(node => ({ field: node.querySelector('textarea')!.scrollTop, mirror: node.querySelector('[data-rfr-composer-mirror]')!.scrollTop }))
  expect(await surface.locator('[data-rfr-composer-mirror]').evaluate(node => getComputedStyle(node).color)).not.toBe('rgba(0, 0, 0, 0)')
  expect(scroll.field).toBeGreaterThan(0)
  expect(scroll.mirror).toBe(scroll.field)
})
