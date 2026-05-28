import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';
import 'package:refraction_ui/refraction_ui.dart';

import '../example/lib/use_cases/textarea_use_cases.dart';
import 'golden_test_helper.dart';

void main() {
  setUpAll(() async {
    await loadAppFonts();
  });

  group('RefractionTextarea Golden Tests', () {
    testGoldens('Textarea Use Cases', (tester) async {
      final builder = GoldenBuilder.column()
        ..addScenario(
          'Default',
          Builder(builder: (ctx) => defaultTextarea(ctx)),
        )
        ..addScenario(
          'With Text',
          Builder(builder: (ctx) => withTextTextarea(ctx)),
        )
        ..addScenario(
          'Disabled',
          Builder(builder: (ctx) => disabledTextarea(ctx)),
        )
        ..addScenario(
          'Custom Min/Max Lines',
          Builder(builder: (ctx) => customLinesTextarea(ctx)),
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
        'textarea_use_cases_light',
        customPump: (tester) => tester.pump(),
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
        'textarea_use_cases_dark',
        customPump: (tester) => tester.pump(),
      );
    });
  });
}
