import { test, expect, type Locator, type Page } from '@playwright/test'

// A destructive Callout draws `text-destructive` on its own 10% wash. Read the
// colours the browser resolved, paint them onto a canvas the way the page
// composites them, and require WCAG AA for body text (4.5:1) in both modes.

const AA_BODY_TEXT = 4.5
const DESTRUCTIVE_TEXT = 'Deleting this project is permanent and cannot be undone.'

/** Contrast between an element's text and the surface it is drawn on, as painted. */
async function paintedContrast(element: Locator): Promise<{ ratio: number; text: number[]; surface: number[] }> {
  return element.evaluate((el) => {
    const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!
    const pixel = () => Array.from(ctx.getImageData(0, 0, 1, 1).data)
    // Canvas ignores a colour it cannot parse, so make that an error instead.
    const paint = (color: string) => {
      ctx.fillStyle = '#ffffff'
      ctx.fillStyle = color
      if (ctx.fillStyle === '#ffffff' && !/^(#fff(fff)?|white|rgb\(255, 255, 255\))$/i.test(color)) {
        throw new Error(`canvas cannot paint ${color}`)
      }
      ctx.fillRect(0, 0, 1, 1)
    }

    // The backgrounds behind the text, from the element out to the first opaque one.
    const layers: string[] = []
    let opacity = 1
    let node: Element | null = el
    for (; node; node = node.parentElement) {
      const style = getComputedStyle(node)
      opacity *= Number(style.opacity)
      layers.unshift(style.backgroundColor)
      ctx.clearRect(0, 0, 1, 1)
      paint(style.backgroundColor)
      if (pixel()[3] === 255) break
    }
    if (!node) layers.unshift('#ffffff')

    // Paint the surface, bottom layer first, then the text over it.
    ctx.clearRect(0, 0, 1, 1)
    for (const layer of layers) paint(layer)
    const surface = pixel().slice(0, 3)
    ctx.globalAlpha = opacity
    paint(getComputedStyle(el).color)
    const text = pixel().slice(0, 3)

    const luminance = (rgb: number[]) => {
      const [r, g, b] = rgb.map((c) => {
        const s = c / 255
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
      })
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    const [hi, lo] = [luminance(text), luminance(surface)].sort((a, b) => b - a)
    return { ratio: (hi + 0.05) / (lo + 0.05), text, surface }
  })
}

async function setColorMode(page: Page, mode: 'Light' | 'Dark') {
  const radio = page.getByRole('radiogroup', { name: 'Color mode' }).getByRole('radio', { name: mode })
  const html = expect(page.locator('html'))
  // In dev the first click can land before hydration and be a no-op; click
  // again until the mode is applied, as a user would.
  await expect(async () => {
    await radio.click()
    await expect(radio).toHaveAttribute('aria-checked', 'true', { timeout: 1_000 })
    if (mode === 'Dark') await html.toHaveClass(/\bdark\b/, { timeout: 1_000 })
    else await html.not.toHaveClass(/\bdark\b/, { timeout: 1_000 })
  }).toPass({ timeout: 15_000 })
  // Measure the settled colours, not a frame of the colour transition.
  await expect
    .poll(() => page.evaluate(() => document.getAnimations().filter((a) => a instanceof CSSTransition).length))
    .toBe(0)
}

for (const mode of ['Light', 'Dark'] as const) {
  test(`destructive callout text meets WCAG AA in ${mode.toLowerCase()} mode`, async ({ page }) => {
    await page.goto('/components/callout')
    await setColorMode(page, mode)

    const callout = page.getByRole('alert').filter({ hasText: DESTRUCTIVE_TEXT })
    await expect(callout).toBeVisible()
    const { ratio, text, surface } = await paintedContrast(callout)

    // The wash is painted: the surface is not the card the callout sits on.
    const card = await paintedContrast(callout.locator('xpath=..'))
    expect(surface).not.toEqual(card.surface)
    expect(ratio, `text rgb(${text}) on rgb(${surface})`).toBeGreaterThanOrEqual(AA_BODY_TEXT)
  })
}
