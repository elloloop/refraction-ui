import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resetIdCounter } from '@refraction-ui/shared'
import { createThreadView, formatTimestamp, formatRelativeTime } from '../src/thread-view.js'
import type { MessageData } from '../src/thread-view.js'
import {
  threadContainerStyles,
  threadMessageStyles,
  threadAvatarStyles,
  threadAuthorStyles,
  threadTimestampStyles,
  threadBodyStyles,
  threadReactionsStyles,
  threadReplyIndicatorStyles,
  threadAttachmentStyles,
} from '../src/thread-view.styles.js'

beforeEach(() => {
  resetIdCounter()
})

const baseMessage: MessageData = {
  id: 'msg-1',
  author: { id: 'user-1', name: 'Alice', avatarUrl: '/alice.jpg' },
  content: 'Hello world',
  timestamp: new Date(2024, 5, 15, 10, 30),
}

const messages: MessageData[] = [
  baseMessage,
  {
    id: 'msg-2',
    author: { id: 'user-2', name: 'Bob' },
    content: 'Hey Alice!',
    timestamp: new Date(2024, 5, 15, 10, 31),
    reactions: [{ emoji: '\u{1F44D}', count: 2, userReacted: true }],
  },
  {
    id: 'msg-3',
    author: { id: 'user-1', name: 'Alice' },
    content: 'How are you?',
    timestamp: new Date(2024, 5, 15, 10, 32),
    replies: [
      {
        id: 'reply-1',
        author: { id: 'user-2', name: 'Bob' },
        content: 'Good, thanks!',
        timestamp: new Date(2024, 5, 15, 10, 33),
      },
    ],
    edited: true,
  },
]

describe('createThreadView - initial state', () => {
  it('passes messages through', () => {
    const api = createThreadView({ messages })
    expect(api.state.messages).toHaveLength(3)
  })

  it('starts with no reply', () => {
    const api = createThreadView({ messages })
    expect(api.state.replyingTo).toBeNull()
  })
})

describe('reply management', () => {
  it('startReply sets replyingTo', () => {
    const api = createThreadView({ messages })
    api.startReply('msg-1')
    expect(api.state.replyingTo).toBe('msg-1')
  })

  it('cancelReply clears replyingTo', () => {
    const api = createThreadView({ messages })
    api.startReply('msg-1')
    api.cancelReply()
    expect(api.state.replyingTo).toBeNull()
  })

  it('reply calls onReply and clears replyingTo', () => {
    const onReply = vi.fn()
    const api = createThreadView({ messages, onReply })
    api.startReply('msg-1')
    api.reply('msg-1', 'Reply content')
    expect(onReply).toHaveBeenCalledWith('msg-1', 'Reply content')
    expect(api.state.replyingTo).toBeNull()
  })

  it('reply without callback does not throw', () => {
    const api = createThreadView({ messages })
    expect(() => api.reply('msg-1', 'test')).not.toThrow()
  })
})

describe('reactions', () => {
  it('react calls onReact', () => {
    const onReact = vi.fn()
    const api = createThreadView({ messages, onReact })
    api.react('msg-1', '\u{1F44D}')
    expect(onReact).toHaveBeenCalledWith('msg-1', '\u{1F44D}')
  })

  it('react without callback does not throw', () => {
    const api = createThreadView({ messages })
    expect(() => api.react('msg-1', '\u{1F44D}')).not.toThrow()
  })
})

describe('formatTimestamp', () => {
  it('formats morning time correctly', () => {
    const result = formatTimestamp(new Date(2024, 5, 15, 9, 5))
    expect(result).toBe('9:05 AM')
  })

  it('formats afternoon time correctly', () => {
    const result = formatTimestamp(new Date(2024, 5, 15, 14, 30))
    expect(result).toBe('2:30 PM')
  })

  it('formats noon correctly', () => {
    const result = formatTimestamp(new Date(2024, 5, 15, 12, 0))
    expect(result).toBe('12:00 PM')
  })

  it('formats midnight correctly', () => {
    const result = formatTimestamp(new Date(2024, 5, 15, 0, 0))
    expect(result).toBe('12:00 AM')
  })

  it('pads minutes with zero', () => {
    const result = formatTimestamp(new Date(2024, 5, 15, 10, 5))
    expect(result).toBe('10:05 AM')
  })
})

describe('formatRelativeTime', () => {
  it('returns "just now" for recent times', () => {
    const now = new Date(2024, 5, 15, 10, 30, 30)
    const date = new Date(2024, 5, 15, 10, 30, 0)
    expect(formatRelativeTime(date, now)).toBe('just now')
  })

  it('returns minutes ago', () => {
    const now = new Date(2024, 5, 15, 10, 35)
    const date = new Date(2024, 5, 15, 10, 30)
    expect(formatRelativeTime(date, now)).toBe('5 minutes ago')
  })

  it('returns singular minute', () => {
    const now = new Date(2024, 5, 15, 10, 31)
    const date = new Date(2024, 5, 15, 10, 30)
    expect(formatRelativeTime(date, now)).toBe('1 minute ago')
  })

  it('returns hours ago', () => {
    const now = new Date(2024, 5, 15, 13, 30)
    const date = new Date(2024, 5, 15, 10, 30)
    expect(formatRelativeTime(date, now)).toBe('3 hours ago')
  })

  it('returns singular hour', () => {
    const now = new Date(2024, 5, 15, 11, 30)
    const date = new Date(2024, 5, 15, 10, 30)
    expect(formatRelativeTime(date, now)).toBe('1 hour ago')
  })

  it('returns days ago', () => {
    const now = new Date(2024, 5, 17, 10, 30)
    const date = new Date(2024, 5, 15, 10, 30)
    expect(formatRelativeTime(date, now)).toBe('2 days ago')
  })

  it('returns singular day', () => {
    const now = new Date(2024, 5, 16, 10, 30)
    const date = new Date(2024, 5, 15, 10, 30)
    expect(formatRelativeTime(date, now)).toBe('1 day ago')
  })

  it('returns formatted date for old timestamps', () => {
    const now = new Date(2024, 5, 30, 10, 30)
    const date = new Date(2024, 5, 1, 10, 30)
    const result = formatRelativeTime(date, now)
    expect(result).toContain('Jun')
    expect(result).toContain('2024')
  })
})

describe('ARIA props', () => {
  it('thread has role=log', () => {
    const api = createThreadView({ messages })
    expect(api.ariaProps.role).toBe('log')
  })

  it('thread has aria-label', () => {
    const api = createThreadView({ messages })
    expect(api.ariaProps['aria-label']).toBe('Message thread')
  })

  it('thread has aria-live=polite', () => {
    const api = createThreadView({ messages })
    expect(api.ariaProps['aria-live']).toBe('polite')
  })

  it('message has role=article', () => {
    const api = createThreadView({ messages })
    const props = api.getMessageAriaProps(messages[0])
    expect(props.role).toBe('article')
  })

  it('message aria-label includes author name', () => {
    const api = createThreadView({ messages })
    const props = api.getMessageAriaProps(messages[0])
    expect(props['aria-label']).toContain('Alice')
  })

  it('message aria-label includes (you) for current user', () => {
    const api = createThreadView({ messages, currentUserId: 'user-1' })
    const props = api.getMessageAriaProps(messages[0])
    expect(props['aria-label']).toContain('(you)')
  })

  it('reply button has aria-label', () => {
    const api = createThreadView({ messages })
    const props = api.getReplyButtonAriaProps('msg-1')
    expect(props['aria-label']).toContain('Reply')
  })
})

describe('IDs', () => {
  it('generates unique IDs', () => {
    const api1 = createThreadView({ messages })
    const api2 = createThreadView({ messages })
    expect(api1.ids.thread).not.toBe(api2.ids.thread)
  })

  it('has all required ID fields', () => {
    const api = createThreadView({ messages })
    expect(api.ids.thread).toBeDefined()
    expect(api.ids.label).toBeDefined()
  })
})

describe('styles', () => {
  it('exports container styles', () => {
    expect(threadContainerStyles).toContain('flex')
  })

  it('exports message styles', () => {
    expect(threadMessageStyles).toContain('flex')
  })

  it('exports avatar styles', () => {
    expect(threadAvatarStyles).toContain('rounded-full')
  })

  it('exports author styles', () => {
    expect(threadAuthorStyles).toContain('font-semibold')
  })

  it('exports timestamp styles', () => {
    expect(threadTimestampStyles).toContain('text-xs')
  })

  it('exports body styles', () => {
    expect(threadBodyStyles).toContain('text-sm')
  })

  it('exports reactions styles', () => {
    expect(threadReactionsStyles).toContain('flex')
  })

  it('exports reply indicator styles', () => {
    expect(threadReplyIndicatorStyles).toContain('flex')
  })

  it('exports attachment styles', () => {
    expect(threadAttachmentStyles).toContain('flex')
  })
})
