import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

/// Test [LifecycleHook] whose registered exit listener can be fired manually.
class _FakeLifecycleHook implements LifecycleHook {
  void Function()? _listener;

  void fireExit() => _listener?.call();

  @override
  LifecycleSubscription onExit(void Function() onExit) {
    _listener = onExit;
    return _FakeSub();
  }
}

class _FakeSub implements LifecycleSubscription {
  @override
  void cancel() {}
}

void main() {
  group('createTelemetry — parity with telemetry-manager.ts', () {
    test('disabled -> noop, zero emissions', () {
      final t = createTelemetry(
        const TelemetryConfig(
          app: 'a',
          env: TelemetryEnv.development,
          enabled: false,
        ),
      );
      final mock = createMockSink();
      t.addSink(mock); // noop ignores
      t.error('should not emit');
      expect(t.sinks, isEmpty);
      expect(mock.logs, isEmpty);
    });

    test('no endpoint -> console-only (single console sink)', () {
      final t = createTelemetry(
        const TelemetryConfig(app: 'a', env: TelemetryEnv.development),
      );
      expect(t.sinks, <String>['console']);
    });

    test('dev preset: debug passes, sync delivery to a custom sink', () {
      final t = createTelemetry(
        const TelemetryConfig(app: 'svc', env: TelemetryEnv.development),
      );
      final mock = createMockSink();
      t.addSink(mock);
      t.debug('d', <String, Object?>{'x': 1});
      expect(mock.logs, hasLength(1));
      final r = mock.logs.single;
      expect(r.level, LogLevel.debug);
      expect(r.app, 'svc');
      expect(r.env, TelemetryEnv.development);
      expect(r.context, <String, Object?>{'x': 1});
    });

    test(
      'prod preset: below warn dropped, warn+ batched then flushed',
      () async {
        final t = createTelemetry(
          const TelemetryConfig(
            app: 'svc',
            env: TelemetryEnv.production,
            sampleRate: 1,
          ),
        );
        final mock = createMockSink();
        t.addSink(mock);

        t.debug('drop');
        t.info('drop');
        expect(mock.logs, isEmpty); // below minLevel (warn)

        t.warn('buffered');
        expect(mock.logs, isEmpty); // batched, not yet delivered

        await t.flush();
        expect(mock.logs, hasLength(1));
        expect(mock.logs.single.message, 'buffered');
        expect(mock.flushCalls, greaterThanOrEqualTo(1));
      },
    );

    test('prod preset: auto-flush when batchSize (20) reached', () {
      final t = createTelemetry(
        const TelemetryConfig(
          app: 'svc',
          env: TelemetryEnv.production,
          sampleRate: 1,
        ),
      );
      final mock = createMockSink();
      t.addSink(mock);
      for (var i = 0; i < 20; i++) {
        t.error('e$i');
      }
      expect(mock.logs, hasLength(20));
    });

    test('sampleRate 0 drops everything; explicit rate overrides preset', () {
      final t = createTelemetry(
        const TelemetryConfig(
          app: 'svc',
          env: TelemetryEnv.development,
          sampleRate: 0,
        ),
      );
      final mock = createMockSink();
      t.addSink(mock);
      t.error('nope');
      expect(mock.logs, isEmpty);
    });

    test('deterministic sampling via injected randomSource', () {
      var t = createTelemetry(
        const TelemetryConfig(
          app: 'svc',
          env: TelemetryEnv.development,
          sampleRate: 0.5,
        ),
        randomSource: () => 0.9, // >= 0.5 -> dropped
      );
      var mock = createMockSink();
      t.addSink(mock);
      t.error('drop');
      expect(mock.logs, isEmpty);

      t = createTelemetry(
        const TelemetryConfig(
          app: 'svc',
          env: TelemetryEnv.development,
          sampleRate: 0.5,
        ),
        randomSource: () => 0.1, // < 0.5 -> kept
      );
      mock = createMockSink();
      t.addSink(mock);
      t.error('keep');
      expect(mock.logs, hasLength(1));
    });

    test(
      'redaction applies to log + span context (deep, case-insensitive)',
      () {
        final t = createTelemetry(
          const TelemetryConfig(
            app: 'svc',
            env: TelemetryEnv.development,
            redactKeys: <String>['password'],
          ),
        );
        final mock = createMockSink();
        t.addSink(mock);
        t.warn('w', <String, Object?>{'Password': 'secret', 'ok': 1});
        expect(mock.logs.single.context['Password'], '[REDACTED]');
        expect(mock.logs.single.context['ok'], 1);

        t.startSpan('s', <String, Object?>{'password': 'x'}).end();
        expect(mock.spans.single.context['password'], '[REDACTED]');
      },
    );

    test('child loggers merge bound context; parent unaffected', () {
      final t = createTelemetry(
        const TelemetryConfig(app: 'svc', env: TelemetryEnv.development),
      );
      final mock = createMockSink();
      t.addSink(mock);

      final session = t.child(<String, Object?>{'sessionId': 's-1'});
      final turn = session.child(<String, Object?>{'turnId': 't-7'});
      turn.info('hello', <String, Object?>{'extra': true});

      final ctx = mock.logs.single.context;
      expect(ctx['sessionId'], 's-1');
      expect(ctx['turnId'], 't-7');
      expect(ctx['extra'], true);

      // Parent has no bound child context.
      t.info('root');
      expect(mock.logs.last.context.containsKey('sessionId'), isFalse);
    });

    test('span lifecycle: duration, ok status, idempotent end, error', () {
      final t = createTelemetry(
        const TelemetryConfig(app: 'svc', env: TelemetryEnv.development),
      );
      final mock = createMockSink();
      t.addSink(mock);

      final span = t.startSpan('llm-call', <String, Object?>{'model': 'gpt'});
      span.end();
      span.end(); // idempotent — second emission suppressed
      expect(mock.spans, hasLength(1));
      final ok = mock.spans.single;
      expect(ok.name, 'llm-call');
      expect(ok.status, 'ok');
      expect(ok.error, isNull);
      expect(ok.durationMs, greaterThanOrEqualTo(0));
      expect(ok.endTime, greaterThanOrEqualTo(ok.startTime));
      expect(ok.context['model'], 'gpt');

      t
          .startSpan('boom')
          .end(
            SpanEndOptions(
              error: StateError('bad'),
              attributes: <String, Object?>{'phase': 2},
            ),
          );
      final errSpan = mock.spans.last;
      expect(errSpan.status, 'error');
      expect(errSpan.error, isNotNull);
      expect(errSpan.error!.message, contains('bad'));
      expect(errSpan.context['phase'], 2);
    });

    test('addSink/removeSink + insertion-ordered sink names', () {
      final t = createTelemetry(
        const TelemetryConfig(app: 'svc', env: TelemetryEnv.development),
      );
      t.addSink(createMockSink('a'));
      t.addSink(createMockSink('b'));
      expect(t.sinks, <String>['console', 'a', 'b']);
      t.removeSink('a');
      expect(t.sinks, <String>['console', 'b']);
    });

    test('production beaconFlush: lifecycle exit triggers a flush', () async {
      final hook = _FakeLifecycleHook();
      final t = createTelemetry(
        const TelemetryConfig(
          app: 'svc',
          env: TelemetryEnv.production,
          sampleRate: 1,
        ),
        lifecycleHook: hook,
      );
      final mock = createMockSink();
      t.addSink(mock);
      t.error('pending');
      expect(mock.logs, isEmpty); // buffered
      hook.fireExit();
      await Future<void>.delayed(Duration.zero);
      expect(mock.logs, hasLength(1));
    });
  });
}
