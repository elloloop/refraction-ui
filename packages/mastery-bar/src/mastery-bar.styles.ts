import { cva } from '@refraction-ui/shared'

/**
 * Track (outer container): rounded, muted background.
 * `size` variant controls the track height.
 */
export const masteryBarVariants = cva({
  base: 'w-full overflow-hidden rounded-full bg-muted',
  variants: {
    size: {
      sm: 'h-1.5',
      md: 'h-2',
      lg: 'h-3',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/**
 * Fill (inner bar): rounded, primary background.
 * `muted` variant renders at reduced opacity for secondary/inactive states.
 */
export const masteryBarFillVariants = cva({
  base: 'h-full rounded-full bg-primary',
  variants: {
    muted: {
      true: 'bg-primary/70',
      false: 'bg-primary',
    },
  },
  defaultVariants: {
    muted: 'false',
  },
})

/** Class applied to each text label (leading or trailing). */
export const masteryBarLabelClass = 'text-xs text-muted-foreground'

/** Class for the leading (left-side) label. */
export const masteryBarLeadingLabelClass = 'text-xs text-muted-foreground'

/** Header row above the track: leading label on the left, label on the right. */
export const masteryBarHeaderClass = 'flex justify-between items-baseline mb-1'
