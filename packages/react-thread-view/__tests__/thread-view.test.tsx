import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { ThreadView } from '../src/thread-view.js'
import type { MessageData } from '@refraction-ui/thread-view'

function makeMessage(overrides: Partial<MessageData> = {}): MessageData {
  return {
    id: 'm1',
    author: { id: 'u1', name: 'Ada' },
    content: 'Hello thread',
    // 3:05 PM local time — formatTimestamp uses local getters.
    timestamp: new Date(2026, 0, 15, 15, 5),
    ...overrides,
  }
}

describe('ThreadView (React SSR)', () => {
  it('renders a log-role container with polite live region', () => {
    const html = renderToString(React.createElement(ThreadView, { messages: [] }))
    expect(html).toContain('role="log"')
    expect(html).toContain('aria-label="Message thread"')
    expect(html).toContain('aria-live="polite"')
  })

  it('renders each message as an article with an accessible label', () => {
    const html = renderToString(React.createElement(ThreadView, { messages: [makeMessage()] }))
    expect(html).toContain('role="article"')
    expect(html).toContain('aria-label="Message from Ada at 3:05 PM"')
  })

  it('marks messages from the current user with "(you)"', () => {
    const html = renderToString(
      React.createElement(ThreadView, { messages: [makeMessage()], currentUserId: 'u1' }),
    )
    expect(html).toContain('Message from Ada (you) at 3:05 PM')
  })

  it('renders the author name, timestamp, and message body', () => {
    const html = renderToString(React.createElement(ThreadView, { messages: [makeMessage()] }))
    expect(html).toContain('>Ada</span>')
    expect(html).toContain('3:05 PM')
    expect(html).toContain('Hello thread')
  })

  it('renders the author initial when no avatarUrl is set', () => {
    const html = renderToString(React.createElement(ThreadView, { messages: [makeMessage()] }))
    expect(html).toContain('>A</div>')
    expect(html).not.toContain('<img')
  })

  it('renders an avatar image with the author name as alt text', () => {
    const html = renderToString(
      React.createElement(ThreadView, {
        messages: [makeMessage({ author: { id: 'u1', name: 'Ada', avatarUrl: 'https://example.com/a.png' } })],
      }),
    )
    expect(html).toContain('<img')
    expect(html).toContain('src="https://example.com/a.png"')
    expect(html).toContain('alt="Ada"')
  })

  it('renders reactions as buttons with emoji and count', () => {
    const html = renderToString(
      React.createElement(ThreadView, {
        messages: [
          makeMessage({ reactions: [{ emoji: '👍', count: 3, userReacted: false }] }),
        ],
      }),
    )
    expect(html).toContain('<button')
    expect(html).toContain('👍 3')
  })

  it('highlights reactions the current user already made', () => {
    const html = renderToString(
      React.createElement(ThreadView, {
        messages: [
          makeMessage({ reactions: [{ emoji: '🎉', count: 1, userReacted: true }] }),
        ],
      }),
    )
    expect(html).toContain('border-primary')
    expect(html).toContain('bg-primary/10')
  })

  it('renders a singular reply indicator for one reply', () => {
    const html = renderToString(
      React.createElement(ThreadView, {
        messages: [makeMessage({ replies: [makeMessage({ id: 'm2' })] })],
      }),
    )
    expect(html).toContain('1 reply')
  })

  it('renders a plural reply indicator for multiple replies', () => {
    const html = renderToString(
      React.createElement(ThreadView, {
        messages: [
          makeMessage({ replies: [makeMessage({ id: 'm2' }), makeMessage({ id: 'm3' })] }),
        ],
      }),
    )
    expect(html).toContain('2 replies')
  })

  it('renders the (edited) marker for edited messages', () => {
    const html = renderToString(
      React.createElement(ThreadView, { messages: [makeMessage({ edited: true })] }),
    )
    expect(html).toContain('(edited)')
  })

  it('renders attachments with their names', () => {
    const html = renderToString(
      React.createElement(ThreadView, {
        messages: [
          makeMessage({
            attachments: [{ id: 'a1', name: 'spec.pdf', url: '#', type: 'file' }],
          }),
        ],
      }),
    )
    expect(html).toContain('spec.pdf')
  })

  it('renders a Reply action button per message with an accessible label', () => {
    const html = renderToString(React.createElement(ThreadView, { messages: [makeMessage()] }))
    expect(html).toContain('aria-label="Reply to message"')
    expect(html).toContain('>Reply</button>')
  })

  it('appends a custom className to the container', () => {
    const html = renderToString(
      React.createElement(ThreadView, { messages: [], className: 'my-thread' }),
    )
    expect(html).toContain('my-thread')
  })
})
