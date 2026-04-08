import { cva } from '@refraction-ui/shared'

export const navbarVariants = cva({
  base: 'sticky top-0 z-40 w-full border-b',
  variants: {
    variant: {
      solid: 'bg-background',
      blur: 'bg-background/80 backdrop-blur-md',
      gradient: 'bg-gradient-to-b from-background to-background/80 backdrop-blur-sm',
      transparent: 'bg-transparent border-transparent',
    },
  },
  defaultVariants: {
    variant: 'blur',
  },
})

export const navLinkVariants = cva({
  base: 'text-sm font-medium transition-colors hover:text-foreground',
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
