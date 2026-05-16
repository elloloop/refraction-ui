/** Severity levels, ordered low -> high. */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

/** Numeric ordering used for level threshold comparisons. */
export const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  fatal: 50,
}

/** Bound key/value pairs attached to every record emitted by a logger. */
export type LogContext = Record<string, unknown>

/** A single structured log record handed to a sink. */
export interface LogRecord {
  level: LogLevel
  message: string
  timestamp: number
  app: string
  env: TelemetryEnv
  /** Merged bound context (child loggers) + per-call context, post-redaction. */
  context: LogContext
}

/** A span record handed to a sink when a span ends. */
export interface SpanRecord {
  name: string
  startTime: number
  endTime: number
  durationMs: number
  app: string
  env: TelemetryEnv
  /** Merged bound context + span attributes, post-redaction. */
  context: LogContext
  /** 'ok' unless ended with an error. */
  status: 'ok' | 'error'
  error?: { name: string; message: string }
}

/**
 * Vendor-neutral telemetry sink. Engines (console, Faro, custom) implement
 * this — no vendor type ever leaks across this boundary.
 */
export interface TelemetrySink {
  /** Engine name, for diagnostics. */
  name: string
  /** Receive a log record. May buffer; honor flush(). */
  log(record: LogRecord): void
  /** Receive a finished span. May buffer; honor flush(). */
  span(record: SpanRecord): void
  /** Force-deliver any buffered records. Resolves once delivery is attempted. */
  flush(): Promise<void>
}

/** Telemetry environment — selects a behavior preset. */
export type TelemetryEnv = 'development' | 'production'

/** Config for {@link createTelemetry} — mirrors `createAI`'s config shape. */
export interface TelemetryConfig {
  /** Logical app/service name attached to every record. */
  app: string
  /** Environment preset selector. */
  env: TelemetryEnv
  /**
   * Remote collector endpoint. When omitted, telemetry stays console-only
   * (no network engine is constructed).
   */
  endpoint?: string
  /**
   * Master kill switch. When `false`, a tree-shakeable noop logger is
   * returned and zero records are ever produced. Defaults to `true`.
   */
  enabled?: boolean
  /**
   * Fraction of records kept, 0..1. Defaults to the preset value
   * (1 in development, 0.25 in production). Records below the sample
   * are dropped before reaching any sink.
   */
  sampleRate?: number
  /**
   * Context keys to strip (deep) before a record is emitted. Use for
   * PII / secrets, e.g. `['password', 'token', 'authorization']`.
   */
  redactKeys?: string[]
}

/** A logger bound to a context. Child loggers inherit + extend that context. */
export interface Logger {
  debug(message: string, context?: LogContext): void
  info(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
  error(message: string, context?: LogContext): void
  fatal(message: string, context?: LogContext): void
  /**
   * Derive a logger with additional bound context (e.g.
   * `{ sessionId, interviewId, turnId }`). Merges over the parent's context.
   */
  child(context: LogContext): Logger
  /** Begin a span. Call {@link Span.end} to record its duration. */
  startSpan(name: string, attributes?: LogContext): Span
  /** Force-deliver buffered records on every sink. */
  flush(): Promise<void>
}

/** An in-flight span returned by {@link Logger.startSpan}. */
export interface Span {
  /** End the span and emit a {@link SpanRecord}. Optionally attach error/attrs. */
  end(opts?: { error?: unknown; attributes?: LogContext }): void
}

/** Return type of {@link createTelemetry}. */
export interface Telemetry extends Logger {
  /** Registered sink names, in insertion order. */
  readonly sinks: string[]
  /** Register an additional sink (e.g. a custom collector). */
  addSink(sink: TelemetrySink): void
  /** Remove a sink by name. */
  removeSink(name: string): void
}
