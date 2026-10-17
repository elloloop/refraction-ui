import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import Avatar from '../dist/astro-avatar/Avatar.astro'
import AvatarPresenceComposition from './compositions/avatar-presence.astro'

/**
 * The Astro Avatar as consumers install it (the meta's dist copy), rendered
 * server-side: the presence dot, the name it adds to, and the classes that
 * keep the dot from being clipped.
 */

async function render(
  props: Record<string, unknown>,
  slot = '<span data-testid="initials">AL</span>',
): Promise<string> {
  const container = await AstroContainer.create()
  return container.renderToString(Avatar as Parameters<AstroContainer['renderToString']>[0], {
    props,
    slots: { default: slot },
  })
}

function rootTag(html: string): string {
  const tag = html.match(/<span[^>]*data-rfr-avatar[^>]*>/)?.[0]
  if (!tag) throw new Error('avatar not rendered')
  return tag
}

function presenceDot(html: string): string | undefined {
  return html.match(/<span[^>]*data-slot="avatar-presence"[^>]*>/)?.[0]
}

describe('astro-avatar presence (SSR)', () => {
  it('renders no dot without presence, and the root does not clip', async () => {
    const html = await render({ 'aria-label': 'Ada Lovelace' })
    expect(presenceDot(html)).toBeUndefined()
    expect(rootTag(html)).toContain('aria-label="Ada Lovelace"')
    expect(rootTag(html)).not.toContain('overflow-hidden')
  })

  it('adds the status to a named avatar and hides the dot from assistive tech', async () => {
    const html = await render({ 'aria-label': 'Ada Lovelace', presence: 'away' })
    const root = rootTag(html)
    expect(root).toContain('role="img"')
    expect(root).toContain('aria-label="Ada Lovelace (Away)"')
    expect(root).toContain('data-presence="away"')
    const dot = presenceDot(html)
    expect(dot).toContain('aria-hidden="true"')
    expect(dot).toContain('bg-warning')
    expect(dot).toContain('data-status="away"')
  })

  it('names the dot when the avatar itself has no name', async () => {
    const html = await render({ presence: 'online' })
    expect(rootTag(html)).not.toContain('role="img"')
    const dot = presenceDot(html)
    expect(dot).toContain('role="img"')
    expect(dot).toContain('aria-label="Online"')
  })

  it('takes the status words from presenceLabel', async () => {
    const html = await render({ 'aria-label': 'Ada', presence: 'dnd', presenceLabel: 'Ne pas déranger' })
    expect(rootTag(html)).toContain('aria-label="Ada (Ne pas déranger)"')
  })

  it('sizes and places the dot for the avatar size and shape, after the slot', async () => {
    const circle = await render({ size: 'xl', presence: 'online' })
    expect(presenceDot(circle)).toContain('h-4 w-4')
    expect(presenceDot(circle)).toContain('bottom-0 end-0')
    expect(circle.indexOf('data-slot="avatar-presence"')).toBeGreaterThan(circle.indexOf('initials'))

    const square = await render({ size: 'xs', shape: 'square', presence: 'online' })
    expect(presenceDot(square)).toContain('h-2 w-2')
    expect(presenceDot(square)).toContain('-bottom-0.5 -end-0.5')
  })
})

describe('astro-avatar (public meta)', () => {
  it('imports from @refraction-ui/astro and layers the dot over the image and the fallback', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(
      AvatarPresenceComposition as Parameters<AstroContainer['renderToString']>[0],
    )
    expect(rootTag(html)).toContain('aria-label="Ada Lovelace (Online)"')
    const image = html.match(/<img[^>]*data-rfr-avatar-image[^>]*>/)?.[0]
    expect(image).toContain('absolute inset-0')
    expect(image).toContain('rounded-[inherit]')
    const fallback = html.match(/<span[^>]*data-rfr-avatar-fallback[^>]*>/)?.[0]
    expect(fallback).toContain('overflow-hidden')
    expect(fallback).toContain('rounded-[inherit]')
    const order = ['<img', 'data-rfr-avatar-fallback', 'data-slot="avatar-presence"'].map((marker) =>
      html.indexOf(marker),
    )
    expect(order).toEqual([...order].sort((a, b) => a - b))
    expect(order[0]).toBeGreaterThan(-1)
  }, 60_000)
})
