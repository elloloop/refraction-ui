import { expect, test, type Locator, type Page } from '@playwright/test'

/** How long a reaction lives (`REACTION_LIFETIME_MS`). */
const LIFETIME_MS = 3000

/** A docs section, found by its heading. */
function section(page: Page, heading: string): Locator {
  return page.locator('section', { has: page.getByRole('heading', { name: heading, exact: true }) })
}

/** Sends one reaction from the interactive demo and returns it. */
async function sendReaction(page: Page): Promise<Locator> {
  await page.goto('/components/floating-reactions')
  const demo = section(page, 'Interactive')
  await demo.getByRole('button', { name: 'Send 🎉' }).click()
  const reaction = demo.locator('[data-floating-reaction]')
  await expect(reaction).toHaveCount(1)
  return reaction
}

interface Frame {
  animationName: string
  duration: string
  /** Vertical offset from where the reaction appeared, in px (negative is up). */
  offsetY: number
  opacity: number
  height: number
}

/**
 * The reaction's animation, paused at `atMs`, so the frame is read exactly
 * rather than raced against the clock.
 */
function frameAt(reaction: Locator, atMs: number): Promise<Frame> {
  return reaction.evaluate((element, at) => {
    const [animation] = element.getAnimations()
    if (!animation) throw new Error('the reaction has no animation')
    animation.pause()
    animation.currentTime = at
    const style = getComputedStyle(element)
    return {
      animationName: style.animationName,
      duration: style.animationDuration,
      offsetY: new DOMMatrixReadOnly(style.transform).m42,
      opacity: Number(style.opacity),
      height: element.getBoundingClientRect().height,
    }
  }, atMs)
}

test('the overlay ships its stylesheet once, in the head', async ({ page }) => {
  await page.goto('/components/floating-reactions')
  const sheets = page.locator('head style[data-href="refraction-ui/floating-reactions"]')
  await expect(sheets).toHaveCount(1)
  // A <style> renders no text, so read its source rather than its rendered text.
  expect(await sheets.evaluate((sheet) => sheet.textContent)).toContain('@keyframes rfr-floating-reaction-rise')
})

test('a reaction rises and fades over its lifetime, then leaves', async ({ page }) => {
  const reaction = await sendReaction(page)

  const start = await frameAt(reaction, 0)
  expect(start.animationName).toBe('rfr-floating-reaction-rise')
  expect(start.duration).toBe(`${LIFETIME_MS / 1000}s`)
  expect(start.offsetY).toBe(0)
  expect(start.opacity).toBe(1)

  const end = await frameAt(reaction, LIFETIME_MS)
  expect(end.offsetY).toBeCloseTo(-0.8 * end.height, 0)
  expect(end.opacity).toBe(0)

  await expect(reaction).toHaveCount(0, { timeout: LIFETIME_MS + 2000 })
})

test.describe('with reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('a reaction stays in place and only fades, then leaves', async ({ page }) => {
    const reaction = await sendReaction(page)

    const start = await frameAt(reaction, 0)
    expect(start.animationName).toBe('rfr-floating-reaction-fade')
    expect(start.duration).toBe(`${LIFETIME_MS / 1000}s`)
    expect(start.opacity).toBe(1)

    for (const at of [LIFETIME_MS / 2, LIFETIME_MS * 0.9, LIFETIME_MS]) {
      expect((await frameAt(reaction, at)).offsetY).toBe(0)
    }
    expect((await frameAt(reaction, LIFETIME_MS)).opacity).toBe(0)

    await expect(reaction).toHaveCount(0, { timeout: LIFETIME_MS + 2000 })
  })
})

test('a ReactionBurst holds still', async ({ page }) => {
  await page.goto('/components/floating-reactions')
  const bursts = section(page, 'Static burst').locator('[aria-hidden="true"]')
  await expect(bursts).toHaveCount(2)
  for (const burst of await bursts.all()) {
    await expect(burst).toHaveCSS('animation-name', 'none')
    await expect(burst).toHaveCSS('opacity', '1')
  }
})
