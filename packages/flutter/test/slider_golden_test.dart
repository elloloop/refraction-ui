import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';
import 'package:refraction_ui/refraction_ui.dart';

import '../example/lib/use_cases/slider_use_cases.dart';
import 'golden_test_helper.dart';

void main() {
  group('RefractionSlider Golden Tests', () {
    testGoldens('Slider Use Cases', (tester) async {
      final builder = GoldenBuilder.column()
        ..addScenario('Default', Builder(builder: (ctx) => defaultSlider(ctx)))
        ..addScenario(
          'Custom Colors',
          Builder(builder: (ctx) => customColorsSlider(ctx)),
        )
        ..addScenario(
          'Disabled',
          Builder(builder: (ctx) => disabledSlider(ctx)),
        );

      await tester.pumpWidgetBuilder(
        builder.build(),
        wrapper: (child) => buildThemedChild(
          child,
          ThemeData.light(),
          RefractionThemeData.light(),
        ),
        surfaceSize: const Size(500, 400),
      );

      await screenMatchesGolden(
        tester,
        'slider_use_cases_light',
        customPump: (tester) => tester.pump(),
      );

      await tester.pumpWidgetBuilder(
        builder.build(),
        wrapper: (child) => buildThemedChild(
          child,
          ThemeData.dark(),
          RefractionThemeData.dark(),
        ),
        surfaceSize: const Size(500, 400),
      );

      await screenMatchesGolden(
        tester,
        'slider_use_cases_dark',
        customPump: (tester) => tester.pump(),
      );
    });
  });
}
