/// Telemetry manager — a 1:1 port of `@refraction-ui/logger`
/// `telemetry-manager.ts`. Manager/provider pattern, mirroring `createAI`.
library;

import 'dart:math';

import 'console_sink.dart';
import 'faro_engine.dart';
import 'lifecycle.dart';
import 'noop.dart';
import 'presets.dart';
import 'redact.dart';
import 'types.dart';

class _Entry {
  _Entry.log(this.logRecord) : kind = 'log', spanRecord = null;
  _Entry.span(this.spanRecord) : kind = 'span', logRecord = null;

  final String kind;
  final LogRecord? logRecord;
  final SpanRecord? spanRecord;
}

/// `createTelemetry` — creates a telemetry manager that fans records out to
/// registered sinks. Manager/provider pattern, mirroring `createAI`.
///
/// - `enabled: false` -> tree-shakeable noop (zero emissions, no engines).
/// - no `endpoint` -> console-only transport.
/// - `endpoint` set -> the (Wave 1) vendor engine is registered when a
///   binding/transport exists; console stays as a safe fallback until then.
///
/// The returned object IS a logger (root context = `{}`); `child()` derives
/// loggers with bound context (sessionId / interviewId / turnId / ...).
///
/// Identical API and structure across web/android/ios/desktop — platform
/// differences (app-exit flush wiring) are handled internally via a
/// conditional-import [LifecycleHook] behind one surface.
Telemetry createTelemetry(
  TelemetryConfig config, {

  /// Override the random source (for deterministic sampling in tests).
  double Function()? randomSource,

  /// Override the app-exit hook (for tests / custom hosts).
  LifecycleHook? lifecycleHook,
}) {
  if (config.enabled == false) {
    return createNoopTelemetry();
  }

  final preset = resolvePreset(config.env);
  final sampleRate = config.sampleRate ?? preset.sampleRate;
  final redactKeys = config.redactKeys ?? const <String>[];
  final rng = randomSource ?? Random().nextDouble;

  final sinks = <String, TelemetrySink>{};
  final sinkOrder = <String>[];
  final buffer = <_Entry>[];

  void addSinkInternal(TelemetrySink sink) {
    if (sinks.containsKey(sink.name)) {
      sinks[sink.name] = sink;
    } else {
      sinks[sink.name] = sink;
      sinkOrder.add(sink.name);
    }
  }

  // Console transport is always present as the zero-dependency baseline.
  addSinkInternal(createConsoleSink(ConsoleSinkOptions(pretty: preset.pretty)));

  // When an endpoint is configured, attempt to attach the vendor engine. The
  // construction is async + lazy so the optional vendor never becomes
  // required and vendor names stay out of the public API.
  if (config.endpoint != null) {
    final endpoint = config.endpoint!;
    // ignore: discarded_futures
    createFaroSink(FaroEngineOptions(app: config.app, endpoint: endpoint))
        .then((faro) {
          if (faro != null) addSinkInternal(faro);
        })
        .catchError((_) {
          // Vendor absent or init failed — console remains.
        });
  }

  bool shouldSample() {
    if (sampleRate >= 1) return true;
    if (sampleRate <= 0) return false;
    return rng() < sampleRate;
  }

  void deliver(_Entry entry) {
    for (final name in sinkOrder) {
      final sink = sinks[name];
      if (sink == null) continue;
      if (entry.kind == 'log') {
        sink.log(entry.logRecord!);
      } else {
        sink.span(entry.spanRecord!);
      }
    }
  }

  Future<void> flushBuffer() async {
    if (buffer.isNotEmpty) {
      final pending = List<_Entry>.from(buffer);
      buffer.clear();
      for (final entry in pending) {
        deliver(entry);
      }
    }
    await Future.wait(
      sinkOrder.map((name) => sinks[name]?.flush() ?? Future<void>.value()),
    );
  }

  void dispatch(_Entry entry) {
    if (preset.batch) {
      buffer.add(entry);
      if (buffer.length >= preset.batchSize) {
        // ignore: discarded_futures
        flushBuffer();
      }
      return;
    }
    deliver(entry);
  }

  // ---- app-exit beacon flush (production preset) --------------------------
  // Uniform across all targets: web maps to pagehide/visibilitychange,
  // non-web maps to process/lifecycle signals — handled internally behind
  // the single [LifecycleHook] surface.
  if (preset.beaconFlush) {
    final hook = lifecycleHook ?? LifecycleHook();
    hook.onExit(() {
      // ignore: discarded_futures
      flushBuffer();
    });
  }

  late final Telemetry Function(LogContext) makeLogger;

  makeLogger = (LogContext boundContext) {
    void emit(LogLevel level, String message, [LogContext? context]) {
      if (LEVEL_ORDER[level]! < LEVEL_ORDER[preset.minLevel]!) return;
      if (!shouldSample()) return;
      final merged = redact(<String, Object?>{
        ...boundContext,
        ...?context,
      }, redactKeys);
      final record = LogRecord(
        level: level,
        message: message,
        timestamp: DateTime.now().millisecondsSinceEpoch,
        app: config.app,
        env: config.env,
        context: merged,
      );
      dispatch(_Entry.log(record));
    }

    return _TelemetryImpl(
      emit: emit,
      makeChild: (ctx) =>
          makeLogger(<String, Object?>{...boundContext, ...ctx}),
      startSpanImpl: (name, attributes) {
        final startTime = DateTime.now().millisecondsSinceEpoch;
        var ended = false;
        return _SpanImpl(() => ended, (value) => ended = value, (opts) {
          final endTime = DateTime.now().millisecondsSinceEpoch;
          final merged = redact(<String, Object?>{
            ...boundContext,
            ...?attributes,
            ...?opts?.attributes,
          }, redactKeys);
          final err = opts?.error;
          final record = SpanRecord(
            name: name,
            startTime: startTime,
            endTime: endTime,
            durationMs: endTime - startTime,
            app: config.app,
            env: config.env,
            context: merged,
            status: err != null ? 'error' : 'ok',
            error: err != null
                ? SpanError(
                    name: (err is Error || err is Exception)
                        ? err.runtimeType.toString()
                        : 'Error',
                    message: err.toString(),
                  )
                : null,
          );
          dispatch(_Entry.span(record));
        });
      },
      flushImpl: flushBuffer,
      sinksImpl: () => List<String>.from(sinkOrder),
      addSinkImpl: addSinkInternal,
      removeSinkImpl: (name) {
        if (sinks.containsKey(name)) {
          sinks.remove(name);
          sinkOrder.remove(name);
        }
      },
    );
  };

  return makeLogger(<String, Object?>{});
}

class _SpanImpl implements Span {
  _SpanImpl(this._isEnded, this._setEnded, this._onEnd);

  final bool Function() _isEnded;
  final void Function(bool) _setEnded;
  final void Function(SpanEndOptions?) _onEnd;

  @override
  void end([SpanEndOptions? opts]) {
    if (_isEnded()) return;
    _setEnded(true);
    _onEnd(opts);
  }
}

class _TelemetryImpl implements Telemetry {
  _TelemetryImpl({
    required void Function(LogLevel, String, [LogContext?]) emit,
    required Telemetry Function(LogContext) makeChild,
    required Span Function(String, LogContext?) startSpanImpl,
    required Future<void> Function() flushImpl,
    required List<String> Function() sinksImpl,
    required void Function(TelemetrySink) addSinkImpl,
    required void Function(String) removeSinkImpl,
  }) : _emit = emit,
       _makeChild = makeChild,
       _startSpan = startSpanImpl,
       _flush = flushImpl,
       _sinks = sinksImpl,
       _addSink = addSinkImpl,
       _removeSink = removeSinkImpl;

  final void Function(LogLevel, String, [LogContext?]) _emit;
  final Telemetry Function(LogContext) _makeChild;
  final Span Function(String, LogContext?) _startSpan;
  final Future<void> Function() _flush;
  final List<String> Function() _sinks;
  final void Function(TelemetrySink) _addSink;
  final void Function(String) _removeSink;

  @override
  void debug(String message, [LogContext? context]) =>
      _emit(LogLevel.debug, message, context);

  @override
  void info(String message, [LogContext? context]) =>
      _emit(LogLevel.info, message, context);

  @override
  void warn(String message, [LogContext? context]) =>
      _emit(LogLevel.warn, message, context);

  @override
  void error(String message, [LogContext? context]) =>
      _emit(LogLevel.error, message, context);

  @override
  void fatal(String message, [LogContext? context]) =>
      _emit(LogLevel.fatal, message, context);

  @override
  Telemetry child(LogContext context) => _makeChild(context);

  @override
  Span startSpan(String name, [LogContext? attributes]) =>
      _startSpan(name, attributes);

  @override
  Future<void> flush() => _flush();

  @override
  List<String> get sinks => _sinks();

  @override
  void addSink(TelemetrySink sink) => _addSink(sink);

  @override
  void removeSink(String name) => _removeSink(name);
}
