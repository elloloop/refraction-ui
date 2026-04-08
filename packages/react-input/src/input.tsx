import * as React from 'react'
import {
  createInput,
  inputVariants,
} from '@refraction-ui/input'
import { cn } from '@refraction-ui/shared'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
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
