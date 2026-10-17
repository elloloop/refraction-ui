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

  it('renders the add-reaction button when onAddReaction is given', () => {
    const html = renderToString(
      React.createElement(ReactionBar, { reactions: REACTIONS, onAddReaction: () => {} }),
    )
    expect(html).toContain('aria-label="Add reaction"')
    expect(html).toMatch(/>\+</)
  })

  it('renders no add-reaction button without a handler for it', () => {
    const html = renderToString(
      React.createElement(ReactionBar, { reactions: REACTIONS }),
    )
    expect(html).not.toContain('aria-label="Add reaction"')
  })

  it('hides the add-reaction button when showAddButton is false', () => {
    const html = renderToString(
      React.createElement(ReactionBar, {
        reactions: REACTIONS,
        onAddReaction: () => {},
        showAddButton: false,
      }),
    )
    expect(html).not.toContain('aria-label="Add reaction"')
  })

  it('renders no pills when reactions is empty', () => {
    const html = renderToString(
      React.createElement(ReactionBar, { reactions: [], onAddReaction: () => {} }),
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

  it('every button carries a focus-visible ring', () => {
    const html = renderToString(
      React.createElement(ReactionBar, {
        reactions: REACTIONS,
        maxVisible: 1,
        onAddReaction: () => {},
      }),
    )
    // The one visible pill, the overflow button and the add button.
    expect(html.split('focus-visible:ring-2').length - 1).toBe(3)
    expect(html).toContain('motion-reduce:transition-none')
  })
})

describe('ReactionBar (SSR) - who reacted', () => {
  const AGREE: Reaction = {
    emoji: '\u{1F44D}',
    label: 'Agree',
    count: 5,
    userReacted: true,
    reactors: ['You', 'Dev Patel'],
  }

  it('a label names the pill instead of the emoji', () => {
    const html = renderToString(React.createElement(ReactionBar, { reactions: [AGREE] }))
    expect(html).toContain('aria-label="Agree 5 reactions, you reacted"')
  })

  it('renders a hidden tooltip the pill is described by', () => {
    const html = renderToString(React.createElement(ReactionBar, { reactions: [AGREE] }))
    const describedBy = html.match(/aria-describedby="([^"]+)"/)?.[1]
    expect(describedBy).toBeTruthy()
    const tooltip = new RegExp(`<span id="${describedBy}" role="tooltip"[^>]*hidden=""[^>]*>`)
    expect(html).toMatch(tooltip)
    expect(html).toContain('You, Dev Patel and 3 others reacted with Agree')
  })

  it('renders no tooltip and no description without reactors', () => {
    const html = renderToString(React.createElement(ReactionBar, { reactions: REACTIONS }))
    expect(html).not.toContain('role="tooltip"')
    expect(html).not.toContain('aria-describedby')
  })

  it('uses custom strings for the name and the tooltip', () => {
    const html = renderToString(
      React.createElement(ReactionBar, {
        reactions: [AGREE],
        strings: {
          groupLabel: 'Message reactions',
          reactionSemantics: (label, count) => `${label}: ${count}`,
          reactorsTooltip: (reactors, label) => `${label} — ${reactors.join(', ')}`,
        },
      }),
    )
    expect(html).toContain('aria-label="Message reactions"')
    expect(html).toContain('aria-label="Agree: 5"')
    expect(html).toContain('Agree — You, Dev Patel')
  })
})

describe('ReactionBar (SSR) - overflow', () => {
  const FOUR: Reaction[] = ['\u{1F44D}', '\u{1F389}', '\u{1F680}', '\u{1F440}'].map((emoji) => ({
    emoji,
    count: 1,
    userReacted: false,
  }))

  it('shows maxVisible pills and a collapsed "+N" button', () => {
    const html = renderToString(
      React.createElement(ReactionBar, { reactions: FOUR, maxVisible: 2 }),
    )
    expect(html.split('aria-pressed=').length - 1).toBe(2)
    expect(html).not.toContain('\u{1F680}')
    expect(html).toMatch(/<button[^>]*aria-expanded="false"[^>]*aria-label="Show 2 more reactions"[^>]*>\+2<\/button>/)
  })

  it('renders no overflow button within the limit', () => {
    const html = renderToString(
      React.createElement(ReactionBar, { reactions: FOUR, maxVisible: 4 }),
    )
    expect(html).not.toContain('aria-expanded')
  })
})
