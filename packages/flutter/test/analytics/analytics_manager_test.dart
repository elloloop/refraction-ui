import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart'
    hide createMockSink, MockSinkExtended;
// Test-only mock sink — imported directly (intentionally NOT re-exported by
// the analytics or package barrels, where it would collide with telemetry's
// flat-barrel createMockSink / MockSinkExtended).
import 'package:refraction_ui/src/analytics/mock_sink.dart';

/// Let the dev-preset microtask delivery settle.
Future<void> pump() => Future<void>.delayed(Duration.zero);

({Analytics a, MockSink sink}) devConfig({
  MockSink? sink,
  double sampleRate = 1,
  List<String> redactKeys = const [],
  double Function()? random,
}) {
  final s = sink ?? createMockSink();
  final a = createAnalytics(
    AnalyticsConfig(
      app: 'test-app',
      env: 'development',
      sinks: [s],
      session: SessionConfig(storage: createMemoryStorage()),
      identity: IdentityConfig(storage: createMemoryStorage()),
      consent: const ConsentConfig(granted: ['analytics']),
      sampleRate: sampleRate,
      redactKeys: redactKeys,
      random: random,
    ),
  );
  return (a: a, sink: s);
}

void main() {
  group('createAnalytics — envelope shape', () {
    test('emits a canonical Segment track envelope', () async {
      final c = devConfig();
      c.a.track('Signup Clicked', {'plan': 'pro'});
      await pump();
      expect(c.sink.events, hasLength(1));
      final ev = c.sink.events[0];
      expect(ev.type, AnalyticsEventType.track);
      expect(ev.event, 'Signup Clicked');
      expect(ev.properties, containsPair('plan', 'pro'));
      expect(isUuidV4(ev.messageId), isTrue);
      expect(isUuidV4(ev.anonymousId), isTrue);
      expect(isUuidV4(ev.sessionId), isTrue);
      expect(ev.schemaVersion, kSchemaVersion);
      expect(DateTime.tryParse(ev.timestamp), isNotNull);
      expect(ev.context.app, 'test-app');
      expect(ev.context.env, 'development');
      expect(ev.context.library.name, '@refraction-ui/analytics');
      // Wire JSON shape.
      final json = ev.toJson();
      expect(json['type'], 'track');
      expect(json['schemaVersion'], kSchemaVersion);
      expect((json['context'] as Map)['library'], isNotNull);
    });

    test('every call type produces the right envelope', () async {
      final c = devConfig();
      c.a.identify('user_1', {'plan': 'pro', 'email': 'a@b.com'});
      c.a.page('Home', {'path': '/'});
      c.a.screen('Dashboard');
      c.a.group('org_1', {'name': 'Acme'});
      c.a.alias('user_2', 'user_1');
      await pump();

      final byType = {for (final e in c.sink.events) e.type: e};
      expect(
        byType[AnalyticsEventType.identify]!.traits,
        containsPair('plan', 'pro'),
      );
      // PII redaction applied to identify traits.
      expect(
        byType[AnalyticsEventType.identify]!.traits!['email'],
        '[REDACTED]',
      );
      expect(byType[AnalyticsEventType.identify]!.userId, 'user_1');
      expect(byType[AnalyticsEventType.page]!.event, 'Home');
      expect(byType[AnalyticsEventType.screen]!.event, 'Dashboard');
      expect(byType[AnalyticsEventType.group]!.groupId, 'org_1');
      // group trait `name` is redacted by the exact-match rule.
      expect(byType[AnalyticsEventType.group]!.traits!['name'], '[REDACTED]');
      expect(byType[AnalyticsEventType.alias]!.previousId, 'user_1');
      expect(byType[AnalyticsEventType.alias]!.userId, 'user_2');
    });

    test('redacts PII in track properties via the deny-list', () async {
      final c = devConfig();
      c.a.track('Form Submitted', {'email': 'a@b.com', 'value': 42});
      await pump();
      expect(c.sink.events[0].properties, {'email': '[REDACTED]', 'value': 42});
    });

    test('redacts caller-supplied redactKeys', () async {
      final c = devConfig(redactKeys: ['internalScore']);
      c.a.track('X', {'internalScore': 99, 'ok': 1});
      await pump();
      expect(c.sink.events[0].properties, {
        'internalScore': '[REDACTED]',
        'ok': 1,
      });
    });
  });

  group('createAnalytics — identity & session', () {
    test('binds userId after identify and clears it on reset', () {
      final c = devConfig();
      expect(c.a.userId(), isNull);
      c.a.identify('user_9');
      expect(c.a.userId(), 'user_9');
      final anonBefore = c.a.anonymousId();
      c.a.reset();
      expect(c.a.userId(), isNull);
      expect(c.a.anonymousId(), isNot(anonBefore));
    });

    test('exposes a working session API', () {
      final c = devConfig();
      final id1 = c.a.session.id();
      expect(isUuidV4(id1), isTrue);
      final id2 = c.a.session.start();
      expect(id2, isNot(id1));
      c.a.session.end();
    });

    test('shares one sessionId across events in a session', () async {
      final c = devConfig();
      c.a.track('A');
      c.a.track('B');
      await pump();
      expect(c.sink.events[0].sessionId, c.sink.events[1].sessionId);
    });
  });

  group('createAnalytics — withContext child', () {
    test(
      'merges child context into every event without affecting parent',
      () async {
        final c = devConfig();
        final child = c.a.withContext({'feature': 'checkout'});
        child.track('Child Event');
        c.a.track('Parent Event');
        await pump();
        final childEv = c.sink.events.firstWhere(
          (e) => e.event == 'Child Event',
        );
        final parentEv = c.sink.events.firstWhere(
          (e) => e.event == 'Parent Event',
        );
        expect(childEv.context.extra['feature'], 'checkout');
        expect(parentEv.context.extra['feature'], isNull);
      },
    );

    test('child shares identity/session/sinks with the parent', () {
      final c = devConfig();
      final child = c.a.withContext(const {});
      expect(child.anonymousId(), c.a.anonymousId());
      child.addSink(createMockSink(name: 'extra'));
      expect(c.a.sinks, contains('extra'));
    });
  });

  group('createAnalytics — sink registry', () {
    test('lists, adds, and removes sinks', () {
      final c = devConfig();
      expect(c.a.sinks, contains('mock'));
      c.a.addSink(createMockSink(name: 'extra'));
      expect(c.a.sinks, contains('extra'));
      c.a.removeSink('extra');
      expect(c.a.sinks, isNot(contains('extra')));
    });

    test('calls sink.init exactly once before the first deliver', () async {
      final c = devConfig();
      c.a.track('A');
      c.a.track('B');
      await pump();
      expect(c.sink.initCalls, hasLength(1));
      expect(c.sink.initCalls[0].app, 'test-app');
      expect(c.sink.initCalls[0].env, 'development');
    });

    test('auto-registers a built-in http sink when endpoint is set', () {
      final a = createAnalytics(
        AnalyticsConfig(
          app: 'x',
          env: 'development',
          endpoint: 'https://t.example.com',
          writeKey: 'wk',
          session: SessionConfig(storage: createMemoryStorage()),
          identity: IdentityConfig(storage: createMemoryStorage()),
        ),
      );
      expect(a.sinks, contains('http'));
    });

    test('dev preset auto-adds a console sink', () {
      final a = createAnalytics(
        AnalyticsConfig(
          app: 'x',
          env: 'development',
          session: SessionConfig(storage: createMemoryStorage()),
          identity: IdentityConfig(storage: createMemoryStorage()),
        ),
      );
      expect(a.sinks, contains('console'));
    });
  });

  group('createAnalytics — consent gating', () {
    test(
      'does not deliver to a sink whose categories are not granted',
      () async {
        final open = createMockSink(name: 'open');
        final gated = createMockSink(
          name: 'gated',
          consentCategories: ['marketing'],
        );
        final a = createAnalytics(
          AnalyticsConfig(
            app: 'x',
            env: 'development',
            sinks: [open, gated],
            session: SessionConfig(storage: createMemoryStorage()),
            identity: IdentityConfig(storage: createMemoryStorage()),
            consent: const ConsentConfig(granted: []),
          ),
        );
        a.track('A');
        await pump();
        expect(open.events, hasLength(1));
        expect(gated.events, isEmpty);

        a.consent.grant(['marketing']);
        a.track('B');
        await pump();
        expect(gated.events, hasLength(1));
      },
    );

    test('per-sink categories are independent', () async {
      final analyticsSink = createMockSink(
        name: 's-analytics',
        consentCategories: ['analytics'],
      );
      final marketingSink = createMockSink(
        name: 's-marketing',
        consentCategories: ['marketing'],
      );
      final a = createAnalytics(
        AnalyticsConfig(
          app: 'x',
          env: 'development',
          sinks: [analyticsSink, marketingSink],
          session: SessionConfig(storage: createMemoryStorage()),
          identity: IdentityConfig(storage: createMemoryStorage()),
          consent: const ConsentConfig(granted: ['analytics']),
        ),
      );
      a.track('A');
      await pump();
      expect(analyticsSink.events, hasLength(1));
      expect(marketingSink.events, isEmpty);
    });
  });

  group('createAnalytics — batching (prod preset)', () {
    ({Analytics a, MockSink sink}) prod({int batchSize = 3}) {
      final s = createMockSink();
      final a = createAnalytics(
        AnalyticsConfig(
          app: 'x',
          env: 'production',
          preset: 'prod',
          batchSize: batchSize,
          sinks: [s],
          session: SessionConfig(storage: createMemoryStorage()),
          identity: IdentityConfig(storage: createMemoryStorage()),
          consent: const ConsentConfig(granted: ['analytics']),
        ),
      );
      return (a: a, sink: s);
    }

    test('buffers events and flushes when batchSize is reached', () async {
      final c = prod(batchSize: 3);
      c.a.track('1');
      c.a.track('2');
      expect(c.sink.events, isEmpty); // still buffered
      c.a.track('3'); // hits batchSize → auto-flush
      await pump();
      expect(c.sink.events, hasLength(3));
      expect(c.sink.deliveries[0].batch, hasLength(3));
    });

    test('flush() drains the buffer on demand', () async {
      final c = prod(batchSize: 100);
      c.a.track('1');
      c.a.track('2');
      expect(c.sink.events, isEmpty);
      await c.a.flush();
      expect(c.sink.events, hasLength(2));
    });

    test('dev preset delivers without batching', () async {
      final c = devConfig();
      c.a.track('immediate');
      await pump();
      expect(c.sink.events, hasLength(1));
    });
  });

  group('createAnalytics — sampling', () {
    test('drops events below the sample rate', () async {
      var roll = 0.9;
      final c = devConfig(sampleRate: 0.5, random: () => roll);
      c.a.track('dropped');
      await pump();
      expect(c.sink.events, isEmpty);
      roll = 0.1;
      c.a.track('kept');
      await pump();
      expect(c.sink.events, hasLength(1));
    });

    test('sampleRate >= 1 keeps everything', () async {
      final c = devConfig(sampleRate: 1);
      c.a.track('a');
      c.a.track('b');
      await pump();
      expect(c.sink.events, hasLength(2));
    });
  });

  group('createAnalytics — noop kill switch', () {
    test('returns a noop when enabled:false', () {
      final sink = createMockSink();
      final a = createAnalytics(
        AnalyticsConfig(
          app: 'x',
          env: 'production',
          enabled: false,
          sinks: [sink],
        ),
      );
      expect(a.enabled, isFalse);
      a.track('nope');
      a.identify('user');
      a.page();
      expect(sink.events, isEmpty);
      expect(a.sinks, isEmpty);
      expect(a.userId(), isNull);
      expect(() {
        a.session.start();
        a.consent.grant(['analytics']);
        a.withContext(const {}).track('still nothing');
        a.reset();
      }, returnsNormally);
    });

    test('a live collector reports enabled:true', () {
      expect(devConfig().a.enabled, isTrue);
    });
  });
}
