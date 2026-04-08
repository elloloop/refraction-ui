import * as React from 'react'
import {
  createBadge,
  badgeVariants,
  type BadgeVariant,
  type BadgeSize,
} from '@refraction-ui/badge'
import { cn } from '@refraction-ui/shared'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant
  size?: BadgeSize
}

/**
 * Badge component — renders a styled badge with variant and size support.
 *
 * Uses the headless @refraction-ui/badge core for state and ARIA attributes.
 * Styling via Tailwind utility classes (no external CSS-in-JS).
 */
export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant, size, className, children, ...props }, ref) => {
    const api = createBadge({ variant, size })
    const classes = cn(badgeVariants({ variant, size }), className)

    return (
      <div
        ref={ref}
        className={classes}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      >
        {children}
      </div>
    )
  },
)

Badge.displayName = 'Badge'
