import { cva } from '@refraction-ui/shared'

/**
 * Container grid for the numbered steps. The `columns` variant maps to a
 * fixed Tailwind grid-cols class; adapters that need a dynamic column count
 * use `gridTemplateColumns` inline style via {@link stepColumns} instead and
 * omit this variant.
 */
export const numberedStepsVariants = cva({
  base: 'grid gap-6',
  variants: {
    columns: {
      '2': 'grid-cols-2',
      '3': 'grid-cols-3',
      '4': 'grid-cols-4',
      '5': 'grid-cols-5',
    },
  },
  defaultVariants: {
    columns: '3',
  },
})

/** Individual step card. */
export const numberedStepsItemClass =
  'rounded-xl border border-border bg-card p-5'

/** Zero-padded ordinal badge above each step title. */
export const numberedStepsOrdinalClass = 'font-mono text-sm text-primary'

/** Step title. */
export const numberedStepsTitleClass = 'mt-2 text-sm font-bold text-foreground'

/** Step body copy. */
export const numberedStepsBodyClass =
  'mt-1 text-xs text-muted-foreground leading-relaxed'
