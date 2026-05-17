/// App-exit / background flush hook.
///
/// This is the ONE identical surface that the manager talks to. The actual
/// platform wiring (web `pagehide`/`visibilitychange` vs. non-web app
/// lifecycle) is an internal implementation detail selected via a conditional
/// import — invisible to the consumer and uniform across web/android/ios/
/// desktop. Mirrors the production-preset "beacon flush on page exit" branch
/// in `@refraction-ui/logger`'s `telemetry-manager.ts`.
library;

import 'lifecycle_stub.dart'
    if (dart.library.io) 'lifecycle_io.dart'
    if (dart.library.js_interop) 'lifecycle_web.dart';

/// A registered exit/background listener. Calling [cancel] detaches it.
abstract class LifecycleSubscription {
  /// Detach the listener.
  void cancel();
}

/// Platform-neutral hook that invokes [onExit] when the host signals that the
/// app/page is going away or to the background. Implemented per platform
/// behind this single surface.
abstract class LifecycleHook {
  /// The platform default — resolved at compile time via conditional import.
  factory LifecycleHook() => createLifecycleHook();

  /// Register [onExit]; returns a handle that detaches it via
  /// [LifecycleSubscription.cancel].
  LifecycleSubscription onExit(void Function() onExit);
}
