/// PostHog Flutter sink (internal-only).
///
/// Implements the existing Dart [AnalyticsSink] SPI **verbatim** (no API/
/// contract change) and maps the canonical Segment envelope onto PostHog's
/// capture model — the same canonical→PostHog mapping the web
/// `@refraction-ui/analytics-sink-posthog` uses (epic #213): `track` verbatim,
/// `page`→`$pageview`, `screen`→`$screen`, `identify`→`$identify`+`$set`+
/// `$anon_distinct_id`, `group`→`$groupidentify`, `alias`→`$create_alias`;
/// `userId ?? anonymousId` → `distinct_id`; `messageId` → idempotency `uuid`.
///
/// Dependency stance (CLAUDE.md: minimize pub deps): `posthog_flutter` is a
/// **real native plugin** (Android/iOS PostHog SDKs via MethodChannels). A
/// dependency-free UI library MUST NOT force it onto every consumer — exactly
/// as the web epic keeps `posthog-js` an optional, never-bundled peer. The SDK
/// is reached through a tiny injectable **port** ([PostHogClient]); the
/// consumer adds `posthog_flutter` to *their* app and wires it in with a
/// ~5-line adapter. Nothing is bundled; no public-API change; uniform surface
/// on every target. No network here — delivery is the plugin's job, fully
/// mockable.
library;

import 'dart:async';

import '../types.dart';
import 'consent_gate.dart' show kAnalyticsConsentCategory;

/// One PostHog capture event (the `/capture` item shape; mirrors the web
/// `PostHogEvent`). Pure value object so the mapping is unit-testable with no
/// network.
class PostHogEvent {
  const PostHogEvent({
    required this.event,
    required this.distinctId,
    required this.properties,
    required this.timestamp,
    required this.uuid,
  });

  final String event;
  final String distinctId;
  final Map<String, Object?> properties;
  final String timestamp;
  final String uuid;

  Map<String, Object?> toJson() => {
    'event': event,
    'distinct_id': distinctId,
    'properties': properties,
    'timestamp': timestamp,
    'uuid': uuid,
  };
}

/// Injectable PostHog port — the surface this sink needs, satisfiable by a
/// ~5-line adapter over the real `posthog_flutter` plugin. Never bundled.
abstract class PostHogClient {
  /// `Posthog().capture(eventName: e.event, properties: e.properties)`
  /// (the adapter also forwards `distinct_id`/`uuid`/`timestamp`).
  FutureOr<void> capture(PostHogEvent event);

  /// `Posthog().flush()`.
  FutureOr<void> flush() {}

  /// `Posthog().reset()` — privacy-safe logout.
  FutureOr<void> reset() {}
}

/// A recording in-memory [PostHogClient] for tests / dry-run.
class RecordingPostHogClient implements PostHogClient {
  final List<PostHogEvent> events = [];
  int flushCalls = 0;
  int resetCalls = 0;

  @override
  void capture(PostHogEvent event) => events.add(event);

  @override
  void flush() => flushCalls++;

  @override
  void reset() => resetCalls++;
}

/// PostHog `distinct_id` for an envelope (`userId` once identified, else
/// `anonymousId`) — mirrors the web `distinctId`.
String posthogDistinctId(AnalyticsEvent ev) => ev.userId ?? ev.anonymousId;

Map<String, Object?> _contextProperties(AnalyticsEvent ev) {
  final ctx = ev.context;
  final props = <String, Object?>{
    r'$lib': ctx.library.name,
    r'$lib_version': ctx.library.version,
    'app': ctx.app,
    'env': ctx.env,
    r'$session_id': ev.sessionId,
    'anonymousId': ev.anonymousId,
  };
  final page = ctx.page;
  if (page != null) {
    if (page.url != null) props[r'$current_url'] = page.url;
    if (page.path != null) props[r'$pathname'] = page.path;
    if (page.referrer != null) props[r'$referrer'] = page.referrer;
    if (page.title != null) props['title'] = page.title;
    if (page.search != null) props[r'$search'] = page.search;
  }
  return props;
}

/// Map one canonical envelope → one PostHog event (mirrors the web
/// `toPostHogEvent` exactly).
PostHogEvent toPostHogEvent(AnalyticsEvent ev) {
  final props = _contextProperties(ev);
  final distinctId = posthogDistinctId(ev);
  switch (ev.type) {
    case AnalyticsEventType.identify:
      return PostHogEvent(
        event: r'$identify',
        distinctId: distinctId,
        properties: {
          ...props,
          r'$set': {...?ev.traits},
          r'$anon_distinct_id': ev.anonymousId,
        },
        timestamp: ev.timestamp,
        uuid: ev.messageId,
      );
    case AnalyticsEventType.group:
      final groupType = (ev.properties?['groupType'] as String?) ?? 'company';
      return PostHogEvent(
        event: r'$groupidentify',
        distinctId: distinctId,
        properties: {
          ...props,
          r'$group_type': groupType,
          r'$group_key': ev.groupId,
          r'$group_set': {...?ev.traits},
        },
        timestamp: ev.timestamp,
        uuid: ev.messageId,
      );
    case AnalyticsEventType.alias:
      return PostHogEvent(
        event: r'$create_alias',
        distinctId: distinctId,
        properties: {...props, 'alias': ev.previousId},
        timestamp: ev.timestamp,
        uuid: ev.messageId,
      );
    case AnalyticsEventType.page:
      return PostHogEvent(
        event: r'$pageview',
        distinctId: distinctId,
        properties: {...props, ...?ev.properties},
        timestamp: ev.timestamp,
        uuid: ev.messageId,
      );
    case AnalyticsEventType.screen:
      return PostHogEvent(
        event: r'$screen',
        distinctId: distinctId,
        properties: {...props, r'$screen_name': ev.event, ...?ev.properties},
        timestamp: ev.timestamp,
        uuid: ev.messageId,
      );
    case AnalyticsEventType.track:
      return PostHogEvent(
        event: ev.event ?? 'track',
        distinctId: distinctId,
        properties: {...props, ...?ev.properties},
        timestamp: ev.timestamp,
        uuid: ev.messageId,
      );
  }
}

/// Map a batch of canonical envelopes to PostHog events.
List<PostHogEvent> toPostHogBatch(List<AnalyticsEvent> batch) =>
    batch.map(toPostHogEvent).toList();

/// The PostHog [AnalyticsSink].
class PostHogSink implements AnalyticsSink {
  PostHogSink({required PostHogClient client, List<String>? consentCategories})
    : _client = client,
      _consentCategories =
          consentCategories ?? const [kAnalyticsConsentCategory];

  final PostHogClient _client;
  final List<String> _consentCategories;

  @override
  String get name => 'posthog';

  @override
  List<String>? get consentCategories => _consentCategories;

  @override
  FutureOr<void> init(SinkInitContext ctx) {}

  @override
  Future<void> deliver(
    List<AnalyticsEvent> batch,
    SinkDeliverContext ctx,
  ) async {
    for (final ev in toPostHogBatch(batch)) {
      await Future.sync(() => _client.capture(ev));
    }
  }

  @override
  Future<void> flush() async {
    await Future.sync(() => _client.flush());
  }

  @override
  Future<void> shutdown() async {
    // Privacy-safe reset — clears PostHog's local distinct id / queues.
    await Future.sync(() => _client.reset());
  }
}

/// Create the PostHog sink. Pass an adapter over the consuming app's
/// `Posthog()` instance as [client].
AnalyticsSink createPostHogSink({
  required PostHogClient client,
  List<String>? consentCategories,
}) => PostHogSink(client: client, consentCategories: consentCategories);
