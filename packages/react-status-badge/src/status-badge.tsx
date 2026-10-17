import * as React from 'react'
import {
  createStatusBadge,
  statusBadgeVariants,
  statusBadgeIconClasses,
  STATUS_BADGE_DOT_SIZE,
  type StatusBadgeVariant,
} from '@refraction-ui/status-badge'
import { LiveDot, type LiveDotColor } from '@refraction-ui/react-live-dot'
import { devWarn } from '@refraction-ui/shared'

export interface StatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The status in words ("Allowed", "Off", "Checking…"). Always shown. */
  label: string
  /** One of Badge's variants. Defaults to `outline`. */
  variant?: StatusBadgeVariant
  /**
   * Leading icon (decorative; hidden from assistive technology). Replaces a
   * static dot; a pulsing dot replaces it while `pulsing`.
   */
  icon?: React.ReactNode
  /** Semantic colour token for the leading dot (never a raw CSS colour). */
  dotColor?: LiveDotColor
  /**
   * The status is still being worked out: draws a breathing LiveDot (in
   * `dotColor`, or `pending`). Under reduced motion the halo holds still.
   */
  pulsing?: boolean
}

/** React draws nothing for these, so they do not count as an icon. */
function isRenderable(node: React.ReactNode): boolean {
  return node != null && typeof node !== 'boolean' && node !== ''
}

/**
 * StatusBadge — a Badge with a leading dot or icon for a status in a word
 * ("Allowed", "Off", "Checking…").
 *
 * Styles come from Badge (`badgeVariants`) so it matches a Badge of the same
 * variant; the dot is a LiveDot, so `pulsing` breathes and respects reduced
 * motion. The label is always rendered, so the status is never colour-only.
 * It renders a `<span>`, so it can sit inside a paragraph, list row or button.
 */
export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  function StatusBadge(
    { label, variant, icon, dotColor, pulsing, className, ...props },
    ref,
  ) {
    const api = createStatusBadge({
      label,
      variant,
      hasIcon: isRenderable(icon),
      dotColor,
      pulsing,
    })

    if (!api.label) {
      devWarn(
        'status-badge/empty-label',
        'StatusBadge needs a non-empty `label`: without it the status is shown by colour alone.',
      )
    }

    return (
      <span
        ref={ref}
        className={statusBadgeVariants({ variant: api.variant, className })}
        {...api.dataAttributes}
        {...props}
      >
        {api.leading === 'icon' && (
          <span
            aria-hidden="true"
            data-status-badge-icon=""
            className={statusBadgeIconClasses}
          >
            {icon}
          </span>
        )}
        {api.leading === 'dot' && (
          <LiveDot
            live={api.pulsing}
            color={api.dotColor}
            size={STATUS_BADGE_DOT_SIZE}
          />
        )}
        <span data-status-badge-label="">{api.label}</span>
      </span>
    )
  },
)
