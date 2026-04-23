import * as React from 'react'
import {
  createCallout,
  createCalloutIcon,
  createCalloutContent,
  createCalloutTitle,
  createCalloutDescription,
  calloutVariants,
  calloutTitleVariants,
  calloutDescriptionVariants,
} from '@refraction-ui/callout'
import { cn } from '@refraction-ui/shared'

export interface CalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info'
}

export const Callout = React.forwardRef<HTMLDivElement, CalloutProps>(
  ({ className, variant, ...props }, ref) => {
    const api = createCallout({ role: variant === 'destructive' ? 'alert' : 'region' })
    return (
      <div
        ref={ref}
        className={cn(calloutVariants({ variant }), className)}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      />
    )
  },
)
Callout.displayName = 'Callout'

export const CalloutIcon = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const api = createCalloutIcon()
    return (
      <div
        ref={ref}
        className={cn('flex-shrink-0 mt-0.5', className)}
        {...api.dataAttributes}
        {...props}
      />
    )
  },
)
CalloutIcon.displayName = 'CalloutIcon'

export const CalloutContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const api = createCalloutContent()
    return (
      <div
        ref={ref}
        className={cn('flex-1', className)}
        {...api.dataAttributes}
        {...props}
      />
    )
  },
)
CalloutContent.displayName = 'CalloutContent'

export const CalloutTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    const api = createCalloutTitle()
    return (
      <h5
        ref={ref}
        className={cn(calloutTitleVariants(), className)}
        {...api.dataAttributes}
        {...props}
      />
    )
  },
)
CalloutTitle.displayName = 'CalloutTitle'

export const CalloutDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const api = createCalloutDescription()
    return (
      <div
        ref={ref}
        className={cn(calloutDescriptionVariants(), className)}
        {...api.dataAttributes}
        {...props}
      />
    )
  },
)
CalloutDescription.displayName = 'CalloutDescription'