import { cva } from '@elloloop/shared'

export const versionSelectorVariants = cva({
  base: 'relative inline-flex items-center justify-between rounded-md border bg-background text-foreground cursor-pointer',
  variants: {
    size: {
      sm: 'h-8 text-sm px-2 min-w-[100px]',
      md: 'h-10 text-base px-3 min-w-[140px]',
      lg: 'h-12 text-lg px-4 min-w-[180px]',
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

export const latestBadgeVariants = cva({
  base: 'inline-flex items-center rounded-full text-xs font-medium px-2 py-0.5',
  variants: {
    variant: {
      default: 'bg-primary/10 text-primary',
      accent: 'bg-accent text-accent-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})
