/// Vendor-neutral telemetry contracts — a 1:1 Dart port of the
/// `@refraction-ui/logger` public surface. No vendor (Faro/Grafana/OTel)
/// type ever appears here or anywhere in the public API.
library;

/// Severity levels, ordered low -> high.
enum LogLevel { debug, info, warn, error, fatal }

/// Numeric ordering used for level threshold comparisons.
///
/// Mirrors `LEVEL_ORDER` in `@refraction-ui/logger`. The screaming-case name
/// is intentional — it is part of the ported public API surface.
// ignore: constant_identifier_names
const Map<LogLevel, int> LEVEL_ORDER = <LogLevel, int>{
  LogLevel.debug: 10,
  LogLevel.info: 20,
  LogLevel.warn: 30,
  LogLevel.error: 40,
  LogLevel.fatal: 50,
};

/// Wire/string name for a [LogLevel] (matches the TS string union values).
extension LogLevelName on LogLevel {
  /// The lowercase string identifier (`'debug'`, `'info'`, ...).
  String get wireName {
    switch (this) {
      case LogLevel.debug:
        return 'debug';
      case LogLevel.info:
        return 'info';
      case LogLevel.warn:
        return 'warn';
      case LogLevel.error:
        return 'error';
      case LogLevel.fatal:
        return 'fatal';
    }
  }
}

/// Bound key/value pairs attached to every record emitted by a logger.
typedef LogContext = Map<String, Object?>;

/// Telemetry environment — selects a behavior preset.
enum TelemetryEnv { development, production }

/// Wire/string name for a [TelemetryEnv] (matches the TS string union).
extension TelemetryEnvName on TelemetryEnv {
  /// The lowercase string identifier (`'development'` / `'production'`).
  String get wireName =>
      this == TelemetryEnv.development ? 'development' : 'production';
}

/// A single structured log record handed to a sink.
class LogRecord {
  /// Creates a [LogRecord].
  const LogRecord({
    required this.level,
    required this.message,
    required this.timestamp,
    required this.app,
    required this.env,
    required this.context,
  });

  /// Severity of the record.
  final LogLevel level;

  /// Human-readable message.
  final String message;

  /// Epoch milliseconds when the record was created.
  final int timestamp;

  /// Logical app/service name.
  final String app;

  /// Environment preset selector this record was emitted under.
  final TelemetryEnv env;

  /// Merged bound context (child loggers) + per-call context, post-redaction.
  final LogContext context;
}

/// A span record handed to a sink when a span ends.
class SpanRecord {
  /// Creates a [SpanRecord].
  const SpanRecord({
    required this.name,
    required this.startTime,
    required this.endTime,
    required this.durationMs,
    required this.app,
    required this.env,
    required this.context,
    required this.status,
    this.error,
  });

  /// Span name.
  final String name;

  /// Epoch milliseconds when the span started.
  final int startTime;

  /// Epoch milliseconds when the span ended.
  final int endTime;

  /// Wall-clock duration in milliseconds.
  final int durationMs;

  /// Logical app/service name.
  final String app;

  /// Environment preset selector this span was emitted under.
  final TelemetryEnv env;

  /// Merged bound context + span attributes, post-redaction.
  final LogContext context;

  /// `'ok'` unless ended with an error.
  final String status;

  /// Set when the span ended with an error.
  final SpanError? error;
}

/// Error detail attached to a [SpanRecord] when a span ends with an error.
class SpanError {
  /// Creates a [SpanError].
  const SpanError({required this.name, required this.message});

  /// Error class/type name (`'Error'` for non-[Error] throwables).
  final String name;

  /// Error message (stringified for non-[Error] throwables).
  final String message;
}

/// Vendor-neutral telemetry sink. Engines (console, Faro, custom) implement
/// this — no vendor type ever leaks across this boundary.
abstract class TelemetrySink {
  /// Engine name, for diagnostics.
  String get name;

  /// Receive a log record. May buffer; honor [flush].
  void log(LogRecord record);

  /// Receive a finished span. May buffer; honor [flush].
  void span(SpanRecord record);

  /// Force-deliver any buffered records. Resolves once delivery is attempted.
  Future<void> flush();
}

/// Config for `createTelemetry` — mirrors `createAI`'s config shape.
class TelemetryConfig {
  /// Creates a [TelemetryConfig].
  const TelemetryConfig({
    required this.app,
    required this.env,
    this.endpoint,
    this.enabled,
    this.sampleRate,
    this.redactKeys,
  });

  /// Logical app/service name attached to every record.
  final String app;

  /// Environment preset selector.
  final TelemetryEnv env;

  /// Remote collector endpoint. When omitted, telemetry stays console-only
  /// (no network engine is constructed).
  final String? endpoint;

  /// Master kill switch. When `false`, a tree-shakeable noop logger is
  /// returned and zero records are ever produced. Defaults to `true`.
  final bool? enabled;

  /// Fraction of records kept, 0..1. Defaults to the preset value
  /// (1 in development, 0.25 in production). Records below the sample
  /// are dropped before reaching any sink.
  final double? sampleRate;

  /// Context keys to strip (deep) before a record is emitted. Use for
  /// PII / secrets, e.g. `['password', 'token', 'authorization']`.
  final List<String>? redactKeys;
}

/// Options passed to [Span.end].
class SpanEndOptions {
  /// Creates [SpanEndOptions].
  const SpanEndOptions({this.error, this.attributes});

  /// When set, the span is recorded with `status: 'error'`.
  final Object? error;

  /// Additional attributes merged into the span context.
  final LogContext? attributes;
}

/// An in-flight span returned by [Logger.startSpan].
abstract class Span {
  /// End the span and emit a [SpanRecord]. Optionally attach error/attrs.
  /// Idempotent — a second call is a no-op.
  void end([SpanEndOptions? opts]);
}

/// A logger bound to a context. Child loggers inherit + extend that context.
abstract class Logger {
  /// Emit a record at [LogLevel.debug].
  void debug(String message, [LogContext? context]);

  /// Emit a record at [LogLevel.info].
  void info(String message, [LogContext? context]);

  /// Emit a record at [LogLevel.warn].
  void warn(String message, [LogContext? context]);

  /// Emit a record at [LogLevel.error].
  void error(String message, [LogContext? context]);

  /// Emit a record at [LogLevel.fatal].
  void fatal(String message, [LogContext? context]);

  /// Derive a logger with additional bound context (e.g.
  /// `{ sessionId, interviewId, turnId }`). Merges over the parent's context.
  /// The parent is unaffected.
  Logger child(LogContext context);

  /// Begin a span. Call [Span.end] to record its duration.
  Span startSpan(String name, [LogContext? attributes]);

  /// Force-deliver buffered records on every sink.
  Future<void> flush();
}

/// Return type of `createTelemetry`. Extends [Logger] with sink management.
abstract class Telemetry implements Logger {
  /// Registered sink names, in insertion order.
  List<String> get sinks;

  /// Register an additional sink (e.g. a custom collector).
  void addSink(TelemetrySink sink);

  /// Remove a sink by name.
  void removeSink(String name);

  @override
  Telemetry child(LogContext context);
}
