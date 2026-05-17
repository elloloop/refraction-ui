import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/analytics/mobile/secure_storage.dart';

void main() {
  group('ConsentGatedSecureStorage — consent-gated identity persistence', () {
    test('drops reads/writes entirely BEFORE consent (no id on disk)', () {
      final backing = InMemorySecureStore();
      var consent = false;
      final s = ConsentGatedSecureStorage(
        store: backing,
        hasConsent: () => consent,
      );

      s.set('rfx:analytics:anon', 'anon-1');
      expect(s.get('rfx:analytics:anon'), isNull);
      // Nothing reached the durable store either.
      expect(backing.read('rfx.analytics:rfx:analytics:anon'), isNull);

      consent = true;
      // Still null — pre-consent write was a no-op (not buffered).
      expect(s.get('rfx:analytics:anon'), isNull);
    });

    test('no id is minted/persisted when Identity runs pre-consent', () {
      final backing = InMemorySecureStore();
      final s = ConsentGatedSecureStorage(
        store: backing,
        hasConsent: () => false,
      );
      // Identity engine speaks the AnalyticsStorage SPI.
      final id = Identity(IdentityConfig(storage: s));
      // It still returns an in-memory anon id (so the API never breaks)…
      expect(id.anonymousId(), isNotEmpty);
      // …but absolutely nothing was written to the secure store.
      expect(backing.read('rfx.analytics:rfx:analytics:anon'), isNull);
      expect(s.get('rfx:analytics:anon'), isNull);
    });

    test('persists + round-trips identity AFTER consent', () async {
      final backing = InMemorySecureStore();
      var consent = false;
      final s = ConsentGatedSecureStorage(
        store: backing,
        hasConsent: () => consent,
      );

      consent = true;
      final id1 = Identity(IdentityConfig(storage: s));
      final anon = id1.anonymousId();
      expect(isUuidV4(anon), isTrue);
      // Mirrored to the durable secure store.
      expect(backing.read('rfx.analytics:rfx:analytics:anon'), anon);

      // A fresh gated store hydrating from disk sees the SAME anon id
      // (persists across "relaunch").
      final s2 = ConsentGatedSecureStorage(
        store: backing,
        hasConsent: () => true,
      );
      await s2.load(['rfx:analytics:anon']);
      final id2 = Identity(IdentityConfig(storage: s2));
      expect(id2.anonymousId(), anon);
    });

    test('load() is a no-op (and reads nothing) until consent', () async {
      final backing = InMemorySecureStore()
        ..write('rfx.analytics:rfx:analytics:anon', 'leaked');
      var consent = false;
      final s = ConsentGatedSecureStorage(
        store: backing,
        hasConsent: () => consent,
      );
      await s.load(['rfx:analytics:anon']);
      expect(s.get('rfx:analytics:anon'), isNull);

      consent = true;
      await s.load(['rfx:analytics:anon']);
      expect(s.get('rfx:analytics:anon'), 'leaked');
    });

    test('purge() wipes the secure store + mirror (reset/revoke)', () async {
      final backing = InMemorySecureStore();
      final s = ConsentGatedSecureStorage(
        store: backing,
        hasConsent: () => true,
      );
      s.set('rfx:analytics:anon', 'anon-x');
      s.set('rfx:analytics:session', 'sess-x');
      expect(backing.read('rfx.analytics:rfx:analytics:anon'), 'anon-x');

      await s.purge();
      expect(s.get('rfx:analytics:anon'), isNull);
      expect(s.get('rfx:analytics:session'), isNull);
      expect(backing.read('rfx.analytics:rfx:analytics:anon'), isNull);
      expect(backing.read('rfx.analytics:rfx:analytics:session'), isNull);
    });

    test('reset() through Identity re-mints + re-persists post-consent', () {
      final backing = InMemorySecureStore();
      final s = ConsentGatedSecureStorage(
        store: backing,
        hasConsent: () => true,
      );
      final id = Identity(IdentityConfig(storage: s));
      final before = id.anonymousId();
      final after = id.reset();
      expect(after, isNot(before));
      expect(isUuidV4(after), isTrue);
      expect(backing.read('rfx.analytics:rfx:analytics:anon'), after);
    });

    test('namespacedKeys reports the durable key layout', () {
      expect(ConsentGatedSecureStorage.namespacedKeys(['a', 'b']), [
        'rfx.analytics:a',
        'rfx.analytics:b',
      ]);
    });
  });

  group('identity blob codec', () {
    test('encodes/decodes; tolerates corrupt/empty input', () {
      final raw = encodeIdentityBlob({'anon': 'x', 'n': 1});
      expect(decodeIdentityBlob(raw), {'anon': 'x', 'n': 1});
      expect(decodeIdentityBlob(null), isNull);
      expect(decodeIdentityBlob(''), isNull);
      expect(decodeIdentityBlob('{not json'), isNull);
    });
  });
}
