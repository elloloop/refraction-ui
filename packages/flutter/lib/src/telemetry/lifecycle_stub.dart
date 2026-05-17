/// Fallback lifecycle hook used when neither `dart:io` nor web interop is
/// available (e.g. pure unit-test VM with no platform signals). It registers
/// nothing — the manager's explicit `flush()` still works everywhere. This
/// keeps the core fully platform-agnostic.
library;

import 'lifecycle.dart';

class _NoopSubscription implements LifecycleSubscription {
  const _NoopSubscription();

  @override
  void cancel() {}
}

class _StubLifecycleHook implements LifecycleHook {
  const _StubLifecycleHook();

  @override
  LifecycleSubscription onExit(void Function() onExit) =>
      const _NoopSubscription();
}

/// Platform-default factory (no signals available).
LifecycleHook createLifecycleHook() => const _StubLifecycleHook();
