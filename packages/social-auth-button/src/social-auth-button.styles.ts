import { cva } from '@refraction-ui/shared'

/** Wrapper around an individual social auth button (positions the lastUsed badge). */
export const socialAuthButtonVariants = cva({
  base: 'relative',
})

/** Responsive grid wrapper: one column on mobile, two columns from `sm` up. */
export const socialAuthRowVariants = cva({
  base: 'grid grid-cols-1 sm:grid-cols-2 gap-3',
})

/** Floating "Last used" badge anchored to the top-right of a button. */
export const lastUsedBadgeVariants = cva({
  base: 'absolute -top-2 -right-2 rounded-full bg-primary text-primary-foreground text-[10px] px-1.5',
})
