/// Append-only durable byte/line store for the offline telemetry queue.
///
/// One identical surface ([DurableStore]); the platform implementation is
/// chosen by a conditional import — a namespaced JSON file under the OS
/// app-support/temp dir on android/ios/desktop, `window.localStorage` on
/// Flutter web, an in-memory list everywhere else (tests). No new pub
/// dependency: `dart:io` / web interop only — the exact pattern Wave-0's
/// analytics module already uses.
///
/// Store-compliance: on iOS the only "required reason" API this code path can
/// touch is **file timestamp** (`NSFileSystemFreeSize` is NOT used; we use
/// `creationDate`/`modificationDate` implicitly via `File`), declared with
/// reason code **C617.1** ("display to the person ... the file timestamp")
/// in `PrivacyInfo.xcprivacy`. The queued payload contains only the records
/// the app already chose to emit (post-redaction) — see DATA_SAFETY.md.
library;

import 'durable_store_stub.dart'
    if (dart.library.io) 'durable_store_io.dart'
    if (dart.library.js_interop) 'durable_store_web.dart'
    as platform;

/// A tiny durable key→list-of-lines store. The queue keeps a single key
/// (`telemetry.queue`) holding newline-delimited JSON envelopes, plus an
/// optional crash key (`telemetry.crash`).
abstract class DurableStore {
  /// Read the full content for [key], or `null` when absent/unreadable.
  String? read(String key);

  /// Replace the content for [key] (durably, best-effort).
  void write(String key, String value);

  /// Delete [key].
  void remove(String key);
}

/// Volatile fallback store (used in pure unit tests / unsupported platforms).
class MemoryDurableStore implements DurableStore {
  final Map<String, String> _m = <String, String>{};

  @override
  String? read(String key) => _m[key];

  @override
  void write(String key, String value) => _m[key] = value;

  @override
  void remove(String key) => _m.remove(key);
}

/// Resolve the platform durable store. A caller-supplied store always wins;
/// any platform failure degrades silently to in-memory so telemetry never
/// throws because the disk was read-only.
DurableStore resolveDurableStore([DurableStore? override]) {
  if (override != null) return override;
  try {
    final s = platform.createPlatformDurableStore();
    if (s != null) return s;
  } catch (_) {
    // fall through
  }
  return MemoryDurableStore();
}
