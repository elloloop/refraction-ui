import * as React from 'react'
import { createCardGrid, type CardGridProps } from '@refraction-ui/card-grid'
import { cn } from '@refraction-ui/shared'

export interface ReactCardGridProps extends React.HTMLAttributes<HTMLDivElement>, CardGridProps {}

export const CardGrid = React.forwardRef<HTMLDivElement, ReactCardGridProps>(
  ({ className, columns = 3, ...props }, ref) => {
    const api = createCardGrid({ columns })
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