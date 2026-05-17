/// GA4-on-mobile sink = **Firebase Analytics** (internal-only).
///
/// On Android/iOS the canonical "GA4" target is the native Firebase Analytics
/// SDK (the Measurement Protocol is a desktop/web concern — Wave 2). This sink
/// implements the existing Dart [AnalyticsSink] SPI **verbatim** (no API/
/// contract change) and maps the canonical Segment envelope onto Firebase's
/// `logEvent` / `setUserId` / `setUserProperty` calls — the same canonical→GA4
/// mapping the web `@refraction-ui/analytics-sink-ga4` uses (issue #216).
///
/// Dependency stance (CLAUDE.md: minimize pub deps): `firebase_analytics` /
/// `firebase_core` are **real native plugins** (Gradle/CocoaPods, a
/// `GoogleService-Info.plist` / `google-services.json`, MethodChannels). A
/// dependency-free UI library MUST NOT force that onto every consumer. So,
/// exactly like the web epic treats the vendor lib as an optional never-
/// bundled peer, the SDK is reached through a tiny injectable **port**
/// ([FirebaseAnalyticsClient]). The consumer adds `firebase_analytics` to
/// *their* app and wires `FirebaseAnalytics.instance` in with a ~5-line
/// adapter (see README/compliance doc). Nothing is bundled; no public-API
/// change; the surface is identical on every target (off-mobile the consumer
/// simply does not register this sink).
///
/// Consent: declares `['analytics']` by default (per-sink categories — the
/// router's existing gate enforces it); the consuming app can require
/// additionally `['analytics','tracking']` so it only receives once iOS ATT
/// authorizes (Firebase honours ATT for IDFA-based features regardless).
library;

import 'dart:async';

import '../types.dart';
import 'consent_gate.dart' show kAnalyticsConsentCategory;

/// Injectable Firebase Analytics port — the exact surface this sink needs,
/// structurally satisfiable by a ~5-line adapter over the real
/// `firebase_analytics` plugin. Never bundled.
abstract class FirebaseAnalyticsClient {
  /// `FirebaseAnalytics.logEvent(name: name, parameters: params)`.
  FutureOr<void> logEvent(String name, Map<String, Object?> params);

  /// `FirebaseAnalytics.setUserId(id: id)` (null clears it on reset).
  FutureOr<void> setUserId(String? id);

  /// `FirebaseAnalytics.setUserProperty(name: name, value: value)`.
  FutureOr<void> setUserProperty(String name, String? value);
}

/// A recording in-memory [FirebaseAnalyticsClient] for tests / dry-run.
class RecordingFirebaseClient implements FirebaseAnalyticsClient {
  final List<({String name, Map<String, Object?> params})> events = [];
  final List<String?> userIds = [];
  final List<({String name, String? value})> userProperties = [];

  @override
  void logEvent(String name, Map<String, Object?> params) =>
      events.add((name: name, params: Map.of(params)));

  @override
  void setUserId(String? id) => userIds.add(id);

  @override
  void setUserProperty(String name, String? value) =>
      userProperties.add((name: name, value: value));
}

const List<String> _reservedPrefixes = ['google_', 'ga_', 'firebase_'];

/// Lower_snake_case + GA4/Firebase name rules (mirrors the web `toGa4Name`).
/// Firebase event/param names: <=40 chars, start with a letter, alnum/_, no
/// reserved prefixes.
String firebaseName(String name) {
  var snake = name
      .trim()
      .replaceAll(RegExp('[\'"]'), '')
      .replaceAll(RegExp(r'[^a-zA-Z0-9]+'), '_')
      .replaceAllMapped(RegExp(r'([a-z0-9])([A-Z])'), (m) => '${m[1]}_${m[2]}')
      .replaceAll(RegExp(r'_+'), '_')
      .replaceAll(RegExp(r'^_+|_+$'), '')
      .toLowerCase();
  if (snake.isEmpty) snake = 'event';
  var safe = RegExp(r'^[a-z]').hasMatch(snake) ? snake : 'e_$snake';
  if (_reservedPrefixes.any(safe.startsWith)) safe = 'x_$safe';
  if (safe.length > 40) safe = safe.substring(0, 40);
  return safe;
}

/// Map a canonical envelope to its Firebase event name (GA4 parity):
/// identify → none (only sets user id/properties), page→page_view,
/// screen→screen_view, group→group, alias→alias, track→snake(name).
String? firebaseEventName(AnalyticsEvent ev) {
  switch (ev.type) {
    case AnalyticsEventType.identify:
      return null;
    case AnalyticsEventType.page:
      return 'page_view';
    case AnalyticsEventType.screen:
      return 'screen_view';
    case AnalyticsEventType.group:
      return 'group';
    case AnalyticsEventType.alias:
      return 'alias';
    case AnalyticsEventType.track:
      return ev.event != null ? firebaseName(ev.event!) : 'track';
  }
}

/// Firebase param values must be String/num/bool — coerce everything else to
/// its string form (matches the plugin's own coercion expectations).
Object _coerceParam(Object v) {
  if (v is String || v is num || v is bool) return v;
  return v.toString();
}

/// Build Firebase `logEvent` params from a canonical envelope (mirrors the web
/// GA4 `toParams`: passes `properties` through snake-cased, aligns
/// `session_id`, maps page/screen/group/alias context).
Map<String, Object?> firebaseParams(AnalyticsEvent ev) {
  final params = <String, Object?>{};
  ev.properties?.forEach((k, v) {
    if (v == null) return;
    params[firebaseName(k)] = _coerceParam(v);
  });
  params['session_id'] = ev.sessionId;
  params['engagement_time_msec'] = params['engagement_time_msec'] ?? 1;

  final page = ev.context.page;
  if (ev.type == AnalyticsEventType.page ||
      ev.type == AnalyticsEventType.screen) {
    if (ev.event != null) {
      if (ev.type == AnalyticsEventType.screen) {
        params['screen_name'] = ev.event;
      } else {
        params['page_title'] = params['page_title'] ?? ev.event;
      }
    }
    if (page?.url != null && params['page_location'] == null) {
      params['page_location'] = page!.url;
    }
    if (page?.path != null && params['page_path'] == null) {
      params['page_path'] = page!.path;
    }
    if (page?.referrer != null && params['page_referrer'] == null) {
      params['page_referrer'] = page!.referrer;
    }
    if (page?.title != null && params['page_title'] == null) {
      params['page_title'] = page!.title;
    }
  }
  if (ev.type == AnalyticsEventType.group && ev.groupId != null) {
    params['group_id'] = ev.groupId;
  }
  if (ev.type == AnalyticsEventType.alias) {
    if (ev.userId != null) params['user_id'] = ev.userId;
    if (ev.previousId != null) params['previous_id'] = ev.previousId;
  }
  return params;
}

/// The Firebase-Analytics [AnalyticsSink]. Implements the existing SPI; maps
/// the canonical envelope onto the injected [FirebaseAnalyticsClient]. No
/// network here — delivery is the plugin's responsibility, fully mockable.
class FirebaseAnalyticsSink implements AnalyticsSink {
  FirebaseAnalyticsSink({
    required FirebaseAnalyticsClient client,
    List<String>? consentCategories,
  }) : _client = client,
       _consentCategories =
           consentCategories ?? const [kAnalyticsConsentCategory];

  final FirebaseAnalyticsClient _client;
  final List<String> _consentCategories;
  String? _lastUserId;

  @override
  String get name => 'firebase';

  @override
  List<String>? get consentCategories => _consentCategories;

  @override
  FutureOr<void> init(SinkInitContext ctx) {}

  @override
  Future<void> deliver(
    List<AnalyticsEvent> batch,
    SinkDeliverContext ctx,
  ) async {
    for (final ev in batch) {
      // User-ID parity: keep Firebase's user_id aligned with the envelope.
      final uid = ev.userId;
      if (uid != null && uid != _lastUserId) {
        _lastUserId = uid;
        await Future.sync(() => _client.setUserId(uid));
      }
      // identify/group traits → Firebase user properties (GA4 parity).
      if (ev.type == AnalyticsEventType.identify ||
          ev.type == AnalyticsEventType.group) {
        final traits = ev.traits;
        if (traits != null) {
          for (final e in traits.entries) {
            if (e.value == null) continue;
            await Future.sync(
              () => _client.setUserProperty(
                firebaseName(e.key),
                e.value.toString(),
              ),
            );
          }
        }
      }
      final name = firebaseEventName(ev);
      if (name != null) {
        await Future.sync(() => _client.logEvent(name, firebaseParams(ev)));
      }
    }
  }

  @override
  FutureOr<void> flush() {}

  @override
  Future<void> shutdown() async {
    // Privacy-safe reset: drop the Firebase user-id binding.
    _lastUserId = null;
    await Future.sync(() => _client.setUserId(null));
  }
}

/// Create the Firebase-Analytics (GA4-on-mobile) sink. Pass an adapter over
/// the consuming app's `FirebaseAnalytics.instance` as [client].
AnalyticsSink createFirebaseAnalyticsSink({
  required FirebaseAnalyticsClient client,
  List<String>? consentCategories,
}) =>
    FirebaseAnalyticsSink(client: client, consentCategories: consentCategories);
