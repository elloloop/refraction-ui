export { default as TelemetryScript } from './TelemetryScript.astro'

// Astro-idiomatic server-side hook
export {
  createTelemetryMiddleware,
  type TelemetryMiddlewareContext,
  type TelemetryMiddlewareNext,
  type TelemetryMiddlewareOptions,
} from './telemetry-middleware.js'

// Library-origin error capture seam (epic #247 / issue #249)
export {
  createLibraryErrorCapture,
  captureAstroLibraryError,
  type LibraryErrorCaptureContext,
  type LibraryErrorCaptureNext,
  type LibraryErrorCaptureOptions,
} from './library-error-capture.js'
export type {
  LibraryOriginIdentity,
  DevFeedbackRecord,
  DevFeedbackSink,
} from '@refraction-ui/shared'

// Re-export core types and factories for convenience (Faro stays hidden)
export {
  createTelemetry,
  createConsoleSink,
  createNoopTelemetry,
  createMockSink,
  redact,
  PRESETS,
  resolvePreset,
  LEVEL_ORDER,
  type Telemetry,
  type TelemetryConfig,
  type TelemetryEnv,
  type TelemetryPreset,
  type Logger,
  type Span,
  type LogLevel,
  type LogContext,
  type LogRecord,
  type SpanRecord,
  type TelemetrySink,
  type ConsoleSinkOptions,
  type MockSinkExtended,
} from '@refraction-ui/logger'
