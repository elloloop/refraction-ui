import * as React from 'react'
import type {
  Analytics,
  AnalyticsContext as AnalyticsEventContext,
  AnalyticsProperties,
  CallOptions,
} from '@refraction-ui/analytics'

const AnalyticsContext = React.createContext<Analytics | null>(null)

export interface AnalyticsProviderProps {
  children: React.ReactNode
  /**
   * The `Analytics` instance to expose. Construct it once with
   * `createAnalytics(...)` from `@refraction-ui/analytics`.
   */
  value: Analytics
}

/**
 * AnalyticsProvider — wraps your app with analytics context.
 *
 * ```tsx
 * <AnalyticsProvider value={createAnalytics({ app: 'my-app', env: 'production' })}>
 *   <App />
 * </AnalyticsProvider>
 * ```
 */
export function AnalyticsProvider({ children, value }: AnalyticsProviderProps) {
  const analyticsRef = React.useRef<Analytics | null>(null)

  if (!analyticsRef.current) {
    analyticsRef.current = value
  }

  return React.createElement(
    AnalyticsContext.Provider,
    { value: analyticsRef.current },
    children,
  )
}

export interface UseAnalyticsOptions {
  /** When set, returns a `with({ ...scope })` child bound to the context. */
  scope?: Partial<AnalyticsEventContext>
}

/**
 * useAnalytics — access the `Analytics` instance from context.
 *
 * Pass `{ scope }` to receive a `with(...)` child whose context is merged
 * into every event. Must be used within an `<AnalyticsProvider>`.
 */
export function useAnalytics(options?: UseAnalyticsOptions): Analytics {
  const ctx = React.useContext(AnalyticsContext)
  if (!ctx) {
    throw new Error('useAnalytics must be used within an <AnalyticsProvider>')
  }
  const scope = options?.scope
  return React.useMemo<Analytics>(
    () => (scope ? ctx.with(scope) : ctx),
    [ctx, scope],
  )
}

/**
 * useTrackEvent — a stable, bound `track` for the current context.
 *
 * ```tsx
 * const track = useTrackEvent()
 * track('Signup Clicked', { plan: 'pro' })
 * ```
 */
export function useTrackEvent(
  options?: UseAnalyticsOptions,
): (event: string, properties?: AnalyticsProperties, opts?: CallOptions) => void {
  const analytics = useAnalytics(options)
  return React.useCallback(
    (event: string, properties?: AnalyticsProperties, opts?: CallOptions) =>
      analytics.track(event, properties, opts),
    [analytics],
  )
}
