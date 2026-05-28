import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';
import 'package:refraction_ui/refraction_ui.dart';

import '../example/lib/use_cases/waveform_use_cases.dart';
import 'golden_test_helper.dart';

void main() {
  group('RefractionWaveform Golden Tests', () {
    testGoldens('Waveform Use Cases', (tester) async {
      final builder = GoldenBuilder.column()
        ..addScenario(
          'Default Bars',
          Builder(builder: (ctx) => defaultWaveform(ctx)),
        )
        ..addScenario(
          'Line Variant',
          Builder(builder: (ctx) => lineWaveform(ctx)),
        )
        ..addScenario(
          'Rings Variant',
          Builder(builder: (ctx) => ringsWaveform(ctx)),
        );

      await tester.pumpWidgetBuilder(
        builder.build(),
        wrapper: (child) => buildThemedChild(
          child,
          ThemeData.light(),
          RefractionThemeData.light(),
        ),
        surfaceSize: const Size(600, 800),
      );

      await screenMatchesGolden(
        tester,
        'waveform_use_cases_light',
        customPump: (tester) async {
          await tester.pump(const Duration(milliseconds: 500));
        },
      );

      await tester.pumpWidgetBuilder(
        builder.build(),
        wrapper: (child) => buildThemedChild(
          child,
          ThemeData.dark(),
          RefractionThemeData.dark(),
        ),
        surfaceSize: const Size(600, 800),
      );

      await screenMatchesGolden(
        tester,
        'waveform_use_cases_dark',
        customPump: (tester) async {
          await tester.pump(const Duration(milliseconds: 500));
        },
      );
    });
  });
}
