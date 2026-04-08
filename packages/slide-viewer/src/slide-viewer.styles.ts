import { cva } from '@refraction-ui/shared'
import type { TokenContract } from '@refraction-ui/shared'

export const slideViewerTokens: TokenContract = {
  name: 'slide-viewer',
  tokens: {
    bg: { variable: '--rfr-slide-bg', fallback: 'hsl(var(--background))' },
    fg: { variable: '--rfr-slide-fg', fallback: 'hsl(var(--foreground))' },
    progressBg: { variable: '--rfr-slide-progress-bg', fallback: 'hsl(var(--primary))' },
    progressTrack: { variable: '--rfr-slide-progress-track', fallback: 'hsl(var(--muted))' },
    badgeBg: { variable: '--rfr-slide-badge-bg', fallback: 'hsl(var(--secondary))' },
  },
}

export const slideViewerVariants = cva({
  base: 'flex flex-col h-full w-full relative overflow-hidden',
  variants: {
    size: {
      compact: 'max-w-2xl',
      default: 'max-w-4xl',
      full: 'max-w-none',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export const progressBarVariants = cva({
  base: 'h-1 w-full bg-muted rounded-full overflow-hidden',
  variants: {
    position: {
      top: 'rounded-none',
      bottom: 'rounded-none',
      inline: 'rounded-full',
    },
  },
  defaultVariants: {
    position: 'top',
  },
})

export const slideTypeBadgeVariants = cva({
  base: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  variants: {
    type: {
      lesson: 'bg-blue-100 text-blue-800',
      quiz: 'bg-purple-100 text-purple-800',
      exercise: 'bg-green-100 text-green-800',
      intro: 'bg-gray-100 text-gray-800',
      summary: 'bg-orange-100 text-orange-800',
    },
  },
  defaultVariants: {
    type: 'lesson',
  },
})
