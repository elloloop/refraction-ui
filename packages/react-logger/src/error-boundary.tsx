import * as React from 'react'
import type { LogContext } from '@refraction-ui/logger'
import { TelemetryContext, type TelemetryContextValue } from './telemetry-provider.js'

export interface TelemetryErrorBoundaryProps {
  children: React.ReactNode
  /**
   * Fallback UI rendered after an error is caught. May be a node or a render
   * function receiving the captured error and a reset callback.
   */
  fallback?:
    | React.ReactNode
    | ((error: Error, reset: () => void) => React.ReactNode)
  /** Extra bound context attached to the reported error record. */
  context?: LogContext
  /** Invoked after the error has been reported to the telemetry sink. */
  onError?: (error: Error, info: React.ErrorInfo) => void
}

interface TelemetryErrorBoundaryState {
  error: Error | null
}

/**
 * TelemetryErrorBoundary — a React error boundary that reports caught render
 * errors to the provider's telemetry sink (at `error` level) before showing
 * an optional fallback.
 *
 * ```tsx
 * <TelemetryErrorBoundary fallback={<p>Something broke.</p>}>
 *   <App />
 * </TelemetryErrorBoundary>
 * ```
 *
 * Must be used within <TelemetryProvider>.
 */
export class TelemetryErrorBoundary extends React.Component<
  TelemetryErrorBoundaryProps,
  TelemetryErrorBoundaryState
> {
  static contextType = TelemetryContext
  declare context: TelemetryContextValue | null

  state: TelemetryErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): TelemetryErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    const telemetry = this.context?.telemetry
    if (telemetry) {
      telemetry.error(error.message, {
        ...this.props.context,
        name: error.name,
        stack: error.stack,
        componentStack: info.componentStack,
      })
    }
    this.props.onError?.(error, info)
  }

  reset = (): void => {
    this.setState({ error: null })
  }

  render(): React.ReactNode {
    const { error } = this.state
    if (error) {
      const { fallback } = this.props
      if (typeof fallback === 'function') {
        return fallback(error, this.reset)
      }
      return fallback ?? null
    }
    return this.props.children
  }
}
