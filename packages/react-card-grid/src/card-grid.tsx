import * as React from 'react'
import { createCardGrid } from '@refraction-ui/card-grid'
import { cn } from '@refraction-ui/shared'

export const CardGrid = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const api = createCardGrid(props)
    return (
      <div
        ref={ref}
        className={cn(className)}
        {...api.dataAttributes}
        {...props}
      />
    )
  }
)
CardGrid.displayName = 'CardGrid'