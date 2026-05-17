import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  group('campaignFingerprint', () {
    test('returns null when no campaign params are present', () {
      expect(campaignFingerprint(null), isNull);
      expect(campaignFingerprint('?foo=bar'), isNull);
      expect(campaignFingerprint(''), isNull);
    });

    test('builds a stable fingerprint from utm params and click ids', () {
      expect(
        campaignFingerprint('?utm_source=google&utm_medium=cpc&x=1'),
        'utm_source=google&utm_medium=cpc',
      );
      expect(campaignFingerprint('?gclid=abc'), 'gclid=abc');
    });

    test('accepts a full query string with leading path', () {
      expect(
        campaignFingerprint('/p?utm_campaign=launch'),
        'utm_campaign=launch',
      );
    });
  });

  group('Session — lifecycle', () {
    test('mints a UUIDv4 session id at first access', () {
      final s = Session(SessionConfig(storage: createMemoryStorage()));
      expect(isUuidV4(s.id()), isTrue);
    });

    test('returns a stable id within an active session', () {
      final s = Session(SessionConfig(storage: createMemoryStorage()));
      expect(s.id(), s.id());
    });

    test('start() forces a brand-new session id', () {
      final s = Session(SessionConfig(storage: createMemoryStorage()));
      final a = s.id();
      final b = s.start();
      expect(b, isNot(a));
      expect(isUuidV4(b), isTrue);
    });

    test('end() drops the session; next id() mints a fresh one', () {
      final s = Session(SessionConfig(storage: createMemoryStorage()));
      final a = s.id();
      s.end();
      expect(s.id(), isNot(a));
    });

    test('exposes the GA4-parity default timeout (30 minutes)', () {
      expect(defaultSessionTimeoutMs, 30 * 60 * 1000);
    });
  });

  group('Session — inactivity timeout (GA4 parity)', () {
    test('rotates the id after the inactivity window elapses', () {
      var now = 1000000;
      final s = Session(
        SessionConfig(storage: createMemoryStorage(), timeoutMs: 1000),
        now: () => now,
      );
      final a = s.touch();
      now += 500; // within window
      expect(s.touch(), a);
      now += 5000; // beyond window
      expect(s.touch(), isNot(a));
    });

    test('touch() slides the window forward (no premature rotation)', () {
      var now = 0;
      final s = Session(
        SessionConfig(storage: createMemoryStorage(), timeoutMs: 1000),
        now: () => now,
      );
      final a = s.touch();
      for (var i = 0; i < 10; i++) {
        now += 900;
        expect(s.touch(), a);
      }
    });
  });

  group('Session — campaign reset', () {
    test('rotates the id when a new campaign appears', () {
      var now = 0;
      final s = Session(
        SessionConfig(storage: createMemoryStorage(), timeoutMs: 60000),
        now: () => now,
      );
      final organic = s.touch();
      now += 100;
      final campaignA = s.touch('utm_source=google');
      expect(campaignA, isNot(organic));
      now += 100;
      final campaignB = s.touch('utm_source=bing');
      expect(campaignB, isNot(campaignA));
    });

    test('does NOT rotate when the same campaign repeats', () {
      var now = 0;
      final s = Session(
        SessionConfig(storage: createMemoryStorage(), timeoutMs: 60000),
        now: () => now,
      );
      final a = s.touch('utm_source=google');
      now += 100;
      expect(s.touch('utm_source=google'), a);
    });

    test('honours resetOnCampaign:false', () {
      var now = 0;
      final s = Session(
        SessionConfig(
          storage: createMemoryStorage(),
          timeoutMs: 60000,
          resetOnCampaign: false,
        ),
        now: () => now,
      );
      final a = s.touch('utm_source=google');
      now += 100;
      expect(s.touch('utm_source=bing'), a);
    });
  });

  group('Session — cross-instance persistence', () {
    test('shares one session across instances backed by the same storage', () {
      final storage = createMemoryStorage();
      final tabA = Session(SessionConfig(storage: storage));
      final tabB = Session(SessionConfig(storage: storage));
      expect(tabB.id(), tabA.id());
    });
  });

  group('Session — session-scoped properties', () {
    test('merges and reads session.set props', () {
      final s = Session(SessionConfig(storage: createMemoryStorage()));
      s.set({'plan': 'pro'});
      s.set({'region': 'eu'});
      expect(s.props(), {'plan': 'pro', 'region': 'eu'});
    });
  });
}
