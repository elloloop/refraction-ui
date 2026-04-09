import { cva } from '@refraction-ui/shared'

export const bottomNavVariants = cva({
  base: 'fixed bottom-0 left-0 right-0 z-40 border-t bg-background md:hidden',
})

export const bottomNavTabVariants = cva({
  base: 'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors',
  variants: {
    active: {
      true: 'text-foreground',
      false: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    active: 'false',
  },
})
