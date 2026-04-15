import * as React from 'react'
import {
  createButton,
  buttonVariants,
  getButtonType,
  type ButtonVariant,
  type ButtonSize,
} from '@refraction-ui/button'
import { useShortcut, ShortcutHint } from '@refraction-ui/react-keyboard-shortcut'
import { cn } from '@refraction-ui/shared'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  asChild?: boolean
  shortcut?: string
  action?: string
}

/**
 * Button component — renders a styled button with variant and size support.
 *
 * Uses the headless @refraction-ui/button core for state, ARIA, and keyboard handling.
 * Styling via Tailwind utility classes (no external CSS-in-JS).
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, loading, asChild, className, disabled, children, shortcut, action, ...props }, ref) => {
    const api = createButton({ variant, size, disabled, loading, asChild, type: props.type })
    const classes = cn(buttonVariants({ variant, size }), className)
    
    const internalRef = React.useRef<HTMLButtonElement>(null)
    const mergedRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        internalRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      },
      [ref]
    )

    useShortcut({
      shortcut,
      action,
      enabled: !disabled && !loading && (!!shortcut || !!action),
      onTrigger: () => {
        internalRef.current?.click()
      },
    })

    // When asChild, render the child element directly with button props merged in.
    // This allows <Button asChild><a href="/">Link</a></Button>
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        ref: mergedRef,
        className: cn(classes, (children.props as Record<string, unknown>).className as string, 'relative'),
        type: getButtonType({ type: props.type }),
        ...api.ariaProps,
        ...api.dataAttributes,
        ...props,
        children: (
          <>
            {(shortcut || action) && <ShortcutHint shortcut={shortcut} action={action} className="right-4" />}
            {(children.props as Record<string, unknown>).children}
          </>
        )
      })
    }

    return (
      <button
        ref={mergedRef}
        type={getButtonType({ type: props.type }) as 'button' | 'submit' | 'reset'}
        className={cn(classes, 'relative')}
        disabled={disabled || loading}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      >
        {(shortcut || action) && <ShortcutHint shortcut={shortcut} action={action} className="right-4" />}
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
