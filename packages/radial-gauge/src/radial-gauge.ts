
// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The visual size of the gauge. */
export type GaugeSize = 'sm' | 'md' | 'lg'

/** Tone mapped to a zone range. */
export type GaugeTone = 'default' | 'success' | 'warning' | 'danger'

/**
 * A threshold zone that applies a semantic tone when the gauge value falls
 * at or below `upTo`. Zones should be listed in ascending `upTo` order; the
 * first zone whose `upTo >= value` wins.
 */
export interface GaugeZone {
  /** Value up to (and including) which this zone applies. */
  upTo: number
  /** Semantic tone for the arc while the value is in this zone. */
  tone: GaugeTone
}

export interface RadialGaugeProps {
  /** Current gauge value. */
  value: number
  /** Minimum possible value. */
  min?: number
  /** Maximum possible value. */
  max?: number
  /** Visual size. */
  size?: GaugeSize
}

export interface RadialGaugeAPI {
  /** ARIA attributes to spread on the SVG element (`role="meter"`). */
  ariaProps: Record<string, string | number>
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

// ---------------------------------------------------------------------------
// Pixel diameters for each size variant (exported for use in adapters)
// ---------------------------------------------------------------------------
export const GAUGE_SIZE_PX: Record<GaugeSize, number> = {
  sm: 80,
  md: 120,
  lg: 160,
}

// ---------------------------------------------------------------------------
// Pure geometry helpers
// ---------------------------------------------------------------------------

/**
 * Clamp `value` to the inclusive range `[min, max]`.
 */
export function clampValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Map a `value` within `[min, max]` to a fraction in `[0, 1]`.
 * Returns 0 when `min === max` to avoid division by zero.
 */
export function valueToFraction(value: number, min: number, max: number): number {
  if (max === min) return 0
  return clampValue((value - min) / (max - min), 0, 1)
}

/**
 * Convert polar coordinates to Cartesian.
 * `angleDeg` is measured clockwise from the positive x-axis (SVG convention).
 */
export function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

/**
 * Build an SVG arc path `d` string from `startAngleDeg` to `endAngleDeg`
 * (both measured clockwise from the top / 12-o'clock position).
 *
 * Returns an empty string when the arc span is zero.
 */
export function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngleDeg: number,
  endAngleDeg: number,
): string {
  const span = endAngleDeg - startAngleDeg
  if (span === 0) return ''

  // For a full circle we need two arcs to avoid SVG treating start === end as
  // a no-op.  Shift the end by 0.001° so the path stays valid.
  const clampedEnd = span >= 360 ? startAngleDeg + 359.999 : endAngleDeg

  const start = polarToCartesian(cx, cy, r, startAngleDeg)
  const end = polarToCartesian(cx, cy, r, clampedEnd)
  const largeArc = clampedEnd - startAngleDeg > 180 ? 1 : 0

  return [
    `M ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`,
  ].join(' ')
}

/**
 * Compute the `stroke-dashoffset` for a full-circle ring gauge.
 *
 * With `stroke-dasharray="circumference circumference"` and this offset, the
 * visible portion of the stroke equals `fraction × circumference`.
 */
export function gaugeStrokeDashoffset(fraction: number, circumference: number): number {
  return circumference * (1 - fraction)
}

// ---------------------------------------------------------------------------
// Zone resolution
// ---------------------------------------------------------------------------

/**
 * Find the active zone tone for the current `value`.
 * Zones are tested in ascending `upTo` order; the first zone whose
 * `upTo >= value` wins. Falls back to `'default'` when no zone matches.
 */
export function resolveZoneTone(
  value: number,
  zones: GaugeZone[],
  max: number,
): GaugeTone {
  if (!zones || zones.length === 0) return 'default'

  // Sort a copy ascending by upTo so callers don't have to pre-sort.
  const sorted = [...zones].sort((a, b) => a.upTo - b.upTo)

  for (const zone of sorted) {
    if (value <= zone.upTo) return zone.tone
  }

  // Value is above all zone thresholds — use the last zone's tone.
  return sorted[sorted.length - 1].tone
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Build the framework-agnostic props for a radial gauge element.
 *
 * Returns `role="meter"` plus ARIA value attributes and data attributes;
 * adapters spread these onto their `<svg>` element.
 */
export function createRadialGauge(props: RadialGaugeProps): RadialGaugeAPI {
  const { value, min = 0, max = 100, size = 'md' } = props

  const clamped = clampValue(value, min, max)

  const ariaProps: Record<string, string | number> = {
    role: 'meter',
    'aria-valuenow': clamped,
    'aria-valuemin': min,
    'aria-valuemax': max,
  }

  const dataAttributes: Record<string, string> = {
    'data-size': size,
    'data-value': String(clamped),
  }

  return { ariaProps, dataAttributes }
}
