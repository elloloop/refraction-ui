import { test, expect, type Locator, type Page } from '@playwright/test'

// FloatingReactions ships its own keyframes: a reaction rises and fades, and
// under `prefers-reduced-motion: reduce` it fades where it appeared instead.
// Each check pauses the real CSS animation at a point in its 3 s life and reads
// where the reaction is and how opaque it is, so nothing depends on timing.

const REACTION = '[data-component="floating-reactions"] > span[aria-hidden="true"]'

interface Sample {
  animations: number
  name: string
  /** Offset of the reaction's top from its overlay's top, in CSS px. */
  top: number
  /** Height of the box the reaction is positioned in, in CSS px. */
  overlayHeight: number
  opacity: number
  movesInAnyFrame: boolean
}

/** Pause the reaction's animation at `ms` into its life and measure it. */
async function sampleAt(reaction: Locator, ms: number): Promise<Sample> {
  return reaction.evaluate((el, at) => {
    const animations = el.getAnimations()
    for (const animation of animations) {
      animation.pause()
      animation.currentTime = at
    }
    const style = getComputedStyle(el)
    const movement = ['bottom', 'top', 'left', 'right', 'inset', 'transform', 'translate', 'scale', 'rotate', 'margin']
    return {
      animations: animations.length,
      name: style.animationName,
      top: el.getBoundingClientRect().top - el.parentElement!.getBoundingClientRect().top,
      overlayHeight: el.parentElement!.getBoundingClientRect().height,
      opacity: Number(style.opacity),
      movesInAnyFrame: animations.some((animation) =>
        (animation.effect as KeyframeEffect)
          .getKeyframes()
          .some((frame) => movement.some((property) => property in frame)),
      ),
    }
  }, ms)
}

async function prefersReducedMotion(page: Page) {
  return page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
}

test.describe('floating reactions motion', () => {
  test('a reaction rises and fades out with the keyframes the component ships', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/components/floating-reactions')
    expect(await prefersReducedMotion(page)).toBe(false)

    const reaction = page.locator(REACTION).first()
    await expect(reaction).toBeAttached()
    const start = await sampleAt(reaction, 0)
    const middle = await sampleAt(reaction, 1500)
    const end = await sampleAt(reaction, 2950)

    // Without the keyframes the browser creates no animation at all.
    expect(start.animations).toBe(1)
    expect(start.name).toBe('rfr-floating-reaction-rise')
    expect(start.opacity).toBe(1)
    expect(middle.top).toBeLessThan(start.top - 5)
    expect(middle.opacity).toBe(1)
    // By the end it has risen most of the way up the overlay (80% at 3 s) and faded out.
    expect((start.top - end.top) / start.overlayHeight).toBeGreaterThan(0.7)
    expect((start.top - end.top) / start.overlayHeight).toBeLessThanOrEqual(0.8)
    expect(end.opacity).toBeLessThan(0.2)
  })

  test('with reduced motion a reaction fades where it appeared, on the same schedule', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/components/floating-reactions')
    expect(await prefersReducedMotion(page)).toBe(true)

    const reaction = page.locator(REACTION).first()
    await expect(reaction).toBeAttached()
    const start = await sampleAt(reaction, 0)
    const middle = await sampleAt(reaction, 1500)
    const end = await sampleAt(reaction, 2950)

    expect(start.animations).toBe(1)
    expect(start.name).toBe('rfr-floating-reaction-fade')
    expect(start.movesInAnyFrame).toBe(false)
    expect(Math.abs(middle.top - start.top)).toBeLessThan(0.5)
    expect(Math.abs(end.top - start.top)).toBeLessThan(0.5)
    expect(middle.opacity).toBe(1)
    expect(end.opacity).toBeLessThan(0.2)
  })

  test('a reaction sent at runtime animates too', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/components/floating-reactions')

    const interactive = page.locator('[data-component="floating-reactions"]').last()
    await expect(interactive.locator('> span')).toHaveCount(0)
    await page.getByRole('button', { name: 'Send 👋' }).click()

    const sent = interactive.locator('> span[aria-hidden="true"]').first()
    await expect(sent).toBeAttached()
    const sample = await sampleAt(sent, 1500)
    expect(sample.animations).toBe(1)
    expect(sample.name).toBe('rfr-floating-reaction-rise')
  })
})
