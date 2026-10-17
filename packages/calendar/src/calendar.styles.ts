import { cva } from '@refraction-ui/shared'

/**
 * Keyboard focus indicator for every calendar control (days and month
 * navigation), so focus stays visible without a global `:focus-visible` rule
 * in the host app.
 */
const calendarFocusRingStyles =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export const calendarVariants = cva({
  base: 'p-3 rounded-md border bg-background',
})

export const dayVariants = cva({
  base: `inline-flex items-center justify-center rounded-md text-sm h-9 w-9 ${calendarFocusRingStyles}`,
  variants: {
    state: {
      default: 'hover:bg-accent hover:text-accent-foreground',
      selected: 'bg-primary text-primary-foreground hover:bg-primary/90',
      today: 'bg-accent text-accent-foreground',
      disabled: 'text-muted-foreground opacity-50 cursor-not-allowed',
      outside: 'text-muted-foreground opacity-50',
    },
  },
  defaultVariants: {
    state: 'default',
  },
})

/** The previous/next month buttons in the calendar header. */
export const calendarNavButtonStyles =
  `inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent ${calendarFocusRingStyles}`
