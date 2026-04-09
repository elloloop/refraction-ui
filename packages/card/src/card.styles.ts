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
  base: 'rounded-lg border bg-card text-card-foreground shadow',
  variants: {
    padding: {
      none: '',
      default: 'p-6',
      compact: 'p-4',
    },
  },
  defaultVariants: {
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
