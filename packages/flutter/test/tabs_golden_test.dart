import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';
import 'package:refraction_ui/refraction_ui.dart';

import '../example/lib/use_cases/tabs_use_cases.dart';
import 'golden_test_helper.dart';

void main() {
  group('RefractionTabs Goldens', () {
    testGoldens('tabs_use_cases_light', (tester) async {
      final builder = GoldenBuilder.column()
        ..addScenario('Default', Builder(builder: (ctx) => defaultTabs(ctx)))
        ..addScenario('Preselected Index', Builder(builder: (ctx) => preselectedTabs(ctx)));

      await tester.pumpWidgetBuilder(
        builder.build(),
        wrapper: (child) => buildThemedChild(child, ThemeData.light(), RefractionThemeData.light()),
      );
      
      await screenMatchesGolden(tester, 'tabs_use_cases_light');
    });

    testGoldens('tabs_use_cases_dark', (tester) async {
      final builder = GoldenBuilder.column()
        ..addScenario('Default', Builder(builder: (ctx) => defaultTabs(ctx)))
        ..addScenario('Preselected Index', Builder(builder: (ctx) => preselectedTabs(ctx)));

      await tester.pumpWidgetBuilder(
        builder.build(),
        wrapper: (child) => buildThemedChild(child, ThemeData.dark(), RefractionThemeData.dark()),
      );

      await screenMatchesGolden(tester, 'tabs_use_cases_dark');
    });
  });
}
