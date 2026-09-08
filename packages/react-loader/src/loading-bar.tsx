import * as React from 'react'
import {
  createLoadingBar,
  loadingBarVariants,
  type LoadingBarPlacement,
  type LoaderTone,
} from '@refraction-ui/loader'
import { cn } from '@refraction-ui/shared'
import { LoaderStyleSheet } from './loader-style-sheet.js'
import { useTrickleProgress } from './use-trickle-progress.js'

export type { LoadingBarPlacement }

export interface LoadingBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Percentage complete. Omit for an indeterminate sweep. */
  value?: number
  /** Accessible name. Defaults to "Loading page". */
  label?: string
  /** Pin to the top of the viewport, or sit in flow. */
  placement?: LoadingBarPlacement
  /** Colour role. */
  tone?: LoaderTone
  /** Track thickness. Defaults to 3px. */
  thickness?: number | string
  /** Playback speed multiplier for the indeterminate sweep. */
  speed?: number
}

/**
 * LoadingBar — a thin progress strip, determinate or indeterminate.
 *
 * `placement="fixed"` pins it to the top edge for route transitions; `inline`
 * sits in flow (e.g. under a card header). Exposes the full
 * `role="progressbar"` value triple when a value is given.
 */
export const LoadingBar = React.forwardRef<HTMLDivElement, LoadingBarProps>(
  function LoadingBar(
    { value, label, placement = 'inline', tone = 'primary', thickness, speed, className, style, ...props },
    ref,
  ) {
    const api = createLoadingBar({ value, label, placement })
    const mergedStyle = {
      ...style,
      ...api.style,
      ...(thickness !== undefined
        ? { '--rfr-loader-bar-height': typeof thickness === 'number' ? `${thickness}px` : thickness }
        : {}),
      ...(speed !== undefined ? { '--rfr-loader-speed': speed } : {}),
    } as React.CSSProperties

    return (
      <>
        <LoaderStyleSheet />
        <div
          ref={ref}
          className={cn(loadingBarVariants({ tone, placement }), className)}
          style={mergedStyle}
          {...api.ariaProps}
          {...api.dataAttributes}
          {...props}
        >
          <span data-part="fill" />
        </div>
      </>
    )
  },
)

export interface PageLoadingBarProps
  extends Omit<LoadingBarProps, 'value' | 'placement'> {
  /** Whether a navigation is in flight. */
  active: boolean
  /** Trickle cadence in ms. */
  intervalMs?: number
}

/**
 * PageLoadingBar — the top-of-page strip for route transitions.
 *
 * Flip `active` on when navigation starts and off when the new page has
 * rendered. The bar trickles forward without a real progress signal, sprints
 * to 100% on completion, then fades out. Renders nothing while idle.
 */
export function PageLoadingBar({ active, intervalMs, ...props }: PageLoadingBarProps) {
  const { value, visible } = useTrickleProgress(active, { intervalMs })
  if (!visible) return null
  return <LoadingBar value={value} placement="fixed" {...props} />
}
