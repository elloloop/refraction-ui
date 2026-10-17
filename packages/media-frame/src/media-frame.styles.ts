import { cva } from '@refraction-ui/shared'

/**
 * Frame root. The media inside keeps its own colours; only the letterbox
 * behind it (visible while media loads, or where it does not cover the box)
 * follows the tone.
 */
export const mediaFrameVariants = cva({
  base: 'relative overflow-hidden border border-border-subtle',
  variants: {
    tone: {
      default: 'bg-muted',
      tertiary: 'bg-tertiary',
    },
  },
  defaultVariants: {
    tone: 'default',
  },
})

/**
 * Corner caption. Positions are logical, so `start` and `end` follow the
 * writing direction.
 */
export const mediaFrameLabelVariants = cva({
  base: 'pointer-events-none absolute z-10 rounded-sm px-1.5 py-px font-mono text-[0.625rem] tracking-wider',
  variants: {
    tone: {
      default: 'bg-background/80 text-foreground',
      tertiary: 'bg-tertiary text-tertiary-foreground opacity-80',
    },
    position: {
      'top-start': 'start-1.5 top-1.5',
      'top-end': 'end-1.5 top-1.5',
      'bottom-start': 'bottom-1.5 start-1.5',
      'bottom-end': 'bottom-1.5 end-1.5',
    },
  },
  defaultVariants: {
    tone: 'default',
    position: 'top-start',
  },
})
