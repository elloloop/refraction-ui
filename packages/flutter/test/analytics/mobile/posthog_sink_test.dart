import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/analytics/mobile/posthog_sink.dart';

AnalyticsEvent _ev(
  AnalyticsEventType type, {
  String? event,
  String anonymousId = 'anon-1',
  String? userId,
  String? groupId,
  String? previousId,
  AnalyticsProperties? properties,
  AnalyticsProperties? traits,
  AnalyticsPage? page,
}) => AnalyticsEvent(
  type: type,
  event: event,
  messageId: 'msg-42',
  anonymousId: anonymousId,
  userId: userId,
  groupId: groupId,
  previousId: previousId,
  sessionId: 'sess-7',
  properties: properties,
  traits: traits,
  context: AnalyticsContext(
    app: 'app',
    env: 'test',
    library: const AnalyticsLibrary(
      name: '@refraction-ui/analytics',
      version: '0.1.0',
    ),
    page: page,
  ),
  timestamp: '2026-05-17T00:00:00.000Z',
  schemaVersion: kSchemaVersion,
);

void main() {
  group('posthogDistinctId', () {
    test('userId once identified, else anonymousId', () {
      expect(posthogDistinctId(_ev(AnalyticsEventType.track)), 'anon-1');
      expect(
        posthogDistinctId(_ev(AnalyticsEventType.track, userId: 'u9')),
        'u9',
      );
    });
  });

  group('toPostHogEvent — canonical → PostHog (web parity)', () {
    test('track: name verbatim + context props + properties', () {
      final e = toPostHogEvent(
        _ev(AnalyticsEventType.track, event: 'Buy', properties: {'qty': 2}),
      );
      expect(e.event, 'Buy');
      expect(e.distinctId, 'anon-1');
      expect(e.uuid, 'msg-42');
      expect(e.timestamp, '2026-05-17T00:00:00.000Z');
      expect(e.properties[r'$lib'], '@refraction-ui/analytics');
      expect(e.properties[r'$session_id'], 'sess-7');
      expect(e.properties['app'], 'app');
      expect(e.properties['qty'], 2);
    });

    test('identify → \$identify with \$set + \$anon_distinct_id stitch', () {
      final e = toPostHogEvent(
        _ev(AnalyticsEventType.identify, userId: 'u9', traits: {'plan': 'pro'}),
      );
      expect(e.event, r'$identify');
      expect(e.distinctId, 'u9');
      expect(e.properties[r'$set'], {'plan': 'pro'});
      expect(e.properties[r'$anon_distinct_id'], 'anon-1');
    });

    test('page → \$pageview, screen → \$screen with \$screen_name', () {
      expect(
        toPostHogEvent(_ev(AnalyticsEventType.page, event: 'Home')).event,
        r'$pageview',
      );
      final s = toPostHogEvent(
        _ev(AnalyticsEventType.screen, event: 'Dashboard'),
      );
      expect(s.event, r'$screen');
      expect(s.properties[r'$screen_name'], 'Dashboard');
    });

    test('group → \$groupidentify with \$group_set', () {
      final e = toPostHogEvent(
        _ev(
          AnalyticsEventType.group,
          groupId: 'org_1',
          traits: {'name': 'Acme'},
          properties: {'groupType': 'team'},
        ),
      );
      expect(e.event, r'$groupidentify');
      expect(e.properties[r'$group_type'], 'team');
      expect(e.properties[r'$group_key'], 'org_1');
      expect(e.properties[r'$group_set'], {'name': 'Acme'});
    });

    test('alias → \$create_alias linking previousId', () {
      final e = toPostHogEvent(
        _ev(AnalyticsEventType.alias, userId: 'u2', previousId: 'u1'),
      );
      expect(e.event, r'$create_alias');
      expect(e.properties['alias'], 'u1');
    });

    test('page context flattens to PostHog props', () {
      final e = toPostHogEvent(
        _ev(
          AnalyticsEventType.page,
          event: 'Home',
          page: const AnalyticsPage(
            url: 'https://x/h',
            path: '/h',
            referrer: 'https://r',
            title: 'T',
            search: '?q=1',
          ),
        ),
      );
      expect(e.properties[r'$current_url'], 'https://x/h');
      expect(e.properties[r'$pathname'], '/h');
      expect(e.properties[r'$referrer'], 'https://r');
      expect(e.properties['title'], 'T');
      expect(e.properties[r'$search'], '?q=1');
    });

    test('toPostHogBatch maps each envelope', () {
      final b = toPostHogBatch([
        _ev(AnalyticsEventType.track, event: 'A'),
        _ev(AnalyticsEventType.track, event: 'B'),
      ]);
      expect(b.map((e) => e.event), ['A', 'B']);
    });

    test('toJson shape matches the PostHog capture item', () {
      final j = toPostHogEvent(
        _ev(AnalyticsEventType.track, event: 'A'),
      ).toJson();
      expect(
        j.keys,
        containsAll([
          'event',
          'distinct_id',
          'properties',
          'timestamp',
          'uuid',
        ]),
      );
    });
  });

  group('PostHogSink — SPI + delivery (mock, no network)', () {
    test('implements the existing AnalyticsSink SPI; default category', () {
      final sink = createPostHogSink(client: RecordingPostHogClient());
      expect(sink, isA<AnalyticsSink>());
      expect(sink.name, 'posthog');
      expect(sink.consentCategories, ['analytics']);
    });

    test('captures via the injected client; flush/shutdown delegate', () async {
      final ph = RecordingPostHogClient();
      final sink = createPostHogSink(client: ph);
      await sink.deliver([
        _ev(AnalyticsEventType.track, event: 'A'),
        _ev(AnalyticsEventType.identify, userId: 'u1'),
      ], const SinkDeliverContext(unload: false));
      await sink.flush();
      await sink.shutdown();

      expect(ph.events.map((e) => e.event), ['A', r'$identify']);
      expect(ph.flushCalls, 1);
      expect(ph.resetCalls, 1); // privacy-safe reset
    });

    test('integrates behind createAnalytics; consent-gated per sink', () async {
      final ph = RecordingPostHogClient();
      final a = createAnalytics(
        AnalyticsConfig(
          app: 'app',
          env: 'development',
          sinks: [
            createPostHogSink(client: ph, consentCategories: ['product']),
          ],
          session: SessionConfig(storage: createMemoryStorage()),
          identity: IdentityConfig(storage: createMemoryStorage()),
          consent: const ConsentConfig(granted: []),
        ),
      );
      a.track('blocked');
      await Future<void>.delayed(Duration.zero);
      expect(ph.events, isEmpty); // 'product' not granted

      a.consent.grant(['product']);
      a.screen('Dashboard');
      await Future<void>.delayed(Duration.zero);
      expect(ph.events.single.event, r'$screen');
      expect(ph.events.single.properties[r'$screen_name'], 'Dashboard');
    });
  });
}
