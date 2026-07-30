import { cva } from '@refraction-ui/shared'

export const toastVariants = cva({
  base: 'pointer-events-auto relative flex w-full items-center justify-between gap-2 overflow-hidden rounded-lg border p-4 shadow-lg transition-all',
  variants: {
    variant: {
      default: 'border bg-background text-foreground',
      success: 'border-l-4 border-success/50 bg-success/10 text-success',
      error: 'border-l-4 border-destructive/50 bg-destructive/10 text-destructive',
      warning: 'border-l-4 border-warning/50 bg-warning/10 text-warning',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})
