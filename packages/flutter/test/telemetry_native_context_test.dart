import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('NativeContext — non-identifying device/app auto-attach', () {
    test('resolves a map; never contains an advertising/hardware id', () {
      final ctx = NativeContext.resolve().values;
      // On the dart:io test host osName is populated.
      expect(ctx['osName'], isNotNull);
      // Store-compliance: no ad/IDFA/IDFV/MAC/serial keys ever.
      for (final forbidden in const [
        'idfa',
        'idfv',
        'advertisingId',
        'gaid',
        'mac',
        'serial',
        'imei',
      ]) {
        expect(ctx.containsKey(forbidden), isFalse);
      }
    });

    test('overrides supply app version/build and win over auto-detection', () {
      final ctx = NativeContext.resolve(
        const NativeContextOverrides(
          appVersion: '1.4.0',
          appBuild: '42',
          deviceModel: 'Pixel 8',
          osName: 'android',
          osVersion: '14',
          locale: 'en-GB',
        ),
      ).values;
      expect(ctx['appVersion'], '1.4.0');
      expect(ctx['appBuild'], '42');
      expect(ctx['deviceModel'], 'Pixel 8');
      expect(ctx['osName'], 'android');
      expect(ctx['osVersion'], '14');
      expect(ctx['locale'], 'en-GB');
    });

    test('null override fields are omitted (no null values leak)', () {
      final ctx = NativeContext.resolve(
        const NativeContextOverrides(appVersion: '2.0.0'),
      ).values;
      expect(ctx['appVersion'], '2.0.0');
      expect(ctx.values.contains(null), isFalse);
    });
  });

  group('installMobileTelemetry — context attached on every record', () {
    test('device sub-context rides on every emitted record', () {
      final base = createTelemetry(
        const TelemetryConfig(app: 'svc', env: TelemetryEnv.development),
      );
      final mock = createMockSink();
      base.addSink(mock);

      final mt = installMobileTelemetry(
        base,
        store: MemoryDurableStore(),
        overrides: const NativeContextOverrides(
          appVersion: '3.1.0',
          appBuild: '99',
        ),
        installIsolateListener: false,
      );

      mt.telemetry.error('boom', <String, Object?>{'route': '/x'});
      final ctx = mock.logs.single.context;
      final device = ctx['device'] as Map<String, Object?>;
      expect(device['appVersion'], '3.1.0');
      expect(device['appBuild'], '99');
      expect(ctx['route'], '/x'); // per-call context still merged

      // child() keeps the device context.
      mt.telemetry.child(<String, Object?>{'sessionId': 's1'}).warn('w');
      final c2 = mock.logs.last.context;
      expect((c2['device'] as Map)['appVersion'], '3.1.0');
      expect(c2['sessionId'], 's1');

      mt.crashGuard.dispose();
    });
  });
}
