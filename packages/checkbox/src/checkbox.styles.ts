import { cva } from '@elloloop/shared'
import type { TokenContract } from '@elloloop/shared'

export const checkboxTokens: TokenContract = {
  name: 'checkbox',
  tokens: {
    bg: { variable: '--rfr-checkbox-bg', fallback: 'hsl(var(--background))' },
    'bg-checked': { variable: '--rfr-checkbox-bg-checked', fallback: 'hsl(var(--primary))' },
    fg: { variable: '--rfr-checkbox-fg', fallback: 'hsl(var(--primary-foreground))' },
    border: { variable: '--rfr-checkbox-border', fallback: 'hsl(var(--primary))' },
    ring: { variable: '--rfr-checkbox-ring', fallback: 'hsl(var(--ring))' },
  },
}

export const checkboxVariants = cva({
  base: 'peer shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  variants: {
    checked: {
      true: 'bg-primary text-primary-foreground',
      false: 'bg-background',
      indeterminate: 'bg-primary text-primary-foreground',
    },
    size: {
      sm: 'h-3.5 w-3.5',
      default: 'h-4 w-4',
      lg: 'h-5 w-5',
    },
  },
  defaultVariants: {
    checked: 'false',
    size: 'default',
  },
})
