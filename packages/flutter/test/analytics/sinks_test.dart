import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart'
    hide createConsoleSink, createMockSink, MockSinkExtended;
// Analytics' own console sink — the package barrel hides it (telemetry owns
// the flat-barrel createConsoleSink), so import it directly here.
import 'package:refraction_ui/src/analytics/console_sink.dart';
// Test-only mock sink — intentionally not re-exported anywhere; would collide
// with telemetry's flat-barrel createMockSink / MockSinkExtended.
import 'package:refraction_ui/src/analytics/mock_sink.dart';

AnalyticsEvent _ev(String event) => AnalyticsEvent(
  type: AnalyticsEventType.track,
  event: event,
  messageId: 'm',
  anonymousId: 'a',
  sessionId: 's',
  properties: const {},
  context: const AnalyticsContext(
    app: 'app',
    env: 'test',
    library: AnalyticsLibrary(
      name: '@refraction-ui/analytics',
      version: '0.1.0',
    ),
  ),
  timestamp: DateTime.now().toUtc().toIso8601String(),
  schemaVersion: kSchemaVersion,
);

void main() {
  group('ConsoleSink', () {
    test('logs a labelled line per canonical envelope', () {
      final lines = <String>[];
      final sink = createConsoleSink(logger: lines.add);
      sink.deliver([
        _ev('A'),
        _ev('B'),
      ], const SinkDeliverContext(unload: false));
      expect(lines, hasLength(2));
      expect(lines[0], startsWith('[analytics] track A'));
      expect(lines[1], startsWith('[analytics] track B'));
    });

    test('passes through configured consent categories', () {
      final sink = createConsoleSink(consentCategories: ['debug']);
      expect(sink.consentCategories, ['debug']);
    });
  });

  group('MockSink', () {
    test('captures init/deliver/flush/shutdown for assertions', () {
      final sink = createMockSink(name: 's1', consentCategories: ['x']);
      expect(sink.name, 's1');
      expect(sink.consentCategories, ['x']);

      sink.init(const SinkInitContext(app: 'a', env: 'e'));
      sink.deliver([_ev('A')], const SinkDeliverContext(unload: false));
      sink.deliver([
        _ev('B'),
        _ev('C'),
      ], const SinkDeliverContext(unload: true));
      sink.flush();
      sink.shutdown();

      expect(sink.initCalls, hasLength(1));
      expect(sink.deliveries, hasLength(2));
      expect(sink.deliveries[1].ctx.unload, isTrue);
      expect(sink.events.map((e) => e.event), ['A', 'B', 'C']);
      expect(sink.flushCalls, 1);
      expect(sink.shutdownCalls, 1);
    });
  });

  group('createNoopAnalytics', () {
    test('exposes the full Analytics surface, all inert', () async {
      final a = createNoopAnalytics();
      expect(a.enabled, isFalse);
      expect(a.sinks, isEmpty);
      expect(a.userId(), isNull);
      expect(a.anonymousId(), startsWith('00000000-0000-4'));
      expect(a.session.id(), isA<String>());
      expect(a.consent.granted(), isEmpty);
      expect(a.consent.isGranted('analytics'), isFalse);
      expect(a.withContext(const {}), same(a));
      expect(() {
        a.track('x');
        a.identify('u');
        a.page();
        a.screen();
        a.group('g');
        a.alias('u2');
        a.session.start();
        a.session.end();
        a.session.set(const {});
        a.consent.grant(['a']);
        a.consent.revoke(['a']);
        a.addSink(createMockSink());
        a.removeSink('mock');
        a.reset();
      }, returnsNormally);
      await a.flush();
    });
  });
}
