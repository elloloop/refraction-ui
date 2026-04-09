import * as React from 'react'
import {
  createTextarea,
  textareaVariants,
} from '@elloloop/textarea'
import { cn } from '@elloloop/shared'

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  size?: 'sm' | 'default' | 'lg'
  maxRows?: number
}

/**
 * Textarea component — renders a styled textarea with size support.
 *
 * Uses the headless @elloloop/textarea core for state, ARIA, and data attributes.
 * Styling via Tailwind utility classes (no external CSS-in-JS).
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ size, className, disabled, readOnly, required, rows, maxRows, 'aria-invalid': ariaInvalid, ...props }, ref) => {
    const api = createTextarea({
      disabled,
      readOnly,
      required,
      rows,
      maxRows,
      'aria-invalid': ariaInvalid === true ? true : undefined,
    })

    const classes = cn(textareaVariants({ size }), className)

    return (
      <textarea
        ref={ref}
        className={classes}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        rows={rows}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      />
    )
  },
)

Textarea.displayName = 'Textarea'
