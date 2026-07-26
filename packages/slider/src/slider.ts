/**
 * @refraction-ui/slider — headless slider.
 *
 * Owns the *behavior* of a single-value range slider: min/max clamping,
 * step rounding, and keyboard increment/decrement semantics. It has NO UI
 * opinion — adapters render the control (a native `<input type="range">` in
 * React, which already applies these same keyboard rules natively) and spread
 * the ARIA object.
 */

/** Options for {@link createSlider}. */
export interface SliderProps {
  /** Current value. Clamped into `[min, max]` and rounded to `step`. */
  value?: number
  /** Minimum selectable value (default 0). */
  min?: number
  /** Maximum selectable value (default 100). */
  max?: number
  /** Granularity between selectable values (default 1). */
  step?: number
  /** Disables the control. */
  disabled?: boolean
  /** Accessible label attached to the slider, when provided. */
  'aria-label'?: string
}

/** The computed view of a slider control. */
export interface SliderAPI {
  /** Normalized value (clamped + step-rounded). */
  value: number
  min: number
  max: number
  step: number
  /** Value position within the range, 0–100. */
  percentage: number
  /** ARIA attributes for the slider element (`role="slider"` + value attrs). */
  ariaProps: Record<string, string | number | boolean>
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/** Clamp a value into `[min, max]`. */
export function clampSliderValue(value: number, min = 0, max = 100): number {
  if (Number.isNaN(value)) return min
  return Math.min(Math.max(value, min), max)
}

/**
 * Round a value to the nearest multiple of `step`, offset from `min`.
 * Non-positive steps leave the value unchanged. The result is re-rounded to
 * the step's decimal precision to avoid float noise (e.g. 0.30000000000000004).
 */
export function roundToStep(value: number, min = 0, step = 1): number {
  if (!step || step <= 0 || Number.isNaN(value)) return value
  const snapped = min + Math.round((value - min) / step) * step
  const decimals = (String(step).split('.')[1] ?? '').length
  return Number(snapped.toFixed(decimals))
}

/**
 * Pure keyboard rule for a slider (WAI-ARIA slider pattern), shared by every
 * adapter that does NOT render a native range input (native inputs already
 * implement these keys):
 *
 * - ArrowRight / ArrowUp   → +step
 * - ArrowLeft  / ArrowDown → -step
 * - PageUp   / PageDown    → ±10×step
 * - Home / End             → min / max
 *
 * The result is clamped; unhandled keys return `current` unchanged.
 */
export function getSliderValueFromKey(
  current: number,
  key: string,
  options: { min?: number; max?: number; step?: number } = {},
): number {
  const { min = 0, max = 100, step = 1 } = options
  switch (key) {
    case 'ArrowRight':
    case 'ArrowUp':
      return clampSliderValue(current + step, min, max)
    case 'ArrowLeft':
    case 'ArrowDown':
      return clampSliderValue(current - step, min, max)
    case 'PageUp':
      return clampSliderValue(current + step * 10, min, max)
    case 'PageDown':
      return clampSliderValue(current - step * 10, min, max)
    case 'Home':
      return min
    case 'End':
      return max
    default:
      return current
  }
}

/**
 * createSlider — the framework-agnostic view of a slider: normalized value,
 * percentage position, and the ARIA object (`role="slider"`,
 * `aria-valuemin/max/now`). Adapters own the value state
 * (controlled/uncontrolled) and call this per render.
 */
export function createSlider(props: SliderProps = {}): SliderAPI {
  const min = props.min ?? 0
  const max = props.max ?? 100
  const step = props.step ?? 1
  const value = clampSliderValue(roundToStep(props.value ?? min, min, step), min, max)
  const percentage = max === min ? 0 : ((value - min) / (max - min)) * 100

  const ariaProps: Record<string, string | number | boolean> = {
    role: 'slider',
    'aria-valuemin': min,
    'aria-valuemax': max,
    'aria-valuenow': value,
    'aria-orientation': 'horizontal',
  }
  if (props.disabled) ariaProps['aria-disabled'] = true
  if (props['aria-label']) ariaProps['aria-label'] = props['aria-label']

  return {
    value,
    min,
    max,
    step,
    percentage,
    ariaProps,
    dataAttributes: {
      'data-value': String(value),
      'data-min': String(min),
      'data-max': String(max),
    },
  }
}
