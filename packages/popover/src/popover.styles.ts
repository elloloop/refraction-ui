import { cva } from '@refraction-ui/shared'

export const popoverContentVariants = cva({
  base: 'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none',
  variants: {
    side: {
      top: 'animate-slide-down-fade',
      right: 'animate-slide-left-fade',
      bottom: 'animate-slide-up-fade',
      left: 'animate-slide-right-fade',
    },
  },
  defaultVariants: {
    side: 'bottom',
  },
})
