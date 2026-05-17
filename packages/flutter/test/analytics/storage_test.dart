import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  group('MemoryStorage', () {
    test('round-trips values and reports null for missing keys', () {
      final s = createMemoryStorage();
      expect(s.get('k'), isNull);
      s.set('k', 'v');
      expect(s.get('k'), 'v');
      s.remove('k');
      expect(s.get('k'), isNull);
    });
  });

  group('resolveStorage', () {
    test('returns the override when supplied', () {
      final override = createMemoryStorage();
      expect(resolveStorage(override), same(override));
    });

    test('returns a working durable/memory store when no override given', () {
      // In the dart:io test VM this resolves to the file-backed default;
      // it must behave as a working AnalyticsStorage either way.
      final s = resolveStorage();
      s.set('rfx:storage:probe', 'y');
      expect(s.get('rfx:storage:probe'), 'y');
      s.remove('rfx:storage:probe');
      expect(s.get('rfx:storage:probe'), isNull);
    });
  });
}
