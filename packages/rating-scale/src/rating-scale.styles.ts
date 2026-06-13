import { cva } from '@refraction-ui/shared'

/** Container row that holds the points plus optional end labels. */
export const ratingScaleVariants = cva({
  base: 'inline-flex items-center gap-3',
  variants: {
    size: {
      sm: '',
      md: '',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Row of point buttons (the scale itself, between the end labels). */
export const ratingScaleTrackClass = 'inline-flex items-center gap-1.5'

/**
 * A single point button. The `state` variant carries the selected vs unselected
 * treatment so adapters never inline these classes.
 */
export const ratingScaleItemVariants = cva({
  base: [
    'inline-flex items-center justify-center rounded-md border font-medium tabular-nums',
    'transition-colors focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
  ].join(' '),
  variants: {
    size: {
      sm: 'size-8 text-xs',
      md: 'size-10 text-sm',
    },
    state: {
      checked: 'border-primary bg-primary text-primary-foreground',
      unchecked: 'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
    },
  },
  defaultVariants: {
    size: 'md',
    state: 'unchecked',
  },
})

/** End-label text flanking the scale (e.g. "Never seen this" / "Could write it"). */
export const ratingScaleLabelClass = 'text-xs text-muted-foreground'
