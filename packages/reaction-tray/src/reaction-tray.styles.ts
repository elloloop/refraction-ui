import { cva } from '@refraction-ui/shared'

/** Surface that holds the grid rows. */
export const reactionTrayClass =
  'inline-flex flex-col gap-1 rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-md'

/** One grid row. */
export const reactionTrayRowClass = 'flex gap-1'

/** Grid cell wrapper (`role="gridcell"`); sizing lives on the button. */
export const reactionTrayGridCellClass = 'flex'

const reactionTrayCellBase = [
  'inline-flex shrink-0 items-center justify-center rounded-lg border-2',
  'transition-colors motion-reduce:transition-none',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
].join(' ')

/**
 * An option button. Active cells gain a visible border as well as a tint, so
 * the state never relies on colour alone (and `aria-pressed` carries it to AT).
 */
export const reactionTrayOptionVariants = cva({
  base: reactionTrayCellBase,
  variants: {
    active: {
      true: 'border-primary bg-primary/10 text-foreground',
      false: 'border-transparent bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground',
    },
  },
  defaultVariants: {
    active: 'false',
  },
})

/** The More/Fewer toggle cell. */
export const reactionTrayToggleClass = [
  reactionTrayCellBase,
  'border-transparent bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
].join(' ')

/** Chevron inside the toggle; it flips when expanded (instantly under reduced motion). */
export const reactionTrayToggleIconVariants = cva({
  base: 'size-5 transition-transform motion-reduce:transition-none',
  variants: {
    expanded: {
      true: 'rotate-180',
      false: 'rotate-0',
    },
  },
  defaultVariants: {
    expanded: 'false',
  },
})

/** Glyph wrapper; `popping` scales it up briefly on select, never under reduced motion. */
export const reactionTrayGlyphVariants = cva({
  base: 'inline-flex select-none items-center justify-center leading-none transition-transform duration-150 ease-out motion-reduce:transition-none',
  variants: {
    popping: {
      true: 'scale-125 motion-reduce:scale-100',
      false: 'scale-100',
    },
  },
  defaultVariants: {
    popping: 'false',
  },
})
