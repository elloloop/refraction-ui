import { test, expect, type Locator, type Page } from '@playwright/test'

const PEOPLE = [
  'Ada Lovelace (Online)',
  'Grace Hopper (Away)',
  'Alan Turing (Busy)',
  'Katherine Johnson (Do Not Disturb)',
  'Edsger Dijkstra (Offline)',
]

type RGB = [number, number, number]

/**
 * A point in the part of the dot that overhangs the avatar's own shape, and
 * the colour the dot is filled with there. The point lies outward from the
 * avatar: beyond its circle, or beyond the edge of a square avatar.
 */
async function overhang(dot: Locator) {
  await dot.scrollIntoViewIfNeeded()
  return dot.evaluate((el) => {
    const a = el.parentElement!.getBoundingClientRect()
    const d = el.getBoundingClientRect()
    const rd = d.width / 2
    const dc = { x: d.left + rd, y: d.top + rd }
    let x: number
    let y: number
    let outsideBy: number
    if (el.parentElement!.className.includes('rounded-full')) {
      const R = a.width / 2
      const ac = { x: a.left + R, y: a.top + R }
      const len = Math.hypot(dc.x - ac.x, dc.y - ac.y)
      x = dc.x + ((dc.x - ac.x) / len) * rd * 0.5
      y = dc.y + ((dc.y - ac.y) / len) * rd * 0.5
      outsideBy = Math.hypot(x - ac.x, y - ac.y) - R
    } else {
      x = (a.right + d.right) / 2
      y = dc.y
      outsideBy = x - a.right
    }
    // The fill as sRGB bytes, however the theme writes the colour.
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = getComputedStyle(el).backgroundColor
    ctx.fillRect(0, 0, 1, 1)
    const fill = Array.from(ctx.getImageData(0, 0, 1, 1).data.slice(0, 3))
    return { x, y, outsideBy, fill }
  })
}

/** The colour actually painted at a viewport point. */
async function paintedAt(page: Page, x: number, y: number): Promise<RGB> {
  const png = await page.screenshot({ clip: { x: x - 0.5, y: y - 0.5, width: 1, height: 1 } })
  return page.evaluate(async (data) => {
    const image = new Image()
    image.src = `data:image/png;base64,${data}`
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(image, 0, 0)
    const [r, g, b] = ctx.getImageData(Math.floor(image.width / 2), Math.floor(image.height / 2), 1, 1).data
    return [r, g, b] as RGB
  }, png.toString('base64'))
}

test('a presence dot joins the avatar name and is painted whole over the edge', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/components/avatar')
  const example = page.getByTestId('avatar-presence-example')

  // A named avatar carries its status in its name; its dot is hidden from
  // assistive tech rather than read a second time.
  for (const name of PEOPLE) {
    await expect(example.getByRole('img', { name, exact: true })).toBeVisible()
  }
  await expect(example.getByRole('img', { name: 'Online', exact: true })).toHaveCount(0)

  // Each dot overhangs its avatar. Where it does, the dot's own colour must be
  // painted: an avatar that clipped its children would show the card instead.
  const dots = example.locator('[data-slot="avatar-presence"]')
  await expect(dots).toHaveCount(11)
  for (const dot of await dots.all()) {
    const { x, y, outsideBy, fill } = await overhang(dot)
    expect(outsideBy, 'the sample point lies outside the avatar').toBeGreaterThan(0.75)
    const painted = await paintedAt(page, x, y)
    for (let channel = 0; channel < 3; channel++) {
      expect(Math.abs(painted[channel] - fill[channel]), `painted ${painted} vs fill ${fill}`).toBeLessThan(24)
    }
  }
})
