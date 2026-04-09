import { cva } from '@elloloop/shared'
import type { TokenContract } from '@elloloop/shared'

export const buttonTokens: TokenContract = {
  name: 'button',
  tokens: {
    bg: { variable: '--rfr-button-bg', fallback: 'hsl(var(--primary))' },
    fg: { variable: '--rfr-button-fg', fallback: 'hsl(var(--primary-foreground))' },
    border: { variable: '--rfr-button-border', fallback: 'hsl(var(--border))' },
    radius: { variable: '--rfr-button-radius', fallback: 'var(--radius)' },
    ring: { variable: '--rfr-button-ring', fallback: 'hsl(var(--ring))' },
  },
}

export const buttonVariants = cva({
  base: 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
      outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
    },
    size: {
      xs: 'h-7 rounded px-2 text-xs',
      sm: 'h-8 rounded-md px-3 text-xs',
      default: 'h-9 px-4 py-2',
      lg: 'h-10 rounded-md px-8',
      icon: 'h-9 w-9',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})
