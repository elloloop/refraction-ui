/// Non-web lifecycle hook (android / ios / macos / windows / linux).
///
/// Internal implementation detail behind [LifecycleHook] — selected via the
/// conditional import in `lifecycle.dart`. Wave-1 mobile wiring:
///
///  - When a Flutter binding is available it attaches a
///    [WidgetsBindingObserver] and fires the exit callback on
///    `AppLifecycleState.paused`, `.inactive`, and `.detached`. This is the
///    mobile replacement for the web `pagehide`/`visibilitychange` beacon:
///    the OS can suspend/kill a backgrounded app at any moment, so the queue
///    is flushed the instant it leaves the foreground.
///  - It ALSO watches `SIGTERM`/`SIGINT` so desktop (macOS/Windows/Linux)
///    and server runs still flush on process termination. Signal
///    registration is guarded so it is a safe no-op where signals are
///    unsupported (mobile).
///
/// The core's public surface and the manager are unchanged; this stays behind
/// the single [LifecycleHook] abstraction and is uniform across all targets.
library;

import 'dart:async';
import 'dart:io';

import 'package:flutter/widgets.dart';

import 'lifecycle.dart';

class _LifecycleObserver with WidgetsBindingObserver {
  _LifecycleObserver(this._onExit);

  final void Function() _onExit;
  AppLifecycleState? _last;

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // Flush whenever we transition into a not-foreground state. Guard against
    // repeated identical callbacks (inactive↔paused churn) so we don't spam
    // flushes, while still flushing once per backgrounding.
    final leavingForeground =
        state == AppLifecycleState.paused ||
        state == AppLifecycleState.inactive ||
        state == AppLifecycleState.detached;
    if (leavingForeground && _last != state) {
      _onExit();
    }
    _last = state;
  }
}

class _IoSubscription implements LifecycleSubscription {
  _IoSubscription(this._subs, this._observer);

  final List<StreamSubscription<ProcessSignal>> _subs;
  final _LifecycleObserver? _observer;
  bool _cancelled = false;

  @override
  void cancel() {
    if (_cancelled) return;
    _cancelled = true;
    for (final s in _subs) {
      unawaited(s.cancel());
    }
    _subs.clear();
    final obs = _observer;
    if (obs != null) {
      final binding = WidgetsBinding.instance;
      // ignore: unnecessary_null_comparison
      if (binding != null) binding.removeObserver(obs);
    }
  }
}

class _IoLifecycleHook implements LifecycleHook {
  const _IoLifecycleHook();

  @override
  LifecycleSubscription onExit(void Function() onExit) {
    _LifecycleObserver? observer;
    // App-lifecycle (mobile background = beacon equivalent). Only when a
    // Flutter binding exists (it won't in a plain `dart test` VM — desktop
    // signal handling below still covers process exit there).
    try {
      final binding = WidgetsBinding.instance;
      // ignore: unnecessary_null_comparison
      if (binding != null) {
        observer = _LifecycleObserver(onExit);
        binding.addObserver(observer);
      }
    } catch (_) {
      // No binding (pure unit-test VM) — signals/explicit flush still work.
    }

    // Process-termination signals (desktop / server).
    final subs = <StreamSubscription<ProcessSignal>>[];
    void watch(ProcessSignal signal) {
      try {
        subs.add(signal.watch().listen((_) => onExit()));
      } catch (_) {
        // Signal unsupported on this platform (e.g. mobile) — safe no-op;
        // the WidgetsBindingObserver above already covers mobile background.
      }
    }

    watch(ProcessSignal.sigterm);
    watch(ProcessSignal.sigint);
    return _IoSubscription(subs, observer);
  }
}

/// Non-web factory.
LifecycleHook createLifecycleHook() => const _IoLifecycleHook();
