import * as React from 'react'
import {
  createCallControls,
  callControlsVariants,
  callControlButtonVariants,
  callControlLabelClass,
  type CallControlTone,
  type CallControlItem,
} from '@refraction-ui/call-controls'
import { cn } from '@refraction-ui/shared'

export type { CallControlTone, CallControlItem }

// ─── CallControlButton ────────────────────────────────────────────────────────

export interface CallControlButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color' | 'content'> {
  /** Accessible label (used as aria-label and visible to screen readers). */
  label: string
  /** Optional icon node rendered inside the button. */
  icon?: React.ReactNode
  /** Visual/semantic tone of the button. */
  tone?: CallControlTone
  /**
   * Whether this control is currently in a "pressed" / toggled-on state.
   * When provided, the button gains `aria-pressed`.
   */
  pressed?: boolean
  /** Visual size of the button. */
  size?: 'sm' | 'md'
}

/**
 * A single round meeting-control button with icon, accessible label,
 * tone variants (default / active / destructive), and optional aria-pressed
 * for toggleable controls (mic, camera, screen-share).
 */
export const CallControlButton = React.forwardRef<
  HTMLButtonElement,
  CallControlButtonProps
>(
  (
    {
      label,
      icon,
      tone = 'default',
      pressed,
      size = 'md',
      className,
      ...props
    },
    ref,
  ) => {
    const ariaPressedProps =
      pressed !== undefined ? { 'aria-pressed': pressed } : {}

    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        {...ariaPressedProps}
        className={cn(callControlButtonVariants({ tone, size }), className)}
        {...props}
      >
        {icon}
        <span className={callControlLabelClass}>{label}</span>
      </button>
    )
  },
)

CallControlButton.displayName = 'CallControlButton'

// ─── CallControls ─────────────────────────────────────────────────────────────

export interface CallControlsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color' | 'content'> {
  /** Visual size passed down to child buttons when using the composable API. */
  size?: 'sm' | 'md'
}

/**
 * Toolbar wrapper for a set of meeting-control buttons.
 *
 * Composable: render `<CallControlButton>` children directly.
 *
 * ```tsx
 * <CallControls>
 *   <CallControlButton label="Mute" icon={<MicIcon />} tone="active" pressed={true} />
 *   <CallControlButton label="Leave" tone="destructive" />
 * </CallControls>
 * ```
 */
export const CallControls = React.forwardRef<HTMLDivElement, CallControlsProps>(
  ({ size = 'md', className, children, ...props }, ref) => {
    const api = createCallControls()

    return (
      <div
        ref={ref}
        className={cn(callControlsVariants({ size }), className)}
        {...(api.ariaProps as React.AriaAttributes & { role: string })}
        {...api.dataAttributes}
        {...props}
      >
        {children}
      </div>
    )
  },
)

CallControls.displayName = 'CallControls'
