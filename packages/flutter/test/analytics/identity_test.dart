import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  group('Identity — anonymousId', () {
    test('mints a UUIDv4 anonymousId on first use', () {
      final id = Identity(IdentityConfig(storage: createMemoryStorage()));
      expect(isUuidV4(id.anonymousId()), isTrue);
    });

    test('persists the anonymousId across instances (cross-tab)', () {
      final storage = createMemoryStorage();
      final a = Identity(IdentityConfig(storage: storage));
      final b = Identity(IdentityConfig(storage: storage));
      expect(b.anonymousId(), a.anonymousId());
    });

    test('ignores a corrupt persisted value and re-mints', () {
      final storage = createMemoryStorage();
      storage.set('rfx:analytics:anon', 'garbage-not-a-uuid');
      final id = Identity(IdentityConfig(storage: storage));
      expect(isUuidV4(id.anonymousId()), isTrue);
    });
  });

  group('Identity — userId (opaque, app-supplied)', () {
    test('is null until identify()', () {
      final id = Identity(IdentityConfig(storage: createMemoryStorage()));
      expect(id.userId(), isNull);
    });

    test('stores the opaque user id verbatim and does not persist it', () {
      final storage = createMemoryStorage();
      final id = Identity(IdentityConfig(storage: storage));
      id.setUserId('user_42');
      expect(id.userId(), 'user_42');
      expect(storage.get('rfx:analytics:anon'), isNot(contains('user_42')));
    });
  });

  group('Identity — alias stitching', () {
    test('stitches anonymous → user when no prior user', () {
      final id = Identity(IdentityConfig(storage: createMemoryStorage()));
      final anon = id.anonymousId();
      final stitch = id.alias('user_1');
      expect(stitch.previousId, anon);
      expect(stitch.userId, 'user_1');
      expect(id.userId(), 'user_1');
    });

    test('stitches old user → new user', () {
      final id = Identity(IdentityConfig(storage: createMemoryStorage()));
      id.setUserId('old');
      final stitch = id.alias('new');
      expect(stitch.previousId, 'old');
      expect(stitch.userId, 'new');
    });

    test('honours an explicit previousId', () {
      final id = Identity(IdentityConfig(storage: createMemoryStorage()));
      final stitch = id.alias('new', 'explicit-prev');
      expect(stitch.previousId, 'explicit-prev');
    });
  });

  group('Identity — reset (privacy-safe logout)', () {
    test('mints a fresh anonymousId and clears the user binding', () {
      final storage = createMemoryStorage();
      final id = Identity(IdentityConfig(storage: storage));
      final before = id.anonymousId();
      id.setUserId('user_1');
      final fresh = id.reset();
      expect(fresh, isNot(before));
      expect(id.anonymousId(), fresh);
      expect(id.userId(), isNull);
      expect(storage.get('rfx:analytics:anon'), fresh);
    });
  });
}
