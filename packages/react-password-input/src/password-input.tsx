import * as React from 'react'
import { Input, type InputProps } from '@refraction-ui/react-input'
import { createPasswordInput, passwordToggleVariants } from '@refraction-ui/password-input'
import { cn } from '@refraction-ui/shared'

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'leadingIcon'> {
  /**
   * Accessible label for the reveal (show password) action.
   * @default 'Show password'
   */
  revealLabel?: string
  /**
   * Accessible label for the hide action.
   * @default 'Hide password'
   */
  hideLabel?: string
}

const EyeIcon = (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-4"
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-4"
  >
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
)

/**
 * PasswordInput — a password field with a built-in reveal/hide toggle.
 *
 * Wraps the styled {@link Input} from `@refraction-ui/react-input`, toggling
 * the underlying input `type` between `'password'` and `'text'`. Forwards all
 * Input props (`value`, `onChange`, `validationState`, `minLength`, …) through
 * to the underlying element, including the `ref`.
 */
export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ revealLabel = 'Show password', hideLabel = 'Hide password', className, ...props }, ref) => {
    const [revealed, setRevealed] = React.useState(false)

    // The core owns the type/label/pressed derivation; React owns the toggle state.
    const { inputType, toggleLabel, togglePressed } = createPasswordInput({
      revealed,
      revealLabel,
      hideLabel,
    })

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={inputType}
          className={cn('pr-10', className)}
          {...props}
        />
        <button
          type="button"
          aria-label={toggleLabel}
          aria-pressed={togglePressed}
          onClick={() => setRevealed((v) => !v)}
          className={passwordToggleVariants()}
        >
          {revealed ? EyeOffIcon : EyeIcon}
        </button>
      </div>
    )
  },
)

PasswordInput.displayName = 'PasswordInput'
