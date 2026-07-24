import * as React from 'react'
import { cn } from '@refraction-ui/shared'
import { MarkdownRenderer } from '@refraction-ui/react-markdown-renderer'
import { formatTimestamp, formatRelativeTime } from '@refraction-ui/thread-view'
import {
  selectMainTimeline,
  selectThreadMessages,
  getReplyCount,
  findMessage,
  rootIdOf,
  type ChatMessage,
  type MessageAttachment,
  type ThreadingMode,
} from '@refraction-ui/conversation'
import { Composer, type SlashCommand, type Mention } from './composer.js'
import type { UseConversationResult } from './use-conversation.js'

const h = React.createElement

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🎉', '👀', '🙏']

/** Chat-tuned markdown: kills article-sized prose margins/headings inside messages. */
const chatMd = cn(
  'max-w-none text-sm',
  '[&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
  '[&_pre]:my-2 [&_pre]:rounded-md [&_pre]:text-xs [&_pre]:leading-relaxed',
  '[&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5',
  '[&_h1]:text-base [&_h1]:font-semibold [&_h1]:mt-2 [&_h1]:mb-1',
  '[&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-2 [&_h2]:mb-1',
  '[&_h3]:text-sm [&_h3]:font-semibold',
  '[&_blockquote]:my-1 [&_blockquote]:border-l-2 [&_blockquote]:pl-2 [&_blockquote]:not-italic [&_blockquote]:text-muted-foreground',
  '[&_img]:my-1 [&_img]:max-h-60 [&_img]:rounded-md',
  '[&_code]:text-[0.85em]',
)

export interface ChatProps {
  conversation: UseConversationResult
  showConversationList?: boolean
  showModeToggle?: boolean
  placeholder?: string
  currentUserId?: string
  emptyState?: React.ReactNode
  className?: string
  // composer extras
  slashCommands?: SlashCommand[]
  mentions?: Mention[] | ((query: string) => Mention[] | Promise<Mention[]>)
  onSlashCommand?: (cmd: SlashCommand) => void
  composerToolbar?: boolean
}

function Avatar({ name, avatarUrl, size = 8 }: { name: string; avatarUrl?: string; size?: number }) {
  return h(
    'div',
    {
      className: cn(
        'flex-shrink-0 overflow-hidden rounded-full bg-muted flex items-center justify-center text-xs font-medium',
        size === 8 ? 'h-8 w-8' : 'h-7 w-7',
      ),
    },
    avatarUrl
      ? h('img', { src: avatarUrl, alt: name, className: 'h-full w-full object-cover' })
      : (name.charAt(0) || '?').toUpperCase(),
  )
}

function TypingDots() {
  return h(
    'div',
    { className: 'flex items-center gap-1 py-1.5', 'aria-label': 'Assistant is typing' },
    ...[0, 150, 300].map((delay) =>
      h('span', {
        key: delay,
        className: 'h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce',
        style: { animationDelay: `${delay}ms` },
      }),
    ),
  )
}

function Attachments({ attachments }: { attachments: MessageAttachment[] }) {
  return h(
    'div',
    { className: 'mt-2 flex flex-wrap gap-2' },
    ...attachments.map((a) =>
      a.type.startsWith('image/')
        ? h('img', { key: a.id, src: a.url, alt: a.name, className: 'max-h-60 rounded-md border border-border object-contain' })
        : h(
            'a',
            {
              key: a.id,
              href: a.url,
              target: '_blank',
              rel: 'noreferrer',
              className: 'inline-flex items-center gap-2 rounded-md border border-border bg-background/60 px-2 py-1 text-xs',
            },
            '📎 ',
            a.name,
          ),
    ),
  )
}

function MessageBody({ message }: { message: ChatMessage }) {
  if (message.status === 'streaming' && message.content === '') return h(TypingDots)
  return h(
    React.Fragment,
    null,
    message.content ? h(MarkdownRenderer, { content: message.content, size: 'sm', className: chatMd }) : null,
    message.attachments && message.attachments.length > 0 ? h(Attachments, { attachments: message.attachments }) : null,
    message.status === 'error'
      ? h('div', { className: 'mt-1 text-xs text-destructive', role: 'alert' }, message.error ?? 'Failed to send.')
      : null,
  )
}

function Reactions({ message, onReact, align }: { message: ChatMessage; onReact: (e: string) => void; align: 'start' | 'end' }) {
  if (!message.reactions || message.reactions.length === 0) return null
  return h(
    'div',
    { className: cn('mt-1 flex flex-wrap gap-1', align === 'end' && 'justify-end') },
    ...message.reactions.map((r) =>
      h(
        'button',
        {
          key: r.emoji,
          type: 'button',
          onClick: () => onReact(r.emoji),
          className: cn(
            'inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs',
            r.userReacted ? 'border-primary bg-primary/10' : 'border-border bg-background',
          ),
        },
        `${r.emoji} ${r.count}`,
      ),
    ),
  )
}

function QuotedParent({ parent, onClick }: { parent: ChatMessage; onClick: () => void }) {
  const snippet = parent.content.length > 80 ? `${parent.content.slice(0, 80)}…` : parent.content
  return h(
    'button',
    {
      type: 'button',
      onClick,
      className:
        'mb-1 flex max-w-full items-start gap-2 rounded-md border-l-2 border-primary/50 bg-muted/50 px-2 py-1 text-left text-xs text-muted-foreground hover:bg-muted',
    },
    h('span', { className: 'font-medium' }, parent.author.name),
    h('span', { className: 'truncate' }, snippet),
  )
}

function HoverActions({
  message,
  conversation,
  isOwn,
  onEdit,
  onToggleEmojis,
  align,
}: {
  message: ChatMessage
  conversation: UseConversationResult
  isOwn: boolean
  onEdit: () => void
  onToggleEmojis: () => void
  align: 'start' | 'end'
}) {
  const { replyTo, deleteMessage } = conversation
  return h(
    'div',
    {
      className: cn(
        'mt-1 flex items-center gap-3 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100',
        align === 'end' && 'justify-end',
      ),
    },
    // Reply targets this specific message but groups under the originating root.
    h('button', { type: 'button', className: 'hover:text-foreground', onClick: () => replyTo(message.id) }, 'Reply'),
    h('button', { type: 'button', className: 'hover:text-foreground', onClick: onToggleEmojis }, 'React'),
    isOwn ? h('button', { type: 'button', className: 'hover:text-foreground', onClick: onEdit }, 'Edit') : null,
    isOwn ? h('button', { type: 'button', className: 'hover:text-destructive', onClick: () => deleteMessage(message.id) }, 'Delete') : null,
  )
}

function EmojiRow({ onPick, align }: { onPick: (e: string) => void; align: 'start' | 'end' }) {
  return h(
    'div',
    { className: cn('mt-1 flex gap-1', align === 'end' && 'justify-end') },
    ...QUICK_EMOJIS.map((emoji) =>
      h('button', { key: emoji, type: 'button', className: 'rounded px-1 text-base hover:bg-accent', onClick: () => onPick(emoji) }, emoji),
    ),
  )
}

function EditField({ message, conversation, onDone }: { message: ChatMessage; conversation: UseConversationResult; onDone: () => void }) {
  const [draft, setDraft] = React.useState(message.content)
  function save() {
    const t = draft.trim()
    if (t && t !== message.content) conversation.editMessage(message.id, t)
    onDone()
  }
  return h(
    'div',
    { className: 'mt-1' },
    h('textarea', {
      className: 'w-full resize-none rounded-md border border-border bg-background px-2 py-1 text-sm',
      value: draft,
      autoFocus: true,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setDraft(e.target.value),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          save()
        }
        if (e.key === 'Escape') onDone()
      },
    }),
    h(
      'div',
      { className: 'mt-1 flex gap-2 text-xs' },
      h('button', { type: 'button', className: 'text-primary', onClick: save }, 'Save'),
      h('button', { type: 'button', className: 'text-muted-foreground', onClick: onDone }, 'Cancel'),
    ),
  )
}

function MessageRow({
  message,
  conversation,
  currentUserId,
  showThreadAffordance,
  quotedParent,
}: {
  message: ChatMessage
  conversation: UseConversationResult
  currentUserId?: string
  showThreadAffordance: boolean
  quotedParent?: ChatMessage
}) {
  const { state, react, openThread } = conversation
  const [showEmojis, setShowEmojis] = React.useState(false)
  const [editing, setEditing] = React.useState(false)

  const isUser = currentUserId ? message.author.id === currentUserId : message.role === 'user'
  const replyCount = getReplyCount(state.messages, message.id)
  const align = isUser ? 'end' : 'start'

  const inner = h(
    React.Fragment,
    null,
    quotedParent ? h(QuotedParent, { parent: quotedParent, onClick: () => openThread(rootIdOf(state.messages, quotedParent.id)) }) : null,
    editing
      ? h(EditField, { message, conversation, onDone: () => setEditing(false) })
      : isUser
        ? h('div', { className: 'inline-block rounded-2xl rounded-br-sm bg-primary/10 px-3 py-2 text-left' }, h(MessageBody, { message }))
        : h(MessageBody, { message }),
    h(Reactions, { message, onReact: (e: string) => react(message.id, e), align }),
    showThreadAffordance && replyCount > 0
      ? h(
          'button',
          { type: 'button', className: cn('mt-1 text-xs font-medium text-primary hover:underline', align === 'end' && 'self-end'), onClick: () => openThread(message.id) },
          `💬 ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`,
        )
      : null,
    h(HoverActions, { message, conversation, isOwn: isUser, onEdit: () => setEditing(true), onToggleEmojis: () => setShowEmojis((v) => !v), align }),
    showEmojis
      ? h(EmojiRow, {
          onPick: (e: string) => {
            react(message.id, e)
            setShowEmojis(false)
          },
          align,
        })
      : null,
  )

  // Assistant / system: full-width flat row with avatar + name.
  if (!isUser) {
    return h(
      'div',
      { className: 'group flex gap-3 rounded-md px-3 py-2 hover:bg-accent/30', role: 'article', 'aria-label': `Message from ${message.author.name}`, 'data-message-id': message.id },
      h(Avatar, { name: message.author.name, avatarUrl: message.author.avatarUrl }),
      h(
        'div',
        { className: 'min-w-0 flex-1' },
        h(
          'div',
          { className: 'flex items-baseline gap-2' },
          h('span', { className: 'text-sm font-semibold' }, message.author.name),
          h('span', { className: 'text-xs text-muted-foreground', title: message.timestamp.toISOString() }, formatTimestamp(message.timestamp)),
          message.edited ? h('span', { className: 'text-xs text-muted-foreground' }, '(edited)') : null,
        ),
        inner,
      ),
    )
  }

  // User: right-aligned bubble column.
  return h(
    'div',
    { className: 'group flex flex-col items-end px-3 py-1.5', role: 'article', 'aria-label': `Message from ${message.author.name}`, 'data-message-id': message.id },
    h(
      'div',
      { className: 'flex items-baseline gap-2' },
      message.edited ? h('span', { className: 'text-xs text-muted-foreground' }, '(edited)') : null,
      h('span', { className: 'text-xs text-muted-foreground', title: message.timestamp.toISOString() }, formatTimestamp(message.timestamp)),
      h('span', { className: 'text-sm font-semibold' }, message.author.name),
    ),
    h('div', { className: 'mt-0.5 flex max-w-[80%] flex-col items-end' }, inner),
  )
}

function ConversationSidebar({ conversation }: { conversation: UseConversationResult }) {
  const { state, newConversation, selectConversation, deleteConversation } = conversation
  return h(
    'aside',
    { className: 'flex w-56 flex-col gap-1 overflow-y-auto border-r border-border bg-muted/20 p-2', 'aria-label': 'Conversations' },
    h(
      'button',
      { type: 'button', className: 'mb-1 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90', onClick: () => newConversation() },
      '+ New chat',
    ),
    ...state.conversations.map((conv) =>
      h(
        'div',
        {
          key: conv.id,
          role: 'button',
          'aria-current': conv.id === state.activeConversationId,
          onClick: () => selectConversation(conv.id),
          className: cn(
            'group flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent/60',
            conv.id === state.activeConversationId && 'bg-accent font-medium',
          ),
        },
        h(
          'div',
          { className: 'min-w-0' },
          h('div', { className: 'truncate' }, conv.title),
          h('div', { className: 'truncate text-xs text-muted-foreground' }, formatRelativeTime(conv.updatedAt)),
        ),
        h(
          'button',
          {
            type: 'button',
            className: 'text-xs text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100',
            'aria-label': `Delete ${conv.title}`,
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation()
              deleteConversation(conv.id)
            },
          },
          '✕',
        ),
      ),
    ),
  )
}

function ThreadPanel({ conversation, currentUserId, composer }: { conversation: UseConversationResult; currentUserId?: string; composer: React.ReactNode }) {
  const { state } = conversation
  const rootId = state.openThreadRootId
  if (!rootId) return null
  const messages = selectThreadMessages(state.messages, rootId)
  // Hint when the next reply targets a specific mid-thread message rather than the root.
  const target = state.replyTarget && state.replyTarget !== rootId ? findMessage(state.messages, state.replyTarget) : undefined
  return h(
    'aside',
    { className: 'flex w-80 flex-col border-l border-border', 'aria-label': 'Thread' },
    h(
      'div',
      { className: 'flex items-center justify-between border-b border-border px-3 py-2' },
      h('span', { className: 'text-sm font-semibold' }, `Thread · ${messages.length - 1} ${messages.length - 1 === 1 ? 'reply' : 'replies'}`),
      h('button', { type: 'button', className: 'text-muted-foreground hover:text-foreground', 'aria-label': 'Close thread', onClick: () => conversation.closeThread() }, '✕'),
    ),
    h(
      'div',
      { className: 'flex-1 overflow-y-auto p-1' },
      ...messages.map((m) => h(MessageRow, { key: m.id, message: m, conversation, currentUserId, showThreadAffordance: false })),
    ),
    target
      ? h(
          'div',
          { className: 'flex items-center justify-between gap-2 border-t border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground' },
          h('span', { className: 'truncate' }, `↳ Replying to ${target.author.name}`),
          h('button', { type: 'button', className: 'hover:text-foreground', onClick: () => conversation.openThread(rootId) }, 'Reply to thread instead'),
        )
      : null,
    composer,
  )
}

function ModeToggle({ conversation }: { conversation: UseConversationResult }) {
  const { state, setThreadingMode } = conversation
  const opt = (mode: ThreadingMode, label: string) =>
    h(
      'button',
      {
        type: 'button',
        onClick: () => setThreadingMode(mode),
        className: cn('rounded px-2 py-0.5 text-xs', state.threadingMode === mode ? 'bg-background shadow-sm' : 'text-muted-foreground'),
      },
      label,
    )
  return h(
    'div',
    { className: 'inline-flex rounded-md bg-muted p-0.5', role: 'group', 'aria-label': 'Threading mode' },
    opt('inline', 'Inline'),
    opt('panel', 'Threads'),
  )
}

/**
 * Chat — batteries-included composite over `useConversation()`:
 * conversation sidebar + main timeline + rich composer + thread side panel.
 * Hybrid layout: assistant replies full-width, user messages in a right-aligned
 * bubble. Markdown/code/gifs, reactions, edit/delete, streaming, and a composer
 * with `/` commands, `@` mentions, `:` emoji, and a formatting toolbar.
 */
export function Chat({
  conversation,
  showConversationList = true,
  showModeToggle = true,
  placeholder,
  currentUserId,
  emptyState,
  className,
  slashCommands,
  mentions,
  onSlashCommand,
  composerToolbar = true,
}: ChatProps) {
  const { state, sendMessage } = conversation
  const timeline = selectMainTimeline(state.messages, state.threadingMode)
  const activeConv = state.conversations.find((c) => c.id === state.activeConversationId)
  const busy = state.status === 'sending' || state.status === 'streaming'
  const error = state.status === 'error' ? state.error : null
  const onRetry = () => void conversation.retryLast()

  const mainComposer = h(Composer, {
    placeholder,
    busy,
    error,
    onRetry,
    slashCommands,
    mentions,
    onSlashCommand,
    toolbar: composerToolbar,
    onSubmit: (content: string, atts?: MessageAttachment[]) => void sendMessage(content, { attachments: atts }),
    onStop: () => conversation.stop(),
  })

  const threadComposer = state.openThreadRootId
    ? h(Composer, {
        placeholder: 'Reply…',
        busy,
        error,
        onRetry,
        slashCommands,
        mentions,
        onSlashCommand,
        toolbar: composerToolbar,
        onSubmit: (content: string, atts?: MessageAttachment[]) =>
          void sendMessage(content, { replyTo: state.replyTarget ?? state.openThreadRootId!, attachments: atts }),
        onStop: () => conversation.stop(),
      })
    : null

  const body =
    timeline.length === 0
      ? h('div', { className: 'flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground' }, emptyState ?? 'No messages yet. Say hello 👋')
      : h(
          'div',
          { className: 'flex-1 space-y-0.5 overflow-y-auto p-2' },
          ...timeline.map((m) =>
            h(MessageRow, {
              key: m.id,
              message: m,
              conversation,
              currentUserId,
              // Show the "N replies" count on originating messages in BOTH modes.
              showThreadAffordance: true,
              // Inline: quote the specific message replied to (falls back to the root).
              quotedParent: state.threadingMode === 'inline' && m.parentId ? findMessage(state.messages, m.replyToId ?? m.parentId) : undefined,
            }),
          ),
        )

  return h(
    'div',
    { className: cn('flex h-full min-h-0 overflow-hidden rounded-xl border border-border bg-background', className) },
    showConversationList ? h(ConversationSidebar, { conversation }) : null,
    h(
      'div',
      { className: 'flex min-w-0 flex-1 flex-col' },
      h(
        'div',
        { className: 'flex items-center justify-between border-b border-border px-3 py-2' },
        h('span', { className: 'truncate text-sm font-semibold' }, activeConv?.title ?? 'Chat'),
        showModeToggle ? h(ModeToggle, { conversation }) : null,
      ),
      body,
      mainComposer,
    ),
    h(ThreadPanel, { conversation, currentUserId, composer: threadComposer }),
  )
}
