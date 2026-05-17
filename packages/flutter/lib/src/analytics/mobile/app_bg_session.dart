/// App-background session boundary (mobile, internal-only).
///
/// GA4-parity on mobile: a session ends when the **app is backgrounded for
/// ≥ `timeoutMs`** (default 30 min), independent of the inactivity-timeout the
/// core [Session] already enforces while foregrounded. Bringing the app back
/// after a long background therefore starts a fresh analytics session.
///
/// This file holds only the **pure policy** — no Flutter widget bindings, no
/// platform imports — so it is uniform across every target and fully unit
/// testable. The platform wiring that drives it (a `WidgetsBindingObserver`
/// on Android/iOS, a no-op elsewhere) lives behind the
/// [AppLifecycleHook] conditional-import surface and never leaks into the
/// public API. The consumer-facing structure/API is identical on web,
/// Android, iOS and desktop — this is an internal implementation detail.
library;

import '../session.dart';

/// Lifecycle phases this policy reacts to. Mirrors the subset of Flutter's
/// `AppLifecycleState` the analytics layer cares about, kept dependency-free
/// so the policy is testable without `package:flutter`.
enum AppLifecyclePhase {
  /// App is foreground and interactive.
  resumed,

  /// App is backgrounded / not visible (Flutter `paused`/`detached`/`hidden`).
  background,
}

/// Pure decision engine: given background→foreground transitions and a clock,
/// decides whether the analytics session must rotate.
///
/// The default boundary is [defaultSessionTimeoutMs] (30 min, GA4 parity) and
/// is shared with the core inactivity timeout so foreground-idle and
/// background-idle behave identically.
class AppBackgroundSessionPolicy {
  AppBackgroundSessionPolicy({int? backgroundTimeoutMs, int Function()? now})
    : backgroundTimeoutMs = backgroundTimeoutMs ?? defaultSessionTimeoutMs,
      _now = now ?? (() => DateTime.now().millisecondsSinceEpoch);

  /// Background duration (ms) that ends the session. Default 30 min.
  final int backgroundTimeoutMs;
  final int Function() _now;

  int? _backgroundedAt;
  AppLifecyclePhase _phase = AppLifecyclePhase.resumed;

  /// Current tracked phase (exposed for assertions/diagnostics).
  AppLifecyclePhase get phase => _phase;

  /// Whether the app is currently considered backgrounded.
  bool get isBackgrounded => _phase == AppLifecyclePhase.background;

  /// Record that the app went to the background. Idempotent — repeated
  /// background phases (paused→hidden→detached) do not reset the clock.
  void onBackground() {
    if (_phase == AppLifecyclePhase.background) return;
    _phase = AppLifecyclePhase.background;
    _backgroundedAt = _now();
  }

  /// Record that the app returned to the foreground. Returns `true` when the
  /// background gap met/exceeded [backgroundTimeoutMs] and the caller should
  /// therefore rotate the analytics session.
  bool onForeground() {
    final wasBackground = _phase == AppLifecyclePhase.background;
    _phase = AppLifecyclePhase.resumed;
    final since = _backgroundedAt;
    _backgroundedAt = null;
    if (!wasBackground || since == null) return false;
    return (_now() - since) >= backgroundTimeoutMs;
  }

  /// Feed a raw lifecycle phase; returns `true` iff this transition requires a
  /// session rotation (only ever on a qualifying background→foreground).
  bool onPhase(AppLifecyclePhase next) {
    switch (next) {
      case AppLifecyclePhase.background:
        onBackground();
        return false;
      case AppLifecyclePhase.resumed:
        return onForeground();
    }
  }
}

/// Binds an [AppBackgroundSessionPolicy] to a [Session]: on a qualifying
/// background→foreground transition it force-starts a new session id so the
/// next event is attributed to a fresh session (GA4-parity, mobile).
///
/// `onRotated` is invoked with the new session id whenever a rotation happens
/// (lets the engine layer re-stamp in-flight context). The binder owns no
/// platform code — it is driven by the [AppLifecycleHook] surface.
class AppBackgroundSessionBinder {
  AppBackgroundSessionBinder({
    required Session session,
    AppBackgroundSessionPolicy? policy,
    void Function(String sessionId)? onRotated,
  }) : _session = session,
       _policy = policy ?? AppBackgroundSessionPolicy(),
       _onRotated = onRotated;

  final Session _session;
  final AppBackgroundSessionPolicy _policy;
  final void Function(String sessionId)? _onRotated;

  AppBackgroundSessionPolicy get policy => _policy;

  /// Drive a lifecycle phase. Rotates the session when the policy says the
  /// background window elapsed, returning the (possibly new) session id, or
  /// `null` when no session is active/needed.
  String? onPhase(AppLifecyclePhase phase) {
    final mustRotate = _policy.onPhase(phase);
    if (!mustRotate) return null;
    final id = _session.start();
    _onRotated?.call(id);
    return id;
  }
}
