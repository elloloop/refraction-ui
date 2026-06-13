import { cva } from '@refraction-ui/shared'

/**
 * Root SVG element variants — controls the rendered size via an inline
 * width/height (adapters use GAUGE_SIZE_PX) and sets up the color context.
 */
export const radialGaugeRootVariants = cva({
  base: 'inline-block shrink-0',
  variants: {
    size: {
      sm: '',
      md: '',
      lg: '',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/**
 * Track (background) circle stroke class.
 * Uses a muted foreground so it sits behind the value arc without competing.
 */
export const gaugeTrackClass = 'fill-none stroke-muted-foreground/20'

/**
 * Value arc stroke class — resolved per tone via {@link gaugeArcToneVariants}.
 * `currentColor` stroke picks up the Tailwind text-* class applied by the
 * tone variant so we only need one class-generating helper.
 */
export const gaugeArcClass = 'fill-none stroke-current transition-[stroke-dashoffset] duration-300 ease-out'

/**
 * Tone variants for the value arc.  Adapters combine this with `gaugeArcClass`.
 */
export const gaugeArcToneVariants = cva({
  base: '',
  variants: {
    tone: {
      default: 'text-foreground',
      success: 'text-emerald-500',
      warning: 'text-amber-500',
      danger: 'text-destructive',
    },
  },
  defaultVariants: {
    tone: 'default',
  },
})

/** Center label (primary text) classes. */
export const gaugeLabelClass = 'fill-foreground text-center font-semibold'

/** Center sub-label (secondary text) classes. */
export const gaugeSublabelClass = 'fill-muted-foreground'

/**
 * Font size for the primary label by size variant.
 * Expressed as SVG `font-size` values (px) for use in the `<text>` element.
 */
export const GAUGE_LABEL_FONT_SIZE: Record<'sm' | 'md' | 'lg', number> = {
  sm: 14,
  md: 20,
  lg: 26,
}

/**
 * Font size for the sub-label by size variant.
 */
export const GAUGE_SUBLABEL_FONT_SIZE: Record<'sm' | 'md' | 'lg', number> = {
  sm: 9,
  md: 11,
  lg: 13,
}
