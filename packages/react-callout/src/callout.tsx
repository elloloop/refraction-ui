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
import { Slot } from '@refraction-ui/react-slot'

export interface CalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info'
  /** Merge the callout's classes/props onto the single child element instead
   * of rendering a `<div>` (Radix-style `asChild`). Expects exactly one React
   * element child. */
  asChild?: boolean
}

export const Callout = React.forwardRef<HTMLDivElement, CalloutProps>(
  function Callout({ className, variant, asChild = false, ...props }, ref) {
    const api = createCallout({ role: variant === 'destructive' ? 'alert' : 'region' })
    const classes = cn(calloutVariants({ variant }), className)

    if (asChild) {
      return (
        <Slot
          ref={ref as React.Ref<HTMLElement>}
          className={classes}
          {...api.ariaProps}
          {...api.dataAttributes}
          {...props}
        />
      )
    }

    return (
      <div
        ref={ref}
        className={classes}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      />
    )
  },
)

export const CalloutIcon = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CalloutIcon({ className, ...props }, ref) {
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

export const CalloutContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CalloutContent({ className, ...props }, ref) {
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

export const CalloutTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  function CalloutTitle({ className, ...props }, ref) {
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

export const CalloutDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CalloutDescription({ className, ...props }, ref) {
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
