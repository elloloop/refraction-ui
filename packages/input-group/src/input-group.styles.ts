import { cva } from '@elloloop/shared'
import type { TokenContract } from '@elloloop/shared'

export const inputGroupTokens: TokenContract = {
  name: 'input-group',
  tokens: {
    bg: { variable: '--rfr-input-group-bg', fallback: 'hsl(var(--background))' },
    border: { variable: '--rfr-input-group-border', fallback: 'hsl(var(--border))' },
    radius: { variable: '--rfr-input-group-radius', fallback: 'var(--radius)' },
  },
}

export const inputGroupVariants = cva({
  base: 'flex items-stretch [&>*:not(:first-child):not(:last-child)]:rounded-none',
  variants: {
    orientation: {
      horizontal: 'flex-row [&>*:first-child]:rounded-r-none [&>*:last-child]:rounded-l-none',
      vertical: 'flex-col [&>*:first-child]:rounded-b-none [&>*:last-child]:rounded-t-none',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
})

export const inputGroupAddonVariants = cva({
  base: 'flex items-center justify-center border bg-muted px-3 text-sm text-muted-foreground',
  variants: {
    orientation: {
      horizontal: 'border-y border-x first:border-r-0 last:border-l-0',
      vertical: 'border-x border-y first:border-b-0 last:border-t-0',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
})

export const inputGroupButtonVariants = cva({
  base: 'relative inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  variants: {
    orientation: {
      horizontal: '',
      vertical: '',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
})
