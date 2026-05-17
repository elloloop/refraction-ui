/// Storage adapters.
///
/// Order of preference for the default: platform persistent storage
/// (browser localStorage on Flutter web; an app-support file on
/// Android/iOS/desktop) → in-memory. The package is platform-agnostic;
/// consumers can inject any [AnalyticsStorage] via config. The platform
/// difference is resolved by a conditional import and is invisible to the
/// consumer — uniform across every Flutter target.
library;

import 'types.dart';
// Default platform storage is selected at compile time. dart:io on
// Android/iOS/desktop, dart:html on Flutter web, memory otherwise.
import 'storage_stub.dart'
    if (dart.library.io) 'storage_io.dart'
    if (dart.library.html) 'storage_html.dart'
    as platform;

/// Volatile per-process store (no-persistence fallback).
class MemoryStorage implements AnalyticsStorage {
  final Map<String, String> _map = {};

  @override
  String? get(String key) => _map[key];

  @override
  void set(String key, String value) {
    _map[key] = value;
  }

  @override
  void remove(String key) {
    _map.remove(key);
  }
}

/// Construct an in-memory store.
AnalyticsStorage createMemoryStorage() => MemoryStorage();

/// Resolve the default storage for the current platform. A caller-supplied
/// storage always wins. Falls back to in-memory when no durable platform
/// store is reachable.
AnalyticsStorage resolveStorage([AnalyticsStorage? override]) {
  if (override != null) return override;
  try {
    final s = platform.createPlatformStorage();
    if (s != null) return s;
  } catch (_) {
    // Any platform-storage failure degrades silently to memory.
  }
  return createMemoryStorage();
}
