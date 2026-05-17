import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/src/analytics/mobile/app_bg_session.dart';
import 'package:refraction_ui/src/analytics/mobile/app_lifecycle.dart';
import 'package:refraction_ui/src/analytics/mobile/mobile.dart' as mobile;

void main() {
  group('AppLifecycleHook — uniform surface', () {
    test('factory resolves a working hook on every target', () {
      final hook = AppLifecycleHook();
      expect(hook, isA<AppLifecycleHook>());
      // In the unit-test VM dart:ui IS available (flutter_test), so this is
      // the Flutter-backed hook; listening + cancelling must be safe and not
      // throw, and a phase callback is never invoked synchronously here.
      var calls = 0;
      final sub = hook.listen((_) => calls++);
      expect(calls, 0);
      sub.cancel();
      sub.cancel(); // idempotent
    });
  });

  group('mobile barrel — internal aggregator', () {
    test('re-exports the mobile layer for deep-path consumers', () {
      // Names are reachable through the internal barrel (no public-API change
      // — it is NOT wired into lib/analytics.dart or the package barrel).
      expect(mobile.AppLifecyclePhase.resumed, isA<AppLifecyclePhase>());
      expect(
        mobile
            .createFirebaseAnalyticsSink(
              client: mobile.RecordingFirebaseClient(),
            )
            .name,
        'firebase',
      );
      expect(
        mobile.createPostHogSink(client: mobile.RecordingPostHogClient()).name,
        'posthog',
      );
      expect(mobile.kAnalyticsConsentCategory, 'analytics');
      expect(mobile.kTrackingConsentCategory, 'tracking');
    });
  });
}
