import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { floatingReactionsStyles } from '@refraction-ui/floating-reactions'
import { FloatingReactions, ReactionBurst } from '../src/floating-reactions.js'
import type { FloatingReaction } from '../src/floating-reactions.js'

const render = (props: React.ComponentProps<typeof FloatingReactions>) =>
  renderToString(React.createElement(FloatingReactions, props))

describe('FloatingReactions (SSR)', () => {
  it('renders the overlay container with role="status"', () => {
    const html = render({ reactions: [] })
    expect(html).toContain('role="status"')
  })

  it('renders aria-live="polite" on the overlay', () => {
    const html = render({ reactions: [] })
    expect(html).toContain('aria-live="polite"')
  })

  it('renders each reaction item with its emoji', () => {
    const reactions: FloatingReaction[] = [
      { id: '1', emoji: '👋', lane: 0 },
      { id: '2', emoji: '❤️', lane: 2 },
    ]
    const html = render({ reactions })
    expect(html).toContain('👋')
    expect(html).toContain('❤️')
  })

  it('renders N reaction items for N reactions', () => {
    const reactions: FloatingReaction[] = [
      { id: 'a', emoji: '👋', lane: 0 },
      { id: 'b', emoji: '🎉', lane: 1 },
      { id: 'c', emoji: '❤️', lane: 3 },
    ]
    const html = render({ reactions })
    // Each reaction gets an aria-hidden span
    const count = (html.match(/aria-hidden="true"/g) ?? []).length
    expect(count).toBe(reactions.length)
  })

  it('applies the lane offset as a left% inline style', () => {
    const reactions: FloatingReaction[] = [{ id: '1', emoji: '👋', lane: 0 }]
    // lane 0, lanes default 5 → 10%
    const html = render({ reactions, lanes: 5 })
    expect(html).toContain('left:10%')
  })

  it('applies a different lane offset for lane 2', () => {
    const reactions: FloatingReaction[] = [{ id: '1', emoji: '❤️', lane: 2 }]
    // lane 2, lanes 5 → 50%
    const html = render({ reactions, lanes: 5 })
    expect(html).toContain('left:50%')
  })

  it('accepts additional className', () => {
    const html = render({ reactions: [], className: 'my-overlay' })
    expect(html).toContain('my-overlay')
  })

  it('renders empty overlay with no reaction spans when reactions is empty', () => {
    const html = render({ reactions: [] })
    expect(html).not.toContain('aria-hidden="true"')
  })
})

describe('FloatingReactions motion (SSR)', () => {
  const styleTag = /<style[^>]*data-href="refraction-ui\/floating-reactions"[^>]*>([\s\S]*?)<\/style>/g

  it('ships the library stylesheet with the overlay, so no global CSS is needed', () => {
    const html = render({ reactions: [] })
    const sheets = [...html.matchAll(styleTag)]
    expect(sheets).toHaveLength(1)
    expect(sheets[0][1]).toBe(floatingReactionsStyles)
  })

  it('renders the stylesheet once however many overlays a page has', () => {
    const html = renderToString(
      <div>
        <FloatingReactions reactions={[{ id: 'a', emoji: '👋' }]} />
        <FloatingReactions reactions={[]} />
      </div>,
    )
    expect([...html.matchAll(styleTag)]).toHaveLength(1)
  })

  it('marks every reaction item so the stylesheet animates it', () => {
    const reactions: FloatingReaction[] = [
      { id: 'a', emoji: '👋', lane: 0 },
      { id: 'b', emoji: '🎉', lane: 1 },
    ]
    const html = render({ reactions })
    expect((html.match(/data-floating-reaction=""/g) ?? []).length).toBe(reactions.length)
  })

  it('keeps a ReactionBurst still: no motion marker and no stylesheet', () => {
    const html = renderToString(<ReactionBurst emoji="🎉" lane={2} />)
    expect(html).toContain('🎉')
    expect(html).not.toContain('data-floating-reaction')
    expect(html).not.toContain('<style')
  })
})
