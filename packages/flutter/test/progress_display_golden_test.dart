import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';
import 'package:refraction_ui/refraction_ui.dart';

import '../example/lib/use_cases/progress_display_use_cases.dart';
import 'golden_test_helper.dart';

void main() {
  group('RefractionProgressDisplay Golden Tests', () {
    testGoldens('Progress Display Use Cases', (tester) async {
      final builder = GoldenBuilder.column()
        ..addScenario(
          'Linear (Default)',
          Builder(builder: (ctx) => linearDefault(ctx)),
        )
        ..addScenario(
          'Linear (No Label)',
          Builder(builder: (ctx) => linearNoLabel(ctx)),
        )
        ..addScenario('Circular', Builder(builder: (ctx) => circular(ctx)))
        ..addScenario(
          'Circular (No Label)',
          Builder(builder: (ctx) => circularNoLabel(ctx)),
        )
        ..addScenario(
          'Custom Color',
          Builder(builder: (ctx) => customColor(ctx)),
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
        'progress_display_use_cases_light',
        customPump: (tester) => tester.pumpAndSettle(),
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
        'progress_display_use_cases_dark',
        customPump: (tester) => tester.pumpAndSettle(),
      );
    });
  });
}
