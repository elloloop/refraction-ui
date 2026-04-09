import { cva } from '@refraction-ui/shared'

export const inputVariants = cva({
  base: 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
  variants: {
    size: {
      sm: 'h-8 text-xs',
      default: 'h-9',
      lg: 'h-10 text-base',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})
