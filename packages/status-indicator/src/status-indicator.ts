import type { AccessibilityProps } from '@elloloop/shared'

export type StatusType = 'success' | 'error' | 'warning' | 'info' | 'pending' | 'neutral'

export interface StatusProps {
  /** The status type */
  type: StatusType
  /** Label to display alongside the status dot */
  label?: string
  /** Whether to show a pulse animation (primarily for 'pending' status) */
  pulse?: boolean
}

export interface StatusAPI {
  /** ARIA attributes for the status indicator */
  ariaProps: Partial<AccessibilityProps> & Record<string, unknown>
  /** The status type */
  type: StatusType
  /** The display label */
  label: string
  /** Whether to show pulse animation */
  pulse: boolean
  /** CSS color class name for the dot */
  color: string
}

const STATUS_COLORS: Record<StatusType, string> = {
  success: 'green',
  error: 'red',
  warning: 'yellow',
  info: 'blue',
  pending: 'orange',
  neutral: 'gray',
}

const STATUS_LABELS: Record<StatusType, string> = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Info',
  pending: 'Pending',
  neutral: 'Neutral',
}

export { STATUS_COLORS, STATUS_LABELS }

export function createStatusIndicator(props: StatusProps): StatusAPI {
  const { type, label: labelOverride, pulse: pulseOverride } = props

  const color = STATUS_COLORS[type]
  const label = labelOverride ?? STATUS_LABELS[type]
  const pulse = pulseOverride ?? (type === 'pending')

  const ariaProps: Partial<AccessibilityProps> & Record<string, unknown> = {
    role: 'status',
    'aria-label': label,
  }

  return {
    ariaProps,
    type,
    label,
    pulse,
    color,
  }
}
