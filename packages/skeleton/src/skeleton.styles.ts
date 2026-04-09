import { cva } from '@elloloop/shared'

export const skeletonVariants = cva({
  base: 'animate-pulse bg-muted',
  variants: {
    shape: {
      text: 'h-4 w-full rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-none',
      rounded: 'rounded-md',
    },
  },
  defaultVariants: {
    shape: 'text',
  },
})
