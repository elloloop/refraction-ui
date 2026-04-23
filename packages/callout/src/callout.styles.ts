import { cva } from '@refraction-ui/shared'

export const calloutVariants = cva({
  base: 'relative w-full rounded-lg border p-4 text-sm flex gap-3',
  variants: {
    variant: {
      default: 'bg-muted/50 border-border text-foreground',
      destructive: 'bg-destructive/10 border-destructive/20 text-destructive',
      success: 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400',
      warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-400',
      info: 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export const calloutTitleVariants = cva({
  base: 'font-semibold leading-none tracking-tight mb-1',
})

export const calloutDescriptionVariants = cva({
  base: 'text-sm opacity-90 leading-relaxed',
})
