import type { AccessibilityProps } from '@elloloop/shared'

export type SkeletonShape = 'text' | 'circular' | 'rectangular' | 'rounded'

export interface SkeletonProps {
  shape?: SkeletonShape
  width?: string | number
  height?: string | number
  /** Number of lines to render for the text shape variant */
  lines?: number
  /** Whether to animate the skeleton pulse. Defaults to true */
  animate?: boolean
}

export interface SkeletonAPI {
  /** ARIA attributes to spread on the element */
  ariaProps: Partial<AccessibilityProps>
  /** Data attributes for CSS styling hooks */
  dataAttributes: Record<string, string>
}

export function createSkeleton(props: SkeletonProps = {}): SkeletonAPI {
  const { shape = 'text', animate = true } = props

  const ariaProps: Partial<AccessibilityProps> = {
    'aria-hidden': true,
    role: 'presentation',
  }

  const dataAttributes: Record<string, string> = {
    'data-shape': shape,
    'data-animate': String(animate),
  }

  return {
    ariaProps,
    dataAttributes,
  }
}
