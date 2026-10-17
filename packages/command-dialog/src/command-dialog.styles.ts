import { cva } from '@refraction-ui/shared'

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

/**
 * Appended to the Dialog panel: the palette owns its own padding and the
 * dialog's transition stops under reduced motion. `cn` concatenates rather
 * than merging, so the overrides of the panel's own `p-6 gap-4 max-w-lg`
 * are marked important to win regardless of stylesheet order.
 */
export const commandDialogContentClass =
  'max-w-xl! gap-0! p-0! overflow-hidden motion-reduce:transition-none motion-reduce:duration-0'

/** Row that holds the search input. */
export const commandDialogInputRowClass = 'flex items-center gap-2 border-b border-border px-3'

/** The search input; the row draws the separator so the input stays borderless. */
export const commandDialogInputClass = `flex-1 px-1 ${focusRing}`

/** Row of filter chips under the input. */
export const commandDialogFiltersClass = 'flex flex-wrap gap-2 border-b border-border px-3 py-2'

/**
 * One filter chip. Selection is shown by fill, weight, a check mark and
 * `aria-checked` — never by colour alone.
 */
export const commandDialogFilterChipVariants = cva({
  base: [
    'inline-flex min-h-9 items-center gap-1 rounded-full border px-3 text-sm',
    'transition-colors motion-reduce:transition-none',
    focusRing,
  ].join(' '),
  variants: {
    selected: {
      true: 'border-primary bg-primary font-semibold text-primary-foreground',
      false: 'border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
    },
  },
  defaultVariants: {
    selected: 'false',
  },
})

/** The scrolling results list. */
export const commandDialogListClass = 'p-1'

/** Text column inside a result row. */
export const commandDialogItemTextClass = 'flex min-w-0 flex-col'

/** Secondary line of a result row. */
export const commandDialogItemDescriptionClass = 'truncate text-xs text-muted-foreground'

/** Leading icon slot of a result row. */
export const commandDialogItemIconClass = 'mr-2 flex shrink-0 items-center text-muted-foreground'

/** "Searching…" status row. */
export const commandDialogLoadingClass = 'flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground'

/** Spinner inside the status row; stops spinning under reduced motion. */
export const commandDialogSpinnerClass =
  'size-4 shrink-0 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent motion-reduce:animate-none'

/** Empty state. */
export const commandDialogEmptyClass = 'py-6 text-center text-sm text-muted-foreground'
