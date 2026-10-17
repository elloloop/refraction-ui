import { test, expect, type Locator, type Page } from '@playwright/test'

type RGB = [number, number, number]
type Point = { x: number; y: number }

/**
 * Points inside a presence dot's fill, around its centre, with the fill colour
 * and what each point lies in: outside the dot's own avatar (where a clipping
 * avatar would cut it) and inside the next avatar in the stack (where that
 * avatar would cover it).
 */
async function dotSamples(dot: Locator) {
  await dot.scrollIntoViewIfNeeded()
  return dot.evaluate((el) => {
    const circle = (box: Element) => {
      const r = box.getBoundingClientRect()
      const style = getComputedStyle(box)
      // The padding box: where an avatar that clipped its content would clip.
      const inner = r.width / 2 - parseFloat(style.borderLeftWidth)
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: inner, outer: r.width / 2 }
    }
    const own = circle(el.parentElement!)
    const next = el.parentElement!.nextElementSibling
    const neighbour = next ? circle(next) : null
    const d = el.getBoundingClientRect()
    const fillRadius = d.width / 2 - parseFloat(getComputedStyle(el).borderLeftWidth)
    const centre = { x: d.left + d.width / 2, y: d.top + d.height / 2 }
    const points = Array.from({ length: 8 }, (_, i) => {
      const angle = (i * Math.PI) / 4
      return {
        x: centre.x + Math.cos(angle) * fillRadius * 0.6,
        y: centre.y + Math.sin(angle) * fillRadius * 0.6,
      }
    })
    const dist = (p: { x: number; y: number }, c: { x: number; y: number }) =>
      Math.hypot(p.x - c.x, p.y - c.y)
    // The fill as sRGB bytes, however the theme writes the colour.
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = getComputedStyle(el).backgroundColor
    ctx.fillRect(0, 0, 1, 1)
    const fill = Array.from(ctx.getImageData(0, 0, 1, 1).data.slice(0, 3))
    return {
      points,
      fill,
      outsideOwn: points.filter((p) => dist(p, own) > own.r + 0.5).length,
      insideNext: neighbour ? points.filter((p) => dist(p, neighbour) < neighbour.outer).length : 0,
    }
  })
}

/** The colours actually painted at viewport points. */
async function paintedAt(page: Page, points: Point[]): Promise<RGB[]> {
  const colours: RGB[] = []
  for (const { x, y } of points) {
    const png = await page.screenshot({ clip: { x: x - 0.5, y: y - 0.5, width: 1, height: 1 } })
    colours.push(
      await page.evaluate(async (data) => {
        const image = new Image()
        image.src = `data:image/png;base64,${data}`
        await image.decode()
        const canvas = document.createElement('canvas')
        canvas.width = image.width
        canvas.height = image.height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(image, 0, 0)
        const { data: px } = ctx.getImageData(Math.floor(image.width / 2), Math.floor(image.height / 2), 1, 1)
        return [px[0], px[1], px[2]] as RGB
      }, png.toString('base64')),
    )
  }
  return colours
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/components/avatar-group')
})

test('presence dots are painted whole, over the edge and over the next avatar', async ({ page }) => {
  const example = page.getByTestId('avatar-group-presence-example')
  await expect(example.getByRole('img', { name: 'Ada Lovelace (online)' })).toHaveCount(2)

  const dots = example.locator('[class*="bottom-0"][class*="end-0"]')
  await expect(dots).toHaveCount(8)
  let overNeighbour = 0
  for (const dot of await dots.all()) {
    const { points, fill, outsideOwn, insideNext } = await dotSamples(dot)
    // Every dot reaches past its own avatar's edge, where clipping would cut it.
    expect(outsideOwn, 'some samples lie outside the avatar').toBeGreaterThan(0)
    // In the small stack the dot also reaches into the next avatar's circle,
    // where that avatar would paint over it.
    if (insideNext > 0) overNeighbour++
    const painted = await paintedAt(page, points)
    for (const colour of painted) {
      for (let channel = 0; channel < 3; channel++) {
        expect(Math.abs(colour[channel] - fill[channel]), `painted ${colour} vs fill ${fill}`).toBeLessThan(24)
      }
    }
  }
  expect(overNeighbour, 'dots that reach into the next avatar').toBe(4)
})

test('a photo that fails to load leaves the initials', async ({ page }) => {
  const grace = page
    .getByTestId('avatar-group-presence-example')
    .getByRole('img', { name: 'Grace Hopper (away)' })
    .first()
  await expect(grace.locator('img')).toHaveCount(0)
  await expect(grace).toHaveText('GH')
})

test('the "+N" button is reached by keyboard and opens the list of everyone', async ({ page, isMobile }) => {
  const example = page.getByTestId('avatar-group-presence-example')
  const more = example.getByRole('button', { name: '2 more users' }).first()

  // The basic example has no handler: its badge is a label, not a button.
  await expect(page.getByRole('img', { name: '1 more users' })).toBeVisible()
  await expect(page.getByRole('button', { name: '1 more users' })).toHaveCount(0)

  const shadow = () => more.evaluate((el) => getComputedStyle(el).boxShadow)
  const resting = await shadow()

  // Reach the button from the element before it, as a keyboard user would.
  // WebKit on a phone does not Tab to buttons (Safari's default), so there it
  // is focused directly, the way an attached keyboard or switch control would.
  if (isMobile) {
    await more.focus()
  } else {
    await page.getByRole('heading', { name: 'Presence, missing photos and everyone else' }).click()
    await page.keyboard.press('Tab')
  }
  await expect(more).toBeFocused()
  // Every avatar wears a background-coloured ring; focus paints it in the
  // focus-ring colour instead.
  const ringColour = await more.evaluate((el) => {
    const probe = document.createElement('span')
    probe.style.color = 'hsl(var(--ring))'
    el.ownerDocument.body.append(probe)
    const colour = getComputedStyle(probe).color
    probe.remove()
    return colour
  })
  expect(resting).not.toContain(ringColour)
  expect(await shadow(), 'a focus ring is drawn').toContain(ringColour)
  await expect(more).toHaveCSS('outline-style', 'none')

  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Everyone here (6)' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText('Do Not Disturb')).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(more).toBeFocused()
})
