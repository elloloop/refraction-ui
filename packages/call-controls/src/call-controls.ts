import type { AccessibilityProps } from '@refraction-ui/shared'

/** Visual/semantic tone of a call control button. */
export type CallControlTone = 'default' | 'active' | 'destructive'

/**
 * Toggleable state for controls like mic or camera.
 * `'on'`  = currently active (mic/camera live).
 * `'off'` = currently muted/disabled.
 */
export type CallControlState = 'on' | 'off'

/**
 * A single control descriptor used by adapters to drive button rendering.
 */
export interface CallControlItem {
  /** Unique identifier for this control. */
  id: string
  /** Visible label (also used as aria-label). */
  label: string
  /** Optional icon to render inside the button. */
  icon?: string
  /** Explicit tone override; when omitted `controlTone` is used with `state`. */
  tone?: CallControlTone
  /** Toggleable state (present only for toggleable controls). */
  pressed?: boolean
}

export interface CallControlsProps {
  /** Controls to render. */
  controls?: CallControlItem[]
}

export interface CallControlsAPI {
  /** ARIA attributes to spread on the toolbar element (`role="toolbar"`). */
  ariaProps: Partial<AccessibilityProps>
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Derive the visual tone for a control given its kind and current toggle state.
 *
 * Convention used by easyloops meeting toolbar:
 * - `leave` / `end`  → always `'destructive'`
 * - any control that is `'off'` (muted/stopped) → `'destructive'` to signal
 *   the user that something is disabled (e.g. mic muted = red indicator).
 * - a control that is `'on'` → `'active'` (lit up / highlighted).
 * - otherwise → `'default'` (neutral).
 */
export function controlTone(
  kind: string,
  state: CallControlState | undefined,
): CallControlTone {
  const normalised = kind.toLowerCase()
  if (normalised === 'leave' || normalised === 'end') return 'destructive'
  if (state === 'off') return 'destructive'
  if (state === 'on') return 'active'
  return 'default'
}

/**
 * Build the framework-agnostic toolbar props for a call-controls bar.
 *
 * Returns `role="toolbar"` plus `aria-label="Call controls"` and data
 * attributes; adapters spread these onto their container element.
 */
export function createCallControls(_props: CallControlsProps = {}): CallControlsAPI {
  const ariaProps: Partial<AccessibilityProps> = {
    role: 'toolbar',
    'aria-label': 'Call controls',
  }

  const dataAttributes: Record<string, string> = {
    'data-component': 'call-controls',
  }

  return { ariaProps, dataAttributes }
}
