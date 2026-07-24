import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { ReactionBar } from '../src/reaction-bar.js'
import type { Reaction } from '../src/index.js'

const REACTIONS: Reaction[] = [
  { emoji: '\u{1F44D}', count: 3, userReacted: true },
  { emoji: '\u{1F389}', count: 1, userReacted: false },
]

describe('ReactionBar (SSR)', () => {
  it('renders a group container labelled "Reactions"', () => {
    const html = renderToString(
      React.createElement(ReactionBar, { reactions: REACTIONS }),
    )
    expect(html).toContain('role="group"')
    expect(html).toContain('aria-label="Reactions"')
  })

  it('container applies base layout classes', () => {
    const html = renderToString(
      React.createElement(ReactionBar, { reactions: REACTIONS }),
    )
    expect(html).toContain('flex')
    expect(html).toContain('flex-wrap')
    expect(html).toContain('items-center')
    expect(html).toContain('gap-1')
  })

  it('renders every reaction emoji and count', () => {
    const html = renderToString(
      React.createElement(ReactionBar, { reactions: REACTIONS }),
    )
    expect(html).toContain('\u{1F44D}')
    expect(html).toContain('\u{1F389}')
    expect(html).toMatch(/>3</)
    expect(html).toMatch(/>1</)
  })

  it('renders each pill as a native button', () => {
    const html = renderToString(
      React.createElement(ReactionBar, { reactions: REACTIONS }),
    )
    expect(html).toContain('<button')
    expect(html).toContain('type="button"')
  })

  it('aria-pressed reflects userReacted state', () => {
    const html = renderToString(
      React.createElement(ReactionBar, { reactions: REACTIONS }),
    )
    expect(html).toContain('aria-pressed="true"')
    expect(html).toContain('aria-pressed="false"')
  })

  it('pill aria-label includes emoji, count and pluralized noun', () => {
    const html = renderToString(
      React.createElement(ReactionBar, { reactions: REACTIONS }),
    )
    expect(html).toContain(`aria-label="\u{1F44D} 3 reactions, you reacted"`)
    expect(html).toContain(`aria-label="\u{1F389} 1 reaction"`)
  })

  it('uses singular "reaction" for a count of 1', () => {
    const html = renderToString(
      React.createElement(ReactionBar, {
        reactions: [{ emoji: '\u{1F525}', count: 1, userReacted: false }],
      }),
    )
    expect(html).toContain('1 reaction"')
    expect(html).not.toContain('1 reactions"')
  })

  it('appends "you reacted" to the aria-label only when userReacted', () => {
    const html = renderToString(
      React.createElement(ReactionBar, {
        reactions: [
          { emoji: '\u{1F44D}', count: 2, userReacted: true },
          { emoji: '\u{1F389}', count: 2, userReacted: false },
        ],
      }),
    )
    expect(html).toContain('2 reactions, you reacted"')
    expect(html).toContain(`aria-label="\u{1F389} 2 reactions"`)
  })

  it('active pill gets the active variant classes', () => {
    const html = renderToString(
      React.createElement(ReactionBar, {
        reactions: [{ emoji: '\u{1F44D}', count: 2, userReacted: true }],
      }),
    )
    expect(html).toContain('border-primary')
    expect(html).toContain('bg-primary/10')
    expect(html).toContain('text-primary')
  })

  it('inactive pill gets the inactive variant classes', () => {
    const html = renderToString(
      React.createElement(ReactionBar, {
        reactions: [{ emoji: '\u{1F44D}', count: 2, userReacted: false }],
      }),
    )
    expect(html).toContain('border-border')
    expect(html).toContain('bg-background')
    expect(html).not.toContain('bg-primary/10')
  })

  it('pill base classes include rounded-full and cursor-pointer', () => {
    const html = renderToString(
      React.createElement(ReactionBar, { reactions: REACTIONS }),
    )
    expect(html).toContain('rounded-full')
    expect(html).toContain('cursor-pointer')
  })

  it('count span uses tabular-nums styling', () => {
    const html = renderToString(
      React.createElement(ReactionBar, { reactions: REACTIONS }),
    )
    expect(html).toContain('tabular-nums')
  })

  it('renders the add-reaction button by default', () => {
    const html = renderToString(
      React.createElement(ReactionBar, { reactions: REACTIONS }),
    )
    expect(html).toContain('aria-label="Add reaction"')
    expect(html).toMatch(/>\+</)
  })

  it('hides the add-reaction button when showAddButton is false', () => {
    const html = renderToString(
      React.createElement(ReactionBar, {
        reactions: REACTIONS,
        showAddButton: false,
      }),
    )
    expect(html).not.toContain('aria-label="Add reaction"')
  })

  it('renders no pills when reactions is empty', () => {
    const html = renderToString(
      React.createElement(ReactionBar, { reactions: [] }),
    )
    expect(html).toContain('role="group"')
    expect(html).not.toContain('aria-pressed')
    // Only the add button remains
    expect(html).toContain('aria-label="Add reaction"')
  })

  it('applies custom className to the container', () => {
    const html = renderToString(
      React.createElement(ReactionBar, {
        reactions: REACTIONS,
        className: 'my-reactions',
      }),
    )
    expect(html).toContain('my-reactions')
  })
})
