import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { FloatingReactions } from '../src/floating-reactions.js'
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
