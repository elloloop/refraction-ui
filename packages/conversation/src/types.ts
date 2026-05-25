/**
 * @refraction-ui/conversation — headless chat store.
 *
 * Owns the *data format* and *behavior* of a multi-conversation chat with
 * reply-threads, reactions, edit/delete, and streaming. It has NO UI opinion
 * and NO backend opinion: the wire is supplied by a {@link ChatTransport}
 * adapter, exactly as {@link AIProvider} is supplied to `@refraction-ui/ai`.
 *
 * Two threading modes (how replies relate to the main timeline):
 * - `'inline'` (default): every message — replies included — appears in the
 *   main timeline; a reply shows its parent quoted, and opening it reveals the
 *   focused thread in a side panel.
 * - `'panel'`: only root messages appear in the main timeline (each showing a
 *   reply count); replies live solely in the thread panel (Slack-style).
 */

/** Author display info — structurally compatible with thread-view's MessageData. */
export interface ChatAuthor {
  id: string
  name: string
  avatarUrl?: string
}

/** Conversational role. Generic; the transport decides what each means. */
export type ChatRole = 'user' | 'assistant' | 'system'

/** Lifecycle of a single message. */
export type MessageStatus = 'pending' | 'streaming' | 'sent' | 'error'

/** How replies relate to the main timeline. */
export type ThreadingMode = 'inline' | 'panel'

/** An emoji reaction aggregate on a message. */
export interface MessageReaction {
  emoji: string
  count: number
  /** Whether the local user has reacted with this emoji */
  userReacted: boolean
}

/** A file/media attachment (images, gifs, docs). */
export interface MessageAttachment {
  id: string
  name: string
  url: string
  /** MIME type, e.g. 'image/gif', 'image/png', 'application/pdf' */
  type: string
  size?: number
}

/** A single message. */
export interface ChatMessage {
  /** Unique message ID */
  id: string
  /** Conversation this message belongs to */
  conversationId: string
  /** Who/what produced it */
  role: ChatRole
  /** Author display info */
  author: ChatAuthor
  /** Content (markdown — may contain code fences, images/gifs; grows while streaming) */
  content: string
  /** Creation time */
  timestamp: Date
  /** Lifecycle status */
  status: MessageStatus
  /** Failure reason when `status === 'error'` */
  error?: string
  /**
   * Root message id of the reply-thread this message belongs to. Absent on
   * root/main-timeline messages. Threads are one level deep — a reply to any
   * message in a thread groups under the same originating root.
   */
  parentId?: string
  /**
   * The specific message this is "in reply to" (for the quote), which may be a
   * mid-thread reply even though `parentId` is always the originating root.
   */
  replyToId?: string
  /** Emoji reactions */
  reactions?: MessageReaction[]
  /** Attachments (images/gifs/files) */
  attachments?: MessageAttachment[]
  /** Whether this message was edited */
  edited?: boolean
  /** Arbitrary consumer metadata — never inspected by the store */
  metadata?: Record<string, unknown>
}

/** A conversation/session (an entry in the conversation list). */
export interface Conversation {
  id: string
  /** Display title (auto-derived from the first message unless set) */
  title: string
  createdAt: Date
  /** Last-activity time (bumped on every message) */
  updatedAt: Date
  metadata?: Record<string, unknown>
}

/** Context handed to the transport for one send. */
export interface SendContext {
  /** Active conversation ID */
  conversationId: string
  /** The user message being sent */
  message: ChatMessage
  /** Prior messages in scope (the thread when replying, else the main timeline) */
  history: ChatMessage[]
  /** Root message id when this send is a reply within a thread */
  parentId?: string
  /** Aborted when the consumer calls `stop()` */
  signal: AbortSignal
}

/** A streamed piece of an assistant reply. */
export interface TransportChunk {
  /** Token/delta to append to the assistant reply */
  delta?: string
  /** Replace the whole reply content (for non-streaming transports) */
  content?: string
  /** Arbitrary metadata merged onto the assistant message */
  metadata?: Record<string, unknown>
}

/**
 * The backend wire. Implemented by adapter code the consumer owns — never by
 * this package. A non-streaming backend yields one chunk with `content` then
 * returns; a streaming backend yields many `delta` chunks.
 */
export interface ChatTransport {
  name: string
  send(ctx: SendContext): AsyncIterable<TransportChunk>
}

/** Snapshot of the store. Returned by `getState()`; treat as immutable. */
export interface ConversationState {
  /** All conversations, most-recently-updated first */
  conversations: Conversation[]
  /** Active conversation ID, or null when none selected */
  activeConversationId: string | null
  /** Flat messages of the active conversation (roots + replies) */
  messages: ChatMessage[]
  /** Root id of the thread shown in the side panel, or null when closed */
  openThreadRootId: string | null
  /** The specific message a reply in the open thread will target (default: the root) */
  replyTarget: string | null
  /** Current threading mode */
  threadingMode: ThreadingMode
  /** Coarse store status */
  status: 'idle' | 'sending' | 'streaming' | 'error'
  /** Last error, if any */
  error: string | null
}

/** Options for `createConversation`. */
export interface ConversationConfig {
  /** Backend wire. Without it the store is a local message log. */
  transport?: ChatTransport
  /** Seed conversations */
  conversations?: Conversation[]
  /** Seed messages keyed by conversationId */
  messages?: Record<string, ChatMessage[]>
  /** Initially active conversation */
  activeConversationId?: string
  /** The local user — author of outgoing messages */
  currentUser?: ChatAuthor
  /** Author of assistant replies (default: { id: 'assistant', name: 'Assistant' }) */
  assistant?: ChatAuthor
  /** Derive a conversation title from its first message (default: first ~48 chars) */
  generateTitle?: (firstMessage: string) => string
  /** Threading mode (default 'inline') */
  threadingMode?: ThreadingMode
}

/** Options for a single `sendMessage`. */
export interface SendOptions {
  /** Send into a specific conversation instead of the active one */
  conversationId?: string
  /** Reply within the thread of this message id */
  replyTo?: string
  /** Attachments on the outgoing message */
  attachments?: MessageAttachment[]
  /** Metadata attached to the outgoing user message */
  metadata?: Record<string, unknown>
}

/** The framework-agnostic store. React/Astro adapters wrap this. */
export interface ConversationAPI {
  /** Current immutable snapshot */
  getState(): ConversationState
  /** Subscribe to changes; returns an unsubscribe fn (suits useSyncExternalStore) */
  subscribe(listener: () => void): () => void

  // — conversation management —
  /** Create a new conversation and make it active */
  newConversation(opts?: { title?: string; metadata?: Record<string, unknown> }): Conversation
  /** Make a conversation active */
  selectConversation(conversationId: string): void
  /** Delete a conversation and its messages */
  deleteConversation(conversationId: string): void
  /** Rename a conversation */
  renameConversation(conversationId: string, title: string): void

  // — messaging —
  /** Optimistically append the user message, then stream the reply via transport */
  sendMessage(content: string, opts?: SendOptions): Promise<void>
  /** Append a message directly (no transport round-trip) */
  appendMessage(message: ChatMessage): void
  /** Edit a message's content (marks it edited) */
  editMessage(messageId: string, content: string): void
  /** Delete a message (and, for a thread root, its replies) */
  deleteMessage(messageId: string): void
  /** Toggle the local user's emoji reaction on a message */
  react(messageId: string, emoji: string): void
  /** Retry the last failed turn in the active conversation */
  retryLast(): Promise<void>
  /** Abort the in-flight stream, keeping any partial reply */
  stop(): void

  // — threads / view —
  /** Open the side panel focused on a message's thread (reply target = root) */
  openThread(rootId: string): void
  /** Open the originating thread and target a specific message for the next reply */
  replyTo(messageId: string): void
  /** Close the thread side panel */
  closeThread(): void
  /** Switch threading mode */
  setThreadingMode(mode: ThreadingMode): void

  /** Swap the transport at runtime */
  setTransport(transport: ChatTransport): void
}
