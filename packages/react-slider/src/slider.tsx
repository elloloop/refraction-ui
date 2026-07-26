import * as React from 'react'
import { cn } from '@refraction-ui/shared'
import { createSlider, clampSliderValue, roundToStep } from '@refraction-ui/slider'

export interface SliderProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step'
  > {
  /** Current value (controlled). Pair with `onChange`/`onValueChange`. */
  value?: number
  /** Initial value for uncontrolled usage (defaults to `min`). */
  defaultValue?: number
  /** Minimum selectable value (default 0). */
  min?: number
  /** Maximum selectable value (default 100). */
  max?: number
  /** Granularity between selectable values (default 1). */
  step?: number
  /** Called with the new numeric value as the user moves the thumb. */
  onChange?: (value: number) => void
  /** Alias of `onChange`, matching the library-wide naming convention. */
  onValueChange?: (value: number) => void
  variant?: 'default'
}

/**
 * Slider — a single-value range control over a native
 * `<input type="range">`. Value clamping, step rounding, and ARIA come from
 * the headless `@refraction-ui/slider` core; keyboard interaction is native
 * to the input (the core's `getSliderValueFromKey` pins the same rules for
 * non-native adapters).
 */
export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      variant: _variant,
      value: controlledValue,
      defaultValue,
      min = 0,
      max = 100,
      step = 1,
      disabled,
      onChange,
      onValueChange,
      ...props
    },
    ref,
  ) => {
    const isControlled = controlledValue !== undefined
    const [internalValue, setInternalValue] = React.useState(() =>
      clampSliderValue(roundToStep(defaultValue ?? min, min, step), min, max),
    )

    const api = createSlider({
      value: isControlled ? controlledValue : internalValue,
      min,
      max,
      step,
      disabled,
      'aria-label': props['aria-label'],
    })

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = clampSliderValue(roundToStep(Number(event.target.value), min, step), min, max)
      if (!isControlled) setInternalValue(next)
      onChange?.(next)
      onValueChange?.(next)
    }

    return (
      <input
        type="range"
        ref={ref}
        min={min}
        max={max}
        step={step}
        value={api.value}
        disabled={disabled}
        className={cn('w-full', className)}
        {...api.ariaProps}
        {...api.dataAttributes}
        onChange={handleChange}
        {...props}
      />
    )
  },
)
Slider.displayName = 'Slider'
