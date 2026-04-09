import * as React from 'react'
import {
  createStatusIndicator,
  statusContainerStyles,
  statusDotVariants,
  statusPulseVariants,
  statusLabelStyles,
  type StatusType,
} from '@elloloop/status-indicator'
import { cn } from '@elloloop/shared'

export interface StatusIndicatorProps {
  type: StatusType
  label?: string
  pulse?: boolean
  showLabel?: boolean
  className?: string
}

export function StatusIndicator({
  type,
  label,
  pulse,
  showLabel = true,
  className,
}: StatusIndicatorProps) {
  const api = createStatusIndicator({ type, label, pulse })

  const dotClassName = api.pulse
    ? statusPulseVariants({ type })
    : statusDotVariants({ type })

  return React.createElement(
    'span',
    { ...api.ariaProps, className: cn(statusContainerStyles, className) },
    React.createElement('span', { className: dotClassName }),
    showLabel &&
      React.createElement('span', { className: statusLabelStyles }, api.label),
  )
}

StatusIndicator.displayName = 'StatusIndicator'
