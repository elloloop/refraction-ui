/// Deep redaction — a 1:1 port of `@refraction-ui/logger` `redact.ts`.
library;

import 'types.dart';

/// Deep-strip any object key whose name (case-insensitive) is in [keys].
/// Lists are walked; cycles are guarded; non-matching values pass through
/// unchanged. Returns a new structure — the input is never mutated.
LogContext redact(LogContext value, List<String> keys) {
  if (keys.isEmpty) return value;
  final lookup = <String>{for (final k in keys) k.toLowerCase()};
  return _walk(value, lookup, Set<Object>.identity()) as LogContext;
}

Object? _walk(Object? value, Set<String> keys, Set<Object> seen) {
  if (value == null) return value;
  if (value is String || value is num || value is bool) return value;

  if (value is Map || value is List) {
    if (seen.contains(value)) return '[Circular]';
    seen.add(value);
  } else {
    // Opaque object — not a plain map/list; pass through unchanged.
    return value;
  }

  if (value is List) {
    return value.map((item) => _walk(item, keys, seen)).toList();
  }

  final map = value as Map;
  final out = <String, Object?>{};
  map.forEach((k, v) {
    final key = k.toString();
    if (keys.contains(key.toLowerCase())) {
      out[key] = '[REDACTED]';
    } else {
      out[key] = _walk(v, keys, seen);
    }
  });
  return out;
}
