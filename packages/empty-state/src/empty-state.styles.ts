import { cva } from '@refraction-ui/shared'

/**
 * Container for the EmptyState column. The `bordered` variant wraps the
 * content in a card surface.
 */
export const emptyStateVariants = cva({
  base: 'flex flex-col items-center text-center gap-3 p-8',
  variants: {
    bordered: {
      true: 'rounded-xl border border-border bg-card',
      false: '',
    },
  },
  defaultVariants: {
    bordered: 'false',
  },
})

/**
 * Tone-tinted classes for the icon chip. Tone styling lives here as a single
 * source of truth (no scattered inline literals in the adapters).
 */
export const emptyStateIconChipVariants = cva({
  base: 'flex size-12 items-center justify-center rounded-full',
  variants: {
    tone: {
      neutral: 'bg-muted text-muted-foreground',
      success: 'bg-green-500/10 text-green-600',
      warning: 'bg-yellow-500/10 text-yellow-600',
      danger: 'bg-destructive/10 text-destructive',
    },
  },
  defaultVariants: {
    tone: 'neutral',
  },
})

/** Layout class helpers for the title/description/actions slots. */
export const emptyStateTitleClass = 'text-lg font-semibold text-foreground'
export const emptyStateDescriptionClass = 'text-sm text-muted-foreground'
export const emptyStateActionsClass = 'flex items-center justify-center gap-2'
