import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Chat, Composer, useConversation } from '../src/index.js'
import type { ConversationConfig } from '@refraction-ui/conversation'
import type { ChatProps } from '../src/chat.js'

// SSR suite — structure and ARIA only. Sending, streaming, reactions, thread
// open/close, and the composer's trigger menus/keyboard formatting are all
// client interactions (textarea events, store updates) not covered here.
//
// `Chat` takes the result of `useConversation()`, so tests render through a
// small harness component that calls the hook. The core store is seeded with
// a fixed clock for deterministic timestamps.

const NOW = new Date('2024-01-01T12:00:00Z')

const user = { id: 'u1', name: 'Ada' }
const assistant = { id: 'asst', name: 'Assistant' }

const seedConfig: ConversationConfig = {
  now: () => NOW,
  currentUser: user,
  assistant,
  conversations: [{ id: 'c1', title: 'Project chat', createdAt: NOW, updatedAt: NOW }],
  messages: {
    c1: [
      {
        id: 'm1',
        conversationId: 'c1',
        role: 'user',
        author: user,
        content: 'Hello there',
        timestamp: NOW,
        status: 'sent',
      },
      {
        id: 'm2',
        conversationId: 'c1',
        role: 'assistant',
        author: assistant,
        content: 'Hi Ada, how can I help?',
        timestamp: NOW,
        status: 'sent',
        reactions: [{ emoji: '👍', count: 2, userReacted: false }],
      },
    ],
  },
}

function Harness({ config, ...chatProps }: { config?: ConversationConfig } & Partial<ChatProps>) {
  const conversation = useConversation(config)
  return React.createElement(Chat, { conversation, ...chatProps } as ChatProps)
}

describe('Chat (React)', () => {
  it('renders the sidebar with the conversation list', () => {
    const html = renderToString(React.createElement(Harness, { config: seedConfig }))
    expect(html).toContain('aria-label="Conversations"')
    expect(html).toContain('Project chat')
    expect(html).toContain('+ New chat')
  })

  it('marks the active conversation with aria-current', () => {
    const html = renderToString(React.createElement(Harness, { config: seedConfig }))
    expect(html).toContain('aria-current="true"')
  })

  it('hides the sidebar when showConversationList is false', () => {
    const html = renderToString(
      React.createElement(Harness, { config: seedConfig, showConversationList: false }),
    )
    expect(html).not.toContain('aria-label="Conversations"')
  })

  it('renders the active conversation title and threading-mode toggle in the header', () => {
    const html = renderToString(React.createElement(Harness, { config: seedConfig }))
    expect(html).toContain('Project chat')
    expect(html).toContain('role="group"')
    expect(html).toContain('aria-label="Threading mode"')
    expect(html).toContain('Inline')
    expect(html).toContain('Threads')
  })

  it('hides the mode toggle when showModeToggle is false', () => {
    const html = renderToString(
      React.createElement(Harness, { config: seedConfig, showModeToggle: false }),
    )
    expect(html).not.toContain('aria-label="Threading mode"')
  })

  it('renders each message as an article with an accessible name', () => {
    const html = renderToString(React.createElement(Harness, { config: seedConfig }))
    expect(html.match(/role="article"/g)?.length).toBe(2)
    expect(html).toContain('aria-label="Message from Ada"')
    expect(html).toContain('aria-label="Message from Assistant"')
    expect(html).toContain('data-message-id="m1"')
    expect(html).toContain('data-message-id="m2"')
  })

  it('renders message content and the deterministic timestamp', () => {
    const html = renderToString(React.createElement(Harness, { config: seedConfig }))
    expect(html).toContain('Hello there')
    expect(html).toContain('Hi Ada, how can I help?')
    expect(html).toContain('title="2024-01-01T12:00:00.000Z"')
  })

  it('renders reaction aggregates as contiguous emoji-count buttons', () => {
    const html = renderToString(React.createElement(Harness, { config: seedConfig }))
    expect(html).toContain('👍 2')
  })

  it('renders the composer with a labelled textarea and a disabled send button', () => {
    const html = renderToString(React.createElement(Harness, { config: seedConfig }))
    expect(html).toContain('aria-label="Message"')
    expect(html).toContain('Send a message…')
    expect(html).toContain('aria-label="Send"')
    expect(html).toMatch(/aria-label="Send"[^>]*disabled|disabled[^>]*aria-label="Send"/)
  })

  it('uses the placeholder prop for the composer', () => {
    const html = renderToString(
      React.createElement(Harness, { config: seedConfig, placeholder: 'Ask anything' }),
    )
    expect(html).toContain('placeholder="Ask anything"')
  })

  it('renders the default empty state when there are no messages', () => {
    const html = renderToString(React.createElement(Harness, { config: { now: () => NOW } }))
    expect(html).toContain('No messages yet. Say hello 👋')
  })

  it('renders a custom empty state', () => {
    const html = renderToString(
      React.createElement(Harness, {
        config: { now: () => NOW },
        emptyState: React.createElement('p', null, 'Nothing here'),
      }),
    )
    expect(html).toContain('Nothing here')
  })

  it('renders no thread panel when no thread is open', () => {
    const html = renderToString(React.createElement(Harness, { config: seedConfig }))
    expect(html).not.toContain('aria-label="Thread"')
  })

  it('appends a custom className to the root', () => {
    const html = renderToString(React.createElement(Harness, { config: seedConfig, className: 'my-chat' }))
    expect(html).toContain('my-chat')
  })
})

describe('Composer (React)', () => {
  function renderComposer(props: Record<string, unknown> = {}) {
    return renderToString(React.createElement(Composer, { onSubmit: () => {}, ...props }))
  }

  it('renders the formatting toolbar with labelled buttons', () => {
    const html = renderComposer()
    expect(html).toContain('aria-label="Bold (⌘B)"')
    expect(html).toContain('aria-label="Italic (⌘I)"')
    expect(html).toContain('aria-label="Code (⌘E)"')
    expect(html).toContain('aria-label="Link (⌘K)"')
    expect(html).toContain('aria-label="Quote"')
    expect(html).toContain('aria-label="Bulleted list"')
    expect(html).toContain('aria-label="Numbered list"')
  })

  it('hides the toolbar when toolbar is false', () => {
    const html = renderComposer({ toolbar: false })
    expect(html).not.toContain('aria-label="Bold (⌘B)"')
  })

  it('renders a hidden file input and attach button by default', () => {
    const html = renderComposer()
    expect(html).toContain('type="file"')
    expect(html).toContain('accept="image/*"')
    expect(html).toContain('aria-label="Attach image or GIF"')
  })

  it('hides attachments when attachments is false', () => {
    const html = renderComposer({ attachments: false })
    expect(html).not.toContain('type="file"')
    expect(html).not.toContain('aria-label="Attach image or GIF"')
  })

  it('renders the error banner with role="alert" and a retry button', () => {
    const html = renderComposer({ error: 'Failed to send.', onRetry: () => {} })
    expect(html).toContain('role="alert"')
    expect(html).toContain('Failed to send.')
    expect(html).toContain('Retry')
  })

  it('renders a Stop button instead of Send when busy', () => {
    const html = renderComposer({ busy: true })
    expect(html).toContain('aria-label="Stop"')
    expect(html).not.toContain('aria-label="Send"')
  })

  it('renders no trigger menu before any textarea input', () => {
    // Slash/mention/emoji menus open from textarea events — closed under SSR.
    const html = renderComposer({ slashCommands: [{ id: 'giphy', label: 'GIPHY' }] })
    expect(html).not.toContain('role="listbox"')
  })
})
