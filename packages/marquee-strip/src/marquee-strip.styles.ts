import { cva } from '@refraction-ui/shared'

/**
 * Container — a full-width band with a subtle muted background and border.
 *
 * The `scroll` variant switches the inner track from wrapping flex to an
 * overflow-hidden marquee track. See {@link marqueeStripInnerClass} and
 * {@link marqueeStripScrollTrackClass} for the corresponding track classes.
 */
export const marqueeStripVariants = cva({
  base: 'w-full bg-muted/30 border-y border-border py-3',
  variants: {
    scroll: {
      true: '',
      false: '',
    },
  },
  defaultVariants: {
    scroll: 'false',
  },
})

/**
 * Inner wrapper for static (non-scroll) mode.
 *
 * Items wrap naturally so they never overflow on narrow viewports.
 */
export const marqueeStripInnerClass =
  'flex flex-wrap items-center gap-3 px-4'

/**
 * Outer clip track for scroll mode — hides overflow so the looping animation
 * is invisible at the edges.
 */
export const marqueeStripScrollOuterClass = 'overflow-hidden px-4'

/**
 * Moving track for scroll mode.
 *
 * The `marquee` keyframe must be defined in the consuming app's global CSS
 * (or via a Tailwind plugin). The canonical definition is:
 *
 * ```css
 * @keyframes marquee {
 *   from { transform: translateX(0); }
 *   to   { transform: translateX(-50%); }
 * }
 * ```
 *
 * Items are duplicated once by the adapter so the strip appears seamless
 * (the track is effectively 200 % wide and translates to –50 %).
 */
export const marqueeStripScrollTrackClass =
  'flex items-center gap-3 w-max animate-[marquee_30s_linear_infinite]'

/** Strip label — shown before the items (uppercase eyebrow style). */
export const marqueeStripLabelClass =
  'text-xs font-semibold uppercase tracking-widest text-muted-foreground shrink-0'

/** Individual item text. */
export const marqueeStripItemClass = 'text-sm text-foreground'
