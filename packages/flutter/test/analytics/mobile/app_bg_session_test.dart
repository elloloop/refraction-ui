import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/analytics/mobile/app_bg_session.dart';

void main() {
  group('AppBackgroundSessionPolicy — GA4-parity app-bg boundary', () {
    test('default background timeout is 30 minutes (GA4 parity)', () {
      expect(
        AppBackgroundSessionPolicy().backgroundTimeoutMs,
        defaultSessionTimeoutMs,
      );
      expect(defaultSessionTimeoutMs, 30 * 60 * 1000);
    });

    test('short background (< timeout) does NOT require rotation', () {
      var now = 1000;
      final p = AppBackgroundSessionPolicy(
        backgroundTimeoutMs: 1000,
        now: () => now,
      );
      p.onBackground();
      now += 500; // within window
      expect(p.onForeground(), isFalse);
    });

    test('long background (>= timeout) requires rotation', () {
      var now = 1000;
      final p = AppBackgroundSessionPolicy(
        backgroundTimeoutMs: 1000,
        now: () => now,
      );
      p.onBackground();
      now += 1000; // exactly at the boundary → rotate
      expect(p.onForeground(), isTrue);
    });

    test('foreground without a prior background never rotates', () {
      final p = AppBackgroundSessionPolicy(backgroundTimeoutMs: 1);
      expect(p.onForeground(), isFalse);
    });

    test('repeated background phases do not reset the bg clock', () {
      var now = 0;
      final p = AppBackgroundSessionPolicy(
        backgroundTimeoutMs: 1000,
        now: () => now,
      );
      p.onPhase(AppLifecyclePhase.background); // paused
      now += 600;
      p.onPhase(AppLifecyclePhase.background); // hidden (idempotent)
      now += 600; // total 1200 since first background
      expect(p.onPhase(AppLifecyclePhase.resumed), isTrue);
    });

    test('tracks current phase / isBackgrounded', () {
      final p = AppBackgroundSessionPolicy();
      expect(p.isBackgrounded, isFalse);
      p.onBackground();
      expect(p.isBackgrounded, isTrue);
      expect(p.phase, AppLifecyclePhase.background);
      p.onForeground();
      expect(p.isBackgrounded, isFalse);
    });
  });

  group('AppBackgroundSessionBinder — rotates the core Session', () {
    test('long background rotates the session id, short does not', () {
      var now = 100000;
      final session = Session(
        SessionConfig(storage: createMemoryStorage(), timeoutMs: 60 * 60000),
        now: () => now,
      );
      final binder = AppBackgroundSessionBinder(
        session: session,
        policy: AppBackgroundSessionPolicy(
          backgroundTimeoutMs: 30 * 60 * 1000,
          now: () => now,
        ),
      );
      final first = session.id();

      // Short background → same session.
      binder.onPhase(AppLifecyclePhase.background);
      now += 5 * 60 * 1000; // 5 min
      expect(binder.onPhase(AppLifecyclePhase.resumed), isNull);
      expect(session.id(), first);

      // Long background → fresh session.
      binder.onPhase(AppLifecyclePhase.background);
      now += 31 * 60 * 1000; // 31 min ≥ 30 min boundary
      final rotated = binder.onPhase(AppLifecyclePhase.resumed);
      expect(rotated, isNotNull);
      expect(rotated, isNot(first));
      expect(isUuidV4(rotated!), isTrue);
      expect(session.id(), rotated);
    });

    test('invokes onRotated with the new session id', () {
      var now = 0;
      String? notified;
      final session = Session(
        SessionConfig(storage: createMemoryStorage()),
        now: () => now,
      );
      final binder = AppBackgroundSessionBinder(
        session: session,
        policy: AppBackgroundSessionPolicy(
          backgroundTimeoutMs: 1000,
          now: () => now,
        ),
        onRotated: (id) => notified = id,
      );
      session.id();
      binder.onPhase(AppLifecyclePhase.background);
      now += 2000;
      final id = binder.onPhase(AppLifecyclePhase.resumed);
      expect(notified, isNotNull);
      expect(notified, id);
    });
  });
}
