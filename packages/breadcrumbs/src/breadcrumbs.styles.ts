import { cva } from '@refraction-ui/shared'

export const breadcrumbsVariants = cva({
  base: 'flex items-center gap-1.5 text-sm text-muted-foreground',
})

export const breadcrumbItemVariants = cva({
  base: 'transition-colors',
  variants: {
    active: {
      true: 'font-medium text-foreground',
      false: 'hover:text-foreground',
    },
  },
  defaultVariants: {
    active: 'false',
  },
})

export const breadcrumbSeparatorStyles = 'text-muted-foreground/50 select-none'
