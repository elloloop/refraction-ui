import { cva } from '@refraction-ui/shared'

export const reactionBarStyles =
  'flex flex-wrap items-center gap-1'

/** Keyboard focus ring shared by every button in the bar. */
const reactionFocusStyles =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export const reactionPillVariants = cva({
  base: `inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs cursor-pointer transition-colors motion-reduce:transition-none hover:bg-accent ${reactionFocusStyles}`,
  variants: {
    state: {
      active: 'border-primary bg-primary/10 text-primary',
      inactive: 'border-border bg-background text-foreground',
    },
  },
  defaultVariants: {
    state: 'inactive',
  },
})

export const reactionAddButtonStyles =
  `inline-flex items-center justify-center h-6 w-6 rounded-full border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground hover:text-foreground cursor-pointer transition-colors motion-reduce:transition-none text-xs ${reactionFocusStyles}`

/** The "+N" / "Show less" button of an overflowing bar. */
export const reactionOverflowButtonStyles =
  `inline-flex items-center justify-center h-6 min-w-6 rounded-full border border-border bg-background px-2 text-xs font-medium tabular-nums text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer transition-colors motion-reduce:transition-none ${reactionFocusStyles}`

/** Positions a reaction's who-reacted tooltip against its pill. */
export const reactionChipStyles = 'relative inline-flex'

/**
 * The who-reacted tooltip: sits above the pill, lined up with its start edge
 * or, with `data-align="end"` (see `getReactorsTooltipAlign`), its end edge.
 * Its bottom padding bridges the gap so the pointer can move onto it without
 * closing it.
 */
export const reactionTooltipStyles =
  'absolute bottom-full start-0 z-50 pb-1 w-max max-w-xs data-[align=end]:start-auto data-[align=end]:end-0'

export const reactionTooltipContentStyles =
  'block rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md'

export const reactionEmojiStyles = 'text-sm'
export const reactionCountStyles = 'text-xs font-medium tabular-nums'
