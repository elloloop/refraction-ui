import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('installCrashCapture — hooks route to the sink pipeline', () {
    test('FlutterError.onError -> error record (non-fatal); prior handler '
        'preserved', () {
      final t = createTelemetry(
        const TelemetryConfig(app: 'svc', env: TelemetryEnv.development),
      );
      final mock = createMockSink();
      t.addSink(mock);

      var priorCalled = false;
      final saved = FlutterError.onError;
      FlutterError.onError = (d) => priorCalled = true;

      final guard = installCrashCapture(
        t,
        store: MemoryDurableStore(),
        installIsolateListener: false,
      );

      FlutterError.reportError(
        FlutterErrorDetails(
          exception: StateError('render boom'),
          stack: StackTrace.current,
          library: 'test',
        ),
      );

      expect(mock.logs, hasLength(1));
      expect(mock.logs.single.level, LogLevel.error);
      expect(mock.logs.single.message, contains('render boom'));
      expect(mock.logs.single.context['error.source'], 'FlutterError.onError');
      expect(priorCalled, isTrue, reason: 'previous handler chained');

      guard.dispose();
      FlutterError.onError = saved;
    });

    test('PlatformDispatcher.onError -> fatal record AND persists '
        'crash-on-next-launch', () {
      final t = createTelemetry(
        const TelemetryConfig(app: 'svc', env: TelemetryEnv.development),
      );
      final mock = createMockSink();
      t.addSink(mock);
      final store = MemoryDurableStore();

      final guard = installCrashCapture(
        t,
        store: store,
        installIsolateListener: false,
      );

      final handled = PlatformDispatcher.instance.onError!(
        StateError('async boom'),
        StackTrace.current,
      );

      expect(handled, isTrue);
      expect(mock.logs.single.level, LogLevel.fatal);
      expect(mock.logs.single.message, contains('async boom'));
      // Persisted for next launch BEFORE the live emit.
      expect(store.read('telemetry.crash'), isNotNull);
      expect(store.read('telemetry.crash'), contains('async boom'));

      guard.dispose();
    });

    test('crash-on-next-launch: a crash persisted by a prior run is '
        're-emitted as fatal on the next install, then cleared', () {
      final store = MemoryDurableStore();
      // Simulate: previous process died after persisting a fatal crash.
      debugWritePersistedCrash(
        store,
        message: 'died last launch',
        type: 'OutOfMemoryError',
      );

      final t = createTelemetry(
        const TelemetryConfig(app: 'svc', env: TelemetryEnv.development),
      );
      final mock = createMockSink();
      t.addSink(mock);

      final guard = installCrashCapture(
        t,
        store: store,
        installIsolateListener: false,
      );

      // Replayed immediately on install.
      expect(mock.logs, hasLength(1));
      expect(mock.logs.single.level, LogLevel.fatal);
      expect(mock.logs.single.message, contains('died last launch'));
      expect(mock.logs.single.context['error.source'], 'crash-on-next-launch');
      // Cleared so it is not re-sent on the run after.
      expect(store.read('telemetry.crash'), isNull);

      guard.dispose();
    });

    test('dispose restores the previous handlers', () {
      final before = FlutterError.onError;
      final beforePd = PlatformDispatcher.instance.onError;
      final t = createTelemetry(
        const TelemetryConfig(app: 'svc', env: TelemetryEnv.development),
      );
      final guard = installCrashCapture(
        t,
        store: MemoryDurableStore(),
        installIsolateListener: false,
      );
      expect(identical(FlutterError.onError, before), isFalse);
      guard.dispose();
      expect(identical(FlutterError.onError, before), isTrue);
      expect(identical(PlatformDispatcher.instance.onError, beforePd), isTrue);
    });

    test('crash record flows all the way through a durable sink', () async {
      final transport = RecordingDurableTransport();
      final t = createTelemetry(
        const TelemetryConfig(app: 'svc', env: TelemetryEnv.development),
      );
      t.addSink(createDurableSink(transport, store: MemoryDurableStore()));
      final guard = installCrashCapture(
        t,
        store: MemoryDurableStore(),
        installIsolateListener: false,
      );

      PlatformDispatcher.instance.onError!(
        StateError('pipeline'),
        StackTrace.current,
      );
      await t.flush();

      expect(transport.delivered, hasLength(1));
      expect(
        (transport.delivered.single['record'] as Map)['message'],
        contains('pipeline'),
      );
      guard.dispose();
    });
  });
}
