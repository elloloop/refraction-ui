/// Crash capture + crash-on-next-launch persistence.
///
/// Installs the three Flutter/Dart error hooks and routes every captured
/// error to a [Logger] (so it flows through the same redaction → sink →
/// durable-queue pipeline as any other record):
///
///  - `FlutterError.onError`            — framework/build/render errors
///  - `PlatformDispatcher.instance.onError` — uncaught async/zone errors
///  - `Isolate.current.addErrorListener` — errors on the current isolate
///    (background isolates forward via the isolate-aware queue, see
///    `isolate_queue.dart`)
///
/// **Crash-on-next-launch**: an error classified *fatal* (the default for the
/// platform-dispatcher hook, which only fires for otherwise-unhandled errors
/// that typically terminate the app) is first written synchronously to the
/// durable store. On the *next* [TelemetryCrashGuard.install] the persisted
/// crash is re-emitted as a `fatal` record and cleared, so a crash that kills
/// the process before flush still reaches the collector on the following run.
///
/// This is an internal detail behind the existing surface; the consumer only
/// calls one method. Uniform across web / android / ios / desktop — the hooks
/// that don't exist on a given platform are simply not installed.
library;

import 'dart:convert';
import 'dart:isolate';

import 'package:flutter/foundation.dart';

import 'durable_store.dart';
import 'types.dart';

/// Installed crash guard. [dispose] removes the hooks (mainly for tests).
class TelemetryCrashGuard {
  TelemetryCrashGuard._(this._restore, this._isolatePort);

  final void Function() _restore;
  final RawReceivePort? _isolatePort;
  bool _disposed = false;

  /// Detach hooks / close the isolate error port.
  void dispose() {
    if (_disposed) return;
    _disposed = true;
    _restore();
    _isolatePort?.close();
  }
}

const String _crashKey = 'telemetry.crash';

/// Install crash capture against [logger]. Call once, as early as possible
/// (before `runApp`), ideally inside the same zone as the app.
///
/// - [store] controls crash-on-next-launch persistence (defaults to the
///   platform durable store).
/// - [installIsolateListener] adds `Isolate.current.addErrorListener`
///   (skip in environments where that throws, e.g. some test runners).
/// - [now] is injectable for deterministic tests.
TelemetryCrashGuard installCrashCapture(
  Logger logger, {
  DurableStore? store,
  bool installIsolateListener = true,
  DateTime Function()? now,
}) {
  final durable = resolveDurableStore(store);
  final clock = now ?? DateTime.now;

  // 1. Replay a crash persisted by the *previous* run, then clear it.
  _replayPersistedCrash(logger, durable);

  void persistFatal(Object error, StackTrace? stack) {
    try {
      durable.write(
        _crashKey,
        jsonEncode(<String, Object?>{
          'message': error.toString(),
          'type': error.runtimeType.toString(),
          'stack': stack?.toString(),
          'timestamp': clock().millisecondsSinceEpoch,
        }),
      );
    } catch (_) {
      // Best-effort: if even persistence fails we still tried the live emit.
    }
  }

  void emit(
    Object error,
    StackTrace? stack, {
    required bool fatal,
    required String source,
  }) {
    if (fatal) {
      // Persist BEFORE the live emit so a hard crash still has it on disk.
      persistFatal(error, stack);
    }
    final ctx = <String, Object?>{
      'error.type': error.runtimeType.toString(),
      'error.source': source,
      if (stack != null) 'error.stack': stack.toString(),
    };
    if (fatal) {
      logger.fatal(error.toString(), ctx);
    } else {
      logger.error(error.toString(), ctx);
    }
  }

  // 2. FlutterError.onError (framework errors — non-fatal by default; the
  //    framework usually keeps running).
  final prevFlutterOnError = FlutterError.onError;
  FlutterError.onError = (FlutterErrorDetails details) {
    emit(
      details.exception,
      details.stack,
      fatal: false,
      source: 'FlutterError.onError',
    );
    // Preserve any pre-existing handler (e.g. the consumer's, or the
    // red-screen presenter) so we never swallow behavior.
    if (prevFlutterOnError != null) {
      prevFlutterOnError(details);
    } else {
      FlutterError.presentError(details);
    }
  };

  // 3. PlatformDispatcher.onError (uncaught async — these are fatal: they
  //    would otherwise crash the app).
  final prevPlatformOnError = PlatformDispatcher.instance.onError;
  PlatformDispatcher.instance.onError = (Object error, StackTrace stack) {
    emit(
      error,
      stack,
      fatal: true,
      source: 'PlatformDispatcher.onError',
    );
    // Return the previous handler's decision when present; otherwise `true`
    // = "handled" (we logged it). The consumer can still wrap us.
    if (prevPlatformOnError != null) {
      return prevPlatformOnError(error, stack);
    }
    return true;
  };

  // 4. Current-isolate error listener. Errors arrive as a 2-element list
  //    [error, stackTrace] (both String when crossing the port).
  RawReceivePort? isolatePort;
  if (installIsolateListener) {
    try {
      isolatePort = RawReceivePort((dynamic pair) {
        final list = pair as List<dynamic>;
        final err = list.isNotEmpty ? list[0] : 'unknown isolate error';
        final st = list.length > 1 && list[1] != null
            ? StackTrace.fromString(list[1].toString())
            : null;
        emit(
          err is Object ? err : '$err',
          st,
          fatal: true,
          source: 'Isolate.onError',
        );
      });
      Isolate.current.addErrorListener(isolatePort.sendPort);
    } catch (_) {
      isolatePort?.close();
      isolatePort = null;
    }
  }

  void restore() {
    FlutterError.onError = prevFlutterOnError;
    PlatformDispatcher.instance.onError = prevPlatformOnError;
    if (isolatePort != null) {
      try {
        Isolate.current.removeErrorListener(isolatePort.sendPort);
      } catch (_) {
        // ignore
      }
    }
  }

  return TelemetryCrashGuard._(restore, isolatePort);
}

void _replayPersistedCrash(Logger logger, DurableStore store) {
  try {
    final raw = store.read(_crashKey);
    if (raw == null || raw.isEmpty) return;
    final decoded = jsonDecode(raw);
    if (decoded is Map) {
      logger.fatal(
        decoded['message']?.toString() ?? 'previous-launch crash',
        <String, Object?>{
          'error.type': decoded['type']?.toString() ?? 'Error',
          'error.source': 'crash-on-next-launch',
          if (decoded['stack'] != null) 'error.stack': decoded['stack'],
          if (decoded['timestamp'] != null)
            'error.originalTimestamp': decoded['timestamp'],
        },
      );
    }
  } catch (_) {
    // Corrupt crash blob — ignore.
  } finally {
    store.remove(_crashKey);
  }
}

/// Test helper: persist a synthetic crash as if a prior run died, so a
/// subsequent [installCrashCapture] replays it. Not part of the consumer flow.
@visibleForTesting
void debugWritePersistedCrash(
  DurableStore store, {
  required String message,
  String type = 'StateError',
}) {
  store.write(
    _crashKey,
    jsonEncode(<String, Object?>{
      'message': message,
      'type': type,
      'stack': null,
      'timestamp': 0,
    }),
  );
}
