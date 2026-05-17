import * as React from 'react'
import { devWarn } from '@refraction-ui/shared'
import {
  createTelemetry,
  createNoopTelemetry,
  type TelemetryConfig,
  type Telemetry,
  type Logger,
  type LogContext,
} from '@refraction-ui/logger'

/**
 * Shared no-op telemetry used when a hook is called outside a
 * <TelemetryProvider>. Lazily created once and reused so the reference is
 * stable across renders. The hooks degrade gracefully (no-op) instead of
 * throwing, so components instrumented with useLogger/useSpan/useTelemetry
 * render fine without a provider (e.g. in tests, or standalone usage).
 */
let noopTelemetry: Telemetry | null = null
function getNoopTelemetry(): Telemetry {
  return (noopTelemetry ??= createNoopTelemetry())
}

export interface TelemetryContextValue {
  /** The root telemetry instance (a logger bound to the empty root context). */
  telemetry: Telemetry
}

export const TelemetryContext = React.createContext<TelemetryContextValue | null>(null)

export interface TelemetryProviderProps extends TelemetryConfig {
  children: React.ReactNode
}

/**
 * TelemetryProvider — wraps your app with telemetry context.
 *
 * ```tsx
 * <TelemetryProvider app="interview-service" env="production">
 *   <App />
 * </TelemetryProvider>
 * ```
 */
export function TelemetryProvider({ children, ...config }: TelemetryProviderProps) {
  const telemetryRef = React.useRef<Telemetry | null>(null)

  if (!telemetryRef.current) {
    telemetryRef.current = createTelemetry(config)
  }

  const value = React.useMemo<TelemetryContextValue>(
    () => ({ telemetry: telemetryRef.current! }),
    [],
  )

  return React.createElement(TelemetryContext.Provider, { value }, children)
}

/**
 * useTelemetry — access the root telemetry instance.
 *
 * If called outside a <TelemetryProvider> it does NOT throw: it returns a
 * shared no-op telemetry (a dev-only warn-once hint is emitted so the missing
 * provider is discoverable). This lets components instrumented with
 * useLogger/useSpan/useTelemetry render safely without a provider.
 */
export function useTelemetry(): Telemetry {
  const ctx = React.useContext(TelemetryContext)
  if (!ctx) {
    devWarn(
      'react-logger/use-telemetry-outside-provider',
      'useTelemetry() (or useLogger()/useSpan(), which depend on it) was called outside a <TelemetryProvider>. Telemetry is a no-op here; wrap your app (or the consuming subtree) in <TelemetryProvider> to enable it.',
    )
    return getNoopTelemetry()
  }
  return ctx.telemetry
}

/**
 * useLogger — derive a scoped child logger with bound context (e.g.
 * `{ sessionId, interviewId, turnId }`). The logger is memoized so it stays
 * stable across renders for the same scope. With no scope, the root telemetry
 * logger is returned.
 *
 * Must be used within <TelemetryProvider>.
 */
export function useLogger(scope?: LogContext): Logger {
  const telemetry = useTelemetry()
  const scopeKey = scope ? JSON.stringify(scope) : ''
  return React.useMemo<Logger>(
    () => (scope ? telemetry.child(scope) : telemetry),
    [telemetry, scope, scopeKey],
  )
}
