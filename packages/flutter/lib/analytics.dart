/// Namespaced entrypoint for the refraction_ui **analytics** module — a
/// headless, neutral Segment-spec collector/router (1:1 Dart port of
/// `@refraction-ui/analytics`).
///
/// Import this file instead of `package:refraction_ui/refraction_ui.dart`
/// when you need the analytics module's `createConsoleSink`. The package
/// barrel hides `createConsoleSink` from the analytics export to avoid a
/// collision with the telemetry module's flat-barrel `createConsoleSink`
/// (telemetry owns the flat barrel). This entrypoint re-exports the **full**
/// analytics public surface — including `createConsoleSink` — so there is no
/// parity loss with the web library.
///
/// ```dart
/// import 'package:refraction_ui/analytics.dart';
///
/// final analytics = createAnalytics(const AnalyticsConfig(
///   app: 'my-app',
///   env: 'production',
///   endpoint: 'https://collect.example.com',
///   writeKey: 'WRITE_KEY',
/// ));
/// final sink = createConsoleSink();
/// ```
///
/// If you need both modules' console sinks in one library, import the
/// telemetry `createConsoleSink` from the package barrel and use this file's
/// `createConsoleSink` with a prefix (e.g. `import '...analytics.dart' as
/// analytics;`).
library;

export 'src/analytics/analytics.dart';
export 'src/analytics/console_sink.dart' show createConsoleSink;
