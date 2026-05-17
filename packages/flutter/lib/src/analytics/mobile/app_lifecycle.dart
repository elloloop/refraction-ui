/// App foreground/background lifecycle hook (internal-only).
///
/// This is the ONE identical surface the engine layer talks to for app-bg
/// session boundaries. The actual wiring — a Flutter `WidgetsBindingObserver`
/// on Android/iOS/desktop, a no-op on plain Dart / unit-test VMs — is an
/// internal implementation detail selected via a conditional import,
/// invisible to the consumer and uniform across web/android/ios/desktop
/// (mirrors the telemetry module's `lifecycle.dart` precedent).
///
/// It uses only `package:flutter`'s `WidgetsBinding` (already a transitive dep
/// of this Flutter package — NOT a new pub dependency) and never the IDFA or
/// any device identifier.
library;

import 'app_bg_session.dart';
import 'app_lifecycle_stub.dart'
    if (dart.library.ui) 'app_lifecycle_flutter.dart';

/// A registered lifecycle listener. Calling [cancel] detaches it.
abstract class AppLifecycleSubscription {
  void cancel();
}

/// Platform-neutral hook that reports app foreground/background phase
/// transitions. Implemented per platform behind this single surface.
abstract class AppLifecycleHook {
  /// The platform default — resolved at compile time via conditional import.
  factory AppLifecycleHook() => createAppLifecycleHook();

  /// Register [onPhase]; returns a handle that detaches it.
  AppLifecycleSubscription listen(void Function(AppLifecyclePhase) onPhase);
}
