/// Mobile consent / App Tracking Transparency sequencing (internal-only).
///
/// Store-review-blocking rules this enforces (epic #230 §3 — MANDATORY):
///
///   1. **No identifiers before consent.** The persistent `anonymousId` /
///      session is not minted or written to disk until the relevant consent
///      categories are granted (see [ConsentGatedSecureStorage]); this
///      controller is the runtime gate that flips that on.
///
///   2. **iOS App Tracking Transparency / IDFA.** The IDFA (and any
///      cross-app/"tracking" category) stays **denied** until the ATT prompt
///      has been *shown* and *authorized*. ATT must be requested **after**
///      first frame and **before** any tracking-category sink can receive —
///      this controller sequences that and never auto-shows the prompt
///      (the consuming app decides when, per Apple's HIG).
///
///   3. **Per-sink consent categories.** Each sink already declares
///      `consentCategories`; this controller maps the platform consent
///      signals (ATT status, the app's own consent UI) onto the core
///      [ConsentApi] so the router's existing per-sink gate (`Consent.allows`)
///      does the enforcement — no router/API change.
///
/// The IDFA itself is never read or stored by this library (zero
/// device-identifier collection); we only gate the *tracking* category so the
/// consuming app passes review. All of this is internal and identical across
/// targets — ATT is simply inert off-iOS.
library;

import 'dart:async';

import '../types.dart';

/// iOS ATT authorization status (mirrors `ATTrackingManager`'s enum; kept
/// dependency-free so it is uniform and testable off-device).
enum AttStatus {
  /// User has not yet seen the ATT prompt.
  notDetermined,

  /// Tracking restricted by device policy (MDM / parental controls).
  restricted,

  /// User explicitly denied tracking.
  denied,

  /// User authorized tracking (IDFA/cross-app permitted).
  authorized,

  /// Not applicable (Android / desktop / web / pre-iOS-14) — treated as a
  /// platform where ATT does not gate, so the app's own consent governs.
  notApplicable,
}

/// Injectable ATT port. The consumer (or the engine layer's platform
/// resolver) supplies the real `app_tracking_transparency` plugin; nothing is
/// bundled. Off-iOS this resolves to a provider that returns
/// [AttStatus.notApplicable].
abstract class TrackingAuthorization {
  /// Current ATT status without prompting.
  FutureOr<AttStatus> status();

  /// Show the system ATT prompt (no-op + returns current status if already
  /// determined / not applicable). The consuming app calls this from its own
  /// flow — this library never auto-prompts.
  FutureOr<AttStatus> request();
}

/// Default [TrackingAuthorization] for platforms with no ATT (Android,
/// desktop, web). Always [AttStatus.notApplicable] so it never blocks the
/// app's own consent decision.
class NoAttAuthorization implements TrackingAuthorization {
  const NoAttAuthorization();

  @override
  AttStatus status() => AttStatus.notApplicable;

  @override
  AttStatus request() => AttStatus.notApplicable;
}

/// A scriptable [TrackingAuthorization] for tests and for the engine layer to
/// adapt a real plugin onto.
class ScriptedTrackingAuthorization implements TrackingAuthorization {
  ScriptedTrackingAuthorization({
    AttStatus initial = AttStatus.notDetermined,
    AttStatus? onRequest,
  }) : _status = initial,
       _onRequest = onRequest ?? AttStatus.authorized;

  AttStatus _status;
  final AttStatus _onRequest;
  int requestCount = 0;

  @override
  AttStatus status() => _status;

  @override
  AttStatus request() {
    requestCount++;
    if (_status == AttStatus.notDetermined) _status = _onRequest;
    return _status;
  }
}

/// The consent category gated by iOS ATT / Android advertising-id (a sink that
/// requires this is only fed once tracking is authorized).
const String kTrackingConsentCategory = 'tracking';

/// The baseline product-analytics category (first-party, no cross-app id).
const String kAnalyticsConsentCategory = 'analytics';

/// Sequences platform tracking-authorization + the app's consent UI onto the
/// core [ConsentApi], and exposes the runtime hook the gated identity store
/// uses to decide whether persistence is permitted.
///
/// Sequencing contract:
///   - Construction grants nothing implicitly; [hasPersistenceConsent] is
///     `false` until [grantBaseline] (the app's own analytics consent) so no
///     id is minted/persisted pre-consent.
///   - The `tracking` category is granted **only** after [syncTracking]
///     observes [AttStatus.authorized] (iOS) or, off-iOS
///     ([AttStatus.notApplicable]), after the app explicitly opts the
///     `tracking` category in via [grant].
///   - [revokeAll] / consent withdrawal removes every category and signals
///     the identity store to purge.
class MobileConsentController {
  MobileConsentController({
    required ConsentApi consent,
    TrackingAuthorization? att,
    List<String> baselineCategories = const [kAnalyticsConsentCategory],
    Future<void> Function()? onPurge,
  }) : _consent = consent,
       _att = att ?? const NoAttAuthorization(),
       _baseline = List.unmodifiable(baselineCategories),
       _onPurge = onPurge;

  final ConsentApi _consent;
  final TrackingAuthorization _att;
  final List<String> _baseline;
  final Future<void> Function()? _onPurge;

  bool _baselineGranted = false;
  AttStatus _lastAtt = AttStatus.notDetermined;

  /// The categories considered the app's first-party analytics baseline.
  List<String> get baselineCategories => _baseline;

  /// Last observed ATT status.
  AttStatus get attStatus => _lastAtt;

  /// True once the app's own analytics consent has been granted — this is the
  /// predicate the [ConsentGatedSecureStorage] consults so identity is only
  /// persisted post-consent.
  bool hasPersistenceConsent() => _baselineGranted;

  /// Grant the first-party analytics baseline (call this when the consuming
  /// app's consent UI is accepted). Idempotent.
  void grantBaseline() {
    if (_baselineGranted) return;
    _baselineGranted = true;
    _consent.grant(_baseline);
  }

  /// Grant arbitrary extra categories (the app's consent UI may collect more,
  /// e.g. `marketing`). Granting [kTrackingConsentCategory] off-iOS is the
  /// app's explicit opt-in; on iOS prefer [syncTracking].
  void grant(List<String> categories) => _consent.grant(categories);

  /// Read the current ATT status and reconcile the `tracking` category:
  /// granted iff authorized (iOS) — never granted while notDetermined /
  /// denied / restricted. Off-iOS ([AttStatus.notApplicable]) this is a no-op
  /// (the app governs `tracking` via [grant]). Returns the observed status.
  Future<AttStatus> syncTracking() async {
    final s = await _att.status();
    _lastAtt = s;
    _reconcileTracking(s);
    return s;
  }

  /// Show the ATT prompt (delegated to the injected port — the consuming app
  /// decides *when*; Apple requires it after first frame). Reconciles the
  /// `tracking` category with the resulting status. No-op off-iOS.
  Future<AttStatus> requestTracking() async {
    final s = await _att.request();
    _lastAtt = s;
    _reconcileTracking(s);
    return s;
  }

  void _reconcileTracking(AttStatus s) {
    if (s == AttStatus.authorized) {
      _consent.grant(const [kTrackingConsentCategory]);
    } else if (s == AttStatus.denied || s == AttStatus.restricted) {
      // Explicit denial — make sure no tracking-category sink can receive.
      _consent.revoke(const [kTrackingConsentCategory]);
    }
    // notDetermined / notApplicable: leave tracking ungranted (the default);
    // the app may still opt in off-iOS via grant().
  }

  /// Withdraw all consent: revoke every known category and purge persisted
  /// identity (privacy-safe). After this no id is minted/persisted until
  /// consent is granted again.
  Future<void> revokeAll() async {
    _consent.revoke([..._consent.granted()]);
    _baselineGranted = false;
    if (_onPurge != null) await _onPurge();
  }
}
