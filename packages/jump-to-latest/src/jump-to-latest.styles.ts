import { cva } from '@refraction-ui/shared'

/**
 * The pill. It stays mounted while hidden so it can fade and slide out;
 * `pointer-events-none` stops a hidden pill from catching clicks meant for
 * the list beneath it. `min-h-11` keeps the target at least 44 px tall.
 * Under reduced motion the pill appears and disappears without animating.
 */
export const jumpToLatestVariants = cva({
  base: [
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4',
    'text-sm font-medium shadow-md tabular-nums whitespace-nowrap',
    'border border-border bg-primary text-primary-foreground hover:bg-primary/90',
    'transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  ].join(' '),
  variants: {
    visible: {
      true: 'translate-y-0 opacity-100',
      false: 'pointer-events-none translate-y-2 opacity-0 motion-reduce:translate-y-0',
    },
  },
  defaultVariants: {
    visible: 'false',
  },
})

/** The decorative down arrow inside the pill. */
export const jumpToLatestIconClass = 'size-4 shrink-0'

/** Visually hidden status region; it must stay rendered even while the pill is hidden. */
export const jumpToLatestLiveRegionClass = 'sr-only'
