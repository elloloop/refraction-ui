/// Built-in `http` sink — Segment HTTP Tracking API wire contract.
///
/// Wire contract (adopt, do not invent — RudderStack/Jitsu/Segment conform):
///
///   POST {endpoint}/v{schemaVersion}/batch
///   Content-Type: application/json
///   Authorization: Basic base64(writeKey:)         (note the trailing colon)
///   Body: { batch: AnalyticsEvent[], sentAt, batchId }
///
/// Each event carries `messageId` (idempotency — backends MUST dedupe),
/// `anonymousId`, `userId?`, `sessionId`, `type`, `event?`,
/// `properties`/`traits`, `context`, `timestamp`, `schemaVersion`.
///
/// Response handling (accept-and-queue semantics):
///   2xx       accepted (the backend has only queued it, not processed it)
///   400       malformed       → DROP, never retry
///   401       bad write key   → DROP, never retry
///   413       payload too big → DROP (we also pre-split under the size caps)
///   429 / 5xx transient       → exponential backoff retry
///   network   transient       → exponential backoff retry
///
/// Clock skew: the backend corrects with
///   corrected = timestamp + (receivedAt − sentAt)
/// so we always stamp an honest client `sentAt`.
///
/// Beacon caveat: the unload/background path uses a beacon, which cannot set
/// an `Authorization` header. On that path we fall back to `?writeKey=` in the
/// query string with a `text/plain` body (the wire contract requires the
/// backend to accept this).
library;

import 'dart:convert';

import 'http_transport.dart';
import 'types.dart';
import 'uuid.dart';

const Set<int> _noRetry = {400, 401, 413};

int _byteLength(String s) => utf8.encode(s).length;

class _SplitResult {
  _SplitResult(this.batches, this.dropped);
  final List<List<AnalyticsEvent>> batches;
  final List<AnalyticsEvent> dropped;
}

/// Split a batch so neither the per-event nor per-batch byte caps are
/// exceeded. Over-sized single events are dropped (they can never be sent).
_SplitResult _splitBatch(
  List<AnalyticsEvent> batch,
  int maxBatchBytes,
  int maxEventBytes,
) {
  final batches = <List<AnalyticsEvent>>[];
  final dropped = <AnalyticsEvent>[];
  var current = <AnalyticsEvent>[];
  var currentBytes = 2; // "[]"

  for (final ev in batch) {
    final evBytes = _byteLength(jsonEncode(ev.toJson()));
    if (evBytes > maxEventBytes) {
      dropped.add(ev);
      continue;
    }
    if (current.isNotEmpty && currentBytes + evBytes + 1 > maxBatchBytes) {
      batches.add(current);
      current = <AnalyticsEvent>[];
      currentBytes = 2;
    }
    current.add(ev);
    currentBytes += evBytes + 1;
  }
  if (current.isNotEmpty) batches.add(current);
  return _SplitResult(batches, dropped);
}

/// The built-in Segment-spec HTTP sink.
class HttpSink implements AnalyticsSink {
  HttpSink(HttpSinkOptions options)
    : _writeKey = options.writeKey,
      _maxRetries = options.maxRetries,
      _backoffBaseMs = options.backoffBaseMs,
      _maxBatchBytes = options.maxBatchBytes,
      _maxEventBytes = options.maxEventBytes,
      _consentCategories = options.consentCategories,
      _transport = options.transport ?? resolveHttpTransport(),
      _sleep = options.sleep ?? ((d) => Future<void>.delayed(d)),
      _url =
          '${options.endpoint.replaceAll(RegExp(r"/+$"), "")}'
          '/v$kSchemaVersion/batch',
      _authHeader =
          'Basic ${base64.encode(utf8.encode("${options.writeKey}:"))}';

  final String _writeKey;
  final int _maxRetries;
  final int _backoffBaseMs;
  final int _maxBatchBytes;
  final int _maxEventBytes;
  final List<String> _consentCategories;
  final HttpTransport _transport;
  final Future<void> Function(Duration) _sleep;
  final String _url;
  final String _authHeader;

  @override
  String get name => 'http';

  @override
  List<String>? get consentCategories => _consentCategories;

  Map<String, Object?> _envelope(List<AnalyticsEvent> batch) => {
    'batch': batch.map((e) => e.toJson()).toList(),
    'sentAt': DateTime.now().toUtc().toIso8601String(),
    'batchId': uuidv4(),
  };

  /// Beacon path: writeKey via query string, text/plain body.
  bool _sendViaBeacon(List<AnalyticsEvent> batch) {
    final beaconUrl = '$_url?writeKey=${Uri.encodeQueryComponent(_writeKey)}';
    return _transport.beacon(
      url: beaconUrl,
      body: jsonEncode(_envelope(batch)),
    );
  }

  /// Standard path: POST + Authorization header, with backoff retries.
  Future<void> _sendViaFetch(List<AnalyticsEvent> batch) async {
    final body = jsonEncode(_envelope(batch));
    for (var attempt = 0; ; attempt++) {
      int status;
      try {
        status = await _transport.post(
          url: _url,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': _authHeader,
          },
          body: body,
        );
      } catch (_) {
        // Network error — treat as transient.
        status = 0;
      }

      if (status >= 200 && status < 300) return; // accepted-and-queued
      if (_noRetry.contains(status)) return; // 400/401/413 — drop, never retry

      // 429 / 5xx / network (0) → backoff retry.
      if (attempt >= _maxRetries) return;
      final delay = _backoffBaseMs * (1 << attempt);
      await _sleep(Duration(milliseconds: delay));
    }
  }

  @override
  Future<void> deliver(
    List<AnalyticsEvent> batch,
    SinkDeliverContext ctx,
  ) async {
    if (batch.isEmpty) return;
    final split = _splitBatch(batch, _maxBatchBytes, _maxEventBytes);
    // Oversized events are unsendable by contract — silently dropped.

    for (final part in split.batches) {
      if (ctx.unload) {
        // Unload path: try beacon first; fall back to keepalive fetch.
        if (_sendViaBeacon(part)) continue;
        // ignore: unawaited_futures
        _sendViaFetch(part);
      } else {
        await _sendViaFetch(part);
      }
    }
  }

  @override
  Future<void> init(SinkInitContext ctx) async {}

  @override
  Future<void> flush() async {}

  @override
  Future<void> shutdown() async {}
}

/// Create the built-in Segment-spec HTTP sink.
AnalyticsSink createHttpSink(HttpSinkOptions options) => HttpSink(options);
