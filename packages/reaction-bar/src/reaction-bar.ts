import type { AccessibilityProps } from '@refraction-ui/shared'
import { generateId } from '@refraction-ui/shared'

export interface Reaction {
  /** The emoji character */
  emoji: string
  /** Number of users who reacted with this emoji */
  count: number
  /** Whether the current user has reacted */
  userReacted: boolean
}

export interface ReactionBarProps {
  /** Current reactions */
  reactions: Reaction[]
  /** Callback when a reaction is toggled */
  onToggle?: (emoji: string) => void
  /** Callback when a new reaction is added */
  onAdd?: (emoji: string) => void
}

export interface ReactionBarAPI {
  /** Current reactions */
  reactions: Reaction[]
  /** Toggle a reaction */
  toggle(emoji: string): void
  /** Add a new reaction */
  add(emoji: string): void
  /** ARIA props for the reaction bar container */
  ariaProps: Partial<AccessibilityProps> & Record<string, unknown>
  /** Get ARIA props for an individual reaction pill */
  getReactionAriaProps(reaction: Reaction): Record<string, unknown>
  /** ARIA props for the "add reaction" button */
  addButtonAriaProps: Record<string, unknown>
  /** Generated IDs */
  ids: {
    container: string
    label: string
  }
}

export function createReactionBar(props: ReactionBarProps): ReactionBarAPI {
  const { reactions, onToggle, onAdd } = props

  const containerId = generateId('rfr-reactions')
  const labelId = generateId('rfr-reactions-label')

  function toggle(emoji: string): void {
    onToggle?.(emoji)
  }

  function add(emoji: string): void {
    onAdd?.(emoji)
  }

  const ariaProps: Partial<AccessibilityProps> & Record<string, unknown> = {
    role: 'group',
    'aria-label': 'Reactions',
    id: containerId,
  }

  function getReactionAriaProps(reaction: Reaction): Record<string, unknown> {
    return {
      role: 'button',
      'aria-pressed': reaction.userReacted,
      'aria-label': `${reaction.emoji} ${reaction.count} reaction${reaction.count === 1 ? '' : 's'}${reaction.userReacted ? ', you reacted' : ''}`,
    }
  }

  const addButtonAriaProps: Record<string, unknown> = {
    role: 'button',
    'aria-label': 'Add reaction',
  }

  return {
    reactions,
    toggle,
    add,
    ariaProps,
    getReactionAriaProps,
    addButtonAriaProps,
    ids: {
      container: containerId,
      label: labelId,
    },
  }
}
