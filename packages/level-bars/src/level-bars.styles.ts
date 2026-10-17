import { cva } from '@refraction-ui/shared'
import type { LevelBarsColor } from './level-bars.js'

/**
 * Fill class per colour token. `muted` uses the muted *foreground* token: the
 * `muted` surface token is a background tint too faint to read as a bar.
 */
export const levelBarsColorClasses: Record<LevelBarsColor, string> = {
  primary: 'bg-primary',
  foreground: 'bg-foreground',
  success: 'bg-success',
  destructive: 'bg-destructive',
  warning: 'bg-warning',
  info: 'bg-info',
  pending: 'bg-pending',
  neutral: 'bg-neutral',
  muted: 'bg-muted-foreground',
}

/** Root box. Its px width and height come from the geometry, set inline. */
export const levelBarsVariants = cva({
  base: 'relative inline-block shrink-0 align-middle',
})

/**
 * One bar, absolutely placed from its rect. `animated` eases height changes
 * between live samples; `motion-reduce:transition-none` drops that easing so
 * under reduced motion each bar snaps straight to its new value.
 */
export const levelBarsBarVariants = cva({
  base: 'absolute rounded-full',
  variants: {
    color: levelBarsColorClasses,
    animated: {
      true: 'transition-[height,top] duration-100 ease-out motion-reduce:transition-none',
      false: '',
    },
  },
  defaultVariants: {
    color: 'primary',
    animated: 'false',
  },
})
