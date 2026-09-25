import { cva } from '@refraction-ui/shared'

/**
 * Grid container. Column counts are responsive (one column on a phone, more
 * as the width allows) — never a fixed inline template that cannot reflow.
 * `auto` fits as many ~12rem items per row as the width allows.
 */
export const statGridVariants = cva({
  base: 'grid',
  variants: {
    columns: {
      '1': 'grid-cols-1',
      '2': 'grid-cols-1 sm:grid-cols-2',
      '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      auto: 'grid-cols-[repeat(auto-fill,minmax(12rem,1fr))]',
    },
    variant: {
      plain: 'gap-8',
      card: 'gap-3',
    },
  },
  defaultVariants: {
    columns: '3',
    variant: 'plain',
  },
})

/** Individual stat item container (role="listitem"). */
export const statItemVariants = cva({
  base: 'flex min-w-0 flex-col',
  variants: {
    variant: {
      plain: '',
      card: 'gap-1 rounded-lg border border-border bg-card p-4 text-card-foreground',
    },
  },
  defaultVariants: {
    variant: 'plain',
  },
})

/** @deprecated Use `statItemVariants()`; kept for existing imports. */
export const statItemClass = 'flex flex-col'

/** The value of a stat, by variant and tone. */
export const statValueVariants = cva({
  base: 'font-bold tabular-nums',
  variants: {
    variant: {
      plain: 'text-xl sm:text-2xl',
      card: 'text-2xl leading-tight',
    },
    tone: {
      default: '',
      positive: 'text-success',
      negative: 'text-destructive',
      caution: 'text-warning',
    },
  },
  compoundVariants: [
    { variant: 'plain', tone: 'default', class: 'text-primary' },
    { variant: 'card', tone: 'default', class: 'text-foreground' },
  ],
  defaultVariants: {
    variant: 'plain',
    tone: 'default',
  },
})

/** @deprecated Use `statValueVariants()`; kept for existing imports. */
export const statValueClass = 'text-xl sm:text-2xl font-bold text-primary'

/** The descriptive label. Above the value it reads as a small caption. */
export const statLabelVariants = cva({
  base: 'text-muted-foreground',
  variants: {
    layout: {
      'value-first': 'mt-1 text-sm leading-snug',
      'label-first': 'text-xs uppercase tracking-wide',
    },
  },
  defaultVariants: {
    layout: 'value-first',
  },
})

/** @deprecated Use `statLabelVariants()`; kept for existing imports. */
export const statLabelClass = 'mt-1 text-sm text-muted-foreground leading-snug'

/** Optional line under a stat explaining how it was computed. */
export const statDescriptionClass = 'text-xs leading-snug text-muted-foreground'
