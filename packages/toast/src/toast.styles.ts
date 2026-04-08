import { cva } from '@refraction-ui/shared'

export const toastVariants = cva({
  base: 'pointer-events-auto relative flex w-full items-center justify-between gap-2 overflow-hidden rounded-lg border p-4 shadow-lg transition-all',
  variants: {
    variant: {
      default: 'border bg-background text-foreground',
      success:
        'border-l-4 border-green-500/50 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100',
      error:
        'border-l-4 border-red-500/50 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100',
      warning:
        'border-l-4 border-amber-500/50 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})
