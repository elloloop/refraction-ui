import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  group('TelemetryConsent — ATT/IDFA gating + sequencing (no IDs before '
      'consent)', () {
    test('default is notDetermined: tracking disallowed, no id emitted', () {
      final c = TelemetryConsent();
      expect(c.state, TrackingState.notDetermined);
      expect(c.allowsTracking, isFalse);
      expect(c.trackingContext(), isEmpty);
    });

    test('attaching an id BEFORE authorization is rejected (guarded)', () {
      final c = TelemetryConsent();
      final accepted = c.attachTrackingId('idfa-123');
      expect(accepted, isFalse);
      expect(c.trackingId, isNull);
      expect(c.trackingContext(), isEmpty);
    });

    test('after authorization: id may be attached and is then emitted', () {
      final c = TelemetryConsent();
      c.setTrackingAuthorized(TrackingState.authorized);
      expect(c.allowsTracking, isTrue);
      expect(c.attachTrackingId('idfa-xyz'), isTrue);
      expect(c.trackingId, 'idfa-xyz');
      expect(c.trackingContext(), <String, Object?>{'trackingId': 'idfa-xyz'});
    });

    test('denied / revoked clears any attached id', () {
      final c = TelemetryConsent()
        ..setTrackingAuthorized(TrackingState.authorized);
      c.attachTrackingId('idfa-1');
      c.setTrackingAuthorized(TrackingState.denied);
      expect(c.allowsTracking, isFalse);
      expect(c.trackingId, isNull);
      expect(c.trackingContext(), isEmpty);
    });

    test(
      'notApplicable (Android/web/desktop): still no id without authorize',
      () {
        final c = TelemetryConsent(initial: TrackingState.notApplicable);
        expect(c.allowsTracking, isFalse);
        expect(c.attachTrackingId('gaid'), isFalse);
        expect(c.trackingContext(), isEmpty);
      },
    );

    test('installMobileTelemetry never emits a tracking id pre-consent', () {
      final base = createTelemetry(
        const TelemetryConfig(app: 'svc', env: TelemetryEnv.development),
      );
      final mock = createMockSink();
      base.addSink(mock);

      final mt = installMobileTelemetry(
        base,
        store: MemoryDurableStore(),
        installIsolateListener: false,
      );
      mt.telemetry.error('e');
      // No trackingId anywhere in the bound device context.
      final ctx = mock.logs.single.context;
      expect(ctx.containsKey('trackingId'), isFalse);
      expect(mt.consent.allowsTracking, isFalse);
      mt.crashGuard.dispose();
    });
  });
}
