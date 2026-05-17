// Telemetry provider and hooks
export { TelemetryProvider, useTelemetry, useLogger } from './telemetry-provider.js'
export type {
  TelemetryProviderProps,
  TelemetryContextValue,
} from './telemetry-provider.js'

// Span hook
export { useSpan } from './use-span.js'
export type { UseSpanAPI } from './use-span.js'

// Error boundary
export { TelemetryErrorBoundary } from './error-boundary.js'
export type { TelemetryErrorBoundaryProps } from './error-boundary.js'

// Library-origin error capture seam (epic #247 / issue #249)
export {
  LibraryErrorCaptureBoundary,
  captureReactLibraryError,
} from './library-error-capture.js'
export type { LibraryErrorCaptureBoundaryProps } from './library-error-capture.js'

// Re-export core types for convenience
export type {
  Telemetry,
  Logger,
  Span,
  LogContext,
  LogLevel,
  LogRecord,
  SpanRecord,
  TelemetryConfig,
  TelemetryEnv,
  TelemetrySink,
} from '@refraction-ui/logger'
