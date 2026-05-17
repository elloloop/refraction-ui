/// Recording sink for tests — a 1:1 port of
/// `@refraction-ui/logger` `mock-sink.ts`. Mirrors `createMockAIProvider`.
library;

import 'types.dart';

/// A [TelemetrySink] that records everything for assertions instead of doing
/// I/O. Used to test the manager and the Faro engine without any network.
class MockSinkExtended implements TelemetrySink {
  /// Creates a [MockSinkExtended] with the given engine [name].
  MockSinkExtended([this._name = 'mock']);

  final String _name;

  /// Every log record received, in order.
  final List<LogRecord> logs = <LogRecord>[];

  /// Every span record received, in order.
  final List<SpanRecord> spans = <SpanRecord>[];

  /// Number of times [flush] was called.
  int flushCalls = 0;

  @override
  String get name => _name;

  @override
  void log(LogRecord record) => logs.add(record);

  @override
  void span(SpanRecord record) => spans.add(record);

  @override
  Future<void> flush() async {
    flushCalls++;
  }
}

/// `createMockSink` — a [TelemetrySink] that records everything for
/// assertions instead of doing I/O.
MockSinkExtended createMockSink([String name = 'mock']) =>
    MockSinkExtended(name);
