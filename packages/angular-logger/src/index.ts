// Injectable service + provider + DI tokens
export {
  TelemetryService,
  provideTelemetry,
  TELEMETRY,
  TELEMETRY_CONFIG,
} from './telemetry.service.js'

// Library-origin error capture seam (epic #247 / issue #249)
export {
  RefractionErrorHandler,
  provideLibraryErrorCapture,
  LIBRARY_ORIGIN_IDENTITY,
  LIBRARY_ERROR_SINK,
} from './library-error-handler.js'

// Re-export core types for convenience (vendor-neutral — no Faro/Grafana
// types are exposed)
export type {
  LogLevel,
  LogContext,
  LogRecord,
  SpanRecord,
  TelemetrySink,
  TelemetryEnv,
  TelemetryConfig,
  Logger,
  Span,
  Telemetry,
} from '@refraction-ui/logger'

// Library-origin capture contract (reused from shared — not redefined)
export type {
  LibraryOriginIdentity,
  DevFeedbackRecord,
  DevFeedbackSink,
} from '@refraction-ui/shared'
