/// Non-web lifecycle hook (android / ios / macos / windows / linux).
///
/// Internal implementation detail behind [LifecycleHook] — selected via the
/// conditional import in `lifecycle.dart`. On desktop/server targets it
/// listens for process termination signals (SIGTERM/SIGINT) so buffered
/// records are flushed on exit. On mobile, foreground/background lifecycle
/// transitions are driven by the Wave 1 engine layer through the same
/// [LifecycleHook] surface; the core stays platform-agnostic and never
/// imports Flutter widget bindings. Signal registration is guarded so it is
/// a safe no-op where signals are unsupported.
library;

import 'dart:async';
import 'dart:io';

import 'lifecycle.dart';

class _IoSubscription implements LifecycleSubscription {
  _IoSubscription(this._subs);

  final List<StreamSubscription<ProcessSignal>> _subs;
  bool _cancelled = false;

  @override
  void cancel() {
    if (_cancelled) return;
    _cancelled = true;
    for (final s in _subs) {
      unawaited(s.cancel());
    }
    _subs.clear();
  }
}

class _IoLifecycleHook implements LifecycleHook {
  const _IoLifecycleHook();

  @override
  LifecycleSubscription onExit(void Function() onExit) {
    final subs = <StreamSubscription<ProcessSignal>>[];
    void watch(ProcessSignal signal) {
      try {
        subs.add(signal.watch().listen((_) => onExit()));
      } catch (_) {
        // Signal unsupported on this platform (e.g. mobile) — safe no-op.
        // Mobile background flush is wired by the Wave 1 engine layer
        // through this same surface.
      }
    }

    watch(ProcessSignal.sigterm);
    watch(ProcessSignal.sigint);
    return _IoSubscription(subs);
  }
}

/// Non-web factory.
LifecycleHook createLifecycleHook() => const _IoLifecycleHook();
