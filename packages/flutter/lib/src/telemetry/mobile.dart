/// Mobile (iOS/Android) + desktop telemetry integration — the single
/// opt-in entry point that wires the Wave-1 internals together behind the
/// existing surface:
///
///  - native device/app context auto-attach (a `device` sub-context on every
///    record, via a [Telemetry.child]),
///  - crash capture (`FlutterError` + `PlatformDispatcher` + isolate) with
///    crash-on-next-launch persistence,
///  - ATT/IDFA + consent sequencing (no IDs before consent).
///
/// The base [createTelemetry] already handles engine wiring, the durable
/// queue (when a [createDurableSink] is registered) and lifecycle flush
/// (`AppLifecycleState.paused/inactive/detached` via the conditional
/// `lifecycle_io.dart`). This helper is additive and **does not change the
/// public API**: it returns a `Telemetry` that is used exactly like the one
/// from `createTelemetry`, identical across web / android / ios / desktop.
library;

import 'att_gate.dart';
import 'crash_capture.dart';
import 'durable_store.dart';
import 'native_context.dart';
import 'types.dart';

/// Result of [installMobileTelemetry]: the context-enriched telemetry plus
/// the crash guard and the ATT/consent gate the host drives.
class MobileTelemetry {
  /// Creates a [MobileTelemetry].
  const MobileTelemetry({
    required this.telemetry,
    required this.crashGuard,
    required this.consent,
  });

  /// Use exactly like the return of `createTelemetry` — every record carries
  /// the native `device` context, crashes are captured, and the gate is
  /// honored. Calling `child()` keeps all of that.
  final Telemetry telemetry;

  /// Installed crash guard (call `dispose()` to detach hooks; mostly tests).
  final TelemetryCrashGuard crashGuard;

  /// ATT / consent gate the host drives from its own ATT prompt result.
  final TelemetryConsent consent;
}

/// Wire native context + crash capture + consent onto an existing [base]
/// telemetry (from `createTelemetry`).
///
/// - [overrides] supplies app version/build (no plugin dependency).
/// - [store] controls crash-on-next-launch persistence.
/// - [consent] lets the host pass a pre-seeded gate (e.g. ATT already
///   resolved); defaults to `notDetermined` (safe — no tracking id emitted).
/// - [installIsolateListener] / [now] forwarded to crash capture (tests).
MobileTelemetry installMobileTelemetry(
  Telemetry base, {
  NativeContextOverrides? overrides,
  DurableStore? store,
  TelemetryConsent? consent,
  bool installIsolateListener = true,
  DateTime Function()? now,
}) {
  final gate = consent ?? TelemetryConsent();

  // Native context as a bound child — non-identifying, attached once. The
  // tracking id (if any) is added ONLY via gate.trackingContext(), which is
  // empty until ATT authorization, enforcing "no IDs before consent".
  final native = NativeContext.resolve(overrides);
  final boundCtx = <String, Object?>{
    if (native.isNotEmpty) 'device': native.values,
    ...gate.trackingContext(),
  };
  final enriched =
      boundCtx.isEmpty ? base : base.child(boundCtx);

  final guard = installCrashCapture(
    enriched,
    store: store,
    installIsolateListener: installIsolateListener,
    now: now,
  );

  return MobileTelemetry(
    telemetry: enriched,
    crashGuard: guard,
    consent: gate,
  );
}
