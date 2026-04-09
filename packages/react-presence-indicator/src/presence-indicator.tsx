import * as React from 'react'
import {
  createPresence,
  presenceDotVariants,
  presenceContainerStyles,
  presenceLabelStyles,
  type PresenceStatus,
} from '@elloloop/presence-indicator'
import { cn } from '@elloloop/shared'

export interface PresenceIndicatorProps {
  status: PresenceStatus
  showLabel?: boolean
  label?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PresenceIndicator({
  status,
  showLabel = false,
  label,
  size = 'md',
  className,
}: PresenceIndicatorProps) {
  const api = createPresence({ status, showLabel, label })

  return React.createElement(
    'span',
    { ...api.ariaProps, className: cn(presenceContainerStyles, className) },
    React.createElement('span', {
      className: presenceDotVariants({ status, size }),
    }),
    api.showLabel &&
      React.createElement('span', { className: presenceLabelStyles }, api.label),
  )
}

PresenceIndicator.displayName = 'PresenceIndicator'
