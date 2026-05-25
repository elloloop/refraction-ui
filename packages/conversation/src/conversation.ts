import { generateId } from '@refraction-ui/shared'
import { rootIdOf, selectRoots, selectThreadMessages } from './selectors.js'
import type {
  ChatAuthor,
  ChatMessage,
  Conversation,
  ConversationAPI,
  ConversationConfig,
  ConversationState,
  SendOptions,
  ThreadingMode,
} from './types.js'

const DEFAULT_ASSISTANT: ChatAuthor = { id: 'assistant', name: 'Assistant' }
const DEFAULT_USER: ChatAuthor = { id: 'user', name: 'You' }
const DEFAULT_TITLE = 'New conversation'

/** Default title: first line, trimmed to ~48 chars. */
function defaultGenerateTitle(firstMessage: string): string {
  const firstLine = firstMessage.split('\n', 1)[0]!.trim()
  if (firstLine.length <= 48) return firstLine || DEFAULT_TITLE
  return `${firstLine.slice(0, 47).trimEnd()}…`
}

/**
 * createConversation — headless multi-conversation chat store with reply-threads,
 * reactions, edit/delete, and streaming. Backend-agnostic: provide a
 * {@link ChatTransport} and `sendMessage` will optimistically append the user
 * message, stream the reply, and expose retry/stop. Without a transport it is a
 * pure local message log.
 */
export function createConversation(config: ConversationConfig = {}): ConversationAPI {
  const assistant = config.assistant ?? DEFAULT_ASSISTANT
  const currentUser = config.currentUser ?? DEFAULT_USER
  const generateTitle = config.generateTitle ?? defaultGenerateTitle

  let transport = config.transport
  let threadingMode: ThreadingMode = config.threadingMode ?? 'inline'
  const conversations = new Map<string, Conversation>()
  const messagesByConv = new Map<string, ChatMessage[]>()
  let activeConversationId: string | null = config.activeConversationId ?? null
  let openThreadRootId: string | null = null
  let status: ConversationState['status'] = 'idle'
  let error: string | null = null
  let abortController: AbortController | null = null

  // Seed
  for (const c of config.conversations ?? []) {
    conversations.set(c.id, c)
    messagesByConv.set(c.id, [])
  }
  for (const [conversationId, msgs] of Object.entries(config.messages ?? {})) {
    messagesByConv.set(conversationId, [...msgs])
  }
  if (activeConversationId === null && config.conversations?.length) {
    activeConversationId = config.conversations[0]!.id
  }

  // — subscription —
  const listeners = new Set<() => void>()
  let snapshot: ConversationState = buildSnapshot()

  function buildSnapshot(): ConversationState {
    return {
      conversations: orderedConversations(),
      activeConversationId,
      messages: activeConversationId ? (messagesByConv.get(activeConversationId) ?? []) : [],
      openThreadRootId,
      threadingMode,
      status,
      error,
    }
  }

  function emit(): void {
    snapshot = buildSnapshot()
    for (const l of listeners) l()
  }

  function orderedConversations(): Conversation[] {
    return [...conversations.values()].sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    )
  }

  function touch(conversationId: string): void {
    const c = conversations.get(conversationId)
    if (c) conversations.set(conversationId, { ...c, updatedAt: new Date() })
  }

  function ensureActiveConversation(opts?: SendOptions): string {
    if (opts?.conversationId) {
      if (!conversations.has(opts.conversationId)) createConversationInternal({}, opts.conversationId)
      return opts.conversationId
    }
    if (activeConversationId && conversations.has(activeConversationId)) return activeConversationId
    return createConversationInternal({}).id
  }

  function createConversationInternal(
    opts: { title?: string; metadata?: Record<string, unknown> },
    id?: string,
  ): Conversation {
    const now = new Date()
    const conversation: Conversation = {
      id: id ?? generateId('rfr-conv'),
      title: opts.title ?? DEFAULT_TITLE,
      createdAt: now,
      updatedAt: now,
      metadata: opts.metadata,
    }
    conversations.set(conversation.id, conversation)
    messagesByConv.set(conversation.id, [])
    activeConversationId = conversation.id
    return conversation
  }

  /** Run a transport stream into the given assistant message. */
  async function streamReply(
    conversationId: string,
    assistantMsg: ChatMessage,
    userMsg: ChatMessage,
    history: ChatMessage[],
  ): Promise<void> {
    abortController = new AbortController()
    status = 'streaming'
    emit()

    try {
      const stream = transport!.send({
        conversationId,
        message: userMsg,
        history,
        parentId: assistantMsg.parentId,
        signal: abortController.signal,
      })
      for await (const chunk of stream) {
        // Apply the delivered chunk before honoring an abort, so a `stop()` mid
        // stream keeps the partial reply rather than discarding the last token.
        if (chunk.content !== undefined) assistantMsg.content = chunk.content
        if (chunk.delta) assistantMsg.content += chunk.delta
        if (chunk.metadata) {
          assistantMsg.metadata = { ...assistantMsg.metadata, ...chunk.metadata }
        }
        emit()
        if (abortController.signal.aborted) break
      }
      assistantMsg.status = 'sent'
      status = 'idle'
      error = null
    } catch (err) {
      if (abortController.signal.aborted) {
        assistantMsg.status = 'sent'
        status = 'idle'
      } else {
        const message = err instanceof Error ? err.message : String(err)
        assistantMsg.status = 'error'
        assistantMsg.error = message
        status = 'error'
        error = message
      }
    } finally {
      abortController = null
      touch(conversationId)
      emit()
    }
  }

  /** History the transport sees: the thread when replying, else the main timeline. */
  function historyFor(list: ChatMessage[], parentId: string | undefined): ChatMessage[] {
    const scope = parentId
      ? selectThreadMessages(list, parentId)
      : selectRoots(list)
    return scope.filter((m) => m.status !== 'error')
  }

  const api: ConversationAPI = {
    getState() {
      return snapshot
    },

    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },

    newConversation(opts) {
      const conversation = createConversationInternal(opts ?? {})
      openThreadRootId = null
      emit()
      return conversation
    },

    selectConversation(conversationId) {
      if (!conversations.has(conversationId) || activeConversationId === conversationId) return
      activeConversationId = conversationId
      openThreadRootId = null
      emit()
    },

    deleteConversation(conversationId) {
      if (!conversations.has(conversationId)) return
      conversations.delete(conversationId)
      messagesByConv.delete(conversationId)
      if (activeConversationId === conversationId) {
        activeConversationId = orderedConversations()[0]?.id ?? null
        openThreadRootId = null
      }
      emit()
    },

    renameConversation(conversationId, title) {
      const c = conversations.get(conversationId)
      if (!c) return
      conversations.set(conversationId, { ...c, title })
      emit()
    },

    appendMessage(message) {
      const list = messagesByConv.get(message.conversationId)
      if (!list) return
      list.push(message)
      touch(message.conversationId)
      emit()
    },

    editMessage(messageId, content) {
      if (!activeConversationId) return
      const list = messagesByConv.get(activeConversationId)!
      const msg = list.find((m) => m.id === messageId)
      if (!msg) return
      msg.content = content
      msg.edited = true
      emit()
    },

    deleteMessage(messageId) {
      if (!activeConversationId) return
      const list = messagesByConv.get(activeConversationId)!
      const msg = list.find((m) => m.id === messageId)
      if (!msg) return
      const removeIds = new Set<string>([messageId])
      // Deleting a thread root removes its replies too.
      if (!msg.parentId) for (const r of list) if (r.parentId === messageId) removeIds.add(r.id)
      const next = list.filter((m) => !removeIds.has(m.id))
      messagesByConv.set(activeConversationId, next)
      if (openThreadRootId && removeIds.has(openThreadRootId)) openThreadRootId = null
      emit()
    },

    react(messageId, emoji) {
      if (!activeConversationId) return
      const list = messagesByConv.get(activeConversationId)!
      const msg = list.find((m) => m.id === messageId)
      if (!msg) return
      const reactions = [...(msg.reactions ?? [])]
      const idx = reactions.findIndex((r) => r.emoji === emoji)
      if (idx === -1) {
        reactions.push({ emoji, count: 1, userReacted: true })
      } else {
        const r = reactions[idx]!
        if (r.userReacted) {
          const count = r.count - 1
          if (count <= 0) reactions.splice(idx, 1)
          else reactions[idx] = { ...r, count, userReacted: false }
        } else {
          reactions[idx] = { ...r, count: r.count + 1, userReacted: true }
        }
      }
      msg.reactions = reactions
      emit()
    },

    async sendMessage(content, opts) {
      const trimmed = content.trim()
      if (!trimmed && !opts?.attachments?.length) return

      const conversationId = ensureActiveConversation(opts)
      const list = messagesByConv.get(conversationId)!
      const parentId = opts?.replyTo ? rootIdOf(list, opts.replyTo) : undefined
      const isFirstRoot = !parentId && selectRoots(list).length === 0

      const userMsg: ChatMessage = {
        id: generateId('rfr-msg'),
        conversationId,
        role: 'user',
        author: currentUser,
        content: trimmed,
        timestamp: new Date(),
        status: 'sent',
        parentId,
        attachments: opts?.attachments,
        metadata: opts?.metadata,
      }
      list.push(userMsg)

      const conversation = conversations.get(conversationId)!
      if (isFirstRoot && conversation.title === DEFAULT_TITLE) {
        conversations.set(conversationId, { ...conversation, title: generateTitle(trimmed) })
      }
      touch(conversationId)

      if (!transport) {
        status = 'idle'
        emit()
        return
      }

      // history excludes the just-pushed user message
      const history = historyFor(list, parentId).filter((m) => m.id !== userMsg.id)
      const assistantMsg: ChatMessage = {
        id: generateId('rfr-msg'),
        conversationId,
        role: 'assistant',
        author: assistant,
        content: '',
        timestamp: new Date(),
        status: 'streaming',
        parentId,
      }
      list.push(assistantMsg)
      await streamReply(conversationId, assistantMsg, userMsg, history)
    },

    async retryLast() {
      if (!activeConversationId || !transport) return
      const list = messagesByConv.get(activeConversationId)!
      const last = list[list.length - 1]
      const parentId = last?.parentId
      // Drop a trailing failed assistant message, if any.
      if (last && last.role === 'assistant' && last.status === 'error') list.pop()

      const scope = parentId ? selectThreadMessages(list, parentId) : selectRoots(list)
      const lastUser = [...scope].reverse().find((m) => m.role === 'user')
      if (!lastUser) return

      const history = historyFor(list, parentId)
      const assistantMsg: ChatMessage = {
        id: generateId('rfr-msg'),
        conversationId: activeConversationId,
        role: 'assistant',
        author: assistant,
        content: '',
        timestamp: new Date(),
        status: 'streaming',
        parentId,
      }
      list.push(assistantMsg)
      await streamReply(activeConversationId, assistantMsg, lastUser, history)
    },

    stop() {
      abortController?.abort()
    },

    openThread(rootId) {
      openThreadRootId = rootId
      emit()
    },

    closeThread() {
      if (openThreadRootId === null) return
      openThreadRootId = null
      emit()
    },

    setThreadingMode(mode) {
      if (threadingMode === mode) return
      threadingMode = mode
      emit()
    },

    setTransport(next) {
      transport = next
    },
  }

  return api
}
