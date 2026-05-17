/// refraction_ui analytics — a headless, neutral **Segment-spec
/// collector/router** for product analytics. 1:1 Dart port of
/// `@refraction-ui/analytics`.
///
/// The app instruments **once** — it never names a vendor. The library
/// collects the canonical event envelope and **fans it out** to N pluggable
/// sinks (your own backend, GA4, Azure, PostHog, …). **There is no privileged
/// engine** — every vendor is just a sink. The consumer specifies the backend
/// URL → events go to *their* endpoint, never refraction-ui's.
///
/// The public API, the canonical Segment `AnalyticsEvent` envelope, the
/// `AnalyticsSink` SPI, and the built-in HTTP sink's wire contract are reused
/// **verbatim** from the web library (#213 / #214 / #221).
///
/// Structure and public API are **identical across Flutter web, Android, iOS
/// and desktop**. Platform differences (persistent storage, HTTP transport)
/// are internal implementation details resolved by conditional imports behind
/// this single surface — there is no per-platform package or divergence.
///
/// ```dart
/// import 'package:refraction_ui/refraction_ui.dart';
///
/// final analytics = createAnalytics(const AnalyticsConfig(
///   app: 'my-app',
///   env: 'production',
///   endpoint: 'https://collect.example.com', // YOUR backend
///   writeKey: 'WRITE_KEY',
///   consent: ConsentConfig(granted: ['analytics']),
/// ));
///
/// analytics.track('Signup Clicked', {'plan': 'pro'});
/// analytics.identify('user_42', {'plan': 'pro'});
/// analytics.screen('Dashboard');
/// await analytics.flush();
/// analytics.reset();
/// ```
library;

export 'analytics_manager.dart' show createAnalytics;
export 'console_sink.dart' show ConsoleSink, AnalyticsLogger, createConsoleSink;
export 'consent.dart' show Consent;
export 'http_sink.dart' show HttpSink, createHttpSink;
export 'identity.dart' show Identity, IdentityStitch;
// NOTE: mock_sink.dart is intentionally NOT re-exported. Its `createMockSink`,
// `MockSink`, `MockSinkExtended` and `MockDelivery` are test-only helpers and
// would collide with the telemetry module's flat-barrel `createMockSink` /
// `MockSinkExtended`. Analytics tests import it directly from
// `package:refraction_ui/src/analytics/mock_sink.dart`.
export 'noop.dart' show NoopAnalytics, createNoopAnalytics;
export 'redaction.dart' show Redactor, piiDenyList, piiExactKeys, redacted;
export 'session.dart'
    show Session, campaignFingerprint, defaultSessionTimeoutMs;
export 'storage.dart' show MemoryStorage, createMemoryStorage, resolveStorage;
export 'types.dart';
export 'uuid.dart' show uuidv4, isUuidV4, uuidV4Re;
