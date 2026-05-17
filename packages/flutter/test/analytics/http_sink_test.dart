import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

const ctxOnline = SinkDeliverContext(unload: false);
const ctxUnload = SinkDeliverContext(unload: true);

AnalyticsEvent makeEvent({String event = 'Test'}) => AnalyticsEvent(
  type: AnalyticsEventType.track,
  event: event,
  messageId: 'mid-${DateTime.now().microsecondsSinceEpoch}-$event',
  anonymousId: 'anon-1',
  sessionId: 'sess-1',
  properties: const {'a': 1},
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

class RecordedCall {
  RecordedCall(this.url, this.headers, this.body);
  final String url;
  final Map<String, String> headers;
  final Map<String, Object?> body;
}

class RecordedBeacon {
  RecordedBeacon(this.url, this.body);
  final String url;
  final String body;
}

/// A mock backend transport conforming to the Segment HTTP Tracking API wire
/// contract. `responder` returns the status code for the Nth call (0-based).
class MockBackend implements HttpTransport {
  MockBackend({int Function(int call)? responder, this.throwOnCall})
    : _responder = responder ?? ((_) => 200);

  final int Function(int call) _responder;
  final int? throwOnCall;

  final List<RecordedCall> calls = [];
  final List<RecordedBeacon> beacons = [];
  bool beaconReturns = true;
  int _n = 0;

  @override
  Future<int> post({
    required String url,
    required Map<String, String> headers,
    required String body,
  }) async {
    final i = _n++;
    if (throwOnCall != null && i < throwOnCall!) {
      throw StateError('network down');
    }
    calls.add(
      RecordedCall(url, headers, jsonDecode(body) as Map<String, Object?>),
    );
    return _responder(i);
  }

  @override
  bool beacon({required String url, required String body}) {
    beacons.add(RecordedBeacon(url, body));
    return beaconReturns;
  }
}

/// Deterministic, zero-delay sleep so backoff retry tests run instantly.
Future<void> noSleep(Duration _) => Future<void>.value();

void main() {
  group('http sink — Segment wire contract: batch format', () {
    test(
      'POSTs to {endpoint}/v{schemaVersion}/batch with the envelope',
      () async {
        final be = MockBackend();
        final sink = createHttpSink(
          HttpSinkOptions(
            endpoint: 'https://collector.example.com/',
            writeKey: 'WK123',
            transport: be,
          ),
        );
        await sink.deliver([
          makeEvent(event: 'A'),
          makeEvent(event: 'B'),
        ], ctxOnline);

        expect(be.calls, hasLength(1));
        final call = be.calls[0];
        expect(
          call.url,
          'https://collector.example.com/v$kSchemaVersion/batch',
        );
        expect(call.headers['Content-Type'], 'application/json');

        final batch = (call.body['batch'] as List).cast<Map<String, Object?>>();
        expect(batch, hasLength(2));
        expect(batch[0]['event'], 'A');
        expect(call.body['sentAt'], isA<String>());
        expect(DateTime.tryParse(call.body['sentAt'] as String), isNotNull);
        expect(isUuidV4(call.body['batchId']), isTrue);
      },
    );

    test(
      'sends Authorization: Basic base64(writeKey:) — trailing colon',
      () async {
        final be = MockBackend();
        final sink = createHttpSink(
          HttpSinkOptions(
            endpoint: 'https://c.example.com',
            writeKey: 'WK123',
            transport: be,
          ),
        );
        await sink.deliver([makeEvent()], ctxOnline);
        expect(
          be.calls[0].headers['Authorization'],
          'Basic ${base64.encode(utf8.encode('WK123:'))}',
        );
      },
    );

    test('every event carries a distinct messageId idempotency key', () async {
      final be = MockBackend();
      final sink = createHttpSink(
        HttpSinkOptions(
          endpoint: 'https://c.example.com',
          writeKey: 'k',
          transport: be,
        ),
      );
      await sink.deliver([
        makeEvent(event: 'A'),
        makeEvent(event: 'B'),
      ], ctxOnline);
      final batch = (be.calls[0].body['batch'] as List)
          .cast<Map<String, Object?>>();
      for (final ev in batch) {
        expect(ev['messageId'], isA<String>());
        expect((ev['messageId'] as String).isNotEmpty, isTrue);
      }
      expect(batch[0]['messageId'], isNot(batch[1]['messageId']));
    });

    test('does nothing for an empty batch', () async {
      final be = MockBackend();
      final sink = createHttpSink(
        HttpSinkOptions(
          endpoint: 'https://c.example.com',
          writeKey: 'k',
          transport: be,
        ),
      );
      await sink.deliver([], ctxOnline);
      expect(be.calls, isEmpty);
    });
  });

  group('http sink — response codes', () {
    test('200 accept-and-queue → no retry', () async {
      final be = MockBackend(responder: (_) => 200);
      final sink = createHttpSink(
        HttpSinkOptions(
          endpoint: 'https://c.example.com',
          writeKey: 'k',
          transport: be,
          sleep: noSleep,
        ),
      );
      await sink.deliver([makeEvent()], ctxOnline);
      expect(be.calls, hasLength(1));
    });

    test('400 malformed → DROP, never retry', () async {
      final be = MockBackend(responder: (_) => 400);
      final sink = createHttpSink(
        HttpSinkOptions(
          endpoint: 'https://c.example.com',
          writeKey: 'k',
          maxRetries: 5,
          transport: be,
          sleep: noSleep,
        ),
      );
      await sink.deliver([makeEvent()], ctxOnline);
      expect(be.calls, hasLength(1));
    });

    test('401 bad key → DROP, never retry', () async {
      final be = MockBackend(responder: (_) => 401);
      final sink = createHttpSink(
        HttpSinkOptions(
          endpoint: 'https://c.example.com',
          writeKey: 'k',
          maxRetries: 5,
          transport: be,
          sleep: noSleep,
        ),
      );
      await sink.deliver([makeEvent()], ctxOnline);
      expect(be.calls, hasLength(1));
    });

    test('413 too large → DROP, never retry', () async {
      final be = MockBackend(responder: (_) => 413);
      final sink = createHttpSink(
        HttpSinkOptions(
          endpoint: 'https://c.example.com',
          writeKey: 'k',
          maxRetries: 5,
          transport: be,
          sleep: noSleep,
        ),
      );
      await sink.deliver([makeEvent()], ctxOnline);
      expect(be.calls, hasLength(1));
    });

    test('429 → backoff retry then give up after maxRetries', () async {
      final be = MockBackend(responder: (_) => 429);
      final sink = createHttpSink(
        HttpSinkOptions(
          endpoint: 'https://c.example.com',
          writeKey: 'k',
          maxRetries: 3,
          backoffBaseMs: 1,
          transport: be,
          sleep: noSleep,
        ),
      );
      await sink.deliver([makeEvent()], ctxOnline);
      // initial + 3 retries = 4 attempts
      expect(be.calls, hasLength(4));
    });

    test('5xx → retried, then succeeds when the backend recovers', () async {
      final be = MockBackend(responder: (n) => n < 2 ? 503 : 200);
      final sink = createHttpSink(
        HttpSinkOptions(
          endpoint: 'https://c.example.com',
          writeKey: 'k',
          maxRetries: 5,
          backoffBaseMs: 1,
          transport: be,
          sleep: noSleep,
        ),
      );
      await sink.deliver([makeEvent()], ctxOnline);
      expect(be.calls, hasLength(3)); // 503, 503, 200
    });

    test('uses increasing backoff delays between retries', () async {
      final delays = <int>[];
      final be = MockBackend(responder: (_) => 500);
      final sink = createHttpSink(
        HttpSinkOptions(
          endpoint: 'https://c.example.com',
          writeKey: 'k',
          maxRetries: 2,
          backoffBaseMs: 100,
          transport: be,
          sleep: (d) {
            delays.add(d.inMilliseconds);
            return Future<void>.value();
          },
        ),
      );
      await sink.deliver([makeEvent()], ctxOnline);
      expect(be.calls, hasLength(3)); // initial + 2 retries
      expect(delays, [100, 200]); // exponential: base*2^attempt
    });

    test('network error is treated as transient and retried', () async {
      final be = MockBackend(throwOnCall: 1, responder: (_) => 200);
      final sink = createHttpSink(
        HttpSinkOptions(
          endpoint: 'https://c.example.com',
          writeKey: 'k',
          maxRetries: 3,
          backoffBaseMs: 1,
          transport: be,
          sleep: noSleep,
        ),
      );
      await sink.deliver([makeEvent()], ctxOnline);
      // 1st throws (counted in _n), 2nd returns 200 and is recorded.
      expect(be.calls, hasLength(1));
    });
  });

  group('http sink — beacon fallback (unload path)', () {
    test(
      'uses beacon with ?writeKey= query (no Authorization header)',
      () async {
        final be = MockBackend();
        final sink = createHttpSink(
          HttpSinkOptions(
            endpoint: 'https://c.example.com',
            writeKey: 'WK secret/with+special',
            transport: be,
          ),
        );
        await sink.deliver([makeEvent()], ctxUnload);

        expect(be.beacons, hasLength(1));
        expect(be.calls, isEmpty); // beacon used, not POST
        final b = be.beacons[0];
        expect(b.url, contains('/v$kSchemaVersion/batch'));
        expect(
          b.url,
          contains(
            'writeKey=${Uri.encodeQueryComponent('WK secret/with+special')}',
          ),
        );
        final parsed = jsonDecode(b.body) as Map<String, Object?>;
        expect((parsed['batch'] as List), hasLength(1));
        expect(isUuidV4(parsed['batchId']), isTrue);
      },
    );

    test('falls back to keepalive POST when beacon is unavailable', () async {
      final be = MockBackend()..beaconReturns = false;
      final sink = createHttpSink(
        HttpSinkOptions(
          endpoint: 'https://c.example.com',
          writeKey: 'k',
          transport: be,
          sleep: noSleep,
        ),
      );
      await sink.deliver([makeEvent()], ctxUnload);
      // beacon attempted (returned false) → POST fallback fired.
      expect(be.beacons, hasLength(1));
      // Allow the unawaited fallback POST to complete.
      await Future<void>.delayed(Duration.zero);
      expect(be.calls, hasLength(1));
    });

    test('online path never uses beacon', () async {
      final be = MockBackend();
      final sink = createHttpSink(
        HttpSinkOptions(
          endpoint: 'https://c.example.com',
          writeKey: 'k',
          transport: be,
          sleep: noSleep,
        ),
      );
      await sink.deliver([makeEvent()], ctxOnline);
      expect(be.beacons, isEmpty);
      expect(be.calls, hasLength(1));
    });
  });

  group('http sink — size limits', () {
    test('splits a batch that exceeds the per-batch byte cap', () async {
      final be = MockBackend();
      final sink = createHttpSink(
        HttpSinkOptions(
          endpoint: 'https://c.example.com',
          writeKey: 'k',
          transport: be,
          maxBatchBytes: 400, // tiny → forces splitting
          maxEventBytes: 32000,
          sleep: noSleep,
        ),
      );
      await sink.deliver([
        makeEvent(),
        makeEvent(),
        makeEvent(),
        makeEvent(),
      ], ctxOnline);
      expect(be.calls.length, greaterThan(1));
      final total = be.calls.fold<int>(
        0,
        (sum, c) => sum + (c.body['batch'] as List).length,
      );
      expect(total, 4); // no events lost during splitting
    });

    test('drops a single event larger than the per-event byte cap', () async {
      final be = MockBackend();
      final sink = createHttpSink(
        HttpSinkOptions(
          endpoint: 'https://c.example.com',
          writeKey: 'k',
          transport: be,
          maxEventBytes: 100, // smaller than any real event
          sleep: noSleep,
        ),
      );
      await sink.deliver([makeEvent()], ctxOnline);
      expect(be.calls, isEmpty); // oversized → unsendable, dropped
    });
  });

  group('http sink — consent categories', () {
    test('defaults to requiring the analytics category', () {
      final sink = createHttpSink(
        const HttpSinkOptions(
          endpoint: 'https://c.example.com',
          writeKey: 'k',
          transport: null,
        ),
      );
      expect(sink.consentCategories, ['analytics']);
    });

    test('honours a custom consentCategories list', () {
      final sink = createHttpSink(
        const HttpSinkOptions(
          endpoint: 'https://c.example.com',
          writeKey: 'k',
          consentCategories: ['marketing', 'analytics'],
        ),
      );
      expect(sink.consentCategories, ['marketing', 'analytics']);
    });
  });

  group('http sink — end-to-end via createAnalytics (prod relay)', () {
    test('routes the canonical batch to the consumer endpoint', () async {
      final be = MockBackend();
      final a = createAnalytics(
        AnalyticsConfig(
          app: 'shop',
          env: 'production',
          preset: 'prod',
          batchSize: 2,
          endpoint: 'https://collect.consumer.example',
          writeKey: 'CONSUMER_KEY',
          httpTransport: be,
          session: SessionConfig(storage: createMemoryStorage()),
          identity: IdentityConfig(storage: createMemoryStorage()),
          consent: const ConsentConfig(granted: ['analytics']),
        ),
      );
      a.track('Add To Cart', {'sku': 'A1'});
      a.track('Checkout', {'total': 42});
      await Future<void>.delayed(Duration.zero);

      expect(be.calls, hasLength(1));
      final call = be.calls[0];
      expect(call.url, 'https://collect.consumer.example/v1/batch');
      expect(
        call.headers['Authorization'],
        'Basic ${base64.encode(utf8.encode('CONSUMER_KEY:'))}',
      );
      final batch = (call.body['batch'] as List).cast<Map<String, Object?>>();
      expect(batch, hasLength(2));
      expect(batch[0]['event'], 'Add To Cart');
      expect(batch[0]['context'], isNotNull);
      expect(batch[0]['schemaVersion'], 1);
    });
  });
}
