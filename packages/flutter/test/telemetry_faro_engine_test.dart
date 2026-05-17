import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

class _RecordingTransport implements FaroTransport {
  final List<({String kind, Object record})> pushes =
      <({String kind, Object record})>[];

  @override
  void push({required String kind, required Object record}) =>
      pushes.add((kind: kind, record: record));
}

void main() {
  group('createFaroSink (parity with faro-engine.ts)', () {
    test(
      'no transport + no vendor binding -> null (caller falls back)',
      () async {
        final sink = await createFaroSink(
          const FaroEngineOptions(app: 'svc', endpoint: 'https://x.example'),
        );
        expect(sink, isNull);
      },
    );

    test(
      'injected transport bypasses vendor; OTLP envelope identical to web',
      () async {
        final transport = _RecordingTransport();
        final sink = await createFaroSink(
          FaroEngineOptions(
            app: 'svc',
            endpoint: 'https://collector.example',
            transport: transport,
          ),
        );
        expect(sink, isNotNull);
        expect(sink!.name, 'faro');

        final log = LogRecord(
          level: LogLevel.warn,
          message: 'm',
          timestamp: 1,
          app: 'svc',
          env: TelemetryEnv.production,
          context: const <String, Object?>{'k': 'v'},
        );
        final span = SpanRecord(
          name: 's',
          startTime: 0,
          endTime: 2,
          durationMs: 2,
          app: 'svc',
          env: TelemetryEnv.production,
          context: const <String, Object?>{},
          status: 'ok',
        );

        sink.log(log);
        sink.span(span);

        // Envelope shape: { kind, record } — identical to the web engine.
        expect(transport.pushes[0].kind, 'log');
        expect(identical(transport.pushes[0].record, log), isTrue);
        expect(transport.pushes[1].kind, 'span');
        expect(identical(transport.pushes[1].record, span), isTrue);

        await expectLater(sink.flush(), completes);
      },
    );

    test('manager wires an endpoint sink when transport injected', () async {
      final transport = _RecordingTransport();
      final faro = await createFaroSink(
        FaroEngineOptions(
          app: 'svc',
          endpoint: 'https://collector.example',
          transport: transport,
        ),
      );
      final t = createTelemetry(
        const TelemetryConfig(app: 'svc', env: TelemetryEnv.development),
      );
      t.addSink(faro!);
      t.error('boom');
      expect(transport.pushes.single.kind, 'log');
    });

    test('faroLevelName maps fatal -> error (parity with FARO_LEVEL)', () {
      expect(faroLevelName(LogLevel.debug), 'debug');
      expect(faroLevelName(LogLevel.info), 'info');
      expect(faroLevelName(LogLevel.warn), 'warn');
      expect(faroLevelName(LogLevel.error), 'error');
      expect(faroLevelName(LogLevel.fatal), 'error');
    });

    test('flattenContext coerces non-strings (parity with flatten)', () {
      final flat = flattenContext(<String, Object?>{
        's': 'str',
        'n': 5,
        'b': true,
        'list': <Object?>[1, 2],
        'map': <String, Object?>{'a': 1},
      });
      expect(flat['s'], 'str');
      expect(flat['n'], '5');
      expect(flat['b'], 'true');
      expect(flat['list'], '[1,2]');
      expect(flat['map'], '{"a":1}');
    });
  });

  group('createMockSink (parity with mock-sink.ts)', () {
    test('records logs, spans, and flush calls', () async {
      final m = createMockSink('m');
      expect(m.name, 'm');
      m.log(
        LogRecord(
          level: LogLevel.info,
          message: 'x',
          timestamp: 0,
          app: 'a',
          env: TelemetryEnv.development,
          context: const <String, Object?>{},
        ),
      );
      m.span(
        SpanRecord(
          name: 's',
          startTime: 0,
          endTime: 0,
          durationMs: 0,
          app: 'a',
          env: TelemetryEnv.development,
          context: const <String, Object?>{},
          status: 'ok',
        ),
      );
      await m.flush();
      expect(m.logs, hasLength(1));
      expect(m.spans, hasLength(1));
      expect(m.flushCalls, 1);
    });

    test('default name is "mock"', () {
      expect(createMockSink().name, 'mock');
    });
  });
}
