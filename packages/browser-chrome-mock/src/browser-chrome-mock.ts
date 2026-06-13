/** Recording or live stream status for the browser chrome mock. */
export type BrowserChromeStatus = 'live' | 'rec'

export interface BrowserChromeMockProps {
  /** URL to display in the address bar. */
  url: string
  /** Optional status badge shown in the chrome bar. */
  status?: BrowserChromeStatus
}

export interface BrowserChromeMockAPI {
  /** ARIA attributes to spread on the group element. */
  ariaProps: { role: 'group'; 'aria-label': string }
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/** Split a URL into bold domain and normal path segments. */
export function splitUrl(url: string): { domain: string; path: string } {
  const slashIndex = url.indexOf('/')
  if (slashIndex === -1) {
    return { domain: url, path: '' }
  }
  return {
    domain: url.slice(0, slashIndex),
    path: url.slice(slashIndex),
  }
}

/**
 * Build the framework-agnostic props for a BrowserChromeMock.
 *
 * Returns a `role="group"` aria label plus optional `data-status` so adapters
 * can hook CSS without duplicating logic.
 */
export function createBrowserChromeMock(
  props: Pick<BrowserChromeMockProps, 'status'> = {},
): BrowserChromeMockAPI {
  const { status } = props

  const ariaProps = {
    role: 'group' as const,
    'aria-label': 'Browser preview',
  }

  const dataAttributes: Record<string, string> = {}
  if (status !== undefined) {
    dataAttributes['data-status'] = status
  }

  return { ariaProps, dataAttributes }
}
