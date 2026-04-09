import * as React from 'react'
import {
  createSwitch,
  switchVariants,
  switchThumbVariants,
} from '@refraction-ui/switch'
import { cn } from '@refraction-ui/shared'

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'default' | 'lg'
}

/**
 * Switch component -- a toggle switch with accessible keyboard and ARIA support.
 *
 * Uses the headless @refraction-ui/switch core for state, ARIA, and keyboard handling.
 */
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked = false, onCheckedChange, disabled = false, size = 'default', className, ...props }, ref) => {
    const api = createSwitch({ checked, disabled })

    const handleClick = () => {
      if (api.isInteractive) {
        onCheckedChange?.(!checked)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === ' ') {
        e.preventDefault()
        if (api.isInteractive) {
          onCheckedChange?.(!checked)
        }
      }
    }

    return (
      <button
        ref={ref}
        type="button"
        className={cn(switchVariants({ checked: checked ? 'true' : 'false', size }), className)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      >
        <span
          className={cn(switchThumbVariants({ checked: checked ? 'true' : 'false', size }))}
        />
      </button>
    )
  },
)

Switch.displayName = 'Switch'
