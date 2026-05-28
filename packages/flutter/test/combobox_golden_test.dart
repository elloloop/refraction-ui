import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';
import 'package:refraction_ui/refraction_ui.dart';

import '../example/lib/use_cases/combobox_use_cases.dart';
import 'golden_test_helper.dart';

void main() {
  setUpAll(() async {
    await loadAppFonts();
  });

  testGoldens('Combobox Goldens', (WidgetTester tester) async {
    final builderLight = GoldenBuilder.grid(columns: 2, widthToHeightRatio: 1)
      ..addScenario(
        'Default',
        Builder(builder: (ctx) => defaultComboboxUseCase(ctx)),
      )
      ..addScenario(
        'Disabled',
        Builder(builder: (ctx) => disabledComboboxUseCase(ctx)),
      );

    await tester.pumpWidgetBuilder(
      builderLight.build(),
      wrapper: (child) => buildThemedChild(
        child,
        ThemeData.light(),
        RefractionThemeData.light(),
      ),
      surfaceSize: const Size(800, 3000),
    );
    await screenMatchesGolden(
      tester,
      'combobox_use_cases_light',
      customPump: (tester) => tester.pump(),
    );

    final builderDark = GoldenBuilder.grid(columns: 2, widthToHeightRatio: 1)
      ..addScenario(
        'Default',
        Builder(builder: (ctx) => defaultComboboxUseCase(ctx)),
      )
      ..addScenario(
        'Disabled',
        Builder(builder: (ctx) => disabledComboboxUseCase(ctx)),
      );

    await tester.pumpWidgetBuilder(
      builderDark.build(),
      wrapper: (child) =>
          buildThemedChild(child, ThemeData.dark(), RefractionThemeData.dark()),
      surfaceSize: const Size(800, 3000),
    );
    await screenMatchesGolden(
      tester,
      'combobox_use_cases_dark',
      customPump: (tester) => tester.pump(),
    );
  });
}
