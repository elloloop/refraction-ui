import type { AccessibilityProps } from '@elloloop/shared'

export type PresenceStatus = 'online' | 'offline' | 'away' | 'busy' | 'dnd'

export interface PresenceProps {
  /** The presence status to display */
  status: PresenceStatus
  /** Show a text label alongside the indicator */
  showLabel?: boolean
  /** Custom label override */
  label?: string
}

export interface PresenceAPI {
  /** ARIA attributes for the indicator */
  ariaProps: Partial<AccessibilityProps> & Record<string, unknown>
  /** CSS color for the status dot */
  color: string
  /** Human-readable label for the status */
  label: string
  /** Whether to show the label text */
  showLabel: boolean
  /** The current status */
  status: PresenceStatus
}

const STATUS_COLORS: Record<PresenceStatus, string> = {
  online: 'green',
  offline: 'gray',
  away: 'yellow',
  busy: 'red',
  dnd: 'red',
}

const STATUS_LABELS: Record<PresenceStatus, string> = {
  online: 'Online',
  offline: 'Offline',
  away: 'Away',
  busy: 'Busy',
  dnd: 'Do Not Disturb',
}

export { STATUS_COLORS, STATUS_LABELS }

export function createPresence(props: PresenceProps): PresenceAPI {
  const { status, showLabel: showLabelProp = false, label: labelOverride } = props

  const color = STATUS_COLORS[status]
  const label = labelOverride ?? STATUS_LABELS[status]

  const ariaProps: Partial<AccessibilityProps> & Record<string, unknown> = {
    role: 'status',
    'aria-label': label,
  }

  return {
    ariaProps,
    color,
    label,
    showLabel: showLabelProp,
    status,
  }
}
