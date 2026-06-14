import * as React from 'react'
import {
  createBrowserChromeMock,
  splitUrl,
  browserChromeMockVariants,
  chromeBarClass,
  trafficDotClass,
  urlBarClass,
  urlDomainClass,
  statusBadgeVariants,
  contentAreaClass,
  type BrowserChromeStatus,
} from '@refraction-ui/browser-chrome-mock'
import { cn } from '@refraction-ui/shared'

export type { BrowserChromeStatus }

export interface BrowserChromeMockProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color' | 'content'> {
  /** URL to display in the address bar. Bold domain + normal path. */
  url: string
  /** Optional status badge shown in the chrome bar. */
  status?: BrowserChromeStatus
}

/** Three traffic-light dots rendered in the chrome bar. */
const TRAFFIC_DOTS = ['bg-red-400', 'bg-yellow-400', 'bg-green-400'] as const

/**
 * BrowserChromeMock — a decorative browser window frame.
 *
 * Renders a mock browser chrome with traffic-light dots, a monospace URL bar
 * (bold domain + normal path), an optional live/rec status badge, and a
 * content area for arbitrary children. Logic and styles come from the headless
 * `@refraction-ui/browser-chrome-mock` core.
 */
export const BrowserChromeMock = React.forwardRef<
  HTMLDivElement,
  BrowserChromeMockProps
>(({ url, status, className, children, ...props }, ref) => {
  const { ariaProps, dataAttributes } = createBrowserChromeMock({ status })
  const { domain, path } = splitUrl(url)

  return (
    <div
      ref={ref}
      className={cn(browserChromeMockVariants(), className)}
      {...ariaProps}
      {...dataAttributes}
      {...props}
    >
      {/* Chrome toolbar */}
      <div className={chromeBarClass}>
        {/* Traffic-light dots */}
        <div className="flex items-center gap-1.5 shrink-0">
          {TRAFFIC_DOTS.map((color) => (
            <span key={color} className={cn(trafficDotClass, color)} />
          ))}
        </div>

        {/* URL bar */}
        <div className={urlBarClass}>
          <span className={urlDomainClass}>{domain}</span>
          {path && <span>{path}</span>}
        </div>

        {/* Status badge */}
        {status && (
          <div className={statusBadgeVariants({ status })}>
            {status === 'rec' && (
              <span className="size-1.5 rounded-full bg-destructive animate-pulse" />
            )}
            {status}
          </div>
        )}
      </div>

      {/* Content area */}
      <div className={contentAreaClass}>{children}</div>
    </div>
  )
})

BrowserChromeMock.displayName = 'BrowserChromeMock'
