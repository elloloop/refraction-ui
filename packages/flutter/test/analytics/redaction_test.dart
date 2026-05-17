import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  group('Redactor — built-in PII deny-list', () {
    test('redacts email/phone/name and common variants', () {
      final r = Redactor();
      final out = r.redact({
        'email': 'a@b.com',
        'userEmail': 'c@d.com',
        'email_address': 'e@f.com',
        'phone': '+1555',
        'phoneNumber': '+1556',
        'firstName': 'Ada',
        'lastName': 'Lovelace',
        'fullName': 'Ada Lovelace',
        'plan': 'pro',
      })!;
      expect(out['email'], redacted);
      expect(out['userEmail'], redacted);
      expect(out['email_address'], redacted);
      expect(out['phone'], redacted);
      expect(out['phoneNumber'], redacted);
      expect(out['firstName'], redacted);
      expect(out['lastName'], redacted);
      expect(out['fullName'], redacted);
      expect(out['plan'], 'pro');
    });

    test('exposes the deny-list and redaction token', () {
      expect(piiDenyList, contains('email'));
      expect(piiDenyList, contains('phone'));
      expect(redacted, '[REDACTED]');
    });

    test('recurses into nested maps and lists', () {
      final r = Redactor();
      final out = r.redact({
        'profile': {'email': 'x@y.com', 'tier': 'gold'},
        'contacts': [
          {'phone': '111'},
          {'phone': '222'},
        ],
      })!;
      final profile = out['profile'] as Map<String, Object?>;
      expect(profile['email'], redacted);
      expect(profile['tier'], 'gold');
      final contacts = (out['contacts'] as List).cast<Map<String, Object?>>();
      expect(contacts[0]['phone'], redacted);
      expect(contacts[1]['phone'], redacted);
    });

    test('does not mutate the input map', () {
      final r = Redactor();
      final input = {'email': 'a@b.com'};
      r.redact(input);
      expect(input['email'], 'a@b.com');
    });

    test('returns null for null input', () {
      expect(Redactor().redact(null), isNull);
    });

    test('redacts the exact "name" key but not compounds like userName', () {
      final r = Redactor();
      final out = r.redact({
        'name': 'Ada',
        'userName': 'ada99',
        'eventName': 'Signup',
      })!;
      expect(out['name'], redacted);
      expect(out['userName'], 'ada99');
      expect(out['eventName'], 'Signup');
    });
  });

  group('Redactor — caller redactKeys', () {
    test('redacts extra keys exactly (normalised, case-insensitive)', () {
      final r = Redactor(['internalScore', 'secret_token']);
      final out = r.redact({
        'internalScore': 99,
        'InternalScore': 98,
        'secretToken': 'abc',
        'keep': 'ok',
      })!;
      expect(out['internalScore'], redacted);
      expect(out['InternalScore'], redacted);
      expect(out['secretToken'], redacted);
      expect(out['keep'], 'ok');
    });

    test('shouldRedact reflects both deny-list and extra keys', () {
      final r = Redactor(['campaignBudget']);
      expect(r.shouldRedact('email'), isTrue);
      expect(r.shouldRedact('campaignBudget'), isTrue);
      expect(r.shouldRedact('eventName'), isFalse);
    });
  });
}
