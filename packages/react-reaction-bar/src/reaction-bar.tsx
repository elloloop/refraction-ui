import * as React from 'react'
import {
  createReactionBar,
  reactionBarStyles,
  reactionPillVariants,
  reactionAddButtonStyles,
  reactionEmojiStyles,
  reactionCountStyles,
  type Reaction,
} from '@refraction-ui/reaction-bar'
import { cn } from '@refraction-ui/shared'

export interface ReactionBarProps {
  reactions: Reaction[]
  onToggle?: (emoji: string) => void
  onAdd?: (emoji: string) => void
  showAddButton?: boolean
  className?: string
}

export function ReactionBar({
  reactions,
  onToggle,
  onAdd,
  showAddButton = true,
  className,
}: ReactionBarProps) {
  const api = createReactionBar({ reactions, onToggle, onAdd })

  return React.createElement(
    'div',
    { ...api.ariaProps, className: cn(reactionBarStyles, className) },
    api.reactions.map((reaction, i) =>
      React.createElement(
        'button',
        {
          key: `${reaction.emoji}-${i}`,
          type: 'button',
          className: reactionPillVariants({
            state: reaction.userReacted ? 'active' : 'inactive',
          }),
          onClick: () => api.toggle(reaction.emoji),
          ...api.getReactionAriaProps(reaction),
        },
        React.createElement('span', { className: reactionEmojiStyles }, reaction.emoji),
        React.createElement('span', { className: reactionCountStyles }, reaction.count),
      ),
    ),
    showAddButton &&
      React.createElement(
        'button',
        {
          type: 'button',
          className: reactionAddButtonStyles,
          onClick: () => onAdd?.('\u{1F44D}'),
          ...api.addButtonAriaProps,
        },
        '+',
      ),
  )
}

ReactionBar.displayName = 'ReactionBar'
