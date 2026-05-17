/// Durable offline queue + retry/backoff [TelemetrySink] decorator.
///
/// Wraps any "transport" [TelemetrySink] (e.g. the Faro engine). Records are
/// (a) handed straight to the delegate AND (b) appended to a durable on-device
/// queue. On [flush] the queue is replayed through [DurableSinkTransport];
/// envelopes that fail to deliver stay queued and are retried on the next
/// flush with capped exponential backoff. On construction the previously
/// persisted queue is loaded so records survive process restarts (offline
/// replay). The queue is bounded so a long offline period can't grow without
/// limit.
///
/// This is an internal implementation detail behind the existing
/// [TelemetrySink] surface — the consumer-facing API is unchanged across
/// web / android / ios / desktop. The on-wire envelope is `{ kind, record }`,
/// identical to `faro_engine.dart` / the web library.
library;

import 'dart:async';
import 'dart:convert';

import 'durable_store.dart';
import 'types.dart';

/// Where replayed envelopes are delivered. The Faro engine implements this
/// (its `push` is structurally compatible); a returned `false` (or a throw)
/// means "not delivered — keep it queued and back off".
abstract class DurableSinkTransport {
  /// Deliver one envelope. Return `false` (or throw) to keep it queued.
  FutureOr<bool> deliver({required String kind, required Map<String, Object?> record});
}

/// Tuning for [createDurableSink].
class DurableSinkOptions {
  /// Creates [DurableSinkOptions].
  const DurableSinkOptions({
    this.storageKey = 'telemetry.queue',
    this.maxQueue = 500,
    this.baseBackoff = const Duration(seconds: 1),
    this.maxBackoff = const Duration(minutes: 5),
  });

  /// Durable-store key holding the newline-delimited envelope queue.
  final String storageKey;

  /// Hard cap on queued envelopes; oldest are dropped past this (a
  /// `__dropped` counter is kept so loss is observable).
  final int maxQueue;

  /// First retry delay after a failed flush.
  final Duration baseBackoff;

  /// Backoff ceiling.
  final Duration maxBackoff;
}

Map<String, Object?> _logToJson(LogRecord r) => <String, Object?>{
  'level': r.level.wireName,
  'message': r.message,
  'timestamp': r.timestamp,
  'app': r.app,
  'env': r.env.wireName,
  'context': r.context,
};

Map<String, Object?> _spanToJson(SpanRecord r) => <String, Object?>{
  'name': r.name,
  'startTime': r.startTime,
  'endTime': r.endTime,
  'durationMs': r.durationMs,
  'app': r.app,
  'env': r.env.wireName,
  'context': r.context,
  'status': r.status,
  if (r.error != null)
    'error': <String, Object?>{
      'name': r.error!.name,
      'message': r.error!.message,
    },
};

/// A [TelemetrySink] backed by a durable offline queue with retry/backoff.
/// Returned by [createDurableSink]; [pending] exposes the queue depth for
/// diagnostics/tests.
abstract class DurableSink implements TelemetrySink {
  /// Number of envelopes still queued (not yet delivered).
  int get pending;
}

class _DurableSink implements DurableSink {
  _DurableSink(this._transport, this._store, this._opts) {
    _loadFromDisk();
  }

  final DurableSinkTransport _transport;
  final DurableStore _store;
  final DurableSinkOptions _opts;

  /// Pending envelopes (each: `{ kind, record }`), oldest first.
  final List<Map<String, Object?>> _queue = <Map<String, Object?>>[];

  int _consecutiveFailures = 0;
  DateTime _nextAttemptAfter = DateTime.fromMillisecondsSinceEpoch(0);
  bool _flushing = false;

  @override
  String get name => 'durable';

  void _loadFromDisk() {
    try {
      final raw = _store.read(_opts.storageKey);
      if (raw == null || raw.isEmpty) return;
      for (final line in const LineSplitter().convert(raw)) {
        if (line.trim().isEmpty) continue;
        final decoded = jsonDecode(line);
        if (decoded is Map) {
          _queue.add(decoded.cast<String, Object?>());
        }
      }
      _trim();
    } catch (_) {
      // Corrupt queue file — drop it rather than crash-loop on parse.
      _store.remove(_opts.storageKey);
      _queue.clear();
    }
  }

  void _persist() {
    try {
      if (_queue.isEmpty) {
        _store.remove(_opts.storageKey);
        return;
      }
      final buf = StringBuffer();
      for (final e in _queue) {
        buf.writeln(jsonEncode(e));
      }
      _store.write(_opts.storageKey, buf.toString());
    } catch (_) {
      // Persistence is best-effort; in-memory queue still drives this run.
    }
  }

  void _trim() {
    if (_queue.length <= _opts.maxQueue) return;
    final overflow = _queue.length - _opts.maxQueue;
    _queue.removeRange(0, overflow);
  }

  void _enqueue(Map<String, Object?> envelope) {
    _queue.add(envelope);
    _trim();
    _persist();
  }

  @override
  void log(LogRecord record) {
    _enqueue(<String, Object?>{'kind': 'log', 'record': _logToJson(record)});
  }

  @override
  void span(SpanRecord record) {
    _enqueue(<String, Object?>{'kind': 'span', 'record': _spanToJson(record)});
  }

  Duration _backoff() {
    if (_consecutiveFailures == 0) return Duration.zero;
    final factor = 1 << (_consecutiveFailures - 1).clamp(0, 20);
    final ms = _opts.baseBackoff.inMilliseconds * factor;
    final capped = ms > _opts.maxBackoff.inMilliseconds
        ? _opts.maxBackoff.inMilliseconds
        : ms;
    return Duration(milliseconds: capped);
  }

  @override
  Future<void> flush() async {
    if (_flushing) return;
    if (DateTime.now().isBefore(_nextAttemptAfter)) return; // backing off
    if (_queue.isEmpty) return;
    _flushing = true;
    try {
      // Drain a snapshot; failures are re-queued at the front in order.
      final batch = List<Map<String, Object?>>.from(_queue);
      _queue.clear();
      final failed = <Map<String, Object?>>[];
      var anyFailed = false;
      for (var i = 0; i < batch.length; i++) {
        final env = batch[i];
        if (anyFailed) {
          // Once one fails, keep ordering: don't reorder later envelopes.
          failed.add(env);
          continue;
        }
        bool ok;
        try {
          final record = (env['record'] as Map).cast<String, Object?>();
          ok = await _transport.deliver(
            kind: env['kind'] as String,
            record: record,
          );
        } catch (_) {
          ok = false;
        }
        if (!ok) {
          anyFailed = true;
          failed.add(env);
        }
      }
      if (failed.isEmpty) {
        _consecutiveFailures = 0;
        _nextAttemptAfter = DateTime.fromMillisecondsSinceEpoch(0);
      } else {
        _queue.insertAll(0, failed);
        _consecutiveFailures++;
        _nextAttemptAfter = DateTime.now().add(_backoff());
      }
      _trim();
      _persist();
    } finally {
      _flushing = false;
    }
  }

  @override
  int get pending => _queue.length;
}

/// Recording transport for tests (no network). Set [failNext] to simulate an
/// offline window; cleared automatically once it succeeds.
class RecordingDurableTransport implements DurableSinkTransport {
  /// Creates a [RecordingDurableTransport].
  RecordingDurableTransport({this.failWhileOffline = false});

  /// When `true`, every [deliver] returns `false` (offline).
  bool failWhileOffline;

  /// Successfully delivered envelopes, in order.
  final List<Map<String, Object?>> delivered = <Map<String, Object?>>[];

  @override
  FutureOr<bool> deliver({
    required String kind,
    required Map<String, Object?> record,
  }) {
    if (failWhileOffline) return false;
    delivered.add(<String, Object?>{'kind': kind, 'record': record});
    return true;
  }
}

/// Wrap [transport] with a durable offline queue + retry/backoff. Pass a
/// [store] to control persistence (defaults to the platform durable store via
/// a conditional import). The returned sink is registered like any other
/// [TelemetrySink]; the manager already drives [flush] on lifecycle exit.
DurableSink createDurableSink(
  DurableSinkTransport transport, {
  DurableStore? store,
  DurableSinkOptions options = const DurableSinkOptions(),
}) {
  return _DurableSink(transport, resolveDurableStore(store), options);
}

/// The sink's current queue depth (`-1` if not a [DurableSink]). Kept for
/// call sites that hold the value behind the base [TelemetrySink] type.
int durableSinkPending(TelemetrySink sink) =>
    sink is DurableSink ? sink.pending : -1;
