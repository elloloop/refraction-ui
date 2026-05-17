/// Identity engine.
///
/// - `anonymousId`: persistent, non-PII, resettable UUIDv4 stored via the
///   storage SPI (secure platform store on mobile/desktop, localStorage on
///   web — internal, behind the uniform surface).
/// - `userId`: opaque, app-supplied; never persisted by the library (the app
///   owns the user record) — kept only in memory.
/// - `alias`: records a previous→current stitch for the wire envelope.
library;

import 'storage.dart';
import 'types.dart';
import 'uuid.dart';

const String _defaultKey = 'rfx:analytics:anon';

/// A previous→current identity stitch pair (for `alias`).
class IdentityStitch {
  const IdentityStitch({required this.userId, required this.previousId});
  final String userId;
  final String previousId;
}

/// Identity engine. Mirrors `createIdentity` from `@refraction-ui/analytics`.
class Identity {
  Identity(IdentityConfig? config)
    : _storage = resolveStorage(config?.storage),
      _key = config?.storageKey ?? _defaultKey {
    _anonymousId = _loadOrMintAnon();
  }

  final AnalyticsStorage _storage;
  final String _key;

  String? _userId;
  late String _anonymousId;

  String _loadOrMintAnon() {
    final existing = _storage.get(_key);
    if (isUuidV4(existing)) return existing!;
    final fresh = uuidv4();
    _storage.set(_key, fresh);
    return fresh;
  }

  String anonymousId() => _anonymousId;

  String? userId() => _userId;

  /// identify(): bind an opaque app user id (no validation, no persistence).
  void setUserId(String id) {
    _userId = id;
  }

  /// alias(): returns the stitch pair for the envelope. `previousId` defaults
  /// to the current user or anonymous id.
  IdentityStitch alias(String nextUserId, [String? previousId]) {
    final prev = previousId ?? _userId ?? _anonymousId;
    _userId = nextUserId;
    return IdentityStitch(userId: nextUserId, previousId: prev);
  }

  /// reset(): privacy-safe logout. Drops the user binding and mints a brand
  /// new anonymousId so the next visitor is not stitched to the old one.
  String reset() {
    _userId = null;
    _anonymousId = uuidv4();
    _storage.set(_key, _anonymousId);
    return _anonymousId;
  }
}
