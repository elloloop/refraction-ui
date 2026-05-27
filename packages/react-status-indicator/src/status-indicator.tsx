import * as React from 'react'
import {
  createStatusIndicator,
  statusContainerStyles,
  statusDotVariants,
  statusPulseVariants,
  statusLabelStyles,
  type StatusType,
} from '@refraction-ui/status-indicator'
import { cn } from '@refraction-ui/shared'

export interface StatusIndicatorProps {
  type: StatusType
  /** Explicit text label. Takes precedence over `children`. */
  label?: string
  /** Composable label content. Used when `label` is omitted. */
  children?: React.ReactNode
  pulse?: boolean
  showLabel?: boolean
  className?: string
}

/** Best ARIA-label: explicit prop wins, then string children, else headless default. */
function deriveAriaLabel(
  label: string | undefined,
  children: React.ReactNode,
  fallback: string,
): string {
  if (label) return label
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children)
  }
  return fallback
}

export function StatusIndicator({
  type,
  label,
  children,
  pulse,
  showLabel = true,
  className,
}: StatusIndicatorProps) {
  const api = createStatusIndicator({ type, label, pulse })
  const ariaLabel = deriveAriaLabel(label, children, api.label)
  const visibleLabel: React.ReactNode = label ?? children ?? api.label

  const dotClassName = api.pulse
    ? statusPulseVariants({ type })
    : statusDotVariants({ type })

  return (
    <span
      {...api.ariaProps}
      aria-label={ariaLabel}
      className={cn(statusContainerStyles, className)}
    >
      <span className={dotClassName} />
      {showLabel && <span className={statusLabelStyles}>{visibleLabel}</span>}
    </span>
  )
}

StatusIndicator.displayName = 'StatusIndicator'
