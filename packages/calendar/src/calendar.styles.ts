import { cva } from '@refraction-ui/shared'

export const calendarVariants = cva({
  base: 'p-3 rounded-md border bg-background',
})

export const dayVariants = cva({
  base: 'inline-flex items-center justify-center rounded-md text-sm h-9 w-9',
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
