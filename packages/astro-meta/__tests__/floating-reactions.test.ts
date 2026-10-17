import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import FloatingReactions from '../dist/astro-floating-reactions/FloatingReactions.astro'

/**
 * The Astro FloatingReactions ships the keyframes its reactions animate with,
 * so an app needs no global CSS for the rise, or for the in-place fade that
 * replaces it under `prefers-reduced-motion: reduce`.
 */

async function render(props: Record<string, unknown>): Promise<string> {
  const container = await AstroContainer.create()
  return container.renderToString(
    FloatingReactions as Parameters<AstroContainer['renderToString']>[0],
    { props },
  )
}

const RISE = '@keyframes rfr-floating-reaction-rise {'
const FADE = '@keyframes rfr-floating-reaction-fade {'

describe('astro-floating-reactions motion', () => {
  it('renders the rise and reduced-motion fade keyframes', async () => {
    const html = await render({ reactions: [{ id: '1', emoji: '👋', lane: 1 }] })
    const style = html.match(/<style>([\s\S]*?)<\/style>/)
    expect(style).not.toBeNull()
    expect(style![1]).toContain(RISE)
    expect(style![1]).toContain(FADE)
  })

  it('keeps the keyframes outside the live region', async () => {
    const html = await render({ reactions: [{ id: '1', emoji: '👋' }] })
    expect(html.indexOf('<style>')).toBeLessThan(html.indexOf('role="status"'))
    expect(html.slice(html.indexOf('role="status"'))).not.toContain('<style')
  })

  it('animates each reaction with the rise, and the fade under reduced motion', async () => {
    const html = await render({
      reactions: [
        { id: '1', emoji: '👋', lane: 0 },
        { id: '2', emoji: '❤️', lane: 3 },
      ],
    })
    expect(html.split('animate-[rfr-floating-reaction-rise_3s_ease-out_forwards]').length - 1).toBe(2)
    expect(html.split('motion-reduce:animate-[rfr-floating-reaction-fade_3s_ease-out_forwards]').length - 1).toBe(2)
  })
})
