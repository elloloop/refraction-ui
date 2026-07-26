import * as React from 'react'
import {
  createPresence,
  presenceDotVariants,
  presenceContainerStyles,
  presenceLabelStyles,
  type PresenceStatus,
} from '@refraction-ui/presence-indicator'
import { cn } from '@refraction-ui/shared'

export interface PresenceIndicatorProps {
  status: PresenceStatus
  showLabel?: boolean
  label?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const PresenceIndicator = React.forwardRef<HTMLSpanElement, PresenceIndicatorProps>(
  ({ status, showLabel = false, label, size = 'md', className }, ref) => {
  const api = createPresence({ status, showLabel, label })

  return React.createElement(
    'span',
    { ref, ...api.ariaProps, className: cn(presenceContainerStyles, className) },
    React.createElement('span', {
      className: presenceDotVariants({ status, size }),
    }),
    api.showLabel &&
      React.createElement('span', { className: presenceLabelStyles }, api.label),
  )
  },
)

PresenceIndicator.displayName = 'PresenceIndicator'
