import { cva } from '@refraction-ui/shared'
import type { TokenContract } from '@refraction-ui/shared'
import { presenceDotColorClasses } from '@refraction-ui/presence-indicator'

export const avatarTokens: TokenContract = {
  name: 'avatar',
  tokens: {
    bg: { variable: '--rfr-avatar-bg', fallback: 'hsl(var(--muted))' },
    fg: { variable: '--rfr-avatar-fg', fallback: 'hsl(var(--muted-foreground))' },
    border: { variable: '--rfr-avatar-border', fallback: 'hsl(var(--border))' },
  },
}

// The root does not clip: the presence dot sits over its edge. The image and
// the fallback round and clip themselves instead, and the image is layered
// over the fallback, so the initials show while it loads.
export const avatarVariants = cva({
  base: 'relative flex shrink-0',
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
  base: 'absolute inset-0 aspect-square h-full w-full rounded-[inherit] object-cover',
})

export const avatarFallbackVariants = cva({
  base: 'flex h-full w-full items-center justify-center overflow-hidden rounded-[inherit] bg-muted text-muted-foreground',
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

/**
 * The presence dot at the avatar's bottom end corner. The ring, in the page
 * background, separates it from the photo.
 */
export const avatarPresenceVariants = cva({
  base: 'absolute block rounded-full ring-2 ring-background',
  variants: {
    status: presenceDotColorClasses,
    shape: {
      circle: 'bottom-0 end-0',
      square: '-bottom-0.5 -end-0.5',
    },
    size: {
      xs: 'h-2 w-2',
      sm: 'h-2.5 w-2.5',
      md: 'h-3 w-3',
      lg: 'h-3.5 w-3.5',
      xl: 'h-4 w-4',
    },
  },
  defaultVariants: {
    status: 'offline',
    shape: 'circle',
    size: 'md',
  },
})
