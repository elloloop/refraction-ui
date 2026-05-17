import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/analytics/mobile/consent_gate.dart';
import 'package:refraction_ui/src/analytics/mobile/secure_storage.dart';

void main() {
  group('MobileConsentController — baseline / persistence gating', () {
    test('grants nothing implicitly; persistence consent false at boot', () {
      final consent = Consent(null);
      final c = MobileConsentController(consent: consent);
      expect(consent.granted(), isEmpty);
      expect(c.hasPersistenceConsent(), isFalse);
    });

    test('grantBaseline grants analytics + flips persistence consent', () {
      final consent = Consent(null);
      final c = MobileConsentController(consent: consent);
      c.grantBaseline();
      expect(consent.isGranted(kAnalyticsConsentCategory), isTrue);
      expect(c.hasPersistenceConsent(), isTrue);
      // Idempotent.
      c.grantBaseline();
      expect(consent.granted().where((x) => x == kAnalyticsConsentCategory),
          hasLength(1));
    });

    test('wires persistence predicate into the gated secure store', () {
      final backing = InMemorySecureStore();
      final consent = Consent(null);
      final c = MobileConsentController(consent: consent);
      final store = ConsentGatedSecureStorage(
        store: backing,
        hasConsent: c.hasPersistenceConsent,
      );

      // Pre-consent: Identity must not persist anything.
      Identity(IdentityConfig(storage: store));
      expect(backing.read('rfx.analytics:rfx:analytics:anon'), isNull);

      // Post-consent: persistence flows.
      c.grantBaseline();
      final id = Identity(IdentityConfig(storage: store));
      expect(backing.read('rfx.analytics:rfx:analytics:anon'),
          id.anonymousId());
    });
  });

  group('iOS ATT / IDFA sequencing → tracking category', () {
    test('tracking NOT granted while ATT notDetermined', () async {
      final consent = Consent(null);
      final att = ScriptedTrackingAuthorization();
      final c = MobileConsentController(consent: consent, att: att);
      final s = await c.syncTracking();
      expect(s, AttStatus.notDetermined);
      expect(consent.isGranted(kTrackingConsentCategory), isFalse);
      expect(att.requestCount, 0); // never auto-prompts
    });

    test('requestTracking authorized → grants tracking category', () async {
      final consent = Consent(null);
      final att = ScriptedTrackingAuthorization(
        onRequest: AttStatus.authorized,
      );
      final c = MobileConsentController(consent: consent, att: att);
      final s = await c.requestTracking();
      expect(s, AttStatus.authorized);
      expect(att.requestCount, 1);
      expect(consent.isGranted(kTrackingConsentCategory), isTrue);
      expect(c.attStatus, AttStatus.authorized);
    });

    test('ATT denied → tracking stays/becomes revoked', () async {
      final consent = Consent(
        const ConsentConfig(granted: [kTrackingConsentCategory]),
      );
      final att = ScriptedTrackingAuthorization(
        initial: AttStatus.notDetermined,
        onRequest: AttStatus.denied,
      );
      final c = MobileConsentController(consent: consent, att: att);
      await c.requestTracking();
      expect(consent.isGranted(kTrackingConsentCategory), isFalse);
    });

    test('off-iOS (notApplicable) leaves tracking to the app opt-in',
        () async {
      final consent = Consent(null);
      // Default att is NoAttAuthorization → notApplicable.
      final c = MobileConsentController(consent: consent);
      final s = await c.syncTracking();
      expect(s, AttStatus.notApplicable);
      expect(consent.isGranted(kTrackingConsentCategory), isFalse);
      // App may explicitly opt in off-iOS.
      c.grant(const [kTrackingConsentCategory]);
      expect(consent.isGranted(kTrackingConsentCategory), isTrue);
    });
  });

  group('ATT/consent sequencing — full ordered flow', () {
    test(
      'no id pre-consent → baseline → ATT → tracking sink unlocked; '
      'revokeAll purges',
      () async {
        final backing = InMemorySecureStore();
        final consent = Consent(null);
        final att = ScriptedTrackingAuthorization(
          onRequest: AttStatus.authorized,
        );
        final store = ConsentGatedSecureStorage(
          store: backing,
          hasConsent: () => false, // replaced below via closure capture
        );
        // Re-create with controller-driven predicate.
        final c0 = MobileConsentController(consent: consent, att: att);
        final gated = ConsentGatedSecureStorage(
          store: backing,
          hasConsent: c0.hasPersistenceConsent,
        );
        final c = MobileConsentController(
          consent: consent,
          att: att,
          onPurge: gated.purge,
        );
        // (store kept only to prove the standalone variant compiles)
        expect(store.get('x'), isNull);

        // 1. Pre-consent: ATT not prompted, no id persisted.
        expect(consent.granted(), isEmpty);
        Identity(IdentityConfig(storage: gated));
        expect(backing.read('rfx.analytics:rfx:analytics:anon'), isNull);

        // 2. App consent UI accepted → baseline analytics.
        c.grantBaseline();
        c0.grantBaseline();
        expect(consent.isGranted(kAnalyticsConsentCategory), isTrue);
        final id = Identity(IdentityConfig(storage: gated));
        expect(backing.read('rfx.analytics:rfx:analytics:anon'),
            id.anonymousId());

        // 3. ATT prompt shown post-first-frame → tracking unlocked.
        await c.requestTracking();
        expect(consent.isGranted(kTrackingConsentCategory), isTrue);

        // A tracking-category sink is now allowed by the core gate.
        final gate = Consent(
          ConsentConfig(granted: consent.granted()),
        );
        expect(
          gate.allows([kAnalyticsConsentCategory, kTrackingConsentCategory]),
          isTrue,
        );

        // 4. Withdraw all consent → categories revoked + identity purged.
        await c.revokeAll();
        expect(consent.granted(), isEmpty);
        expect(c.hasPersistenceConsent(), isFalse);
        expect(backing.read('rfx.analytics:rfx:analytics:anon'), isNull);
      },
    );
  });

  group('per-sink consent categories via the core router', () {
    test('Firebase/PostHog sinks gate independently on their categories',
        () async {
      final consent = Consent(null);
      final c = MobileConsentController(consent: consent);

      final analyticsOnly = Consent(
        ConsentConfig(granted: consent.granted()),
      );
      // Pre-consent: a sink requiring ['analytics'] is blocked.
      expect(analyticsOnly.allows([kAnalyticsConsentCategory]), isFalse);

      c.grantBaseline();
      final afterBaseline = Consent(
        ConsentConfig(granted: consent.granted()),
      );
      // analytics sink now allowed; a tracking-gated sink still blocked.
      expect(afterBaseline.allows([kAnalyticsConsentCategory]), isTrue);
      expect(
        afterBaseline.allows([kAnalyticsConsentCategory,
            kTrackingConsentCategory]),
        isFalse,
      );
    });
  });
}
