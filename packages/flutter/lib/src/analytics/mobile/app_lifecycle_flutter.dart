/// Flutter app-lifecycle hook (Android / iOS / desktop).
///
/// Internal implementation detail behind [AppLifecycleHook] — selected via
/// the conditional import in `app_lifecycle.dart` whenever `dart:ui` is
/// available (any Flutter target). Maps Flutter's `AppLifecycleState` onto the
/// dependency-free [AppLifecyclePhase] the pure session policy understands:
///   resumed                       → AppLifecyclePhase.resumed
///   inactive/paused/hidden/detached → AppLifecyclePhase.background
///
/// Uses only `package:flutter`'s `WidgetsBinding` (already a transitive
/// dependency of this Flutter package — NOT a new pub dependency) and never
/// touches the IDFA or any device identifier.
library;

import 'package:flutter/widgets.dart';

import 'app_bg_session.dart';
import 'app_lifecycle.dart';

class _Observer with WidgetsBindingObserver {
  _Observer(this._onPhase);
  final void Function(AppLifecyclePhase) _onPhase;

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.resumed:
        _onPhase(AppLifecyclePhase.resumed);
      case AppLifecycleState.inactive:
      case AppLifecycleState.paused:
      case AppLifecycleState.hidden:
      case AppLifecycleState.detached:
        _onPhase(AppLifecyclePhase.background);
    }
  }
}

class _FlutterSubscription implements AppLifecycleSubscription {
  _FlutterSubscription(this._observer);
  final _Observer _observer;
  bool _cancelled = false;

  @override
  void cancel() {
    if (_cancelled) return;
    _cancelled = true;
    WidgetsBinding.instance.removeObserver(_observer);
  }
}

class _FlutterAppLifecycleHook implements AppLifecycleHook {
  const _FlutterAppLifecycleHook();

  @override
  AppLifecycleSubscription listen(void Function(AppLifecyclePhase) onPhase) {
    // Ensure the binding exists (safe to call repeatedly).
    WidgetsFlutterBinding.ensureInitialized();
    final observer = _Observer(onPhase);
    WidgetsBinding.instance.addObserver(observer);
    return _FlutterSubscription(observer);
  }
}

/// Flutter factory (any target with `dart:ui`).
AppLifecycleHook createAppLifecycleHook() => const _FlutterAppLifecycleHook();
