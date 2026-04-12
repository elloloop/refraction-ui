import * as React from 'react'
import { cn } from '@refraction-ui/shared'

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("", className)} {...props} />
  }
)
Pagination.displayName = 'Pagination'
