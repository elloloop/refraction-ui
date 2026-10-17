import { cva } from '@refraction-ui/shared'

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

/** Root: positions the popup under the field. */
export const multiComboboxVariants = cva({
  base: 'relative w-full',
})

/**
 * The bordered field holding chips and the text input. The input itself has
 * no outline, so the field draws the focus ring while focus is inside it.
 */
export const multiComboboxFieldVariants = cva({
  base: [
    'flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground',
    'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
  ].join(' '),
  variants: {
    disabled: {
      true: 'cursor-not-allowed opacity-50',
      false: 'cursor-text',
    },
  },
  defaultVariants: {
    disabled: 'false',
  },
})

/** The `<ul>` of chips; wraps onto further lines alongside the input. */
export const multiComboboxChipListClass = 'flex max-w-full flex-wrap items-center gap-1.5'

/** A selected-value chip. */
export const multiComboboxChipClass =
  'inline-flex max-w-full items-center gap-1 rounded-md bg-muted py-0.5 pl-2 pr-0.5 text-sm text-foreground'

/** Chip label; truncates long names. */
export const multiComboboxChipLabelClass = 'truncate'

/**
 * Chip remove button. The visible button is small (1.25rem) so chips stay
 * compact; the `before:` pseudo-element extends the hit area by 0.75rem on
 * every side, giving the 2.75rem (44px) minimum touch target.
 */
export const multiComboboxChipRemoveClass = [
  'relative inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground',
  "before:absolute before:-inset-3 before:content-['']",
  'hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none',
  FOCUS_RING,
].join(' ')

/** The text input inside the field. */
export const multiComboboxInputClass =
  'min-w-[6rem] flex-1 bg-transparent py-1 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed'

/** Popup panel under the field. */
export const multiComboboxPopoverClass = [
  'absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md',
  'animate-in fade-in-0 zoom-in-95 motion-reduce:animate-none',
].join(' ')

/** The listbox (scrolls when long). */
export const multiComboboxListboxClass = 'max-h-72 overflow-y-auto p-1 empty:hidden'

/** One option row. Active and selected states are also exposed via data-* and ARIA. */
export const multiComboboxOptionVariants = cva({
  base: 'relative flex w-full min-h-10 cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none',
  variants: {
    active: {
      true: 'bg-accent text-accent-foreground',
      false: '',
    },
    disabled: {
      true: 'cursor-not-allowed opacity-50',
      false: '',
    },
  },
  defaultVariants: {
    active: 'false',
    disabled: 'false',
  },
})

/** Leading slot (e.g. an avatar) at the start of an option. */
export const multiComboboxLeadingClass = 'flex shrink-0 items-center'

/** Option label. */
export const multiComboboxOptionLabelClass = 'flex-1 truncate'

/** Checkmark marking a selected option (so selection isn't shown by colour alone). */
export const multiComboboxCheckClass = 'size-4 shrink-0 text-foreground'

/** Loading / empty / max-reached rows in the popup. */
export const multiComboboxStatusClass =
  'flex items-center justify-center gap-2 px-2 py-4 text-center text-sm text-muted-foreground'

/** Loading spinner; stops spinning under prefers-reduced-motion. */
export const multiComboboxSpinnerClass = 'size-4 animate-spin motion-reduce:animate-none'
