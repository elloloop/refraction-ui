/// Default persistent storage for dart:io targets (Android, iOS, macOS,
/// Windows, Linux). A single JSON file under the OS temp/app dir holds the
/// small set of analytics keys (anonymousId, session). This keeps the package
/// dependency-free (no shared_preferences / path_provider) while still being
/// durable across launches. The file path is namespaced so it does not
/// collide with the consuming app's own data.
library;

import 'dart:convert';
import 'dart:io';

import 'types.dart';

class _FileStorage implements AnalyticsStorage {
  _FileStorage(this._file) {
    _load();
  }

  final File _file;
  final Map<String, String> _cache = {};

  void _load() {
    try {
      if (_file.existsSync()) {
        final raw = _file.readAsStringSync();
        if (raw.isNotEmpty) {
          final decoded = jsonDecode(raw);
          if (decoded is Map) {
            decoded.forEach((k, v) {
              if (v is String) _cache['$k'] = v;
            });
          }
        }
      }
    } catch (_) {
      // Corrupt / unreadable — treat as empty.
    }
  }

  void _persist() {
    try {
      _file.parent.createSync(recursive: true);
      _file.writeAsStringSync(jsonEncode(_cache), flush: true);
    } catch (_) {
      // Read-only FS / quota — degrade silently (in-memory cache still works).
    }
  }

  @override
  String? get(String key) => _cache[key];

  @override
  void set(String key, String value) {
    _cache[key] = value;
    _persist();
  }

  @override
  void remove(String key) {
    _cache.remove(key);
    _persist();
  }
}

AnalyticsStorage? createPlatformStorage() {
  try {
    final base = Directory.systemTemp.path;
    final file = File('$base/refraction_ui_analytics/store.json');
    return _FileStorage(file);
  } catch (_) {
    return null;
  }
}
