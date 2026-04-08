import { cva } from '@refraction-ui/shared'

export const selectorVariants = cva({
  base: 'relative inline-flex items-center justify-between rounded-md border bg-background text-foreground cursor-pointer',
  variants: {
    size: {
      sm: 'h-8 text-sm px-2 min-w-[120px]',
      md: 'h-10 text-base px-3 min-w-[160px]',
      lg: 'h-12 text-lg px-4 min-w-[200px]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export const optionVariants = cva({
  base: 'flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent',
  variants: {
    selected: {
      true: 'bg-accent/50 font-medium',
      false: '',
    },
  },
  defaultVariants: {
    selected: 'false',
  },
})
