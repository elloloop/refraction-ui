import * as React from 'react'
import {
  createBadge,
  badgeVariants,
  type BadgeVariant,
  type BadgeSize,
} from '@refraction-ui/badge'
import { cn } from '@refraction-ui/shared'
import { Slot } from '@refraction-ui/react-slot'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  /** Merge the badge's classes/props onto the single child element instead of
   * rendering a `<div>` (Radix-style `asChild`) — e.g.
   * `<Badge asChild><a href="/x">…</a></Badge>` for a linked badge. Expects
   * exactly one React element child. */
  asChild?: boolean
}

/**
 * Badge component — renders a styled badge with variant and size support.
 *
 * Uses the headless @refraction-ui/badge core for state and ARIA attributes.
 * Styling via Tailwind utility classes (no external CSS-in-JS).
 */
export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  function Badge({ variant, size, asChild = false, className, children, ...props }, ref) {
    const api = createBadge({ variant, size })
    const classes = cn(badgeVariants({ variant, size }), className)

    if (asChild) {
      return (
        <Slot
          ref={ref as React.Ref<HTMLElement>}
          className={classes}
          {...api.ariaProps}
          {...api.dataAttributes}
          {...props}
        >
          {children}
        </Slot>
      )
    }

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
