import { cva } from '@refraction-ui/shared'

/**
 * Root container that holds the step rail and the content/footer area
 * side-by-side (vertical) or stacked (horizontal).
 */
export const wizardVariants = cva({
  base: 'flex gap-8',
  variants: {
    orientation: {
      vertical: 'flex-row',
      horizontal: 'flex-col',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
})

/**
 * The step rail — the ordered list of step indicators.
 * Vertical: a narrow column on the left. Horizontal: a row across the top.
 */
export const wizardRailVariants = cva({
  base: 'flex shrink-0',
  variants: {
    orientation: {
      vertical: 'flex-col gap-0',
      horizontal: 'flex-row items-center gap-0',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
})

/**
 * A single step item in the rail. The `status` variant drives colour so
 * adapters never inline these classes.
 */
export const wizardStepItemVariants = cva({
  base: 'flex items-center gap-3 relative',
  variants: {
    orientation: {
      vertical: 'flex-row',
      horizontal: 'flex-col',
    },
    status: {
      complete: '',
      current: '',
      upcoming: '',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
    status: 'upcoming',
  },
})

/**
 * The circular step indicator (the number/check badge on the rail).
 * `status` variant applies the appropriate background and text treatment.
 */
export const wizardStepIndicatorVariants = cva({
  base: [
    'relative z-10 flex size-8 shrink-0 items-center justify-center',
    'rounded-full border-2 text-xs font-semibold transition-colors',
  ].join(' '),
  variants: {
    status: {
      complete: 'border-primary bg-primary text-primary-foreground',
      current: 'border-primary bg-background text-primary',
      upcoming: 'border-border bg-background text-muted-foreground',
    },
  },
  defaultVariants: {
    status: 'upcoming',
  },
})

/** The label text next to / below the step indicator. */
export const wizardStepLabelVariants = cva({
  base: 'text-sm font-medium transition-colors',
  variants: {
    status: {
      complete: 'text-foreground',
      current: 'text-foreground',
      upcoming: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    status: 'upcoming',
  },
})

/** "(Optional)" sub-label shown beneath the step label. */
export const wizardStepOptionalClass = 'text-xs text-muted-foreground'

/**
 * The connector line drawn between two adjacent step indicators.
 * Positioned absolutely so the indicator sits on top of it.
 */
export const wizardConnectorVariants = cva({
  base: 'shrink-0 transition-colors',
  variants: {
    orientation: {
      vertical: 'mx-4 w-0.5 flex-1 min-h-[1.5rem]',
      horizontal: 'my-4 h-0.5 flex-1 min-w-[1.5rem]',
    },
    complete: {
      true: 'bg-primary',
      false: 'bg-border',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
    complete: 'false',
  },
})

/** The main content area to the right (vertical) or below (horizontal) the rail. */
export const wizardContentClass = 'flex min-w-0 flex-1 flex-col'

/** Footer row that holds the Back / Skip / Next-or-Complete buttons. */
export const wizardFooterClass = 'mt-6 flex items-center gap-3'

/** The primary action button (Next / Complete). */
export const wizardPrimaryButtonVariants = cva({
  base: [
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium',
    'bg-primary text-primary-foreground transition-colors',
    'hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
  ].join(' '),
})

/** The secondary action button (Back / Skip). */
export const wizardSecondaryButtonVariants = cva({
  base: [
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium',
    'border border-input bg-background text-foreground transition-colors',
    'hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
  ].join(' '),
})
