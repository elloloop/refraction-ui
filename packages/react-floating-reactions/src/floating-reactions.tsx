import * as React from 'react'
import {
  createFloatingReactions,
  laneOffsetPercent,
  REACTION_LIFETIME_MS,
  floatingReactionsVariants,
  floatingReactionItemClass,
  floatingReactionLabelClass,
  floatingReactionsStyles,
  type FloatingReaction,
} from '@refraction-ui/floating-reactions'
import { cn } from '@refraction-ui/shared'

export type { FloatingReaction }

/**
 * Identity of the overlay's stylesheet. React 19 hoists a `<style>` with an
 * `href` and a `precedence` into the document head once, however many
 * overlays render; React 18 leaves it in place, which is harmless.
 */
const STYLE_HREF = 'refraction-ui/floating-reactions'

export interface FloatingReactionsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color' | 'content'> {
  /**
   * Controlled list of reactions currently visible in the overlay. The parent
   * is responsible for adding items and removing them after REACTION_LIFETIME_MS
   * (or use the useFloatingReactions hook which handles this automatically).
   */
  reactions: FloatingReaction[]
  /**
   * Total number of horizontal lane buckets used to spread reactions.
   * @default 5
   */
  lanes?: number
}

/**
 * FloatingReactions — a controlled overlay that renders transient emoji
 * reactions floating upward. Intended to be positioned absolutely over a
 * meeting/video surface.
 *
 * - Each reaction rises and fades over `REACTION_LIFETIME_MS`. The overlay
 *   renders the keyframes itself, so no global CSS is needed. Under
 *   `prefers-reduced-motion: reduce` a reaction stays in place and fades.
 * - The overlay is `pointer-events-none` so it never blocks interaction.
 * - role="status" aria-live="polite" announces new reactions to screen readers.
 */
export const FloatingReactions = React.forwardRef<
  HTMLDivElement,
  FloatingReactionsProps
>(function FloatingReactions({ reactions, lanes = 5, className, ...props }, ref) {
  const { ariaProps, dataAttributes, itemDataAttributes } = createFloatingReactions()

  return (
    <div
      ref={ref}
      className={cn(floatingReactionsVariants({ active: reactions.length > 0 ? 'true' : 'false' }), className)}
      {...ariaProps}
      {...dataAttributes}
      {...props}
    >
      <style href={STYLE_HREF} precedence="refraction-ui">
        {floatingReactionsStyles}
      </style>
      {reactions.map((reaction) => {
        const left = laneOffsetPercent(reaction.lane ?? 0, lanes)
        return (
          <span
            key={reaction.id}
            className={floatingReactionItemClass}
            style={{ left: `${left}%` }}
            aria-hidden="true"
            {...itemDataAttributes}
          >
            {reaction.emoji}
            <span className={floatingReactionLabelClass}>{reaction.emoji}</span>
          </span>
        )
      })}
    </div>
  )
})

// ---------------------------------------------------------------------------
// ReactionBurst — a single reaction held still (for previews and stories).
// ---------------------------------------------------------------------------

export interface ReactionBurstProps {
  emoji: string
  lane?: number
  lanes?: number
}

/**
 * ReactionBurst renders a single emoji at the specified lane offset — useful
 * for static demos or Storybook stories showing a specific burst position.
 * It holds still: only reactions inside a `FloatingReactions` overlay float
 * away.
 */
export function ReactionBurst({ emoji, lane = 0, lanes = 5 }: ReactionBurstProps) {
  const left = laneOffsetPercent(lane, lanes)
  return (
    <span
      className={floatingReactionItemClass}
      style={{ left: `${left}%` }}
      aria-hidden="true"
    >
      {emoji}
      <span className={floatingReactionLabelClass}>{emoji}</span>
    </span>
  )
}

// ---------------------------------------------------------------------------
// useFloatingReactions — manages the list with auto-expiry.
// ---------------------------------------------------------------------------

export interface UseFloatingReactionsResult {
  reactions: FloatingReaction[]
  /**
   * Add an emoji reaction. An auto-incrementing id (not Math.random) is
   * generated internally unless you pass one explicitly.
   */
  emit: (emoji: string, options?: { id?: string; lane?: number }) => void
  /** Remove all current reactions immediately. */
  clear: () => void
}

/**
 * Manages a list of FloatingReaction items with automatic expiry after
 * REACTION_LIFETIME_MS. IDs use an incrementing ref counter — no Math.random.
 *
 * @example
 * const { reactions, emit } = useFloatingReactions()
 * // <FloatingReactions reactions={reactions} />
 * // <button onClick={() => emit('👋')}>Wave</button>
 */
export function useFloatingReactions(): UseFloatingReactionsResult {
  const [reactions, setReactions] = React.useState<FloatingReaction[]>([])
  const counter = React.useRef(0)

  const emit = React.useCallback(
    (emoji: string, options: { id?: string; lane?: number } = {}) => {
      counter.current += 1
      const id = options.id ?? `fr-${counter.current}`
      const lane = options.lane

      const reaction: FloatingReaction = { id, emoji, lane }
      setReactions((prev) => [...prev, reaction])

      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== id))
      }, REACTION_LIFETIME_MS)
    },
    [],
  )

  const clear = React.useCallback(() => {
    setReactions([])
  }, [])

  return { reactions, emit, clear }
}
