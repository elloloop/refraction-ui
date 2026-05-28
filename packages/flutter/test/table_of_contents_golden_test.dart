import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';
import 'package:refraction_ui/refraction_ui.dart';

import '../example/lib/use_cases/table_of_contents_use_cases.dart';
import 'golden_test_helper.dart';

void main() {
  group('RefractionTableOfContents Goldens', () {
    testGoldens('table_of_contents_use_cases_light', (tester) async {
      final builder = GoldenBuilder.column()
        ..addScenario(
          'Default',
          Builder(builder: (ctx) => defaultTableOfContents(ctx)),
        )
        ..addScenario(
          'With Active Item',
          Builder(builder: (ctx) => activeTableOfContents(ctx)),
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
        'table_of_contents_use_cases_light',
        customPump: (tester) => tester.pump(),
      );
    });

    testGoldens('table_of_contents_use_cases_dark', (tester) async {
      final builder = GoldenBuilder.column()
        ..addScenario(
          'Default',
          Builder(builder: (ctx) => defaultTableOfContents(ctx)),
        )
        ..addScenario(
          'With Active Item',
          Builder(builder: (ctx) => activeTableOfContents(ctx)),
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
        'table_of_contents_use_cases_dark',
        customPump: (tester) => tester.pump(),
      );
    });
  });
}
