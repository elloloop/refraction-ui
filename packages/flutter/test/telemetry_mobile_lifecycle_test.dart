import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

/// Test hook standing in for the platform `lifecycle_io.dart`
/// `WidgetsBindingObserver`: lets the suite drive the same exit callback the
/// real observer fires on `AppLifecycleState.paused/inactive/detached`.
class _AppLifecycleHook implements LifecycleHook {
  void Function()? _onExit;
  AppLifecycleState? _last;

  /// Mirror the real observer's transition logic exactly.
  void drive(AppLifecycleState state) {
    final leaving = state == AppLifecycleState.paused ||
        state == AppLifecycleState.inactive ||
        state == AppLifecycleState.detached;
    if (leaving && _last != state) _onExit?.call();
    _last = state;
  }

  @override
  LifecycleSubscription onExit(void Function() onExit) {
    _onExit = onExit;
    return _Sub();
  }
}

class _Sub implements LifecycleSubscription {
  @override
  void cancel() {}
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('mobile lifecycle flush — paused/inactive/detached (web beacon '
      'replacement)', () {
    test('production: backgrounding flushes the buffered queue', () async {
      final hook = _AppLifecycleHook();
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

      t.error('pending-1');
      t.error('pending-2');
      expect(mock.logs, isEmpty, reason: 'prod batches');

      hook.drive(AppLifecycleState.inactive); // leaving foreground
      await Future<void>.delayed(Duration.zero);
      expect(mock.logs, hasLength(2));
    });

    test('paused and detached also flush; resumed does NOT', () async {
      final hook = _AppLifecycleHook();
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

      hook.drive(AppLifecycleState.resumed); // no-op
      t.error('a');
      hook.drive(AppLifecycleState.resumed); // still no flush
      await Future<void>.delayed(Duration.zero);
      expect(mock.logs, isEmpty);

      hook.drive(AppLifecycleState.paused);
      await Future<void>.delayed(Duration.zero);
      expect(mock.logs, hasLength(1));

      t.error('b');
      hook.drive(AppLifecycleState.detached);
      await Future<void>.delayed(Duration.zero);
      expect(mock.logs, hasLength(2));
    });

    test('repeated identical background state flushes once per transition',
        () async {
      final hook = _AppLifecycleHook();
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

      t.error('once');
      hook.drive(AppLifecycleState.paused);
      hook.drive(AppLifecycleState.paused); // same state -> no extra flush
      await Future<void>.delayed(Duration.zero);
      expect(mock.flushCalls, greaterThanOrEqualTo(1));
      expect(mock.logs, hasLength(1));
    });

    test('the real platform LifecycleHook constructs without a binding crash',
        () {
      // On the dart:io path this builds the WidgetsBindingObserver-backed
      // hook; in the test VM it must be a safe no-op (explicit flush still
      // works), proving the uniform surface holds.
      final hook = LifecycleHook();
      final sub = hook.onExit(() {});
      expect(sub, isNotNull);
      sub.cancel(); // idempotent / no throw
    });
  });
}
