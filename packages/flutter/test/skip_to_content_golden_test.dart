import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';
import 'package:refraction_ui/refraction_ui.dart';

import '../example/lib/use_cases/skip_to_content_use_cases.dart';
import 'golden_test_helper.dart';

void main() {
  group('RefractionSkipToContent Golden Tests', () {
    testGoldens('Skip To Content Use Cases', (tester) async {
      final builder = GoldenBuilder.column()
        ..addScenario(
          'Default',
          Builder(builder: (ctx) => defaultSkipToContent(ctx)),
        )
        ..addScenario(
          'Custom Label',
          Builder(builder: (ctx) => customLabelSkipToContent(ctx)),
        );

      await tester.pumpWidgetBuilder(
        builder.build(),
        wrapper: (child) => buildThemedChild(
          child,
          ThemeData.light(),
          RefractionThemeData.light(),
        ),
        surfaceSize: const Size(400, 400),
      );

      await screenMatchesGolden(
        tester,
        'skip_to_content_use_cases_light',
        customPump: (tester) => tester.pump(),
      );

      await tester.pumpWidgetBuilder(
        builder.build(),
        wrapper: (child) => buildThemedChild(
          child,
          ThemeData.dark(),
          RefractionThemeData.dark(),
        ),
        surfaceSize: const Size(400, 400),
      );

      await screenMatchesGolden(
        tester,
        'skip_to_content_use_cases_dark',
        customPump: (tester) => tester.pump(),
      );
    });
  });
}
