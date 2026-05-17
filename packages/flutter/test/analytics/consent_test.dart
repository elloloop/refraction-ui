import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  group('Consent', () {
    test('starts with nothing granted by default', () {
      final c = Consent(null);
      expect(c.granted(), isEmpty);
      expect(c.isGranted('analytics'), isFalse);
    });

    test('seeds granted categories from config', () {
      final c = Consent(
        const ConsentConfig(granted: ['analytics', 'marketing']),
      );
      expect(c.isGranted('analytics'), isTrue);
      expect(c.isGranted('marketing'), isTrue);
    });

    test('grant/revoke mutate the granted set', () {
      final c = Consent(null);
      c.grant(['analytics', 'marketing']);
      expect(c.granted()..sort(), ['analytics', 'marketing']);
      c.revoke(['marketing']);
      expect(c.isGranted('marketing'), isFalse);
      expect(c.isGranted('analytics'), isTrue);
    });

    test('allows() requires ALL categories of a sink (per-sink gating)', () {
      final c = Consent(const ConsentConfig(granted: ['analytics']));
      expect(c.allows(null), isTrue);
      expect(c.allows([]), isTrue);
      expect(c.allows(['analytics']), isTrue);
      expect(c.allows(['analytics', 'marketing']), isFalse);
      c.grant(['marketing']);
      expect(c.allows(['analytics', 'marketing']), isTrue);
    });

    test('exposes the strict flag from config', () {
      expect(Consent(null).strict, isFalse);
      expect(Consent(const ConsentConfig(strict: true)).strict, isTrue);
    });
  });
}
