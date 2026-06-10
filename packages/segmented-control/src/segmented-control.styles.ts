import { cva } from '@refraction-ui/shared'

/** Pill-shaped container that holds the segments (`role="radiogroup"`). */
export const segmentedControlVariants = cva({
  base: 'inline-flex items-center gap-1 rounded-lg bg-muted p-1',
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

/**
 * A single segment (`role="radio"`). The `state` variant carries the
 * active vs inactive visual treatment so adapters never inline these classes.
 */
export const segmentedControlItemVariants = cva({
  base: [
    'inline-flex items-center justify-center gap-1.5 rounded-md font-medium',
    'whitespace-nowrap transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-muted',
  ].join(' '),
  variants: {
    size: {
      sm: 'px-2.5 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
    },
    state: {
      checked: 'bg-background text-foreground shadow-sm',
      unchecked: 'text-muted-foreground hover:text-foreground',
    },
  },
  defaultVariants: {
    size: 'md',
    state: 'unchecked',
  },
})
