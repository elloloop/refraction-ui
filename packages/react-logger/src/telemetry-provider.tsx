import * as React from 'react'
import { devWarn } from '@refraction-ui/shared'
import {
  createTelemetry,
  type TelemetryConfig,
  type Telemetry,
  type Logger,
  type LogContext,
} from '@refraction-ui/logger'

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
 * Must be used within <TelemetryProvider>.
 */
export function useTelemetry(): Telemetry {
  const ctx = React.useContext(TelemetryContext)
  if (!ctx) {
    devWarn(
      'react-logger/use-telemetry-outside-provider',
      'useTelemetry() (or useSpan(), which depends on it) was called outside a <TelemetryProvider>. Wrap your app (or the consuming subtree) in <TelemetryProvider> so the telemetry context is available.',
    )
    throw new Error('useTelemetry must be used within a <TelemetryProvider>')
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
