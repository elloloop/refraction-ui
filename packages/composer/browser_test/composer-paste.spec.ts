import { test, expect, type Locator } from '@playwright/test'

test('Astro toolbar actions keep the textarea, draft and selection through menu use', async ({ page, browserName }) => {
  await page.goto('/')
  const composer = page.locator('refraction-interactive-composer')
  const field = composer.getByRole('textbox')
  await field.fill('Draft to keep\nwhile choosing a language.')
  const handle = await field.elementHandle()
  await field.evaluate((el: HTMLTextAreaElement) => el.setSelectionRange(6, 13))
  const trigger = composer.getByRole('button', { name: 'Dictation language' })
  await composer.getByRole('button', { name: 'Dictate', exact: true }).focus()
  // WebKit's default macOS traversal skips native buttons; Chromium proves Tab.
  if (browserName === 'webkit') await trigger.focus()
  else await page.keyboard.press('Tab')
  await expect(trigger).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(composer.getByRole('menuitem', { name: 'Auto', exact: true })).toBeFocused()
  await page.keyboard.press('End')
  await expect(composer.getByRole('menuitem', { name: 'Telugu', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await expect(field).toHaveValue('Draft to keep\nwhile choosing a language.')
  expect(await field.evaluate((el: HTMLTextAreaElement) => [el.selectionStart, el.selectionEnd])).toEqual([6, 13])
  expect(await field.evaluate((el, previous) => el === previous, handle)).toBe(true)
  await expect(page.locator('#results')).toHaveText('No paste or submission yet')
  const fieldBox = await field.boundingBox()
  const micBox = await composer.getByRole('button', { name: 'Dictate', exact: true }).boundingBox()
  expect(micBox!.y).toBeGreaterThanOrEqual(fieldBox!.y + fieldBox!.height)
})

async function paste(field: Locator, text: string, files: { type: string; size: number; name?: string }[] = []) {
  await field.evaluate((el, data) => {
    const transfer = new DataTransfer()
    transfer.setData('text/plain', data.text)
    for (const [i, file] of data.files.entries()) transfer.items.add(new File([new Uint8Array(file.size)], file.name ?? `fixture-${i}.png`, { type: file.type }))
    el.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: transfer }))
  }, { text, files })
}
for (const framework of ['react', 'astro']) {
  test(`${framework}: mixed clipboard selection, native undo, multiple original files, no autosend`, async ({ page }) => {
    await page.goto('/')
    const field = page.locator(`#${framework} textarea`)
    await field.focus()
    await field.evaluate((el: HTMLTextAreaElement) => el.setSelectionRange(7, 15))
    await paste(field, 'mixed', [{ type: 'image/png', size: 3 }, { type: 'image/jpeg', size: 4, name: 'fixture.jpg' }])
    await expect(field).toHaveValue('before mixed after')
    expect(await field.evaluate((el: HTMLTextAreaElement) => [el.selectionStart, el.selectionEnd])).toEqual([12, 12])
    const records = JSON.parse(await page.locator('#results').innerText())[framework]
    expect(records.images).toEqual([{ name: 'fixture-0.png', type: 'image/png', size: 3 }, { name: 'fixture.jpg', type: 'image/jpeg', size: 4 }])
    expect(records.submissions).toEqual([])
    await field.press('ControlOrMeta+Z')
    await expect(field).toHaveValue('before selected after')
    await expect(page.locator(`#${framework}`)).toContainText('fixture-0.png')
    await page.locator(`#${framework}`).getByRole('button', { name: 'Send', exact: true }).click()
    expect(JSON.parse(await page.locator('#results').innerText())[framework].submissions).toHaveLength(1)
  })
  test(`${framework}: image-only preserves draft/selection; unsupported format ignored; invalid batch atomic`, async ({ page }) => {
    await page.goto('/')
    const field = page.locator(`#${framework} textarea`)
    await field.focus()
    await field.evaluate((el: HTMLTextAreaElement) => el.setSelectionRange(7, 15))
    await paste(field, '', [{ type: 'image/png', size: 3 }])
    await expect(field).toHaveValue('before selected after')
    expect(await field.evaluate((el: HTMLTextAreaElement) => [el.selectionStart, el.selectionEnd])).toEqual([7, 15])
    await paste(field, '', [{ type: 'image/gif', size: 3 }])
    await paste(field, 'must not replace', [{ type: 'image/png', size: 3 }, { type: 'image/png', size: 1025 }])
    await expect(field).toHaveValue('before selected after')
    await expect(page.locator(`#${framework}`)).toContainText('Could not paste images')
    expect(JSON.parse(await page.locator('#results').innerText())[framework].images).toHaveLength(1)
    await paste(field, 'also must not replace', [{ type: 'image/png', size: 0 }])
    await expect(field).toHaveValue('before selected after')
  })
}

test('Chromium: real OS clipboard image uses the explicit keyboard paste', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Clipboard write permission is exercised with Chromium only')
  await page.goto('/')
  await page.evaluate(async () => {
    const canvas = document.createElement('canvas'); canvas.width = 16; canvas.height = 16
    const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#635bff'; ctx.fillRect(0, 0, 16, 16)
    const blob = await new Promise<Blob>(resolve => canvas.toBlob(blob => resolve(blob!)))
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
  })
  for (const framework of ['react', 'astro']) {
    const field = page.locator(`#${framework} textarea`)
    await field.focus()
    await field.press('ControlOrMeta+V')
    await expect(page.locator(`#${framework}`)).toContainText('image.png')
    await expect(field).toHaveValue('before selected after')
    expect(JSON.parse(await page.locator('#results').innerText())[framework].submissions).toEqual([])
  }
})

test('local fixture visual evidence at narrow/wide sizes', async ({ page }, testInfo) => {
  await page.goto('/')
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const framework of ['react', 'astro']) {
      const field = page.locator(`#${framework} textarea`)
      await field.focus()
      await paste(field, '', [{ type: 'image/png', size: 3 }])
    }
    const main = page.locator('main')
    expect(await main.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`local-clipboard-${width}.png`), fullPage: true, animations: 'disabled' })
  }
})


test('Astro blocks paste while disabled, read-only, busy or composing; removes a staged image without submitting', async ({ page }) => {
  await page.goto('/')
  const composer = page.locator('refraction-interactive-composer')
  const field = composer.locator('textarea')
  for (const attribute of ['disabled', 'read-only', 'busy']) {
    await composer.evaluate((el, name) => el.setAttribute(name, ''), attribute)
    await paste(field, 'blocked', [{ type: 'image/png', size: 3 }])
    await expect(field).toHaveValue('before selected after')
    await expect(page.locator('#results')).toHaveText('No paste or submission yet')
    await composer.evaluate((el, name) => el.removeAttribute(name), attribute)
  }
  await field.dispatchEvent('compositionstart')
  await paste(field, 'blocked', [{ type: 'image/png', size: 3 }])
  await expect(page.locator('#results')).toHaveText('No paste or submission yet')
  await field.dispatchEvent('compositionend')
  await field.focus()
  await paste(field, '', [{ type: 'image/png', size: 3 }])
  await composer.getByRole('button', { name: 'Remove attachment fixture-0.png', exact: true }).click()
  await expect(composer).not.toContainText('fixture-0.png')
  expect(JSON.parse(await page.locator('#results').innerText()).astro.submissions).toEqual([])
})


for (const framework of ['react', 'astro']) {
  test(`${framework}: restored Unicode draft replacement and undo preserve complete characters`, async ({ page }) => {
    await page.goto('/?draft=' + encodeURIComponent('before 😀 after'))
    const field = page.locator(`#${framework} textarea`)
    await expect(field).toHaveValue('before 😀 after')
    await field.focus()
    await field.evaluate((el: HTMLTextAreaElement) => el.setSelectionRange(7, 9))
    await paste(field, '😁')
    await expect(field).toHaveValue('before 😁 after')
    await field.press('ControlOrMeta+Z')
    await expect(field).toHaveValue('before 😀 after')
  })
}
