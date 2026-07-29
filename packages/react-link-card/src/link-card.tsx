import * as React from 'react'
import { createLinkCard } from '@refraction-ui/link-card'
import { cn } from '@refraction-ui/shared'

export const LinkCard = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  function LinkCard({ className, ...props }, ref) {
    const api = createLinkCard(props)
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
