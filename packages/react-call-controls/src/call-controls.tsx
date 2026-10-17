import * as React from 'react'
import {
  createCallControls,
  callControlsVariants,
  callControlButtonVariants,
  callControlLabelClass,
  callControlsDefaultLabels,
  callControlsDockBarClass,
  callControlsDockClass,
  type CallControlTone,
  type CallControlItem,
} from '@refraction-ui/call-controls'
import { cn } from '@refraction-ui/shared'
import { CallControlsDockContent, DOCK_CONTROL_KEYS, type CallControlsDockProps } from './call-controls-dock.js'
import { handleToolbarArrowKeys } from './toolbar-focus.js'

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
  function CallControlButton(
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
  ) {
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

// ─── CallControls ─────────────────────────────────────────────────────────────

export interface CallControlsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color' | 'content'>,
    CallControlsDockProps {
  /** Visual size of the toolbar and its buttons. */
  size?: 'sm' | 'md'
}

function isDock(props: CallControlsDockProps): boolean {
  return DOCK_CONTROL_KEYS.some((key) => props[key] !== undefined)
}

/**
 * Toolbar of meeting controls. Left and right arrows (and Home, End) move
 * between its buttons; every button also keeps its own tab stop.
 *
 * Composable: render `<CallControlButton>` children directly.
 *
 * ```tsx
 * <CallControls>
 *   <CallControlButton label="Mute" icon={<MicIcon />} tone="active" pressed={true} />
 *   <CallControlButton label="Leave" tone="destructive" />
 * </CallControls>
 * ```
 *
 * Dock: pass the controls as props and the toolbar draws them — grouped,
 * with pressed states, counts, a leave button, and a "More controls"
 * disclosure that takes the actions and panel toggles when the dock is
 * narrower than 600 px. `children` are added after the panel toggles.
 *
 * ```tsx
 * <CallControls
 *   mic={{ active: micOn, onToggle: toggleMic }}
 *   camera={{ active: cameraOn, onToggle: toggleCamera }}
 *   screenShare={{ active: sharing, onToggle: toggleShare }}
 *   chat={{ active: chatOpen, onToggle: toggleChat, count: unread }}
 *   onLeave={leave}
 * />
 * ```
 */
export const CallControls = React.forwardRef<HTMLDivElement, CallControlsProps>(
  function CallControls(props, ref) {
    const {
      size = 'md',
      className,
      children,
      onKeyDown,
      mic,
      camera,
      screenShare,
      hand,
      reactions,
      captions,
      pip,
      record,
      chat,
      people,
      onLeave,
      labels,
      icons,
      containerClassName,
      ...rest
    } = props
    const api = createCallControls()
    const dock = isDock(props)

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event)
      handleToolbarArrowKeys(event)
    }

    if (!dock) {
      return (
        <div
          ref={ref}
          className={cn(callControlsVariants({ size }), className)}
          {...api.ariaProps}
          {...api.dataAttributes}
          {...rest}
          onKeyDown={handleKeyDown}
        >
          {children}
        </div>
      )
    }

    return (
      <div className={cn(callControlsDockClass, containerClassName)} data-call-controls-dock="">
        <div
          ref={ref}
          className={cn(callControlsVariants({ size }), callControlsDockBarClass, className)}
          {...api.ariaProps}
          aria-label={labels?.toolbar ?? callControlsDefaultLabels.toolbar}
          {...api.dataAttributes}
          data-variant="dock"
          {...rest}
          onKeyDown={handleKeyDown}
        >
          <CallControlsDockContent
            size={size}
            {...{ mic, camera, screenShare, hand, reactions, captions, pip, record, chat, people, onLeave, labels, icons }}
          >
            {children}
          </CallControlsDockContent>
        </div>
      </div>
    )
  },
)
