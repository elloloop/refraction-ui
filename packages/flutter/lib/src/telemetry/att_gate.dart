/// App Tracking Transparency (ATT) / IDFA gate + consent sequencing.
///
/// **This package never reads the IDFA / advertising identifier itself.** It
/// has no `app_tracking_transparency` / ads dependency and emits no device
/// advertising ID in the native context (see `native_context_io.dart` —
/// only OS name/version, coarse model, locale, app version/build). This gate
/// exists so a consuming app that *does* attach an ad/tracking identifier (or
/// any cross-app identifier) can sequence it correctly for App Store review:
///
///  1. Telemetry starts in [TrackingState.notDetermined] — **no tracking
///     identifier is attached, no tracking-scoped record is delivered**.
///  2. The app shows the OS ATT prompt (its own code / plugin) and calls
///     [TelemetryConsent.setTrackingAuthorized] with the result.
///  3. Only after `authorized` may the app add tracking identifiers; the
///     gate exposes [TelemetryConsent.allowsTracking] so the integration can
///     branch. Until then `attachTrackingId` is a guarded no-op.
///
/// Analytics-style category consent (Wave-0's `Consent`) is orthogonal and
/// still applies; this is specifically the iOS ATT / IDFA sequencing the
/// store requires. Uniform surface: on Android / web there is no ATT prompt,
/// so the state simply starts `notApplicable` and tracking is governed solely
/// by category consent — same API, no platform branching for the consumer.
library;

/// ATT-equivalent authorization state. Mirrors Apple's
/// `ATTrackingManager.AuthorizationStatus` semantics without importing it.
enum TrackingState {
  /// iOS, prompt not yet shown — treat as "no tracking".
  notDetermined,

  /// User allowed app-tracking (IDFA readable by the app).
  authorized,

  /// User declined, or tracking is restricted by policy/MDM.
  denied,

  /// No ATT concept on this platform (Android < ad-id changes / web / desktop)
  /// — tracking is governed by category consent only.
  notApplicable,
}

/// Sequencing gate. The consuming integration drives [setTrackingAuthorized]
/// from its own ATT prompt result; refraction-ui never shows the prompt nor
/// reads the IDFA.
class TelemetryConsent {
  /// Start in [TrackingState.notDetermined] (the safe default for iOS) unless
  /// the host knows ATT does not apply.
  TelemetryConsent({TrackingState initial = TrackingState.notDetermined})
    : _state = initial;

  TrackingState _state;
  String? _trackingId;

  /// Current ATT-equivalent state.
  TrackingState get state => _state;

  /// `true` only when the user explicitly authorized tracking. While this is
  /// `false`, NO tracking/advertising identifier may be attached or emitted.
  bool get allowsTracking => _state == TrackingState.authorized;

  /// Record the OS ATT prompt result (or `notApplicable` on non-iOS). If the
  /// user later revokes, calling this with `denied` clears any attached id so
  /// it stops being emitted.
  void setTrackingAuthorized(TrackingState result) {
    _state = result;
    if (!allowsTracking) {
      _trackingId = null;
    }
  }

  /// Attach a tracking/advertising identifier the *host* obtained AFTER ATT
  /// authorization. Guarded: ignored unless [allowsTracking] — so an
  /// identifier can never be set before consent (store-rejection risk).
  /// Returns whether it was accepted.
  bool attachTrackingId(String id) {
    if (!allowsTracking) return false;
    _trackingId = id;
    return true;
  }

  /// The tracking id to merge into context, or `null` while not authorized.
  /// Telemetry context-builders MUST gate on this (never read it directly
  /// from a platform API before consent).
  String? get trackingId => allowsTracking ? _trackingId : null;

  /// Extra context to merge only when tracking is authorized & an id is set.
  /// Empty (and therefore omitted) until consent is granted — this is the
  /// "no IDs before consent" guarantee in one place.
  Map<String, Object?> trackingContext() {
    final id = trackingId;
    if (id == null) return const <String, Object?>{};
    return <String, Object?>{'trackingId': id};
  }
}
