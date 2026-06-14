import { cva } from '@refraction-ui/shared'

/** Root wrapper for the entire slot picker (day row + slots grid). */
export const slotPickerVariants = cva({
  base: 'flex flex-col gap-4',
  variants: {},
  defaultVariants: {},
})

/** Scrollable row of day chips. */
export const slotPickerDayRowClass = 'flex items-center gap-2 overflow-x-auto pb-1'

/**
 * Individual day chip.
 *
 * `selected` → primary treatment; `unselected` → card with border.
 */
export const slotPickerDayVariants = cva({
  base: [
    'inline-flex flex-col items-center justify-center rounded-lg px-3 py-2 min-w-[3.5rem]',
    'text-sm font-medium cursor-pointer transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
  ].join(' '),
  variants: {
    selected: {
      true: 'bg-primary text-primary-foreground',
      false: 'bg-card border border-input text-foreground hover:bg-muted',
    },
  },
  defaultVariants: {
    selected: 'false',
  },
})

/** Grid that holds the time-slot buttons. */
export const slotPickerGridClass = 'grid grid-cols-3 gap-2 sm:grid-cols-4'

/**
 * Individual time-slot button.
 *
 * `selected` → primary; `disabled` → dimmed regardless of selection.
 */
export const slotPickerSlotVariants = cva({
  base: [
    'inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium',
    'transition-colors cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  ].join(' '),
  variants: {
    selected: {
      true: 'bg-primary text-primary-foreground border-primary',
      false: 'bg-card border-input text-foreground hover:bg-muted',
    },
    disabled: {
      true: 'opacity-40 pointer-events-none',
      false: '',
    },
  },
  defaultVariants: {
    selected: 'false',
    disabled: 'false',
  },
})

/** Section label above the day row or slot grid (e.g. "Pick a day"). */
export const slotPickerSectionLabelClass = 'text-sm font-semibold text-foreground'

/** Timezone label rendered beside the "Pick a time" heading. */
export const slotPickerTimezoneClass = 'text-xs text-muted-foreground ml-2'
