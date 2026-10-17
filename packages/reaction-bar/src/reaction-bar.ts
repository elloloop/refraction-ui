import { generateId } from '@refraction-ui/shared'

export interface Reaction {
  /** The emoji character. Identifies the reaction within its bar. */
  emoji: string
  /** Number of users who reacted with this emoji */
  count: number
  /** Whether the current user has reacted */
  userReacted: boolean
  /**
   * What assistive technology calls this reaction ("Agree"). Defaults to the
   * emoji itself, which screen readers already announce by its Unicode name.
   */
  label?: string
  /**
   * Display names of the people who reacted, in the order to show them, for
   * the who-reacted tooltip. Omitted or empty hides the tooltip. The bar
   * never reorders or rewrites names: put the current user's own entry
   * ("You") wherever it belongs.
   */
  reactors?: readonly string[]
}

/** User-facing strings of a reaction bar (English defaults). */
export interface ReactionBarStrings {
  /** Accessible name of the bar's group. */
  groupLabel: string
  /** Accessible name of the add-reaction button. */
  addReaction: string
  /** Visible text of the overflow button; receives the hidden count. */
  showMore: (hidden: number) => string
  /** Accessible name of the overflow button; receives the hidden count. */
  showMoreLabel: (hidden: number) => string
  /** Text and accessible name of the button that collapses an expanded bar. */
  showLess: string
  /** A reaction's accessible name. */
  reactionSemantics: (label: string, count: number, reactedByYou: boolean) => string
  /**
   * The who-reacted tooltip, which is also the reaction's accessible
   * description. `count` is the reaction's total, which may exceed the
   * number of names a server sends.
   */
  reactorsTooltip: (reactors: readonly string[], label: string, count: number) => string
}

/** Names shown before "and N others" by the default who-reacted tooltip. */
export const DEFAULT_NAMED_REACTORS = 3

/** `value` rounded down, or null when it is missing or not a finite number. */
function finiteInteger(value: number | undefined): number | null {
  return value !== undefined && Number.isFinite(value) ? Math.floor(value) : null
}

export interface FormatReactorNamesOptions {
  /**
   * Everyone who reacted, when it exceeds `names.length` (a server that sends
   * only the first names). Defaults to `names.length`.
   */
  total?: number
  /** Names listed before the rest collapse into "N others". Default: 3. */
  maxNamed?: number
}

/**
 * Join reactor names for a sentence: "Ana", "Ana and Dev", "Ana, Dev and
 * Sam", "Ana, Dev, Sam and 2 others". Returns an empty string for no names.
 */
export function formatReactorNames(
  names: readonly string[],
  options: FormatReactorNamesOptions = {},
): string {
  if (names.length === 0) return ''
  const maxNamed = Math.max(1, finiteInteger(options.maxNamed) ?? DEFAULT_NAMED_REACTORS)
  const total = Math.max(names.length, finiteInteger(options.total) ?? names.length)

  const named = names.slice(0, maxNamed)
  const others = total - named.length
  if (others === 0) {
    if (named.length === 1) return named[0]
    return `${named.slice(0, -1).join(', ')} and ${named[named.length - 1]}`
  }
  return `${named.join(', ')} and ${others} ${others === 1 ? 'other' : 'others'}`
}

export const defaultReactionBarStrings: ReactionBarStrings = {
  groupLabel: 'Reactions',
  addReaction: 'Add reaction',
  showMore: (hidden) => `+${hidden}`,
  showMoreLabel: (hidden) => `Show ${hidden} more reaction${hidden === 1 ? '' : 's'}`,
  showLess: 'Show less',
  reactionSemantics: (label, count, reactedByYou) =>
    `${label} ${count} reaction${count === 1 ? '' : 's'}${reactedByYou ? ', you reacted' : ''}`,
  reactorsTooltip: (reactors, label, count) =>
    `${formatReactorNames(reactors, { total: count })} reacted with ${label}`,
}

export interface ReactionBarProps {
  /** Current reactions */
  reactions: Reaction[]
  /** Callback when a reaction is toggled */
  onToggle?: (emoji: string) => void
  /**
   * Reactions shown before an overflow button ("+N") that expands the bar.
   * Omit to show every reaction.
   */
  maxVisible?: number
  /** Whether an overflowing bar is expanded to show every reaction. */
  expanded?: boolean
  /** Overrides for the user-facing strings. */
  strings?: Partial<ReactionBarStrings>
  /**
   * Prefix for the element ids. Adapters that render on the server pass an id
   * that is stable across server and client renders; omitted, one is generated.
   */
  idPrefix?: string
}

export interface ReactorsTooltip {
  /** Id the reaction's button references with `aria-describedby`. */
  id: string
  role: 'tooltip'
  /** The who-reacted sentence. */
  text: string
}

export interface ReactionBarAPI {
  /** Current reactions */
  reactions: Reaction[]
  /** The reactions to render, honouring `maxVisible` and `expanded`. */
  visibleReactions: Reaction[]
  /** Reactions folded into the overflow button (0 when expanded). */
  hiddenCount: number
  /** Whether the bar has more reactions than `maxVisible`. */
  overflowing: boolean
  /** The resolved user-facing strings. */
  strings: ReactionBarStrings
  /** Toggle a reaction */
  toggle(emoji: string): void
  /** ARIA props for the reaction bar container */
  ariaProps: Record<string, string | number | boolean>
  /** ARIA props for an individual reaction pill */
  getReactionAriaProps(reaction: Reaction): Record<string, string | number | boolean>
  /** The who-reacted tooltip of a reaction, or null when it names nobody. */
  getReactorsTooltip(reaction: Reaction): ReactorsTooltip | null
  /** ARIA props for the "add reaction" button */
  addButtonAriaProps: Record<string, string | number | boolean>
  /** ARIA props for the overflow button (null when the bar does not overflow). */
  overflowButtonAriaProps: Record<string, string | number | boolean> | null
  /** Visible text of the overflow button (null when the bar does not overflow). */
  overflowButtonText: string | null
  /** Generated IDs */
  ids: {
    container: string
    label: string
  }
}

function visibleLimit(maxVisible: number | undefined): number | null {
  const limit = finiteInteger(maxVisible)
  return limit === null ? null : Math.max(0, limit)
}

function reactionLabel(reaction: Reaction): string {
  return reaction.label ?? reaction.emoji
}

export function createReactionBar(props: ReactionBarProps): ReactionBarAPI {
  const { reactions, onToggle, maxVisible, expanded = false } = props
  const strings: ReactionBarStrings = { ...defaultReactionBarStrings, ...props.strings }

  const idPrefix = props.idPrefix ?? generateId('rfr-reactions')
  const containerId = idPrefix
  const labelId = `${idPrefix}-label`

  const limit = visibleLimit(maxVisible)
  const overflowing = limit !== null && reactions.length > limit
  const visibleReactions = overflowing && !expanded ? reactions.slice(0, limit) : reactions
  const hiddenCount = reactions.length - visibleReactions.length

  const tooltipIds = new Map<string, string>()
  reactions.forEach((reaction, index) => {
    tooltipIds.set(reaction.emoji, `${idPrefix}-reactors-${index}`)
  })

  function toggle(emoji: string): void {
    onToggle?.(emoji)
  }

  function getReactorsTooltip(reaction: Reaction): ReactorsTooltip | null {
    const reactors = reaction.reactors ?? []
    const id = tooltipIds.get(reaction.emoji)
    if (reactors.length === 0 || id === undefined) return null
    return {
      id,
      role: 'tooltip',
      text: strings.reactorsTooltip(reactors, reactionLabel(reaction), reaction.count),
    }
  }

  function getReactionAriaProps(reaction: Reaction): Record<string, string | number | boolean> {
    const props: Record<string, string | number | boolean> = {
      role: 'button',
      'aria-pressed': reaction.userReacted,
      'aria-label': strings.reactionSemantics(
        reactionLabel(reaction),
        reaction.count,
        reaction.userReacted,
      ),
    }
    const tooltip = getReactorsTooltip(reaction)
    if (tooltip) props['aria-describedby'] = tooltip.id
    return props
  }

  const ariaProps: Record<string, string | number | boolean> = {
    role: 'group',
    'aria-label': strings.groupLabel,
    id: containerId,
  }

  const addButtonAriaProps: Record<string, string | number | boolean> = {
    role: 'button',
    'aria-label': strings.addReaction,
  }

  const overflowButtonAriaProps: Record<string, string | number | boolean> | null = overflowing
    ? {
        'aria-expanded': expanded,
        'aria-controls': containerId,
        'aria-label': expanded ? strings.showLess : strings.showMoreLabel(hiddenCount),
      }
    : null

  const overflowButtonText = overflowing
    ? expanded
      ? strings.showLess
      : strings.showMore(hiddenCount)
    : null

  return {
    reactions,
    visibleReactions,
    hiddenCount,
    overflowing,
    strings,
    toggle,
    ariaProps,
    getReactionAriaProps,
    getReactorsTooltip,
    addButtonAriaProps,
    overflowButtonAriaProps,
    overflowButtonText,
    ids: {
      container: containerId,
      label: labelId,
    },
  }
}

/** Which edge of its pill a who-reacted tooltip lines up with. */
export type ReactorsTooltipAlign = 'start' | 'end'

/** Space kept between a tooltip and the viewport edge, in CSS pixels. */
export const REACTORS_TOOLTIP_VIEWPORT_MARGIN = 8

export interface ReactorsTooltipAlignInput {
  /** The pill's horizontal extent in viewport coordinates. */
  anchor: { left: number; right: number }
  /** The tooltip's rendered width. */
  tooltipWidth: number
  viewportWidth: number
  /** Writing direction: `start` is the left edge in LTR, the right edge in RTL. */
  direction?: 'ltr' | 'rtl'
  margin?: number
}

/**
 * Line a who-reacted tooltip up with its pill's start edge, unless that runs
 * it further off screen than lining it up with the end edge would: a pill
 * near the far edge of a narrow pane flips its tooltip back over itself.
 */
export function getReactorsTooltipAlign(input: ReactorsTooltipAlignInput): ReactorsTooltipAlign {
  const {
    anchor,
    tooltipWidth,
    viewportWidth,
    direction = 'ltr',
    margin = REACTORS_TOOLTIP_VIEWPORT_MARGIN,
  } = input
  // How far a tooltip that begins at `left` would cross either viewport edge.
  const overflow = (left: number) =>
    Math.max(0, margin - left) + Math.max(0, left + tooltipWidth - (viewportWidth - margin))
  const fromLeft = overflow(anchor.left)
  const fromRight = overflow(anchor.right - tooltipWidth)
  const [atStart, atEnd] = direction === 'rtl' ? [fromRight, fromLeft] : [fromLeft, fromRight]
  return atEnd < atStart ? 'end' : 'start'
}
