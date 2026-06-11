import * as React from 'react'
import {
  createInput,
  inputVariants,
  type InputValidationState,
} from '@refraction-ui/input'
import { cn } from '@refraction-ui/shared'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Visual size of the input.
   *
   * Note: this prop intentionally **shadows** the native HTML `size`
   * attribute (which would otherwise control the visible character width
   * of the `<input>` element). We re-purpose the name for our visual
   * size variants (`'sm' | 'default' | 'lg'`) because in practice almost
   * no one uses the native character-width `size` attribute, while
   * visual sizing is a near-universal need.
   *
   * If you need the native character-width behavior, set it via
   * `htmlSize` on the underlying DOM through a `ref`, or render a plain
   * `<input>` instead.
   *
   * See the package README's "Sizing" section for more.
   */
  size?: 'sm' | 'default' | 'lg'
  /**
   * Validation affordance. Tints the border and wires `aria-invalid`:
   * - `'valid'` → green border, trailing check icon, `aria-invalid={false}`
   * - `'invalid'` → destructive border, `aria-invalid={true}`
   *
   * When omitted the input is rendered without a wrapper (identical to the
   * legacy bare `<input>` markup), unless `leadingIcon` is set.
   */
  validationState?: InputValidationState
  /**
   * Optional icon rendered inside the input's left padding. When provided
   * (or when `validationState` is set) the input is wrapped in a relative
   * `<div>` and gains left padding to make room for the icon.
   */
  leadingIcon?: React.ReactNode
}

const CheckIcon = (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-green-500"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

/**
 * Input component — renders a styled input with size support.
 *
 * Uses the headless @refraction-ui/input core for state, ARIA, and data attributes.
 * Styling via Tailwind utility classes (no external CSS-in-JS).
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      size,
      className,
      disabled,
      readOnly,
      required,
      validationState,
      leadingIcon,
      'aria-invalid': ariaInvalid,
      ...props
    },
    ref,
  ) => {
    // The core owns the `aria-invalid` derivation and the validation border
    // tokens; the React layer only does DOM composition (wrapper + icons).
    const api = createInput({
      type: type as import('@refraction-ui/input').InputType,
      disabled,
      readOnly,
      required,
      'aria-invalid': ariaInvalid === undefined ? undefined : ariaInvalid === true || ariaInvalid === 'true',
      validationState,
    })

    const hasWrapper = leadingIcon != null || validationState != null

    const classes = cn(
      inputVariants({ size, validationState }),
      leadingIcon != null && 'pl-9',
      validationState === 'valid' && 'pr-9',
      className,
    )

    const inputEl = (
      <input
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      />
    )

    if (!hasWrapper) {
      return inputEl
    }

    return (
      <div className="relative">
        {leadingIcon != null && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 flex size-4 -translate-y-1/2 items-center justify-center text-muted-foreground"
          >
            {leadingIcon}
          </span>
        )}
        {inputEl}
        {validationState === 'valid' && CheckIcon}
      </div>
    )
  },
)

Input.displayName = 'Input'
