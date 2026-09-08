import * as React from 'react'
import {
  createLoadingOverlay,
  loadingOverlayVariants,
  loaderMessageClass,
  type LoadingOverlayScope,
} from '@refraction-ui/loader'
import { cn } from '@refraction-ui/shared'
import { LoaderStyleSheet } from './loader-style-sheet.js'
import { Spinner } from './spinner.js'

export type { LoadingOverlayScope }

export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the overlay is shown. Renders nothing when false. */
  open?: boolean
  /** Cover the viewport, or the nearest positioned ancestor. */
  scope?: LoadingOverlayScope
  /** Blur the content behind the scrim. */
  blur?: boolean
  /** Visible message under the indicator. */
  message?: React.ReactNode
  /** Accessible name when `message` is not a plain string. */
  label?: string
  /** Custom indicator. Defaults to a large ring spinner. */
  children?: React.ReactNode
}

/**
 * LoadingOverlay — a scrim that blocks a region while it loads.
 *
 * `scope="fullscreen"` covers the viewport (route transitions, sign-in);
 * `scope="contain"` covers its nearest `position: relative` ancestor (a card
 * refetching). Drop any indicator in as children — a `Spinner`, anything
 * else — and it is centred over a translucent, optionally blurred
 * backdrop. Unmounts entirely when closed so nothing lingers for screen readers.
 */
export const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  function LoadingOverlay(
    { open = true, scope = 'fullscreen', blur = true, message, label, children, className, ...props },
    ref,
  ) {
    if (!open) return null

    const api = createLoadingOverlay({
      open,
      scope,
      blur,
      label: label ?? (typeof message === 'string' ? message : undefined),
    })

    return (
      <>
        <LoaderStyleSheet />
        <div
          ref={ref}
          className={cn(loadingOverlayVariants({ scope }), className)}
          {...api.ariaProps}
          {...api.dataAttributes}
          {...props}
        >
          <div data-part="panel">
            {children ?? <Spinner size="lg" decorative />}
            {message != null && <p className={loaderMessageClass}>{message}</p>}
          </div>
        </div>
      </>
    )
  },
)
