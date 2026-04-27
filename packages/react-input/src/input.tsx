import * as React from 'react'
import {
  createInput,
  inputVariants,
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
}

/**
 * Input component — renders a styled input with size support.
 *
 * Uses the headless @refraction-ui/input core for state, ARIA, and data attributes.
 * Styling via Tailwind utility classes (no external CSS-in-JS).
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ type = 'text', size, className, disabled, readOnly, required, 'aria-invalid': ariaInvalid, ...props }, ref) => {
    const api = createInput({
      type: type as import('@refraction-ui/input').InputType,
      disabled,
      readOnly,
      required,
      'aria-invalid': ariaInvalid === true ? true : undefined,
    })

    const classes = cn(inputVariants({ size }), className)

    return (
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
  },
)

Input.displayName = 'Input'
