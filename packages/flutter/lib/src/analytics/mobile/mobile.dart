/// Internal aggregator for the **mobile (iOS/Android)** analytics layer.
///
/// This is an *internal implementation* barrel — it is intentionally **NOT**
/// re-exported by `lib/analytics.dart` or the package barrel, exactly like
/// `mock_sink.dart`. The mobile layer adds **no public API**: its sinks
/// implement the existing Dart [AnalyticsSink] SPI and are registered through
/// the existing `AnalyticsConfig.sinks` / `analytics.addSink(...)` surface, so
/// the consumer-facing structure and public API stay identical across Flutter
/// web, Android, iOS and desktop (epic #230 §2/§4).
///
/// A consumer who wants the mobile sinks imports this deep path explicitly
/// (mirrors how analytics tests import `src/analytics/mock_sink.dart`):
///
/// ```dart
/// import 'package:refraction_ui/refraction_ui.dart';
/// import 'package:refraction_ui/src/analytics/mobile/mobile.dart';
///
/// final analytics = createAnalytics(AnalyticsConfig(
///   app: 'my-app',
///   env: 'production',
///   consent: const ConsentConfig(), // nothing granted pre-consent
///   sinks: [
///     createFirebaseAnalyticsSink(client: MyFirebaseAdapter()),
///     createPostHogSink(client: MyPostHogAdapter()),
///   ],
/// ));
/// ```
library;

export 'app_bg_session.dart';
export 'app_lifecycle.dart';
export 'consent_gate.dart';
export 'firebase_sink.dart';
export 'posthog_sink.dart';
export 'secure_storage.dart';
