/// Default zero-dependency console transport — a 1:1 port of
/// `@refraction-ui/logger` `console-sink.ts`.
library;

import 'dart:convert';

import 'types.dart';

/// A console-ish writer with one method per level. Injectable for tests so a
/// suite can capture output without touching the real console. Mirrors the
/// `Pick<Console, 'debug' | 'info' | 'warn' | 'error'>` shape on the web.
abstract class ConsoleLike {
  /// Write a debug-level line.
  void debug(String line, Object? payload);

  /// Write an info-level line.
  void info(String line, Object? payload);

  /// Write a warn-level line.
  void warn(String line, Object? payload);

  /// Write an error-level line.
  void error(String line, Object? payload);
}

/// Console method used for each level (`fatal` -> `error`, as on the web).
const Map<LogLevel, String> _method = <LogLevel, String>{
  LogLevel.debug: 'debug',
  LogLevel.info: 'info',
  LogLevel.warn: 'warn',
  LogLevel.error: 'error',
  LogLevel.fatal: 'error',
};

/// Default [ConsoleLike] — writes through `dart:developer`-free `print`
/// equivalents. Platform-agnostic: identical on web/android/ios/desktop.
class _DefaultConsole implements ConsoleLike {
  const _DefaultConsole();

  void _emit(String tag, String line, Object? payload) {
    // ignore: avoid_print
    print('$tag $line ${_stringifyPayload(payload)}');
  }

  static String _stringifyPayload(Object? payload) {
    if (payload == null) return '';
    try {
      return jsonEncode(payload);
    } catch (_) {
      return payload.toString();
    }
  }

  @override
  void debug(String line, Object? payload) => _emit('DEBUG', line, payload);

  @override
  void info(String line, Object? payload) => _emit('INFO', line, payload);

  @override
  void warn(String line, Object? payload) => _emit('WARN', line, payload);

  @override
  void error(String line, Object? payload) => _emit('ERROR', line, payload);
}

/// Options for [createConsoleSink].
class ConsoleSinkOptions {
  /// Creates [ConsoleSinkOptions].
  const ConsoleSinkOptions({this.pretty, this.console});

  /// Single-line pretty output (vs. structured JSON). Defaults to `true`.
  final bool? pretty;

  /// Console to write to (injectable for tests). Defaults to a built-in.
  final ConsoleLike? console;
}

class _ConsoleSink implements TelemetrySink {
  _ConsoleSink(this._pretty, this._out);

  final bool _pretty;
  final ConsoleLike _out;

  @override
  String get name => 'console';

  void _emit(LogLevel level, String line, Object? payload) {
    switch (_method[level]) {
      case 'debug':
        _out.debug(line, payload);
        break;
      case 'info':
        _out.info(line, payload);
        break;
      case 'warn':
        _out.warn(line, payload);
        break;
      case 'error':
      default:
        _out.error(line, payload);
        break;
    }
  }

  @override
  void log(LogRecord record) {
    if (_pretty) {
      final ts = DateTime.fromMillisecondsSinceEpoch(
        record.timestamp,
        isUtc: true,
      ).toIso8601String();
      _emit(
        record.level,
        '$ts ${record.level.wireName.toUpperCase()} '
        '[${record.app}] ${record.message}',
        record.context,
      );
    } else {
      _emit(
        record.level,
        jsonEncode(<String, Object?>{
          'type': 'log',
          ...logRecordToJson(record),
        }),
        record.context,
      );
    }
  }

  @override
  void span(SpanRecord record) {
    final level = record.status == 'error' ? LogLevel.error : LogLevel.debug;
    if (_pretty) {
      _emit(
        level,
        '[span] ${record.name} '
        '${record.durationMs.toDouble().toStringAsFixed(2)}ms '
        '(${record.status})',
        record.context,
      );
    } else {
      _emit(
        level,
        jsonEncode(<String, Object?>{
          'type': 'span',
          ...spanRecordToJson(record),
        }),
        record.context,
      );
    }
  }

  @override
  Future<void> flush() async {
    // Console is synchronous — nothing buffered.
  }
}

/// Default zero-dependency transport. Used whenever no `endpoint` is set.
/// Synchronous; [TelemetrySink.flush] is a resolved no-op (nothing buffered).
TelemetrySink createConsoleSink([ConsoleSinkOptions? opts]) {
  final pretty = opts?.pretty ?? true;
  final out = opts?.console ?? const _DefaultConsole();
  return _ConsoleSink(pretty, out);
}

/// JSON projection of a [LogRecord], matching the web structured-JSON shape.
Map<String, Object?> logRecordToJson(LogRecord r) => <String, Object?>{
  'level': r.level.wireName,
  'message': r.message,
  'timestamp': r.timestamp,
  'app': r.app,
  'env': r.env.wireName,
  'context': r.context,
};

/// JSON projection of a [SpanRecord], matching the web structured-JSON shape.
Map<String, Object?> spanRecordToJson(SpanRecord r) => <String, Object?>{
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
