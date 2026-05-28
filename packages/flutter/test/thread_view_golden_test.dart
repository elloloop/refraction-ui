import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';
import 'package:refraction_ui/refraction_ui.dart';

import '../example/lib/use_cases/thread_view_use_cases.dart';
import 'golden_test_helper.dart';

void main() {
  group('RefractionThreadView Goldens', () {
    testGoldens('thread_view_use_cases_light', (tester) async {
      final builder = GoldenBuilder.column()
        ..addScenario(
          'Default',
          Builder(builder: (ctx) => defaultThreadView(ctx)),
        )
        ..addScenario('Empty', Builder(builder: (ctx) => emptyThreadView(ctx)));

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
        'thread_view_use_cases_light',
        customPump: (tester) => tester.pump(),
      );
    });

    testGoldens('thread_view_use_cases_dark', (tester) async {
      final builder = GoldenBuilder.column()
        ..addScenario(
          'Default',
          Builder(builder: (ctx) => defaultThreadView(ctx)),
        )
        ..addScenario('Empty', Builder(builder: (ctx) => emptyThreadView(ctx)));

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
        'thread_view_use_cases_dark',
        customPump: (tester) => tester.pump(),
      );
    });
  });
}
