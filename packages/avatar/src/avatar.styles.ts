import { cva } from '@refraction-ui/shared'
import type { TokenContract } from '@refraction-ui/shared'

export const avatarTokens: TokenContract = {
  name: 'avatar',
  tokens: {
    bg: { variable: '--rfr-avatar-bg', fallback: 'hsl(var(--muted))' },
    fg: { variable: '--rfr-avatar-fg', fallback: 'hsl(var(--muted-foreground))' },
    border: { variable: '--rfr-avatar-border', fallback: 'hsl(var(--border))' },
  },
}

export const avatarVariants = cva({
  base: 'relative flex shrink-0 overflow-hidden',
  variants: {
    shape: {
      circle: 'rounded-full',
      square: 'rounded-md',
    },
    size: {
      xs: 'h-6 w-6',
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
    },
  },
  defaultVariants: {
    shape: 'circle',
    size: 'md',
  },
})

export const avatarImageVariants = cva({
  base: 'aspect-square h-full w-full object-cover',
})

export const avatarFallbackVariants = cva({
  base: 'flex h-full w-full items-center justify-center rounded-[inherit] bg-muted text-muted-foreground',
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})
