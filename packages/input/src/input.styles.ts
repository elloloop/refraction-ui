import { cva } from '@refraction-ui/shared'

export const inputVariants = cva({
  base: 'flex w-full rounded-md border border-input bg-transparent px-3 py-1 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
  variants: {
    size: {
      sm: 'h-8 text-xs',
      default: 'h-9 text-sm',
      lg: 'h-10 text-base',
    },
    validationState: {
      valid: 'border-success focus-visible:ring-success',
      invalid: 'border-destructive focus-visible:ring-destructive',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})
