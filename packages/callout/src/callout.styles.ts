import { cva } from '@refraction-ui/shared'

export const calloutVariants = cva({
  base: 'relative w-full rounded-lg border p-4 text-sm flex gap-3',
  variants: {
    variant: {
      default: 'bg-muted/50 border-border text-foreground',
      destructive: 'bg-destructive/10 border-destructive/20 text-destructive',
      success: 'bg-success/10 border-success/20 text-success',
      warning: 'bg-warning/10 border-warning/20 text-warning',
      info: 'bg-info/10 border-info/20 text-info',
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
