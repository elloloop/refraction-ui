import { cva } from '@refraction-ui/shared'
import type { TokenContract } from '@refraction-ui/shared'

export const cardTokens: TokenContract = {
  name: 'card',
  tokens: {
    bg: { variable: '--rfr-card-bg', fallback: 'hsl(var(--card))' },
    fg: { variable: '--rfr-card-fg', fallback: 'hsl(var(--card-foreground))' },
    border: { variable: '--rfr-card-border', fallback: 'hsl(var(--border))' },
  },
}

export const cardVariants = cva({
  base: 'rounded-lg border shadow',
  variants: {
    variant: {
      // Default — unchanged surface (bg-card + border via the global token).
      default: 'bg-card text-card-foreground',
      // Lower-emphasis container on the subtle surface token (issue #485).
      subtle: 'bg-surface-subtle text-card-foreground',
      // Tinted second-accent card (issue #485).
      tertiary: 'border-transparent bg-tertiary-soft text-tertiary-soft-foreground',
    },
    padding: {
      none: '',
      default: 'p-6',
      compact: 'p-4',
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 'none',
  },
})

export const cardHeaderVariants = cva({
  base: 'flex flex-col space-y-1.5 p-6',
})

export const cardTitleVariants = cva({
  base: 'font-semibold leading-none tracking-tight',
  variants: {
    size: {
      sm: 'text-lg',
      default: 'text-2xl',
      lg: 'text-3xl',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export const cardDescriptionVariants = cva({
  base: 'text-sm text-muted-foreground',
})

export const cardContentVariants = cva({
  base: 'p-6 pt-0',
})

export const cardFooterVariants = cva({
  base: 'flex items-center p-6 pt-0',
})
