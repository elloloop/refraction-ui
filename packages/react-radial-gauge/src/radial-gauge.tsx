import * as React from 'react'
import {
  clampValue,
  valueToFraction,
  gaugeStrokeDashoffset,
  resolveZoneTone,
  createRadialGauge,
  radialGaugeRootVariants,
  gaugeTrackClass,
  gaugeArcClass,
  gaugeArcToneVariants,
  gaugeLabelClass,
  gaugeSublabelClass,
  GAUGE_SIZE_PX,
  GAUGE_LABEL_FONT_SIZE,
  GAUGE_SUBLABEL_FONT_SIZE,
  type GaugeSize,
  type GaugeTone,
  type GaugeZone,
} from '@refraction-ui/radial-gauge'
import { cn } from '@refraction-ui/shared'

export type { GaugeSize, GaugeTone, GaugeZone }

export interface RadialGaugeProps extends React.SVGAttributes<SVGSVGElement> {
  /** Current value. */
  value: number
  /** Minimum value. Defaults to 0. */
  min?: number
  /** Maximum value. Defaults to 100. */
  max?: number
  /** Visual size of the gauge. Defaults to 'md'. */
  size?: GaugeSize
  /** Stroke thickness in px. Defaults to 8. */
  thickness?: number
  /** Primary center label. When omitted and `showValue` is true, the numeric value is shown. */
  label?: React.ReactNode
  /** Secondary label shown below the primary label. */
  sublabel?: React.ReactNode
  /**
   * Threshold zones that colour the arc based on the current value.
   * List in ascending `upTo` order for clarity (internally sorted).
   */
  zones?: GaugeZone[]
  /** Show the numeric value in the center when no explicit label is given. Defaults to true. */
  showValue?: boolean
  /** Accessible name for the gauge. */
  'aria-label'?: string
}

/**
 * RadialGauge — a circular progress / gauge component.
 *
 * Renders an SVG with a background track ring and a value arc whose length is
 * proportional to the current value fraction. Center text shows the value or a
 * custom label. Supports semantic zone colouring (success / warning / danger)
 * so the arc hue communicates health at a glance — ideal for score cards,
 * interview report rings, and dashboard KPIs.
 *
 * Accessibility: `role="meter"` with `aria-valuenow/min/max` on the SVG.
 */
export const RadialGauge = React.forwardRef<SVGSVGElement, RadialGaugeProps>(
  (
    {
      value,
      min = 0,
      max = 100,
      size = 'md',
      thickness = 8,
      label,
      sublabel,
      zones,
      showValue = true,
      className,
      ...props
    },
    ref,
  ) => {
    const diameter = GAUGE_SIZE_PX[size]
    const cx = diameter / 2
    const cy = diameter / 2
    // Radius inset by half the stroke width so it stays within the viewBox.
    const r = cx - thickness / 2

    const clamped = clampValue(value, min, max)
    const fraction = valueToFraction(clamped, min, max)

    const circumference = 2 * Math.PI * r
    const dashoffset = gaugeStrokeDashoffset(fraction, circumference)

    const tone = zones && zones.length > 0 ? resolveZoneTone(clamped, zones, max) : 'default'

    const api = createRadialGauge({ value, min, max, size })

    // Primary center content: explicit label wins; else show numeric value if requested.
    const centerLabel = label ?? (showValue ? String(clamped) : null)
    const labelFontSize = GAUGE_LABEL_FONT_SIZE[size]
    const sublabelFontSize = GAUGE_SUBLABEL_FONT_SIZE[size]

    // Vertical offset for the label. When a sublabel is present, nudge up slightly.
    const labelDy = sublabel ? -sublabelFontSize * 0.8 : 0

    return (
      <svg
        ref={ref}
        width={diameter}
        height={diameter}
        viewBox={`0 0 ${diameter} ${diameter}`}
        role="meter"
        aria-valuenow={Number(api.ariaProps['aria-valuenow'])}
        aria-valuemin={Number(api.ariaProps['aria-valuemin'])}
        aria-valuemax={Number(api.ariaProps['aria-valuemax'])}
        className={cn(radialGaugeRootVariants({ size }), className)}
        {...api.dataAttributes}
        {...props}
      >
        {/* Background track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          strokeWidth={thickness}
          className={gaugeTrackClass}
        />

        {/* Value arc — ring style: rotate -90° to start at 12-o'clock */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          strokeWidth={thickness}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          className={cn(gaugeArcClass, gaugeArcToneVariants({ tone }))}
        />

        {/* Center label */}
        {centerLabel != null && (
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={labelFontSize}
            dy={labelDy}
            className={gaugeLabelClass}
          >
            {centerLabel}
          </text>
        )}

        {/* Sub-label */}
        {sublabel != null && (
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={sublabelFontSize}
            dy={labelDy + labelFontSize * 1.1}
            className={gaugeSublabelClass}
          >
            {sublabel}
          </text>
        )}
      </svg>
    )
  },
)

RadialGauge.displayName = 'RadialGauge'
