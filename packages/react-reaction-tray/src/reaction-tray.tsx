import * as React from 'react'
import {
  createReactionTray,
  buildReactionTrayLayout,
  getNextReactionTrayIndex,
  isReactionTrayNavigationKey,
  clampReactionTrayIndex,
  resolveReactionTrayCellSize,
  resolveReactionTrayGlyphSize,
  reactionTrayPxToRem,
  reactionTrayClass,
  reactionTrayRowClass,
  reactionTrayGridCellClass,
  reactionTrayOptionVariants,
  reactionTrayToggleClass,
  reactionTrayToggleIconVariants,
  reactionTrayGlyphVariants,
  REACTION_TRAY_POP_DURATION_MS,
  REACTION_TRAY_DEFAULT_MORE_LABEL,
  REACTION_TRAY_DEFAULT_FEWER_LABEL,
  type ReactionTrayOptionData,
  type ReactionTrayCell,
} from '@refraction-ui/reaction-tray'
import { cn, prefersReducedMotion } from '@refraction-ui/shared'

/** A reaction: `glyph` is an emoji string or any React node (e.g. custom artwork). */
export type ReactionTrayOption = ReactionTrayOptionData<React.ReactNode>

/** Paints an option's glyph; swap it for artwork (Twemoji, Lottie, …) without touching the tray. */
export type ReactionTrayGlyphRenderer = (option: ReactionTrayOption) => React.ReactNode

/** Default renderer: the native glyph (an emoji string stays selectable text). */
export const nativeReactionTrayGlyph: ReactionTrayGlyphRenderer = (option) => option.glyph

export interface ReactionTrayProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect' | 'role'> {
  /** Every reaction, in order; the first `inlineCount` are shown inline. */
  options: ReactionTrayOption[]
  /** Called with the option the user picked (toggle its `isActive` in response). */
  onSelected?: (option: ReactionTrayOption) => void
  /** How many options show before the rest move behind "More". Default 6. */
  inlineCount?: number
  /** Start with the overflow options revealed. */
  initiallyExpanded?: boolean
  /** Accessible name of the toggle while collapsed. */
  moreLabel?: string
  /** Accessible name of the toggle while expanded. */
  fewerLabel?: string
  /** Cell edge in px (rendered in rem); never below 44. Default 44. */
  cellSize?: number
  /** Glyph size in px (rendered in rem); capped at the cell size. Default 24. */
  glyphSize?: number
  /** Focus the tray's current cell when it mounts (e.g. after a long-press opens it). */
  autofocus?: boolean
  /** Custom glyph painter. Defaults to the native glyph. */
  renderGlyph?: ReactionTrayGlyphRenderer
}

// jsdom and some embedded webviews lack matchMedia; treat that as "no preference".
function reducedMotionPreferred(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? prefersReducedMotion()
    : false
}

function ToggleChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={reactionTrayToggleIconVariants({ expanded: expanded ? 'true' : 'false' })}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

/**
 * ReactionTray — quick reactions with the rest one step away behind "More".
 *
 * Renders a `role="grid"` of toggle buttons (`aria-pressed`, named by each
 * option's label) with roving tabindex and 2-D arrow / Home / End navigation.
 * The More/Fewer toggle (`aria-expanded`) sits at the end of the first row and
 * never moves, so focus stays on it while the overflow rows appear below.
 * Selecting pops the glyph briefly, except under `prefers-reduced-motion`.
 */
export const ReactionTray = React.forwardRef<HTMLDivElement, ReactionTrayProps>(
  function ReactionTray(
    {
      options,
      onSelected,
      inlineCount,
      initiallyExpanded = false,
      moreLabel = REACTION_TRAY_DEFAULT_MORE_LABEL,
      fewerLabel = REACTION_TRAY_DEFAULT_FEWER_LABEL,
      cellSize,
      glyphSize,
      autofocus = false,
      renderGlyph = nativeReactionTrayGlyph,
      className,
      'aria-label': ariaLabel,
      ...props
    },
    ref,
  ) {
    const [expanded, setExpanded] = React.useState(initiallyExpanded)
    const [rovingIndex, setRovingIndex] = React.useState(0)
    const [poppingId, setPoppingId] = React.useState<string | null>(null)
    const cellRefs = React.useRef<(HTMLButtonElement | null)[]>([])
    const popTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

    const layout = buildReactionTrayLayout(options.length, inlineCount, expanded)
    const focusIndex = clampReactionTrayIndex(rovingIndex, layout.cells.length)
    const api = createReactionTray({ ariaLabel, expanded, hasOverflow: layout.hasOverflow })

    const cellPx = resolveReactionTrayCellSize(cellSize)
    const cellStyle = { width: reactionTrayPxToRem(cellPx), height: reactionTrayPxToRem(cellPx) }
    const glyphRem = reactionTrayPxToRem(resolveReactionTrayGlyphSize(glyphSize, cellPx))
    const glyphStyle = { fontSize: glyphRem, width: glyphRem, height: glyphRem }

    React.useEffect(() => () => clearTimeout(popTimer.current), [])

    React.useEffect(() => {
      if (autofocus) cellRefs.current[focusIndex]?.focus()
      // Only on mount: autofocus is an opening gesture, not a live binding.
    }, [])

    const select = (option: ReactionTrayOption) => {
      onSelected?.(option)
      if (reducedMotionPreferred()) return
      clearTimeout(popTimer.current)
      setPoppingId(option.id)
      popTimer.current = setTimeout(() => setPoppingId(null), REACTION_TRAY_POP_DURATION_MS)
    }

    const toggleExpanded = () => {
      // The toggle keeps its position, so it stays the focused (roving) cell.
      setRovingIndex(layout.toggleIndex)
      setExpanded((value) => !value)
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (!isReactionTrayNavigationKey(event.key)) return
      event.preventDefault()
      const next = getNextReactionTrayIndex(index, event.key, {
        count: layout.cells.length,
        columns: layout.columns,
        ctrlKey: event.ctrlKey || event.metaKey,
      })
      if (next === index) return
      setRovingIndex(next)
      cellRefs.current[next]?.focus()
    }

    const cellButtonProps = (index: number) => ({
      ref: (node: HTMLButtonElement | null) => {
        cellRefs.current[index] = node
      },
      type: 'button' as const,
      tabIndex: index === focusIndex ? 0 : -1,
      style: cellStyle,
      onFocus: () => setRovingIndex(index),
      onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => handleKeyDown(event, index),
    })

    const renderCell = (cell: ReactionTrayCell) => {
      if (cell.type === 'toggle') {
        return (
          <div key="toggle" role="gridcell" className={reactionTrayGridCellClass}>
            <button
              {...cellButtonProps(cell.index)}
              {...api.getToggleAriaProps({ moreLabel, fewerLabel })}
              data-reaction-tray-toggle=""
              className={reactionTrayToggleClass}
              onClick={toggleExpanded}
            >
              <ToggleChevron expanded={expanded} />
            </button>
          </div>
        )
      }

      const option = options[cell.optionIndex]
      const active = option.isActive === true
      const popping = poppingId === option.id
      return (
        <div key={option.id} role="gridcell" className={reactionTrayGridCellClass}>
          <button
            {...cellButtonProps(cell.index)}
            {...api.getOptionAriaProps(option)}
            title={option.label}
            data-state={active ? 'on' : 'off'}
            className={reactionTrayOptionVariants({ active: active ? 'true' : 'false' })}
            onClick={() => select(option)}
          >
            <span
              aria-hidden="true"
              data-popping={popping ? 'true' : 'false'}
              className={reactionTrayGlyphVariants({ popping: popping ? 'true' : 'false' })}
              style={glyphStyle}
            >
              {renderGlyph(option)}
            </span>
          </button>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(reactionTrayClass, className)}
        {...props}
        {...api.ariaProps}
        {...api.dataAttributes}
      >
        {layout.rows.map((row, rowIndex) => (
          // Rows are positional: row 0 (with the toggle) must survive expand/collapse.
          <div key={rowIndex} role="row" className={reactionTrayRowClass}>
            {row.map(renderCell)}
          </div>
        ))}
      </div>
    )
  },
)
