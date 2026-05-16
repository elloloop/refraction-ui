// Injectable service + provider + DI tokens
export {
  TelemetryService,
  provideTelemetry,
  TELEMETRY,
  TELEMETRY_CONFIG,
} from './telemetry.service.js'

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
