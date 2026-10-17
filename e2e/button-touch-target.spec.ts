import { test, expect, type Locator } from '@playwright/test'

// `touchTarget` must grow the area that receives pointer input to 44×44 CSS px
// while the button keeps its visual size. Hit-testing is the browser's own
// answer to "would a tap here land on the button?", so assert on that.
const TARGET = 44
const ICON_SIZES = [36, 32, 28] // icon, icon-sm, icon-xs, in the docs example order

/** Size of the button and, for each offset from its centre, whether a tap there lands on it. */
async function probe(button: Locator, offsets: Array<[number, number]>) {
  return button.evaluate((el, points) => {
    // Centre it (instantly: the docs page scrolls smoothly) so every probe point is in the viewport.
    el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' })
    const box = el.getBoundingClientRect()
    const cx = box.left + box.width / 2
    const cy = box.top + box.height / 2
    return {
      width: box.width,
      height: box.height,
      hits: points.map(([dx, dy]) => {
        const hit = document.elementFromPoint(cx + dx, cy + dy)
        return !!hit && el.contains(hit)
      }),
    }
  }, offsets)
}

test('button touchTarget: 44px hit area without changing the visual size', async ({ page }) => {
  await page.goto('/components/button')
  const buttons = page.locator('[data-touch-target]')
  await expect(buttons).toHaveCount(ICON_SIZES.length)

  const inside = TARGET / 2 - 1
  const outside = TARGET / 2 + 1
  const insidePoints: Array<[number, number]> = [[inside, 0], [-inside, 0], [0, inside], [0, -inside]]
  const outsidePoints: Array<[number, number]> = [[outside, 0], [-outside, 0], [0, outside], [0, -outside]]

  for (const [index, size] of ICON_SIZES.entries()) {
    const result = await probe(buttons.nth(index), [...insidePoints, ...outsidePoints])

    // The visual box is unchanged.
    expect(Math.round(result.width)).toBe(size)
    expect(Math.round(result.height)).toBe(size)
    // Outside the visual box but inside the 44px square: still the button.
    expect(result.hits.slice(0, 4), `${size}px button, points ${inside}px from its centre`).toEqual([true, true, true, true])
    // Just beyond the 44px square: not the button.
    expect(result.hits.slice(4), `${size}px button, points ${outside}px from its centre`).toEqual([false, false, false, false])
  }
})
