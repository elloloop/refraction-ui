import type { AccessibilityProps } from '@refraction-ui/shared'
import { generateId } from '@refraction-ui/shared'

export interface MessageReaction {
  emoji: string
  count: number
  userReacted: boolean
}

export interface MessageAttachment {
  id: string
  name: string
  url: string
  type: string
  size?: number
}

export interface MessageData {
  /** Unique message ID */
  id: string
  /** Author display info */
  author: {
    id: string
    name: string
    avatarUrl?: string
  }
  /** Message content (can contain markdown) */
  content: string
  /** Message timestamp */
  timestamp: Date
  /** Reactions on this message */
  reactions?: MessageReaction[]
  /** Threaded replies */
  replies?: MessageData[]
  /** File attachments */
  attachments?: MessageAttachment[]
  /** Whether this message has been edited */
  edited?: boolean
}

export interface ThreadViewProps {
  /** Messages to display */
  messages: MessageData[]
  /** Callback when a reply is sent */
  onReply?: (messageId: string, content: string) => void
  /** Callback when a reaction is toggled */
  onReact?: (messageId: string, emoji: string) => void
  /** Current user ID (for highlighting own messages) */
  currentUserId?: string
}

export interface ThreadViewState {
  messages: MessageData[]
  replyingTo: string | null
}

export interface ThreadViewAPI {
  /** Current state */
  state: ThreadViewState
  /** Start replying to a message */
  startReply(messageId: string): void
  /** Cancel reply */
  cancelReply(): void
  /** Send a reply */
  reply(messageId: string, content: string): void
  /** Toggle a reaction on a message */
  react(messageId: string, emoji: string): void
  /** Format a timestamp for display */
  formatTimestamp(date: Date): string
  /** Format relative time (e.g., "2 minutes ago") */
  formatRelativeTime(date: Date): string
  /** ARIA props for the thread container */
  ariaProps: Partial<AccessibilityProps> & Record<string, unknown>
  /** Get ARIA props for a message */
  getMessageAriaProps(message: MessageData): Record<string, unknown>
  /** Get ARIA props for a reply button */
  getReplyButtonAriaProps(messageId: string): Record<string, unknown>
  /** Generated IDs */
  ids: {
    thread: string
    label: string
  }
}

export function formatTimestamp(date: Date): string {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`
  return `${displayHours}:${displayMinutes} ${ampm}`
}

export function formatRelativeTime(date: Date, now?: Date): string {
  const reference = now ?? new Date()
  const diffMs = reference.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function createThreadView(props: ThreadViewProps): ThreadViewAPI {
  const { messages, onReply, onReact, currentUserId } = props

  let replyingTo: string | null = null

  const threadId = generateId('rfr-thread')
  const labelId = generateId('rfr-thread-label')

  function startReply(messageId: string): void {
    replyingTo = messageId
  }

  function cancelReply(): void {
    replyingTo = null
  }

  function reply(messageId: string, content: string): void {
    onReply?.(messageId, content)
    replyingTo = null
  }

  function react(messageId: string, emoji: string): void {
    onReact?.(messageId, emoji)
  }

  const ariaProps: Partial<AccessibilityProps> & Record<string, unknown> = {
    role: 'log',
    'aria-label': 'Message thread',
    'aria-live': 'polite',
    id: threadId,
  }

  function getMessageAriaProps(message: MessageData): Record<string, unknown> {
    const isOwn = currentUserId && message.author.id === currentUserId
    return {
      role: 'article',
      'aria-label': `Message from ${message.author.name}${isOwn ? ' (you)' : ''} at ${formatTimestamp(message.timestamp)}`,
    }
  }

  function getReplyButtonAriaProps(_messageId: string): Record<string, unknown> {
    return {
      role: 'button',
      'aria-label': `Reply to message`,
    }
  }

  return {
    state: {
      messages,
      get replyingTo() { return replyingTo },
    },
    startReply,
    cancelReply,
    reply,
    react,
    formatTimestamp,
    formatRelativeTime,
    ariaProps,
    getMessageAriaProps,
    getReplyButtonAriaProps,
    ids: {
      thread: threadId,
      label: labelId,
    },
  }
}
