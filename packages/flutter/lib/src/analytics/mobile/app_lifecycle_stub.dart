/// Fallback app-lifecycle hook used when `dart:ui` is unavailable (plain Dart
/// VM / unit tests). Registers nothing — the engine's explicit phase driving
/// (and tests using [AppBackgroundSessionBinder] directly) still work
/// everywhere. Keeps the core fully platform-agnostic.
library;

import 'app_bg_session.dart';
import 'app_lifecycle.dart';

class _NoopSubscription implements AppLifecycleSubscription {
  const _NoopSubscription();
  @override
  void cancel() {}
}

class _StubAppLifecycleHook implements AppLifecycleHook {
  const _StubAppLifecycleHook();
  @override
  AppLifecycleSubscription listen(void Function(AppLifecyclePhase) onPhase) =>
      const _NoopSubscription();
}

/// Platform-default factory (no lifecycle source available).
AppLifecycleHook createAppLifecycleHook() => const _StubAppLifecycleHook();
