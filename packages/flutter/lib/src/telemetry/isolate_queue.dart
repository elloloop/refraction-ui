/// Isolate-aware telemetry ingestion (SendPort bridge).
///
/// A background isolate (compute / `Isolate.spawn`) has its own memory and
/// cannot reach the main isolate's [Telemetry] / sinks, so its logs would be
/// lost. This bridges them: the main isolate opens an ingest port; a worker
/// isolate is handed the [SendPort] and emits through a lightweight [Logger]
/// that serializes each record and posts it over the port. The host re-emits
/// every received record through the real telemetry pipeline (redaction →
/// sinks → durable queue), so background-isolate logs survive.
///
/// Internal detail behind the existing surface — the public API is unchanged
/// and identical across web / android / ios / desktop. (On Flutter web there
/// are no `dart:isolate` worker isolates in the same sense; the host side is a
/// harmless no-op there and direct logging is used instead — the consumer
/// code path is the same.)
library;

import 'dart:isolate';

import 'types.dart';

/// Wire shape posted over the [SendPort]. Kept to JSON-safe primitives so it
/// crosses the isolate boundary without custom codecs.
typedef _Envelope = Map<String, Object?>;

/// Host side: owns a [ReceivePort], re-emits worker records into [target].
class TelemetryIsolateHost {
  TelemetryIsolateHost._(this._port, this._target) {
    _port.listen(_onMessage);
  }

  final ReceivePort _port;
  final Logger _target;
  bool _closed = false;

  /// Hand this to a spawned isolate; use it to build a
  /// [createIsolateLogger]. Safe to pass through `Isolate.spawn`.
  SendPort get sendPort => _port.sendPort;

  /// Open an ingest host that forwards worker records into [target]
  /// (typically your root [Telemetry] or a child of it).
  factory TelemetryIsolateHost.attach(Logger target) =>
      TelemetryIsolateHost._(ReceivePort(), target);

  void _onMessage(dynamic message) {
    if (_closed || message is! Map) return;
    final env = message.cast<String, Object?>();
    final kind = env['kind'];
    final ctx = (env['context'] as Map?)?.cast<String, Object?>() ??
        const <String, Object?>{};
    if (kind == 'log') {
      final level = env['level'] as String? ?? 'info';
      final msg = env['message'] as String? ?? '';
      switch (level) {
        case 'debug':
          _target.debug(msg, ctx);
          break;
        case 'warn':
          _target.warn(msg, ctx);
          break;
        case 'error':
          _target.error(msg, ctx);
          break;
        case 'fatal':
          _target.fatal(msg, ctx);
          break;
        case 'info':
        default:
          _target.info(msg, ctx);
          break;
      }
    } else if (kind == 'span') {
      // Spans crossing isolates are recorded as a synthetic completed span
      // (start/end already happened in the worker).
      final name = env['name'] as String? ?? 'isolate-span';
      final span = _target.startSpan(name, ctx);
      span.end();
    }
  }

  /// Stop accepting worker records.
  void close() {
    if (_closed) return;
    _closed = true;
    _port.close();
  }
}

/// Worker side: a minimal [Logger] that serializes onto [port]. Only the
/// emit/child surface is meaningful in a worker; [flush] is a no-op (the host
/// isolate owns flushing), spans post a single completed-span envelope.
class _IsolateLogger implements Logger {
  _IsolateLogger(this._port, this._bound);

  final SendPort _port;
  final Map<String, Object?> _bound;

  void _post(String level, String message, Map<String, Object?>? ctx) {
    final env = <String, Object?>{
      'kind': 'log',
      'level': level,
      'message': message,
      'context': <String, Object?>{..._bound, ...?ctx},
    };
    _safeSend(env);
  }

  void _safeSend(_Envelope env) {
    try {
      _port.send(env);
    } catch (_) {
      // Port closed / non-sendable payload — drop rather than crash a worker.
    }
  }

  @override
  void debug(String message, [LogContext? context]) =>
      _post('debug', message, context);

  @override
  void info(String message, [LogContext? context]) =>
      _post('info', message, context);

  @override
  void warn(String message, [LogContext? context]) =>
      _post('warn', message, context);

  @override
  void error(String message, [LogContext? context]) =>
      _post('error', message, context);

  @override
  void fatal(String message, [LogContext? context]) =>
      _post('fatal', message, context);

  @override
  Logger child(LogContext context) =>
      _IsolateLogger(_port, <String, Object?>{..._bound, ...context});

  @override
  Span startSpan(String name, [LogContext? attributes]) {
    final port = _port;
    final bound = _bound;
    return _IsolateSpan(() {
      port.send(<String, Object?>{
        'kind': 'span',
        'name': name,
        'context': <String, Object?>{...bound, ...?attributes},
      });
    });
  }

  @override
  Future<void> flush() async {
    // The host isolate owns sinks/flush; nothing to do here.
  }
}

class _IsolateSpan implements Span {
  _IsolateSpan(this._onEnd);

  final void Function() _onEnd;
  bool _ended = false;

  @override
  void end([SpanEndOptions? opts]) {
    if (_ended) return;
    _ended = true;
    try {
      _onEnd();
    } catch (_) {
      // ignore
    }
  }
}

/// Build a worker-isolate [Logger] that forwards to the host via [port]
/// (obtained from [TelemetryIsolateHost.sendPort] and passed into the
/// spawned isolate). Background-isolate logs are no longer lost.
Logger createIsolateLogger(SendPort port) =>
    _IsolateLogger(port, const <String, Object?>{});
