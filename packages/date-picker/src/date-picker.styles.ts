import { cva } from '@refraction-ui/shared'

export const datePickerTriggerStyles =
  'inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer'

export const datePickerDropdownStyles =
  'absolute z-50 mt-1 w-max rounded-md border bg-popover p-4 text-popover-foreground shadow-md'

export const datePickerGridStyles = 'w-full border-collapse'

export const datePickerDayVariants = cva({
  base: 'inline-flex h-8 w-8 items-center justify-center rounded-md text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground',
  variants: {
    state: {
      default: '',
      selected: 'bg-primary text-primary-foreground hover:bg-primary/90',
      today: 'border border-accent-foreground',
      disabled: 'text-muted-foreground opacity-50 pointer-events-none',
      outside: 'text-muted-foreground opacity-30',
    },
  },
  defaultVariants: {
    state: 'default',
  },
})

export const datePickerTimeStyles =
  'flex items-center gap-2 mt-3 pt-3 border-t'

export const datePickerTimeInputStyles =
  'w-14 rounded-md border border-input bg-background px-2 py-1 text-sm text-center'
