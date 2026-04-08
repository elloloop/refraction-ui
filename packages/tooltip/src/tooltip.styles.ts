import { cva } from '@refraction-ui/shared'

export const tooltipContentVariants = cva({
  base: 'z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-md',
  variants: {
    side: {
      top: 'animate-slide-down-fade',
      right: 'animate-slide-left-fade',
      bottom: 'animate-slide-up-fade',
      left: 'animate-slide-right-fade',
    },
  },
  defaultVariants: {
    side: 'top',
  },
})
