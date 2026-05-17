import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  group('LEVEL_ORDER (parity with @refraction-ui/logger)', () {
    test('numeric ordering matches the web contract', () {
      expect(LEVEL_ORDER[LogLevel.debug], 10);
      expect(LEVEL_ORDER[LogLevel.info], 20);
      expect(LEVEL_ORDER[LogLevel.warn], 30);
      expect(LEVEL_ORDER[LogLevel.error], 40);
      expect(LEVEL_ORDER[LogLevel.fatal], 50);
    });

    test('wire names match the TS string union', () {
      expect(LogLevel.debug.wireName, 'debug');
      expect(LogLevel.fatal.wireName, 'fatal');
      expect(TelemetryEnv.development.wireName, 'development');
      expect(TelemetryEnv.production.wireName, 'production');
    });
  });

  group('Presets (parity with presets.ts)', () {
    test('development preset', () {
      final p = resolvePreset(TelemetryEnv.development);
      expect(p.minLevel, LogLevel.debug);
      expect(p.batch, isFalse);
      expect(p.batchSize, 1);
      expect(p.sampleRate, 1);
      expect(p.pretty, isTrue);
      expect(p.beaconFlush, isFalse);
    });

    test('production preset', () {
      final p = resolvePreset(TelemetryEnv.production);
      expect(p.minLevel, LogLevel.warn);
      expect(p.batch, isTrue);
      expect(p.batchSize, 20);
      expect(p.sampleRate, 0.25);
      expect(p.pretty, isFalse);
      expect(p.beaconFlush, isTrue);
    });

    test(
      'resolvePreset returns a defensive copy (not the shared instance)',
      () {
        final a = resolvePreset(TelemetryEnv.production);
        final b = resolvePreset(TelemetryEnv.production);
        expect(identical(a, b), isFalse);
        expect(identical(a, PRESETS[TelemetryEnv.production]), isFalse);
      },
    );

    test('PRESETS map exposes both environments', () {
      expect(PRESETS.keys, containsAll(TelemetryEnv.values));
    });
  });
}
