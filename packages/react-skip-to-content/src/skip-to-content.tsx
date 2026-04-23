import * as React from 'react'
import {
  createSkipToContent,
  skipToContentVariants,
} from '@refraction-ui/skip-to-content'
import { cn } from '@refraction-ui/shared'

export interface SkipToContentProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** The target element ID to skip to (without the #) */
  targetId?: string
}

export const SkipToContent = React.forwardRef<HTMLAnchorElement, SkipToContentProps>(
  ({ className, targetId = 'main-content', children = 'Skip to content', ...props }, ref) => {
    const api = createSkipToContent()
    return (
      <a
        ref={ref}
        href={`#${targetId}`}
        className={cn(skipToContentVariants(), className)}
        {...api.dataAttributes}
        {...props}
      >
        {children}
      </a>
    )
  },
)
SkipToContent.displayName = 'SkipToContent'
