import * as React from 'react'
import {
  createSkeleton,
  skeletonVariants,
  type SkeletonShape,
} from '@refraction-ui/skeleton'
import { cn } from '@refraction-ui/shared'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shape?: SkeletonShape
  width?: string | number
  height?: string | number
  /** Whether to animate the skeleton pulse. Defaults to true */
  animate?: boolean
}

/**
 * Skeleton component -- renders a placeholder loading element.
 *
 * Uses the headless @refraction-ui/skeleton core for ARIA attributes.
 * Styling via Tailwind utility classes (no external CSS-in-JS).
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ shape, width, height, animate, className, style, ...props }, ref) => {
    const api = createSkeleton({ shape, animate })
    const classes = cn(skeletonVariants({ shape }), className)

    const mergedStyle: React.CSSProperties = {
      ...style,
      ...(width !== undefined ? { width } : {}),
      ...(height !== undefined ? { height } : {}),
    }

    return React.createElement('div', {
      ref,
      className: classes,
      style: Object.keys(mergedStyle).length > 0 ? mergedStyle : undefined,
      ...api.ariaProps,
      ...api.dataAttributes,
      ...props,
    })
  },
)

Skeleton.displayName = 'Skeleton'

// ---------------------------------------------------------------------------
// SkeletonText
// ---------------------------------------------------------------------------

export interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of text lines to render. Defaults to 3 */
  lines?: number
  /** Whether to animate the skeleton pulse. Defaults to true */
  animate?: boolean
}

/** Width percentages for each line to create a natural-looking text block */
const lineWidths = ['100%', '92%', '85%', '96%', '78%', '88%', '94%', '82%']

/**
 * SkeletonText component -- renders N lines of text-shaped skeletons with
 * slight width variations for a natural loading appearance.
 */
export const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonTextProps>(
  ({ lines = 3, animate, className, ...props }, ref) => {
    const children: React.ReactElement[] = []

    for (let i = 0; i < lines; i++) {
      const width = lineWidths[i % lineWidths.length]
      children.push(
        React.createElement(Skeleton, {
          key: i,
          shape: 'text',
          width,
          animate,
        }),
      )
    }

    return React.createElement(
      'div',
      {
        ref,
        className: cn('space-y-2', className),
        ...props,
      },
      ...children,
    )
  },
)

SkeletonText.displayName = 'SkeletonText'
