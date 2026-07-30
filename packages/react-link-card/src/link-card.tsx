import * as React from 'react'
import { createLinkCard } from '@refraction-ui/link-card'
import { cn } from '@refraction-ui/shared'
import { Slot } from '@refraction-ui/react-slot'

export interface LinkCardProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Merge the link card's classes/props onto the single child element
   * instead of rendering an `<a>` (Radix-style `asChild`) — e.g. compose with
   * a router `<Link>`. Expects exactly one React element child. */
  asChild?: boolean
}

export const LinkCard = React.forwardRef<HTMLAnchorElement, LinkCardProps>(
  function LinkCard({ className, asChild = false, ...props }, ref) {
    const api = createLinkCard(props)

    if (asChild) {
      return (
        <Slot
          ref={ref as React.Ref<HTMLElement>}
          className={cn(className)}
          {...api.dataAttributes}
          {...props}
        />
      )
    }

    return (
      <a
        ref={ref}
        className={cn(className)}
        {...api.dataAttributes}
        {...props}
      />
    )
  }
)
