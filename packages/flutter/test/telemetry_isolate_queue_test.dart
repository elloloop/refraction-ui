import 'dart:isolate';

import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  group('TelemetryIsolateHost — background-isolate logs are not lost', () {
    test('worker logger -> host -> real telemetry pipeline (in-process port)',
        () async {
      final telemetry = createTelemetry(
        const TelemetryConfig(app: 'svc', env: TelemetryEnv.development),
      );
      final mock = createMockSink();
      telemetry.addSink(mock);

      final host = TelemetryIsolateHost.attach(telemetry);
      // The SendPort is what would be passed into Isolate.spawn.
      final workerLogger = createIsolateLogger(host.sendPort);

      workerLogger.info('from-worker', <String, Object?>{'wid': 7});
      workerLogger
          .child(<String, Object?>{'job': 'resize'}).error('worker-fail');

      // Port delivery is async (microtask/event loop) — let it drain.
      await Future<void>.delayed(const Duration(milliseconds: 20));

      expect(mock.logs, hasLength(2));
      final first = mock.logs.firstWhere((r) => r.message == 'from-worker');
      expect(first.level, LogLevel.info);
      expect(first.context['wid'], 7);

      final second = mock.logs.firstWhere((r) => r.message == 'worker-fail');
      expect(second.level, LogLevel.error);
      expect(second.context['job'], 'resize');

      host.close();
    });

    test('worker span crosses the boundary as a completed span', () async {
      final telemetry = createTelemetry(
        const TelemetryConfig(app: 'svc', env: TelemetryEnv.development),
      );
      final mock = createMockSink();
      telemetry.addSink(mock);
      final host = TelemetryIsolateHost.attach(telemetry);
      final worker = createIsolateLogger(host.sendPort);

      worker.startSpan('decode', <String, Object?>{'fmt': 'png'}).end();
      await Future<void>.delayed(const Duration(milliseconds: 20));

      expect(mock.spans, hasLength(1));
      expect(mock.spans.single.name, 'decode');
      expect(mock.spans.single.context['fmt'], 'png');
      host.close();
    });

    test('closed host ignores further messages (no throw)', () async {
      final telemetry = createTelemetry(
        const TelemetryConfig(app: 'svc', env: TelemetryEnv.development),
      );
      final mock = createMockSink();
      telemetry.addSink(mock);
      final host = TelemetryIsolateHost.attach(telemetry);
      final worker = createIsolateLogger(host.sendPort);
      host.close();
      worker.info('after-close');
      await Future<void>.delayed(const Duration(milliseconds: 20));
      expect(mock.logs, isEmpty);
    });

    test('end-to-end across a real spawned isolate (SendPort handoff)',
        () async {
      final telemetry = createTelemetry(
        const TelemetryConfig(app: 'svc', env: TelemetryEnv.development),
      );
      final mock = createMockSink();
      telemetry.addSink(mock);
      final host = TelemetryIsolateHost.attach(telemetry);

      final done = ReceivePort();
      await Isolate.spawn(_worker, [host.sendPort, done.sendPort]);
      await done.first; // worker signals completion
      await Future<void>.delayed(const Duration(milliseconds: 30));

      expect(
        mock.logs.map((r) => r.message),
        containsAll(<String>['bg-isolate-1', 'bg-isolate-2']),
      );
      final tagged =
          mock.logs.firstWhere((r) => r.message == 'bg-isolate-2');
      expect(tagged.context['isolate'], 'worker');
      host.close();
      done.close();
    });
  });
}

/// Runs in a spawned isolate: emits via the forwarded SendPort, then signals.
void _worker(List<Object> args) {
  final sendPort = args[0] as SendPort;
  final done = args[1] as SendPort;
  final logger = createIsolateLogger(sendPort);
  logger.warn('bg-isolate-1');
  logger.child(<String, Object?>{'isolate': 'worker'}).error('bg-isolate-2');
  done.send('done');
}
