import * as React from 'react'
import { devWarn } from '@refraction-ui/shared'
import { createNoopAnalytics } from '@refraction-ui/analytics'
import type {
  Analytics,
  AnalyticsContext as AnalyticsEventContext,
  AnalyticsProperties,
  CallOptions,
} from '@refraction-ui/analytics'

const AnalyticsContext = React.createContext<Analytics | null>(null)

/**
 * Shared no-op Analytics used when a hook is called outside an
 * <AnalyticsProvider>. Lazily created once and reused so the reference stays
 * stable. The hooks degrade gracefully (silent no-op) instead of throwing —
 * components instrumented with useAnalytics/useTrackEvent render fine without
 * a provider (tests, standalone); analytics activates when one is mounted.
 */
let noopAnalytics: Analytics | null = null
function getNoopAnalytics(): Analytics {
  return (noopAnalytics ??= createNoopAnalytics())
}

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
 * into every event. If called outside an `<AnalyticsProvider>` it does NOT
 * throw: it returns a shared no-op `Analytics` (a dev-only warn-once hint is
 * emitted). Instrumenting a component with analytics must never crash the
 * host (incl. in tests).
 */
export function useAnalytics(options?: UseAnalyticsOptions): Analytics {
  const ctx = React.useContext(AnalyticsContext)
  let base = ctx
  if (!base) {
    devWarn(
      'react-analytics/use-analytics-outside-provider',
      'useAnalytics() (or useTrackEvent()) was called outside an <AnalyticsProvider>. Analytics is a no-op here; wrap your app (or the consuming subtree) in <AnalyticsProvider> to enable it.',
    )
    base = getNoopAnalytics()
  }
  const scope = options?.scope
  return React.useMemo<Analytics>(
    () => (scope ? base.with(scope) : base),
    [base, scope],
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
