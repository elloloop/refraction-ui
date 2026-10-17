import { cva } from '@refraction-ui/shared'
import type { LiveDotColor } from './live-dot.js'

/**
 * Fill class per colour token — the single map shared by the dot and its halo
 * so the two can never drift apart. `muted` uses the muted *foreground* token:
 * the `muted` surface token is a background tint too faint to read as a dot.
 */
export const liveDotColorClasses: Record<LiveDotColor, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  destructive: 'bg-destructive',
  warning: 'bg-warning',
  info: 'bg-info',
  pending: 'bg-pending',
  neutral: 'bg-neutral',
  muted: 'bg-muted-foreground',
}

/**
 * Root box. It sets the dot's size; the dot and halo fill it. `custom` adds no
 * size class because the adapter applies a rem width/height inline.
 */
export const liveDotVariants = cva({
  base: 'relative inline-flex shrink-0 align-middle',
  variants: {
    size: {
      xs: 'size-1.5',
      sm: 'size-2',
      md: 'size-2.5',
      lg: 'size-3',
      custom: '',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
})

/** The solid dot, drawn above the halo. */
export const liveDotCoreVariants = cva({
  base: 'relative inline-flex size-full rounded-full',
  variants: {
    color: liveDotColorClasses,
  },
  defaultVariants: {
    color: 'success',
  },
})

/**
 * The halo behind the dot while live: it swells and fades (`animate-ping`).
 * Under `prefers-reduced-motion` the animation stops and the halo holds still
 * as a soft static ring, so "live" still reads differently from a plain dot
 * without any movement.
 */
export const liveDotHaloVariants = cva({
  base: [
    'pointer-events-none absolute inset-0 rounded-full opacity-75 animate-ping',
    'motion-reduce:animate-none motion-reduce:scale-150 motion-reduce:opacity-40',
  ].join(' '),
  variants: {
    color: liveDotColorClasses,
  },
  defaultVariants: {
    color: 'success',
  },
})
