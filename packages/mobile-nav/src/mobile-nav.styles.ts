import { cva } from '@refraction-ui/shared'
import type { TokenContract } from '@refraction-ui/shared'

export const mobileNavTokens: TokenContract = {
  name: 'mobile-nav',
  tokens: {
    bg: { variable: '--rfr-mobile-nav-bg', fallback: 'hsl(var(--background))' },
    fg: { variable: '--rfr-mobile-nav-fg', fallback: 'hsl(var(--foreground))' },
    border: { variable: '--rfr-mobile-nav-border', fallback: 'hsl(var(--border))' },
  },
}

export const mobileNavVariants = cva({
  base: 'relative',
  variants: {},
})

export const mobileNavContentVariants = cva({
  base: 'w-full overflow-hidden border-b bg-background transition-all duration-200',
  variants: {
    state: {
      open: 'max-h-screen opacity-100 animate-in slide-in-from-top',
      closed: 'max-h-0 opacity-0 pointer-events-none animate-out slide-out-to-top',
    },
  },
  defaultVariants: {
    state: 'closed',
  },
})

export const mobileNavTriggerVariants = cva({
  base: 'inline-flex items-center justify-center rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  variants: {},
})

export const mobileNavLinkVariants = cva({
  base: 'block w-full px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2',
  variants: {},
})
