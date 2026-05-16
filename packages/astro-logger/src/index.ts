export { default as TelemetryScript } from './TelemetryScript.astro'

// Astro-idiomatic server-side hook
export {
  createTelemetryMiddleware,
  type TelemetryMiddlewareContext,
  type TelemetryMiddlewareNext,
  type TelemetryMiddlewareOptions,
} from './telemetry-middleware.js'

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
