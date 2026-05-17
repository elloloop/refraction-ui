/// Durable store for `dart:io` targets (Android, iOS, macOS, Windows, Linux).
///
/// One namespaced file per key under the OS temp dir. Mirrors Wave-0's
/// analytics `storage_io.dart` exactly (no `path_provider`/`shared_preferences`
/// dependency) so the offline telemetry queue survives process restarts while
/// the package stays dependency-free. The directory name is namespaced so it
/// never collides with the consuming app's own data.
library;

import 'dart:io';

import 'durable_store.dart';

class _FileDurableStore implements DurableStore {
  _FileDurableStore(this._dir);

  final Directory _dir;

  File _fileFor(String key) {
    final safe = key.replaceAll(RegExp(r'[^A-Za-z0-9._-]'), '_');
    return File('${_dir.path}/$safe.ndjson');
  }

  @override
  String? read(String key) {
    try {
      final f = _fileFor(key);
      if (!f.existsSync()) return null;
      final raw = f.readAsStringSync();
      return raw.isEmpty ? null : raw;
    } catch (_) {
      return null;
    }
  }

  @override
  void write(String key, String value) {
    try {
      _dir.createSync(recursive: true);
      _fileFor(key).writeAsStringSync(value, flush: true);
    } catch (_) {
      // Read-only FS / quota — degrade silently.
    }
  }

  @override
  void remove(String key) {
    try {
      final f = _fileFor(key);
      if (f.existsSync()) f.deleteSync();
    } catch (_) {
      // ignore
    }
  }
}

DurableStore? createPlatformDurableStore() {
  try {
    final base = Directory.systemTemp.path;
    final dir = Directory('$base/refraction_ui_telemetry');
    return _FileDurableStore(dir);
  } catch (_) {
    return null;
  }
}
