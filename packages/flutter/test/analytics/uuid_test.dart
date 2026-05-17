import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  group('uuidv4', () {
    test('produces an RFC 4122 v4 shaped string', () {
      expect(uuidV4Re.hasMatch(uuidv4()), isTrue);
    });

    test('sets the version nibble to 4', () {
      for (var i = 0; i < 50; i++) {
        expect(uuidv4()[14], '4');
      }
    });

    test('sets the variant nibble to 8/9/a/b', () {
      for (var i = 0; i < 50; i++) {
        expect('89ab'.contains(uuidv4()[19]), isTrue);
      }
    });

    test('is collision-free across many draws', () {
      final seen = <String>{};
      for (var i = 0; i < 5000; i++) {
        seen.add(uuidv4());
      }
      expect(seen.length, 5000);
    });
  });

  group('isUuidV4', () {
    test('accepts valid v4 uuids', () {
      expect(isUuidV4(uuidv4()), isTrue);
    });

    test('rejects non-uuid strings and non-strings', () {
      expect(isUuidV4('not-a-uuid'), isFalse);
      expect(isUuidV4(''), isFalse);
      expect(isUuidV4(null), isFalse);
      expect(isUuidV4(123), isFalse);
      // v1-style (version nibble 1) must be rejected.
      expect(isUuidV4('00000000-0000-1000-8000-000000000000'), isFalse);
    });
  });
}
