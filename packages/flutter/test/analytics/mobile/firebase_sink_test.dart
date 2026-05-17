import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/analytics/mobile/firebase_sink.dart';

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
  messageId: 'msg-1',
  anonymousId: anonymousId,
  userId: userId,
  groupId: groupId,
  previousId: previousId,
  sessionId: 'sess-1',
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
  group('firebaseName — GA4/Firebase name rules', () {
    test('lower_snake_cases, strips quotes, dedups underscores', () {
      expect(firebaseName('Signup Clicked'), 'signup_clicked');
      expect(firebaseName('camelCaseName'), 'camel_case_name');
      // Quotes are stripped (web `toGa4Name` parity), not turned into "_".
      expect(firebaseName("O'Brien's Event"), 'obriens_event');
    });

    test('prefixes names that do not start with a letter', () {
      expect(firebaseName('123abc'), 'e_123abc');
    });

    test('escapes GA4 reserved prefixes', () {
      expect(firebaseName('firebase_x'), 'x_firebase_x');
      expect(firebaseName('google_thing'), 'x_google_thing');
    });

    test('caps at 40 chars', () {
      expect(firebaseName('a' * 60).length, 40);
    });
  });

  group('firebaseEventName — canonical → GA4 event name', () {
    test('maps every Segment type', () {
      expect(firebaseEventName(_ev(AnalyticsEventType.identify)), isNull);
      expect(firebaseEventName(_ev(AnalyticsEventType.page)), 'page_view');
      expect(firebaseEventName(_ev(AnalyticsEventType.screen)), 'screen_view');
      expect(firebaseEventName(_ev(AnalyticsEventType.group)), 'group');
      expect(firebaseEventName(_ev(AnalyticsEventType.alias)), 'alias');
      expect(
        firebaseEventName(_ev(AnalyticsEventType.track, event: 'Buy Now')),
        'buy_now',
      );
    });
  });

  group('firebaseParams — envelope → params', () {
    test('passes properties through (snake-cased) + session alignment', () {
      final p = firebaseParams(
        _ev(
          AnalyticsEventType.track,
          event: 'X',
          properties: {'planType': 'pro', 'count': 3},
        ),
      );
      expect(p['plan_type'], 'pro');
      expect(p['count'], 3);
      expect(p['session_id'], 'sess-1');
      expect(p['engagement_time_msec'], 1);
    });

    test('coerces non-primitive param values to string', () {
      final p = firebaseParams(
        _ev(
          AnalyticsEventType.track,
          event: 'X',
          properties: {
            'list': [1, 2],
          },
        ),
      );
      expect(p['list'], '[1, 2]');
    });

    test('screen/page map context to page_/screen_ params', () {
      final screen = firebaseParams(
        _ev(AnalyticsEventType.screen, event: 'Dashboard'),
      );
      expect(screen['screen_name'], 'Dashboard');

      final pg = firebaseParams(
        _ev(
          AnalyticsEventType.page,
          event: 'Home',
          page: const AnalyticsPage(path: '/h', url: 'https://x/h'),
        ),
      );
      expect(pg['page_title'], 'Home');
      expect(pg['page_path'], '/h');
      expect(pg['page_location'], 'https://x/h');
    });

    test('group/alias carry their ids', () {
      final g = firebaseParams(
        _ev(AnalyticsEventType.group, groupId: 'org_1'),
      );
      expect(g['group_id'], 'org_1');
      final a = firebaseParams(
        _ev(AnalyticsEventType.alias, userId: 'u2', previousId: 'u1'),
      );
      expect(a['user_id'], 'u2');
      expect(a['previous_id'], 'u1');
    });
  });

  group('FirebaseAnalyticsSink — SPI + delivery (mock, no network)', () {
    test('implements the existing AnalyticsSink SPI; default category', () {
      final sink = createFirebaseAnalyticsSink(
        client: RecordingFirebaseClient(),
      );
      expect(sink, isA<AnalyticsSink>());
      expect(sink.name, 'firebase');
      expect(sink.consentCategories, ['analytics']);
    });

    test('logs track via the injected client; sets user id once', () async {
      final fb = RecordingFirebaseClient();
      final sink = createFirebaseAnalyticsSink(client: fb);
      await sink.deliver([
        _ev(AnalyticsEventType.track, event: 'A', userId: 'u1'),
        _ev(AnalyticsEventType.track, event: 'B', userId: 'u1'),
      ], const SinkDeliverContext(unload: false));

      expect(fb.events.map((e) => e.name), ['a', 'b']);
      expect(fb.userIds, ['u1']); // set once (de-duped on change)
    });

    test('identify sets user properties, emits no event', () async {
      final fb = RecordingFirebaseClient();
      final sink = createFirebaseAnalyticsSink(client: fb);
      await sink.deliver([
        _ev(
          AnalyticsEventType.identify,
          userId: 'u9',
          traits: {'plan': 'pro', 'orgName': 'Acme'},
        ),
      ], const SinkDeliverContext(unload: false));

      expect(fb.events, isEmpty); // identify emits no GA4 event
      expect(fb.userIds, ['u9']);
      final byName = {for (final p in fb.userProperties) p.name: p.value};
      expect(byName['plan'], 'pro');
      expect(byName['org_name'], 'Acme');
    });

    test('shutdown clears the Firebase user-id binding (privacy reset)',
        () async {
      final fb = RecordingFirebaseClient();
      final sink = createFirebaseAnalyticsSink(client: fb);
      await sink.deliver([
        _ev(AnalyticsEventType.track, event: 'A', userId: 'u1'),
      ], const SinkDeliverContext(unload: false));
      await sink.shutdown();
      expect(fb.userIds, ['u1', null]);
    });

    test('integrates with createAnalytics behind the existing surface',
        () async {
      final fb = RecordingFirebaseClient();
      final a = createAnalytics(
        AnalyticsConfig(
          app: 'app',
          env: 'development',
          sinks: [createFirebaseAnalyticsSink(client: fb)],
          session: SessionConfig(storage: createMemoryStorage()),
          identity: IdentityConfig(storage: createMemoryStorage()),
          consent: const ConsentConfig(granted: ['analytics']),
        ),
      );
      a.track('Signup Clicked', {'plan': 'pro'});
      await Future<void>.delayed(Duration.zero);
      expect(fb.events.single.name, 'signup_clicked');
      expect(fb.events.single.params['plan'], 'pro');
    });

    test('consent gate blocks the sink until its category is granted',
        () async {
      final fb = RecordingFirebaseClient();
      final a = createAnalytics(
        AnalyticsConfig(
          app: 'app',
          env: 'development',
          sinks: [createFirebaseAnalyticsSink(client: fb)],
          session: SessionConfig(storage: createMemoryStorage()),
          identity: IdentityConfig(storage: createMemoryStorage()),
          consent: const ConsentConfig(granted: []),
        ),
      );
      a.track('blocked');
      await Future<void>.delayed(Duration.zero);
      expect(fb.events, isEmpty);

      a.consent.grant(['analytics']);
      a.track('allowed');
      await Future<void>.delayed(Duration.zero);
      expect(fb.events.single.name, 'allowed');
    });
  });
}
