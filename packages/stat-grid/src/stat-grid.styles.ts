import { cva } from '@refraction-ui/shared'

/** Grid container that lays out stat items. */
export const statGridVariants = cva({
  base: 'grid gap-8',
  variants: {
    columns: {
      '1': 'grid-cols-1',
      '2': 'grid-cols-2',
      '3': 'grid-cols-3',
    },
  },
  defaultVariants: {
    columns: '3',
  },
})

/** Individual stat item container (role="listitem"). */
export const statItemClass = 'flex flex-col'

/** The large bold value of the stat. */
export const statValueClass = 'text-xl sm:text-2xl font-bold text-primary'

/** The descriptive label below the value. */
export const statLabelClass = 'mt-1 text-sm text-muted-foreground leading-snug'
