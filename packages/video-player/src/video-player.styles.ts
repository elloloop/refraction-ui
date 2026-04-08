import { cva } from '@refraction-ui/shared'

export const playerVariants = cva({
  base: 'relative overflow-hidden rounded-lg bg-black',
  variants: {
    size: {
      sm: 'max-w-sm',
      md: 'max-w-2xl',
      lg: 'max-w-4xl',
      full: 'w-full',
    },
  },
  defaultVariants: {
    size: 'full',
  },
})

export const controlsVariants = cva({
  base: 'absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity',
  variants: {
    visibility: {
      visible: 'opacity-100',
      hidden: 'opacity-0 pointer-events-none',
    },
  },
  defaultVariants: {
    visibility: 'visible',
  },
})

export const overlayVariants = cva({
  base: 'absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity',
  variants: {
    visibility: {
      visible: 'opacity-100',
      hidden: 'opacity-0 pointer-events-none',
    },
  },
  defaultVariants: {
    visibility: 'visible',
  },
})
