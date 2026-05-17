/// Mobile identity persistence (internal-only).
///
/// On Android/iOS the persistent analytics identity (the resettable,
/// non-PII `anonymousId` + session) must live in **platform-appropriate
/// durable storage**:
///   - iOS  : Keychain (via the consumer's secure-storage plugin)
///   - Android : EncryptedSharedPreferences / Keystore-backed prefs
///
/// `refraction_ui` is a UI library and MUST stay dependency-free (CLAUDE.md:
/// "minimize pub deps"; the package currently has zero runtime deps). Hard-
/// depending on `flutter_secure_storage`/`shared_preferences` would force a
/// native Keychain/Keystore + plugin channel onto **every** consumer of the
/// UI library even if they never touch analytics. So — exactly like the web
/// epic keeps `posthog-js` an optional, never-bundled peer — the secure store
/// is reached through a tiny injectable **port** ([SecureKeyValueStore]). The
/// consumer wires their existing `flutter_secure_storage` (or
/// `shared_preferences`) instance in once; nothing is bundled and there is no
/// public-API change. The surface is identical on every target.
///
/// Persistence is **consent-gated**: until the required consent categories are
/// granted, the store is read-only-empty and writes are dropped, so **no
/// identifier is ever written to disk before consent** (App Store / Play
/// Data-Safety requirement). On consent revoke / reset the keys are purged.
library;

import 'dart:async';
import 'dart:convert';

import '../types.dart';

/// Minimal async secure key/value port — structurally compatible with
/// `flutter_secure_storage` (`read`/`write`/`delete`) and trivially adaptable
/// to `shared_preferences`. Injected by the consumer; never bundled.
abstract class SecureKeyValueStore {
  FutureOr<String?> read(String key);
  FutureOr<void> write(String key, String value);
  FutureOr<void> delete(String key);
}

/// An in-memory [SecureKeyValueStore] for tests and as a safe default when no
/// platform store is injected (degrades to per-process, like the core's
/// memory storage fallback — never crashes a consuming app).
class InMemorySecureStore implements SecureKeyValueStore {
  final Map<String, String> _m = {};

  @override
  String? read(String key) => _m[key];

  @override
  void write(String key, String value) => _m[key] = value;

  @override
  void delete(String key) => _m.remove(key);
}

/// Predicate that reports whether persistence is currently permitted. Wired to
/// the consent gate by the engine layer so identity persistence flips on/off
/// with consent at runtime.
typedef ConsentPredicate = bool Function();

/// A synchronous [AnalyticsStorage] (the SPI the core [Identity]/[Session]
/// engines speak) backed by an **async** secure store, with a **consent gate**
/// in front of every read/write.
///
/// Design:
///   - The core engines call [get]/[set]/[remove] synchronously. We service
///     reads from a hydrated in-memory mirror and mirror writes through to the
///     async secure store in the background (durable across launches; the
///     mirror keeps the SPI synchronous — same trick the core file-store uses).
///   - **Before consent**: [get] returns `null` (so [Identity] does NOT mint
///     and persist an id) and [set]/[remove] are no-ops → nothing hits disk.
///   - On consent grant the engine calls [load] to hydrate from disk (if a
///     prior consented session persisted anything) and subsequent writes flow.
///   - On revoke/reset the engine calls [purge] to wipe the keys from the
///     secure store and the mirror.
class ConsentGatedSecureStorage implements AnalyticsStorage {
  ConsentGatedSecureStorage({
    required SecureKeyValueStore store,
    required ConsentPredicate hasConsent,
    String namespace = _defaultNamespace,
  }) : _store = store,
       _hasConsent = hasConsent,
       _ns = namespace;

  static const String _defaultNamespace = 'rfx.analytics';

  final SecureKeyValueStore _store;
  final ConsentPredicate _hasConsent;
  final String _ns;

  /// Synchronous mirror of the durable store (only ever populated while
  /// consent holds — pre-consent it stays empty so no id is materialised).
  final Map<String, String> _mirror = {};
  final Set<String> _known = {};

  String _k(String key) => '$_ns:$key';

  /// Hydrate the synchronous mirror from the durable secure store. Safe to
  /// call repeatedly; a no-op (and intentionally does NOT touch disk) until
  /// consent is granted, guaranteeing no pre-consent identifier read either.
  Future<void> load(Iterable<String> keys) async {
    if (!_hasConsent()) return;
    for (final key in keys) {
      _known.add(key);
      try {
        final v = await _store.read(_k(key));
        if (v != null) _mirror[key] = v;
      } catch (_) {
        // Keychain/Keystore unavailable (e.g. locked device) — degrade to the
        // in-memory mirror; never crash the consuming app.
      }
    }
  }

  @override
  String? get(String key) {
    if (!_hasConsent()) return null;
    return _mirror[key];
  }

  @override
  void set(String key, String value) {
    if (!_hasConsent()) return; // no identifier persisted before consent
    _known.add(key);
    _mirror[key] = value;
    // Mirror through to durable storage asynchronously; the synchronous SPI
    // contract is honoured by the in-memory mirror above.
    unawaited(_safeWrite(_k(key), value));
  }

  @override
  void remove(String key) {
    _mirror.remove(key);
    if (!_hasConsent()) return;
    unawaited(_safeDelete(_k(key)));
  }

  /// Purge every analytics key from the durable secure store and the mirror
  /// (consent revoke / privacy-safe reset). Best-effort; never throws.
  Future<void> purge() async {
    final keys = {..._known, ..._mirror.keys};
    _mirror.clear();
    for (final key in keys) {
      await _safeDelete(_k(key));
    }
  }

  Future<void> _safeWrite(String key, String value) async {
    try {
      await _store.write(key, value);
    } catch (_) {
      // Degrade silently — mirror still serves reads this process.
    }
  }

  Future<void> _safeDelete(String key) async {
    try {
      await _store.delete(key);
    } catch (_) {
      // Degrade silently.
    }
  }

  /// Diagnostic: the durable keys this store would manage for [base] keys.
  static List<String> namespacedKeys(
    Iterable<String> base, {
    String namespace = _defaultNamespace,
  }) => [for (final b in base) '$namespace:$b'];
}

/// Convenience: encode/decode a small JSON blob through the gated store (used
/// by tests and the engine layer for compound identity records).
String encodeIdentityBlob(Map<String, Object?> data) => jsonEncode(data);

Map<String, Object?>? decodeIdentityBlob(String? raw) {
  if (raw == null || raw.isEmpty) return null;
  try {
    final m = jsonDecode(raw);
    return m is Map ? m.cast<String, Object?>() : null;
  } catch (_) {
    return null;
  }
}
