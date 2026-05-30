import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';
import 'package:refraction_ui/refraction_ui.dart';

import '../example/lib/use_cases/status_indicator_use_cases.dart';
import 'golden_test_helper.dart';

void main() {
  group('RefractionStatusIndicator Golden Tests', () {
    testGoldens('Status Indicator Use Cases', (tester) async {
      final builder = GoldenBuilder.column()
        ..addScenario(
          'Default',
          Builder(builder: (ctx) => defaultStatusIndicator(ctx)),
        )
        ..addScenario(
          'Custom Labels',
          Builder(builder: (ctx) => customLabelStatusIndicator(ctx)),
        );

      await tester.pumpWidgetBuilder(
        builder.build(),
        wrapper: (child) => buildThemedChild(
          child,
          ThemeData.light(),
          RefractionThemeData.light(),
        ),
        surfaceSize: const Size(400, 600),
      );

      await screenMatchesGolden(
        tester,
        'status_indicator_use_cases_light',
        customPump: (tester) => tester.pump(),
      );

      await tester.pumpWidgetBuilder(
        builder.build(),
        wrapper: (child) => buildThemedChild(
          child,
          ThemeData.dark(),
          RefractionThemeData.dark(),
        ),
        surfaceSize: const Size(400, 600),
      );

      await screenMatchesGolden(
        tester,
        'status_indicator_use_cases_dark',
        customPump: (tester) => tester.pump(),
      );
    });
  });
}
