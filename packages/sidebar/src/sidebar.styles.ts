import { cva } from '@refraction-ui/shared'

export const sidebarVariants = cva({
  base: 'hidden md:flex flex-col border-r bg-background',
  variants: {
    collapsed: {
      true: 'w-16',
      false: 'w-64',
    },
  },
  defaultVariants: {
    collapsed: 'false',
  },
})

export const sidebarItemVariants = cva({
  base: 'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
  variants: {
    active: {
      true: 'bg-accent text-accent-foreground',
      false: 'text-muted-foreground hover:bg-muted hover:text-foreground',
    },
  },
  defaultVariants: {
    active: 'false',
  },
})
