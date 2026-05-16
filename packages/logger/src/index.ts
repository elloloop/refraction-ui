// Types (vendor-neutral — no Faro/Grafana types are exported)
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
} from './types.js'
export { LEVEL_ORDER } from './types.js'

// Manager
export { createTelemetry } from './telemetry-manager.js'
export type { TelemetryPreset } from './telemetry-manager.js'

// Presets
export { PRESETS, resolvePreset } from './presets.js'

// Built-in transports
export { createConsoleSink } from './console-sink.js'
export type { ConsoleSinkOptions } from './console-sink.js'

// Faro engine (optional peers loaded dynamically; types stay vendor-neutral)
export { createFaroSink } from './faro-engine.js'
export type { FaroEngineOptions } from './faro-engine.js'

// Kill switch
export { createNoopTelemetry } from './noop.js'

// Utilities
export { redact } from './redact.js'

// Mock sink (for testing)
export { createMockSink } from './mock-sink.js'
export type { MockSinkExtended } from './mock-sink.js'
