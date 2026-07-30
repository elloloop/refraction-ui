import { cva } from '@refraction-ui/shared'

export const statusContainerStyles =
  'inline-flex items-center gap-1.5'

export const statusDotVariants = cva({
  base: 'inline-block h-2 w-2 rounded-full',
  variants: {
    type: {
      success: 'bg-success',
      error: 'bg-destructive',
      warning: 'bg-warning',
      info: 'bg-info',
      pending: 'bg-pending',
      neutral: 'bg-neutral',
    },
  },
  defaultVariants: {
    type: 'neutral',
  },
})

export const statusPulseVariants = cva({
  base: 'animate-pulse inline-block h-2 w-2 rounded-full',
  variants: {
    type: {
      success: 'bg-success',
      error: 'bg-destructive',
      warning: 'bg-warning',
      info: 'bg-info',
      pending: 'bg-pending',
      neutral: 'bg-neutral',
    },
  },
  defaultVariants: {
    type: 'pending',
  },
})

export const statusLabelStyles =
  'text-sm text-muted-foreground'
