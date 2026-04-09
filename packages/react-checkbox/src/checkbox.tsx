import * as React from 'react'
import {
  createCheckbox,
  checkboxVariants,
  checkIconPath,
  indeterminateIconPath,
  type CheckedState,
} from '@refraction-ui/checkbox'
import { cn } from '@refraction-ui/shared'

export interface CheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: CheckedState
  onCheckedChange?: (checked: CheckedState) => void
  disabled?: boolean
  size?: 'sm' | 'default' | 'lg'
}

/**
 * Checkbox component -- renders a styled checkbox with check/indeterminate icons.
 *
 * Uses the headless @refraction-ui/checkbox core for state, ARIA, and keyboard handling.
 */
export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked = false, onCheckedChange, disabled = false, size = 'default', className, ...props }, ref) => {
    const api = createCheckbox({ checked, disabled })

    const checkedVariant = checked === 'indeterminate' ? 'indeterminate' : checked ? 'true' : 'false'

    const handleClick = () => {
      if (api.isInteractive) {
        if (checked === 'indeterminate') {
          onCheckedChange?.(true)
        } else {
          onCheckedChange?.(!checked)
        }
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === ' ') {
        e.preventDefault()
        if (api.isInteractive) {
          if (checked === 'indeterminate') {
            onCheckedChange?.(true)
          } else {
            onCheckedChange?.(!checked)
          }
        }
      }
    }

    return (
      <button
        ref={ref}
        type="button"
        className={cn(checkboxVariants({ checked: checkedVariant, size }), className)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      >
        {checked === true && (
          <svg
            className="h-full w-full"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d={checkIconPath} />
          </svg>
        )}
        {checked === 'indeterminate' && (
          <svg
            className="h-full w-full"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d={indeterminateIconPath} />
          </svg>
        )}
      </button>
    )
  },
)

Checkbox.displayName = 'Checkbox'
