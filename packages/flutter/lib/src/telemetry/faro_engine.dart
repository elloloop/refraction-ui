/// Faro-backed engine — a 1:1 port of `@refraction-ui/logger`
/// `faro-engine.ts`.
///
/// The vendor (Faro) is an **internal abstraction behind [TelemetrySink]** —
/// no vendor type appears in this module's public surface. The real
/// Faro-Flutter / OTel-Dart binding is a Wave 1 concern: when no override
/// [FaroEngineOptions.transport] is supplied this factory resolves to `null`
/// (peer absent), so the caller falls back to console — identical to the web
/// semantics where the optional peer may be missing. The on-wire envelope
/// (`{ kind, record }` pushed to a transport) is identical to web (OTLP).
library;

import 'types.dart';

/// Minimal structural shape of a Faro-ish transport. Not part of the public
/// vendor-neutral API beyond this engine's options. The payload envelope is
/// identical to the web engine.
abstract class FaroTransport {
  /// Receive a `{ kind, record }` envelope. [kind] is `'log'` or `'span'`;
  /// [record] is a [LogRecord] or [SpanRecord] respectively.
  void push({required String kind, required Object record});
}

/// Options for [createFaroSink].
class FaroEngineOptions {
  /// Creates [FaroEngineOptions].
  const FaroEngineOptions({
    required this.app,
    required this.endpoint,
    this.transport,
  });

  /// Logical app/service name.
  final String app;

  /// Consumer-supplied collector endpoint. Data goes to the consumer's
  /// endpoint, never refraction-ui's.
  final String endpoint;

  /// Test/override transport. When provided, the Faro vendor is NOT loaded
  /// and records are forwarded straight to [FaroTransport.push].
  final FaroTransport? transport;
}

/// Map our levels onto Faro's log-level strings (`fatal` -> `error`).
const Map<LogLevel, String> _faroLevel = <LogLevel, String>{
  LogLevel.debug: 'debug',
  LogLevel.info: 'info',
  LogLevel.warn: 'warn',
  LogLevel.error: 'error',
  LogLevel.fatal: 'error',
};

class _FaroSink implements TelemetrySink {
  _FaroSink(this._transport);

  final FaroTransport _transport;

  @override
  String get name => 'faro';

  @override
  void log(LogRecord record) {
    _transport.push(kind: 'log', record: record);
  }

  @override
  void span(SpanRecord record) {
    _transport.push(kind: 'span', record: record);
  }

  @override
  Future<void> flush() async {
    // The vendor's own transport flushes on its schedule / on background;
    // the manager drives app-exit flushing. Nothing buffered here.
  }
}

/// Construct the Faro engine. Returns `null` when no vendor binding is
/// available and no override [FaroEngineOptions.transport] was supplied —
/// callers treat `null` as "fall back to console". The real Faro-Flutter /
/// OTel-Dart binding lands in Wave 1 behind this same surface.
Future<TelemetrySink?> createFaroSink(FaroEngineOptions opts) async {
  final transport = opts.transport ?? await _loadFaroTransport(opts);
  if (transport == null) return null;
  return _FaroSink(transport);
}

/// Adapt the (Wave 1) Faro vendor to [FaroTransport]. Returns `null` while
/// no vendor binding is wired (Wave 0) — exactly mirroring the web behavior
/// where the optional peer is absent.
Future<FaroTransport?> _loadFaroTransport(FaroEngineOptions opts) async {
  // Wave 0: no vendor binding. Wave 1 plugs Faro-Flutter / OTel-Dart in here
  // without any change to this engine's public surface or the OTLP envelope.
  return null;
}

/// Faro context attributes are flat string maps; coerce ours to match.
/// Exposed for parity tests against the web engine's `flatten`.
Map<String, String> flattenContext(Map<String, Object?> ctx) {
  final out = <String, String>{};
  ctx.forEach((k, v) {
    out[k] = v is String ? v : _jsonish(v);
  });
  return out;
}

String _jsonish(Object? v) {
  if (v == null) return 'null';
  if (v is num || v is bool) return v.toString();
  if (v is String) return v;
  // Match JSON.stringify for collections.
  return _stringify(v);
}

String _stringify(Object? v) {
  if (v == null) return 'null';
  if (v is String) return '"$v"';
  if (v is num || v is bool) return v.toString();
  if (v is List) {
    return '[${v.map(_stringify).join(',')}]';
  }
  if (v is Map) {
    final entries = v.entries
        .map((e) => '"${e.key}":${_stringify(e.value)}')
        .join(',');
    return '{$entries}';
  }
  return '"$v"';
}

/// Maps a [LogLevel] to the Faro log-level string. Exposed for parity tests.
String faroLevelName(LogLevel level) => _faroLevel[level]!;
