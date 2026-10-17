import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { ThreadView } from '../src/thread-view.js'
import type { MessageData } from '@refraction-ui/thread-view'

const FOCUS_RING = ['focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring']

const message: MessageData = {
  id: 'm1',
  author: { id: 'u1', name: 'Ada' },
  content: 'Hello thread',
  timestamp: new Date(2026, 0, 15, 15, 5),
  reactions: [
    { emoji: '👍', count: 2, userReacted: true },
    { emoji: '🎉', count: 1, userReacted: false },
  ],
}

/** The class list of every `<button>` in the SSR markup, in document order. */
function buttonClasses(html: string): string[][] {
  return [...html.matchAll(/<button[^>]*class="([^"]*)"/g)].map((match) => match[1].split(/\s+/))
}

describe('ThreadView focus rings (React SSR)', () => {
  const html = renderToString(React.createElement(ThreadView, { messages: [message] }))

  it('renders every control (two reactions and Reply) with a focus ring', () => {
    const buttons = buttonClasses(html)
    expect(buttons).toHaveLength(3)
    for (const classes of buttons) {
      expect(classes).toEqual(expect.arrayContaining(FOCUS_RING))
    }
  })

  it('keeps the reacted pill highlighted', () => {
    const [reacted, notReacted] = buttonClasses(html)
    expect(reacted).toContain('border-primary')
    expect(notReacted).toContain('border-border')
  })

  it('reveals the Reply action when it receives keyboard focus', () => {
    expect(html).toMatch(/<div class="[^"]*focus-within:opacity-100[^"]*"><button[^>]*aria-label="Reply to message"/)
  })
})
