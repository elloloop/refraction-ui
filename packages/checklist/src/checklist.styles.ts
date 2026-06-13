import { cva } from '@refraction-ui/shared'

/** Outer container that wraps the list and optional progress summary. */
export const checklistContainerClass = 'flex flex-col gap-2'

/** The `role="list"` element holding all item rows. */
export const checklistListClass = 'flex flex-col gap-1'

/**
 * A single item row — a button with checkbox semantics.
 *
 * The `checked` variant applies muted text and a line-through on the label
 * to communicate completion without relying solely on the checkbox visual.
 */
export const checklistItemVariants = cva({
  base: [
    'flex items-start gap-3 rounded-md px-2 py-2 text-left',
    'transition-colors hover:bg-accent',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
  ].join(' '),
  variants: {
    checked: {
      true: 'text-muted-foreground',
      false: 'text-foreground',
    },
  },
  defaultVariants: {
    checked: 'false',
  },
})

/**
 * The visual checkbox box (the square indicator beside the label).
 *
 * The `checked` variant fills the box with the primary colour and shows a
 * checkmark via a border trick; the unchecked state shows an empty border.
 */
export const checklistBoxVariants = cva({
  base: [
    'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded',
    'border transition-colors',
  ].join(' '),
  variants: {
    checked: {
      true: 'border-primary bg-primary text-primary-foreground',
      false: 'border-input bg-background',
    },
  },
  defaultVariants: {
    checked: 'false',
  },
})

/** Wrapper for label + optional description text. */
export const checklistLabelWrapClass = 'flex flex-col gap-0.5 min-w-0'

/** The item's primary label. Strikethrough is applied when the item is checked. */
export const checklistLabelVariants = cva({
  base: 'text-sm font-medium leading-none transition-colors',
  variants: {
    checked: {
      true: 'line-through text-muted-foreground',
      false: 'text-foreground',
    },
  },
  defaultVariants: {
    checked: 'false',
  },
})

/** Optional description — always in muted text, smaller than the label. */
export const checklistDescriptionClass = 'text-xs text-muted-foreground'

/** Progress summary line shown below the list when `showProgress` is true. */
export const checklistProgressClass = 'text-xs text-muted-foreground tabular-nums'
