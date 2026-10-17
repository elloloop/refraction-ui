import * as React from 'react'
import {
  createReactionBar,
  reactionBarStyles,
  reactionPillVariants,
  reactionAddButtonStyles,
  reactionOverflowButtonStyles,
  reactionChipStyles,
  reactionTooltipStyles,
  reactionTooltipContentStyles,
  reactionEmojiStyles,
  reactionCountStyles,
  getReactorsTooltipAlign,
  type Reaction,
  type ReactionBarStrings,
  type ReactorsTooltipAlign,
} from '@refraction-ui/reaction-bar'
import { cn } from '@refraction-ui/shared'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect

/** Which edge of its pill an open tooltip should line up with to stay on screen. */
function measureTooltipAlign(tooltip: HTMLElement): ReactorsTooltipAlign {
  const chip = tooltip.parentElement ?? tooltip
  return getReactorsTooltipAlign({
    anchor: chip.getBoundingClientRect(),
    tooltipWidth: tooltip.getBoundingClientRect().width,
    viewportWidth: document.documentElement.clientWidth,
    direction: getComputedStyle(chip).direction === 'rtl' ? 'rtl' : 'ltr',
  })
}

export interface ReactionBarProps {
  reactions: Reaction[]
  /** Called with a reaction's emoji when its pill is activated. */
  onToggle?: (emoji: string) => void
  /**
   * Called when the add-reaction button is activated, with the button itself
   * so the caller can anchor its emoji picker to it. The button renders only
   * when this is given.
   */
  onAddReaction?: (trigger: HTMLButtonElement) => void
  /** Set false to hide the add-reaction button. Default: true. */
  showAddButton?: boolean
  /**
   * Reactions shown before a "+N" button that expands the bar (and then
   * collapses it again). Omit to show every reaction.
   */
  maxVisible?: number
  /** Overrides for the user-facing strings (English defaults). */
  strings?: Partial<ReactionBarStrings>
  className?: string
}

export const ReactionBar = React.forwardRef<HTMLDivElement, ReactionBarProps>(
  function ReactionBar(
    {
      reactions,
      onToggle,
      onAddReaction,
      showAddButton = true,
      maxVisible,
      strings,
      className,
    },
    ref,
  ) {
    const [expanded, setExpanded] = React.useState(false)
    // The emoji whose who-reacted tooltip is showing.
    const [tooltipFor, setTooltipFor] = React.useState<string | null>(null)
    const [tooltipAlign, setTooltipAlign] = React.useState<ReactorsTooltipAlign>('start')
    // Focus that follows a pointer press is not keyboard focus: it should not
    // open a tooltip on touch, where there is no hover to close it again.
    const pointerPressed = React.useRef(false)
    // React ids agree across SSR and hydration, unlike the core's counter.
    const idPrefix = `rfr-reactions-${React.useId()}`

    const api = createReactionBar({ reactions, onToggle, maxVisible, expanded, strings, idPrefix })

    const openTooltip = reactions.find((reaction) => reaction.emoji === tooltipFor)
    const openTooltipId = openTooltip ? api.getReactorsTooltip(openTooltip)?.id : undefined

    // Measured before paint, so a flipped tooltip never shows in the wrong place.
    useIsomorphicLayoutEffect(() => {
      const tooltip = openTooltipId ? document.getElementById(openTooltipId) : null
      if (tooltip) setTooltipAlign(measureTooltipAlign(tooltip))
    }, [openTooltipId])

    React.useEffect(() => {
      if (tooltipFor === null) return
      function dismiss(event: KeyboardEvent) {
        if (event.key === 'Escape') setTooltipFor(null)
      }
      document.addEventListener('keydown', dismiss)
      return () => document.removeEventListener('keydown', dismiss)
    }, [tooltipFor])

    function closeTooltip(emoji: string) {
      setTooltipFor((current) => (current === emoji ? null : current))
    }

    function renderReaction(reaction: Reaction) {
      const tooltip = api.getReactorsTooltip(reaction)
      const pill = React.createElement(
        'button',
        {
          key: tooltip ? undefined : reaction.emoji,
          type: 'button',
          className: reactionPillVariants({
            state: reaction.userReacted ? 'active' : 'inactive',
          }),
          onClick: () => api.toggle(reaction.emoji),
          ...api.getReactionAriaProps(reaction),
          ...(tooltip && {
            onPointerDown: () => {
              pointerPressed.current = true
            },
            onFocus: () => {
              if (!pointerPressed.current) setTooltipFor(reaction.emoji)
              pointerPressed.current = false
            },
            onBlur: () => {
              pointerPressed.current = false
              closeTooltip(reaction.emoji)
            },
            onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
              // Escape belongs to the open tooltip first, not to an enclosing
              // dialog or popover.
              if (event.key === 'Escape' && tooltipFor === reaction.emoji) {
                event.stopPropagation()
                setTooltipFor(null)
              }
            },
          }),
        },
        React.createElement('span', { className: reactionEmojiStyles }, reaction.emoji),
        React.createElement('span', { className: reactionCountStyles }, reaction.count),
      )
      if (!tooltip) return pill

      return React.createElement(
        'span',
        {
          key: reaction.emoji,
          className: reactionChipStyles,
          onPointerEnter: (event: React.PointerEvent<HTMLSpanElement>) => {
            if (event.pointerType !== 'touch') setTooltipFor(reaction.emoji)
          },
          onPointerLeave: () => closeTooltip(reaction.emoji),
        },
        pill,
        React.createElement(
          'span',
          {
            id: tooltip.id,
            role: tooltip.role,
            className: reactionTooltipStyles,
            hidden: tooltipFor !== reaction.emoji,
            'data-align': tooltipFor === reaction.emoji ? tooltipAlign : undefined,
          },
          React.createElement('span', { className: reactionTooltipContentStyles }, tooltip.text),
        ),
      )
    }

    return React.createElement(
      'div',
      { ref, ...api.ariaProps, className: cn(reactionBarStyles, className) },
      api.visibleReactions.map(renderReaction),
      api.overflowButtonAriaProps &&
        React.createElement(
          'button',
          {
            type: 'button',
            className: reactionOverflowButtonStyles,
            onClick: () => setExpanded((open) => !open),
            ...api.overflowButtonAriaProps,
          },
          api.overflowButtonText,
        ),
      showAddButton &&
        onAddReaction &&
        React.createElement(
          'button',
          {
            type: 'button',
            className: reactionAddButtonStyles,
            onClick: (event: React.MouseEvent<HTMLButtonElement>) =>
              onAddReaction(event.currentTarget),
            ...api.addButtonAriaProps,
          },
          '+',
        ),
    )
  },
)
