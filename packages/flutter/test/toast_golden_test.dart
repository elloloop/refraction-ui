import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';
import 'package:refraction_ui/refraction_ui.dart';

import '../example/lib/use_cases/toast_use_cases.dart';
import 'golden_test_helper.dart';

void main() {
  group('RefractionToast Goldens', () {
    testGoldens('toast_use_cases_light', (tester) async {
      final builder = GoldenBuilder.column()
        ..addScenario('Default', Builder(builder: (ctx) => defaultToast(ctx)))
        ..addScenario(
          'With Description',
          Builder(builder: (ctx) => descriptionToast(ctx)),
        );

      await tester.pumpWidgetBuilder(
        builder.build(),
        wrapper: (child) => buildThemedChild(
          child,
          ThemeData.light(),
          RefractionThemeData.light(),
        ),
      );

      await screenMatchesGolden(
        tester,
        'toast_use_cases_light',
        customPump: (tester) async {
          await tester.tap(find.text('Show Default Toast'));
          await tester.pump(const Duration(milliseconds: 300));
        },
      );
      await tester.pump(const Duration(seconds: 5));
    });

    testGoldens('toast_use_cases_dark', (tester) async {
      final builder = GoldenBuilder.column()
        ..addScenario('Default', Builder(builder: (ctx) => defaultToast(ctx)))
        ..addScenario(
          'With Description',
          Builder(builder: (ctx) => descriptionToast(ctx)),
        );

      await tester.pumpWidgetBuilder(
        builder.build(),
        wrapper: (child) => buildThemedChild(
          child,
          ThemeData.dark(),
          RefractionThemeData.dark(),
        ),
      );

      await screenMatchesGolden(
        tester,
        'toast_use_cases_dark',
        customPump: (tester) async {
          await tester.tap(find.text('Show Description Toast'));
          await tester.pump(const Duration(milliseconds: 300));
        },
      );
      await tester.pump(const Duration(seconds: 5));
    });
  });
}
