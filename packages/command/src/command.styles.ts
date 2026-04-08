import { cva } from '@refraction-ui/shared'

export const commandVariants = cva({
  base: 'flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
})

export const commandInputVariants = cva({
  base: 'flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
})

export const commandItemVariants = cva({
  base: 'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
  variants: {
    state: {
      default: '',
      selected: 'bg-accent text-accent-foreground',
      disabled: 'pointer-events-none opacity-50',
    },
  },
  defaultVariants: {
    state: 'default',
  },
})

export const commandGroupVariants = cva({
  base: 'overflow-hidden p-1 text-foreground',
})
