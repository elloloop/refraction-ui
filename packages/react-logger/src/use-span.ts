import * as React from 'react'
import type { LogContext, Span } from '@refraction-ui/logger'
import { useTelemetry } from './telemetry-provider.js'

export interface UseSpanAPI {
  /**
   * Begin a span tied to the provider's telemetry instance. Returns the
   * {@link Span}; call {@link Span.end} (or {@link UseSpanAPI.end}) to record
   * its duration. Starting a new span while one is active ends the previous
   * one first so a single hook owns at most one in-flight span.
   */
  start: (name: string, attributes?: LogContext) => Span
  /** End the active span (no-op if none is in flight). Idempotent per span. */
  end: (opts?: { error?: unknown; attributes?: LogContext }) => void
  /** Whether a span started by this hook is currently in flight. */
  isActive: boolean
}

/**
 * useSpan — start/end a telemetry span tied to the provider's telemetry
 * instance. The active span is cleaned up automatically on unmount.
 *
 * ```tsx
 * const span = useSpan()
 * useEffect(() => {
 *   span.start('llm-call', { model: 'gpt' })
 *   return () => span.end()
 * }, [])
 * ```
 *
 * Must be used within <TelemetryProvider>.
 */
export function useSpan(): UseSpanAPI {
  const telemetry = useTelemetry()
  const spanRef = React.useRef<Span | null>(null)
  const [isActive, setIsActive] = React.useState(false)

  const end = React.useCallback(
    (opts?: { error?: unknown; attributes?: LogContext }) => {
      if (!spanRef.current) return
      spanRef.current.end(opts)
      spanRef.current = null
      setIsActive(false)
    },
    [],
  )

  const start = React.useCallback(
    (name: string, attributes?: LogContext): Span => {
      if (spanRef.current) {
        spanRef.current.end()
      }
      const span = telemetry.startSpan(name, attributes)
      spanRef.current = span
      setIsActive(true)
      return span
    },
    [telemetry],
  )

  React.useEffect(() => {
    return () => {
      if (spanRef.current) {
        spanRef.current.end()
        spanRef.current = null
      }
    }
  }, [])

  return React.useMemo<UseSpanAPI>(
    () => ({ start, end, isActive }),
    [start, end, isActive],
  )
}
