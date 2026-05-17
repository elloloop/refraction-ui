import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

class _CapturingConsole implements ConsoleLike {
  final List<(String, String, Object?)> calls = <(String, String, Object?)>[];

  @override
  void debug(String line, Object? payload) =>
      calls.add(('debug', line, payload));

  @override
  void info(String line, Object? payload) => calls.add(('info', line, payload));

  @override
  void warn(String line, Object? payload) => calls.add(('warn', line, payload));

  @override
  void error(String line, Object? payload) =>
      calls.add(('error', line, payload));
}

void main() {
  group('createConsoleSink (parity with console-sink.ts)', () {
    test('pretty log routes to the level method with formatted line', () {
      final c = _CapturingConsole();
      final sink = createConsoleSink(ConsoleSinkOptions(console: c));
      sink.log(
        LogRecord(
          level: LogLevel.warn,
          message: 'hi',
          timestamp: 0,
          app: 'svc',
          env: TelemetryEnv.development,
          context: const <String, Object?>{'k': 'v'},
        ),
      );
      expect(c.calls.single.$1, 'warn');
      expect(c.calls.single.$2, contains('WARN'));
      expect(c.calls.single.$2, contains('[svc]'));
      expect(c.calls.single.$2, contains('hi'));
      expect(c.calls.single.$3, <String, Object?>{'k': 'v'});
    });

    test('fatal maps to console.error', () {
      final c = _CapturingConsole();
      final sink = createConsoleSink(ConsoleSinkOptions(console: c));
      sink.log(
        LogRecord(
          level: LogLevel.fatal,
          message: 'boom',
          timestamp: 0,
          app: 'svc',
          env: TelemetryEnv.development,
          context: const <String, Object?>{},
        ),
      );
      expect(c.calls.single.$1, 'error');
    });

    test('non-pretty emits structured JSON with type:log', () {
      final c = _CapturingConsole();
      final sink = createConsoleSink(
        ConsoleSinkOptions(pretty: false, console: c),
      );
      sink.log(
        LogRecord(
          level: LogLevel.info,
          message: 'm',
          timestamp: 123,
          app: 'svc',
          env: TelemetryEnv.production,
          context: const <String, Object?>{},
        ),
      );
      expect(c.calls.single.$2, contains('"type":"log"'));
      expect(c.calls.single.$2, contains('"message":"m"'));
      expect(c.calls.single.$2, contains('"env":"production"'));
    });

    test('span: ok -> debug, error -> error; pretty line shape', () {
      final c = _CapturingConsole();
      final sink = createConsoleSink(ConsoleSinkOptions(console: c));
      sink.span(
        SpanRecord(
          name: 'work',
          startTime: 0,
          endTime: 5,
          durationMs: 5,
          app: 'svc',
          env: TelemetryEnv.development,
          context: const <String, Object?>{},
          status: 'ok',
        ),
      );
      sink.span(
        SpanRecord(
          name: 'work',
          startTime: 0,
          endTime: 5,
          durationMs: 5,
          app: 'svc',
          env: TelemetryEnv.development,
          context: const <String, Object?>{},
          status: 'error',
        ),
      );
      expect(c.calls[0].$1, 'debug');
      expect(c.calls[0].$2, contains('[span] work'));
      expect(c.calls[0].$2, contains('(ok)'));
      expect(c.calls[1].$1, 'error');
      expect(c.calls[1].$2, contains('(error)'));
    });

    test('flush resolves (nothing buffered)', () async {
      final sink = createConsoleSink(
        ConsoleSinkOptions(console: _CapturingConsole()),
      );
      await expectLater(sink.flush(), completes);
    });
  });

  group('createNoopTelemetry (kill switch, parity with noop.ts)', () {
    test('zero emissions, empty sinks, idempotent child/span', () async {
      final t = createNoopTelemetry();
      t.debug('x');
      t.info('x');
      t.warn('x');
      t.error('x');
      t.fatal('x');
      expect(t.sinks, isEmpty);
      expect(identical(t.child(const <String, Object?>{}), t), isTrue);
      final span = t.startSpan('s');
      span.end();
      span.end(); // idempotent / no throw
      t.addSink(createMockSink());
      t.removeSink('mock');
      expect(t.sinks, isEmpty);
      await expectLater(t.flush(), completes);
    });
  });
}
