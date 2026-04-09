import { cva } from '@elloloop/shared'

export const searchBarVariants = cva({
  base: 'relative flex items-center w-full rounded-md border bg-background text-foreground',
  variants: {
    size: {
      sm: 'h-8 text-sm px-2',
      md: 'h-10 text-base px-3',
      lg: 'h-12 text-lg px-4',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export const searchResultVariants = cva({
  base: 'absolute top-full left-0 w-full mt-1 rounded-md border bg-popover text-popover-foreground shadow-md z-50 overflow-hidden',
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})
