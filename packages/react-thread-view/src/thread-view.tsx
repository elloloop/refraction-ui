import * as React from 'react'
import {
  createThreadView,
  threadContainerStyles,
  threadMessageStyles,
  threadAvatarStyles,
  threadContentStyles,
  threadAuthorStyles,
  threadTimestampStyles,
  threadBodyStyles,
  threadReactionsStyles,
  threadReplyIndicatorStyles,
  threadActionsStyles,
  threadAttachmentStyles,
  threadEditedStyles,
  type MessageData,
  type MessageReaction,
} from '@elloloop/thread-view'
import { cn } from '@elloloop/shared'

export interface ThreadViewProps {
  messages: MessageData[]
  onReply?: (messageId: string, content: string) => void
  onReact?: (messageId: string, emoji: string) => void
  currentUserId?: string
  className?: string
}

function MessageComponent({
  message,
  api,
}: {
  message: MessageData
  api: ReturnType<typeof createThreadView>
}) {
  return React.createElement(
    'div',
    { className: threadMessageStyles, ...api.getMessageAriaProps(message) },
    // Avatar
    React.createElement(
      'div',
      { className: threadAvatarStyles },
      message.author.avatarUrl
        ? React.createElement('img', {
            src: message.author.avatarUrl,
            alt: message.author.name,
            className: 'h-full w-full object-cover',
          })
        : message.author.name.charAt(0).toUpperCase(),
    ),
    // Content
    React.createElement(
      'div',
      { className: threadContentStyles },
      React.createElement(
        'div',
        { className: 'flex items-baseline' },
        React.createElement('span', { className: threadAuthorStyles }, message.author.name),
        React.createElement(
          'span',
          { className: threadTimestampStyles },
          api.formatTimestamp(message.timestamp),
        ),
        message.edited &&
          React.createElement('span', { className: threadEditedStyles }, '(edited)'),
      ),
      React.createElement('div', { className: threadBodyStyles }, message.content),
      // Reactions
      message.reactions &&
        message.reactions.length > 0 &&
        React.createElement(
          'div',
          { className: threadReactionsStyles },
          message.reactions.map((reaction, i) =>
            React.createElement(
              'button',
              {
                key: `${reaction.emoji}-${i}`,
                type: 'button',
                className: cn(
                  'inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs cursor-pointer',
                  reaction.userReacted ? 'border-primary bg-primary/10' : 'border-border',
                ),
                onClick: () => api.react(message.id, reaction.emoji),
              },
              `${reaction.emoji} ${reaction.count}`,
            ),
          ),
        ),
      // Reply indicator
      message.replies &&
        message.replies.length > 0 &&
        React.createElement(
          'div',
          { className: threadReplyIndicatorStyles },
          `${message.replies.length} ${message.replies.length === 1 ? 'reply' : 'replies'}`,
        ),
      // Attachments
      message.attachments &&
        message.attachments.map((attachment) =>
          React.createElement(
            'div',
            { key: attachment.id, className: threadAttachmentStyles },
            React.createElement('span', null, '\u{1F4CE}'),
            React.createElement('span', { className: 'truncate' }, attachment.name),
          ),
        ),
      // Actions (reply button)
      React.createElement(
        'div',
        { className: threadActionsStyles },
        React.createElement(
          'button',
          {
            type: 'button',
            className: 'text-xs text-muted-foreground hover:text-foreground cursor-pointer',
            onClick: () => api.startReply(message.id),
            ...api.getReplyButtonAriaProps(message.id),
          },
          'Reply',
        ),
      ),
    ),
  )
}

export function ThreadView({
  messages,
  onReply,
  onReact,
  currentUserId,
  className,
}: ThreadViewProps) {
  const api = createThreadView({ messages, onReply, onReact, currentUserId })

  return React.createElement(
    'div',
    { ...api.ariaProps, className: cn(threadContainerStyles, className) },
    messages.map((message) =>
      React.createElement(MessageComponent, {
        key: message.id,
        message,
        api,
      }),
    ),
  )
}

ThreadView.displayName = 'ThreadView'
