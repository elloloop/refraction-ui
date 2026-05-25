import { describe, it, expect, beforeEach, vi } from 'vitest'
import { resetIdCounter } from '@refraction-ui/shared'
import { createConversation } from '../src/conversation.js'
import {
  selectMainTimeline,
  selectThreadMessages,
  getReplyCount,
} from '../src/selectors.js'
import type { ChatTransport, SendContext, TransportChunk } from '../src/types.js'

beforeEach(() => {
  resetIdCounter()
})

function echoTransport(chunks: string[]): ChatTransport {
  return {
    name: 'echo',
    async *send(): AsyncIterable<TransportChunk> {
      for (const delta of chunks) yield { delta }
    },
  }
}

function failingTransport(message = 'boom'): ChatTransport {
  return {
    name: 'failing',
    // eslint-disable-next-line require-yield
    async *send(): AsyncIterable<TransportChunk> {
      throw new Error(message)
    },
  }
}

describe('conversation management', () => {
  it('creates, selects, renames, and deletes conversations', () => {
    const c = createConversation()
    const a = c.newConversation()
    const b = c.newConversation({ title: 'Second' })

    expect(c.getState().activeConversationId).toBe(b.id)
    expect(c.getState().conversations).toHaveLength(2)

    c.selectConversation(a.id)
    expect(c.getState().activeConversationId).toBe(a.id)

    c.renameConversation(a.id, 'Renamed')
    expect(c.getState().conversations.find((x) => x.id === a.id)?.title).toBe('Renamed')

    c.deleteConversation(a.id)
    expect(c.getState().conversations).toHaveLength(1)
    expect(c.getState().activeConversationId).toBe(b.id)
  })
})

describe('sendMessage — manual (no transport)', () => {
  it('records the user message and derives the title', async () => {
    const c = createConversation()
    await c.sendMessage('Hello there, how are you today?')
    const { messages, conversations } = c.getState()
    expect(messages).toHaveLength(1)
    expect(messages[0]!.role).toBe('user')
    expect(conversations[0]!.title).toBe('Hello there, how are you today?')
  })

  it('ignores empty content without attachments', async () => {
    const c = createConversation()
    await c.sendMessage('   ')
    expect(c.getState().messages).toHaveLength(0)
  })
})

describe('sendMessage — streaming transport', () => {
  it('appends user + assistant and accumulates deltas', async () => {
    const c = createConversation({ transport: echoTransport(['Hel', 'lo', '!']) })
    await c.sendMessage('hi')
    const { messages, status } = c.getState()
    expect(messages).toHaveLength(2)
    expect(messages[1]!.role).toBe('assistant')
    expect(messages[1]!.content).toBe('Hello!')
    expect(messages[1]!.status).toBe('sent')
    expect(status).toBe('idle')
  })

  it('passes main-timeline history (excluding the new message)', async () => {
    const seen: SendContext[] = []
    const transport: ChatTransport = {
      name: 'spy',
      async *send(ctx) {
        seen.push(ctx)
        yield { delta: 'ok' }
      },
    }
    const c = createConversation({ transport })
    await c.sendMessage('first')
    await c.sendMessage('second')
    expect(seen[1]!.message.content).toBe('second')
    expect(seen[1]!.history.map((m) => m.content)).toEqual(['first', 'ok'])
    expect(seen[1]!.parentId).toBeUndefined()
  })
})

describe('reply threads', () => {
  it('replies attach to the thread root and scope transport history to the thread', async () => {
    const seen: SendContext[] = []
    const transport: ChatTransport = {
      name: 'spy',
      async *send(ctx) {
        seen.push(ctx)
        yield { delta: 'reply-ack' }
      },
    }
    const c = createConversation({ transport })
    await c.sendMessage('root question') // user(root) + assistant(root)
    const rootId = c.getState().messages[0]!.id

    await c.sendMessage('a follow-up', { replyTo: rootId })
    const msgs = c.getState().messages

    const reply = msgs.find((m) => m.role === 'user' && m.content === 'a follow-up')!
    expect(reply.parentId).toBe(rootId)
    // history for the reply send is the thread (root + its assistant), not the whole convo
    expect(seen[1]!.parentId).toBe(rootId)
    expect(seen[1]!.history.every((m) => m.parentId === rootId || m.id === rootId)).toBe(true)
  })

  it('getReplyCount + selectThreadMessages reflect the thread', async () => {
    const c = createConversation()
    await c.sendMessage('root')
    const rootId = c.getState().messages[0]!.id
    await c.sendMessage('r1', { replyTo: rootId })
    await c.sendMessage('r2', { replyTo: rootId })

    const msgs = c.getState().messages
    expect(getReplyCount(msgs, rootId)).toBe(2)
    expect(selectThreadMessages(msgs, rootId).map((m) => m.content)).toEqual(['root', 'r1', 'r2'])
  })
})

describe('threading modes (selectors)', () => {
  it('inline shows replies in the timeline; panel hides them', async () => {
    const c = createConversation()
    await c.sendMessage('root')
    const rootId = c.getState().messages[0]!.id
    await c.sendMessage('reply', { replyTo: rootId })
    const msgs = c.getState().messages

    expect(selectMainTimeline(msgs, 'inline').map((m) => m.content)).toEqual(['root', 'reply'])
    expect(selectMainTimeline(msgs, 'panel').map((m) => m.content)).toEqual(['root'])
  })

  it('setThreadingMode flips state', () => {
    const c = createConversation()
    expect(c.getState().threadingMode).toBe('inline')
    c.setThreadingMode('panel')
    expect(c.getState().threadingMode).toBe('panel')
  })
})

describe('reactions', () => {
  it('toggles a reaction on and off', async () => {
    const c = createConversation()
    await c.sendMessage('hi')
    const id = c.getState().messages[0]!.id

    c.react(id, '👍')
    expect(c.getState().messages[0]!.reactions).toEqual([{ emoji: '👍', count: 1, userReacted: true }])
    c.react(id, '👍')
    expect(c.getState().messages[0]!.reactions).toEqual([])
  })
})

describe('edit + delete', () => {
  it('editMessage marks edited', async () => {
    const c = createConversation()
    await c.sendMessage('typo')
    const id = c.getState().messages[0]!.id
    c.editMessage(id, 'fixed')
    expect(c.getState().messages[0]!.content).toBe('fixed')
    expect(c.getState().messages[0]!.edited).toBe(true)
  })

  it('deleting a thread root removes its replies', async () => {
    const c = createConversation()
    await c.sendMessage('root')
    const rootId = c.getState().messages[0]!.id
    await c.sendMessage('reply', { replyTo: rootId })
    expect(c.getState().messages).toHaveLength(2)
    c.deleteMessage(rootId)
    expect(c.getState().messages).toHaveLength(0)
  })
})

describe('thread panel', () => {
  it('open/close sets openThreadRootId', async () => {
    const c = createConversation()
    await c.sendMessage('root')
    const rootId = c.getState().messages[0]!.id
    c.openThread(rootId)
    expect(c.getState().openThreadRootId).toBe(rootId)
    c.closeThread()
    expect(c.getState().openThreadRootId).toBeNull()
  })

  it('deleting the open thread root closes the panel', async () => {
    const c = createConversation()
    await c.sendMessage('root')
    const rootId = c.getState().messages[0]!.id
    c.openThread(rootId)
    c.deleteMessage(rootId)
    expect(c.getState().openThreadRootId).toBeNull()
  })

  it('openThread defaults the reply target to the root', async () => {
    const c = createConversation()
    await c.sendMessage('root')
    const rootId = c.getState().messages[0]!.id
    c.openThread(rootId)
    expect(c.getState().replyTarget).toBe(rootId)
  })
})

describe('reply-target strategy (reply to a mid-thread message)', () => {
  it('replyTo opens the originating thread and targets the specific message', async () => {
    const c = createConversation()
    await c.sendMessage('root')
    const rootId = c.getState().messages[0]!.id
    await c.sendMessage('mid reply', { replyTo: rootId })
    const mid = c.getState().messages.find((m) => m.content === 'mid reply')!

    c.replyTo(mid.id)
    // panel opens on the originating root, but the next reply targets `mid`
    expect(c.getState().openThreadRootId).toBe(rootId)
    expect(c.getState().replyTarget).toBe(mid.id)
  })

  it('replying to a mid-thread message groups under the root, records replyToId', async () => {
    const c = createConversation()
    await c.sendMessage('root')
    const rootId = c.getState().messages[0]!.id
    await c.sendMessage('first reply', { replyTo: rootId })
    const mid = c.getState().messages.find((m) => m.content === 'first reply')!

    // reply to the mid-thread reply, not the root
    await c.sendMessage('reply to the reply', { replyTo: mid.id })
    const nested = c.getState().messages.find((m) => m.content === 'reply to the reply')!

    expect(nested.parentId).toBe(rootId) // grouped under the originating root
    expect(nested.replyToId).toBe(mid.id) // but quotes the specific message
    // thread still flat: root + 2 replies
    const thread = c.getState().messages.filter((m) => m.parentId === rootId)
    expect(thread).toHaveLength(2)
  })
})

describe('error + retry + stop', () => {
  it('marks the assistant message as error and surfaces it', async () => {
    const c = createConversation({ transport: failingTransport('nope') })
    await c.sendMessage('hi')
    const { messages, status, error } = c.getState()
    expect(messages[1]!.status).toBe('error')
    expect(status).toBe('error')
    expect(error).toBe('nope')
  })

  it('retryLast drops the failed reply and re-sends', async () => {
    let attempt = 0
    const transport: ChatTransport = {
      name: 'flaky',
      async *send() {
        attempt += 1
        if (attempt === 1) throw new Error('transient')
        yield { delta: 'recovered' }
      },
    }
    const c = createConversation({ transport })
    await c.sendMessage('hi')
    expect(c.getState().status).toBe('error')
    await c.retryLast()
    const { messages, status } = c.getState()
    expect(status).toBe('idle')
    expect(messages).toHaveLength(2)
    expect(messages[1]!.content).toBe('recovered')
  })

  it('stop aborts the stream and keeps partial content', async () => {
    const transport: ChatTransport = {
      name: 'slow',
      async *send(ctx) {
        yield { delta: 'par' }
        await new Promise((r) => setTimeout(r, 0))
        if (ctx.signal.aborted) return
        yield { delta: 'tial' }
      },
    }
    const c = createConversation({ transport })
    const p = c.sendMessage('hi')
    c.stop()
    await p
    const { messages, status } = c.getState()
    expect(status).toBe('idle')
    expect(messages[1]!.content).toBe('par')
  })
})

describe('subscribe', () => {
  it('notifies on change and unsubscribes cleanly', async () => {
    const c = createConversation({ transport: echoTransport(['a', 'b']) })
    const listener = vi.fn()
    const unsub = c.subscribe(listener)
    await c.sendMessage('hi')
    expect(listener.mock.calls.length).toBeGreaterThan(1)
    unsub()
    const before = listener.mock.calls.length
    c.newConversation()
    expect(listener.mock.calls.length).toBe(before)
  })
})
