/** Whether the overlay covers the viewport or its nearest positioned ancestor. */
export type LoadingOverlayScope = 'fullscreen' | 'contain'

export const DEFAULT_LOADING_OVERLAY_LABEL = 'Loading'

export interface LoadingOverlayProps {
  /** Whether the overlay is shown. */
  open?: boolean
  /** Coverage. */
  scope?: LoadingOverlayScope
  /** Blur the content behind the scrim. */
  blur?: boolean
  /** Accessible name when no visible message is given. */
  label?: string
}

export interface LoadingOverlayAPI {
  /** ARIA attributes for the overlay root (`role="status"`). */
  ariaProps: Record<string, string | number | boolean>
  /** Data attributes that drive the stylesheet and expose state. */
  dataAttributes: Record<string, string>
}

/**
 * Props for a scrim that blocks a region while it loads. The overlay is a
 * polite live region so the message is announced once; adapters render it
 * only while `open` so nothing lingers in the accessibility tree.
 */
export function createLoadingOverlay(props: LoadingOverlayProps = {}): LoadingOverlayAPI {
  const {
    open = true,
    scope = 'fullscreen',
    blur = true,
    label = DEFAULT_LOADING_OVERLAY_LABEL,
  } = props

  const ariaProps: Record<string, string | number | boolean> = {
    role: 'status',
    'aria-live': 'polite',
    'aria-busy': true,
    'aria-label': label,
  }

  const dataAttributes: Record<string, string> = {
    'data-rfr-loader': 'overlay',
    'data-slot': 'loading-overlay',
    'data-state': open ? 'open' : 'closed',
    'data-scope': scope,
    'data-blur': blur ? 'true' : 'false',
  }

  return { ariaProps, dataAttributes }
}
