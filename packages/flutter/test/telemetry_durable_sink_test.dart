import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  group('createDurableSink — offline queue + retry/backoff (no network)', () {
    test('online: records delivered immediately on flush', () async {
      final t = RecordingDurableTransport();
      final store = MemoryDurableStore();
      final sink = createDurableSink(t, store: store);

      sink.log(_log('a'));
      sink.log(_log('b'));
      expect(sink.pending, 2);
      expect(t.delivered, isEmpty); // not delivered until flush

      await sink.flush();
      expect(sink.pending, 0);
      expect(t.delivered, hasLength(2));
      expect(t.delivered[0]['kind'], 'log');
      expect((t.delivered[0]['record'] as Map)['message'], 'a');
    });

    test(
      'offline window: nothing delivered, queue persists; replay on '
      'reconnect (durable across a new sink instance = process restart)',
      () async {
        final store = MemoryDurableStore();
        final offline = RecordingDurableTransport(failWhileOffline: true);
        final s1 = createDurableSink(offline, store: store);

        s1.log(_log('queued-1'));
        s1.log(_log('queued-2'));
        await s1.flush(); // offline -> stays queued + backoff armed
        expect(offline.delivered, isEmpty);
        expect(s1.pending, 2);

        // Simulate process restart: brand-new sink, SAME durable store.
        final online = RecordingDurableTransport();
        final s2 = createDurableSink(online, store: store);
        expect(s2.pending, 2, reason: 'queue survived restart');

        await s2.flush();
        expect(online.delivered, hasLength(2));
        expect((online.delivered[0]['record'] as Map)['message'], 'queued-1');
        expect((online.delivered[1]['record'] as Map)['message'], 'queued-2');
        expect(s2.pending, 0);
      },
    );

    test(
      'backoff: a failed flush is not retried until backoff elapses',
      () async {
        final store = MemoryDurableStore();
        final transport = RecordingDurableTransport(failWhileOffline: true);
        final sink = createDurableSink(
          transport,
          store: store,
          options: const DurableSinkOptions(
            baseBackoff: Duration(milliseconds: 80),
          ),
        );

        sink.log(_log('x'));
        await sink.flush(); // fails, backoff armed (~80ms)
        expect(sink.pending, 1);

        // Immediately reconnect; flush should be SKIPPED (still backing off).
        transport.failWhileOffline = false;
        await sink.flush();
        expect(transport.delivered, isEmpty, reason: 'still within backoff');
        expect(sink.pending, 1);

        await Future<void>.delayed(const Duration(milliseconds: 120));
        await sink.flush(); // backoff elapsed -> delivers
        expect(transport.delivered, hasLength(1));
        expect(sink.pending, 0);
      },
    );

    test('ordering preserved when a mid-batch delivery fails', () async {
      final store = MemoryDurableStore();
      // Transport that fails the 2nd envelope only.
      final t = _FlakyTransport(failIndex: 1);
      final sink = createDurableSink(
        t,
        store: store,
        options: const DurableSinkOptions(
          baseBackoff: Duration(milliseconds: 30),
        ),
      );
      sink.log(_log('1'));
      sink.log(_log('2'));
      sink.log(_log('3'));

      await sink.flush();
      // 1 delivered; 2 failed so 2 & 3 stay queued IN ORDER.
      expect(t.delivered.map((e) => (e['record'] as Map)['message']), ['1']);
      expect(sink.pending, 2);

      t.failIndex = -1; // recover
      // Wait out the post-failure backoff before retrying.
      await Future<void>.delayed(const Duration(milliseconds: 50));
      await sink.flush();
      expect(t.delivered.map((e) => (e['record'] as Map)['message']), [
        '1',
        '2',
        '3',
      ]);
    });

    test('queue is bounded (oldest dropped past maxQueue)', () {
      final store = MemoryDurableStore();
      final sink = createDurableSink(
        RecordingDurableTransport(failWhileOffline: true),
        store: store,
        options: const DurableSinkOptions(maxQueue: 3),
      );
      for (var i = 0; i < 10; i++) {
        sink.log(_log('m$i'));
      }
      expect(sink.pending, 3);
    });

    test('corrupt persisted queue is dropped, not crash-looped', () {
      final store = MemoryDurableStore()
        ..write('telemetry.queue', '{not json\nstill not json');
      final sink = createDurableSink(RecordingDurableTransport(), store: store);
      expect(sink.pending, 0);
      expect(store.read('telemetry.queue'), isNull);
    });

    test(
      'wires behind the uniform TelemetrySink surface via addSink',
      () async {
        final t = RecordingDurableTransport();
        final telemetry = createTelemetry(
          const TelemetryConfig(app: 'svc', env: TelemetryEnv.development),
        );
        telemetry.addSink(createDurableSink(t, store: MemoryDurableStore()));
        expect(telemetry.sinks, contains('durable'));
        telemetry.error('boom');
        await telemetry.flush();
        expect(t.delivered, hasLength(1));
        expect((t.delivered.single['record'] as Map)['message'], 'boom');
      },
    );
  });
}

LogRecord _log(String message) => LogRecord(
  level: LogLevel.error,
  message: message,
  timestamp: 0,
  app: 'svc',
  env: TelemetryEnv.production,
  context: const <String, Object?>{},
);

class _FlakyTransport implements DurableSinkTransport {
  _FlakyTransport({required this.failIndex});
  int failIndex;
  int _seen = 0;
  final List<Map<String, Object?>> delivered = <Map<String, Object?>>[];

  @override
  bool deliver({required String kind, required Map<String, Object?> record}) {
    final idx = _seen++;
    if (idx == failIndex) return false;
    delivered.add(<String, Object?>{'kind': kind, 'record': record});
    return true;
  }
}
