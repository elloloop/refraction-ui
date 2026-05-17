/// Kill-switch logger — a 1:1 port of `@refraction-ui/logger` `noop.ts`.
library;

import 'types.dart';

/// Shared no-op span — emits nothing, allocates nothing per call.
class _NoopSpan implements Span {
  const _NoopSpan();

  @override
  void end([SpanEndOptions? opts]) {
    // no-op
  }
}

const _NoopSpan _noopSpan = _NoopSpan();

class _NoopTelemetry implements Telemetry {
  const _NoopTelemetry();

  @override
  void debug(String message, [LogContext? context]) {}

  @override
  void info(String message, [LogContext? context]) {}

  @override
  void warn(String message, [LogContext? context]) {}

  @override
  void error(String message, [LogContext? context]) {}

  @override
  void fatal(String message, [LogContext? context]) {}

  @override
  Telemetry child(LogContext context) => this;

  @override
  Span startSpan(String name, [LogContext? attributes]) => _noopSpan;

  @override
  Future<void> flush() async {}

  @override
  List<String> get sinks => const <String>[];

  @override
  void addSink(TelemetrySink sink) {}

  @override
  void removeSink(String name) {}
}

/// Returned by `createTelemetry` when `enabled: false`. Every method is an
/// empty stub, so the call sites can be dead-code-eliminated and the engines
/// (console/Faro) are never constructed. Zero emissions.
Telemetry createNoopTelemetry() => const _NoopTelemetry();
