import { cva } from '@refraction-ui/shared'

/** Root wrapper: positions the suggestion list under the input. */
export const timePickerRootClass = 'relative w-full'

/** The text field (`role="combobox"`). `invalid` adds the error border. */
export const timePickerInputVariants = cva({
  base: [
    'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm tabular-nums text-foreground',
    'placeholder:text-muted-foreground ring-offset-background',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ].join(' '),
  variants: {
    invalid: {
      true: 'border-destructive',
      false: 'border-input',
    },
  },
  defaultVariants: {
    invalid: 'false',
  },
})

/** Suggestion popup (`role="listbox"`). The fade only runs when motion is allowed. */
export const timePickerListboxClass = [
  'absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto overscroll-contain',
  'rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md',
  'motion-safe:animate-in motion-safe:fade-in-0',
].join(' ')

/**
 * One suggestion (`role="option"`). The active option gets an inset ring as
 * well as the accent fill, and the committed one a check mark plus weight, so
 * neither state relies on colour alone.
 */
export const timePickerOptionVariants = cva({
  base: [
    'flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm tabular-nums',
    'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
    'data-[highlighted]:ring-2 data-[highlighted]:ring-inset data-[highlighted]:ring-ring',
  ].join(' '),
  variants: {
    selected: {
      true: 'font-medium',
      false: '',
    },
  },
  defaultVariants: {
    selected: 'false',
  },
})

/** Fixed-width slot for the check mark so labels stay aligned. */
export const timePickerOptionCheckClass = 'inline-flex size-4 shrink-0 items-center justify-center'

/** The "(30 min)" part of an end-time suggestion. */
export const timePickerOptionDurationClass = 'text-muted-foreground'

/** Validation message under the input. */
export const timePickerMessageClass = 'mt-1.5 text-xs text-destructive'
