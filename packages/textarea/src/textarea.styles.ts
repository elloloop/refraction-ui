import { cva } from '@refraction-ui/shared'

export const textareaVariants = cva({
  base: 'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
  variants: {
    size: {
      sm: 'min-h-[40px] text-xs',
      default: 'min-h-[60px]',
      lg: 'min-h-[80px] text-base',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})
