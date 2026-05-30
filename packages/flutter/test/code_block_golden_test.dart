import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';
import 'package:refraction_ui/refraction_ui.dart';

import '../example/lib/use_cases/code_block_use_cases.dart';

import 'golden_test_helper.dart';

void main() {
  testGoldens('CodeBlock Goldens', (WidgetTester tester) async {
    final builderLight = GoldenBuilder.column()
      ..addScenario('Default', Builder(builder: (ctx) => defaultCodeBlock(ctx)))
      ..addScenario(
        'With Language',
        Builder(builder: (ctx) => languageCodeBlock(ctx)),
      )
      ..addScenario(
        'No Copy Button',
        Builder(builder: (ctx) => noCopyCodeBlock(ctx)),
      );

    await tester.pumpWidgetBuilder(
      builderLight.build(),
      surfaceSize: const Size(800, 1200),
      wrapper: (child) => buildThemedChild(
        child,
        ThemeData.light(),
        RefractionThemeData.light(),
      ),
    );
    await screenMatchesGolden(
      tester,
      'code_block_use_cases_light',
      customPump: (tester) => tester.pump(),
    );

    final builderDark = GoldenBuilder.column()
      ..addScenario('Default', Builder(builder: (ctx) => defaultCodeBlock(ctx)))
      ..addScenario(
        'With Language',
        Builder(builder: (ctx) => languageCodeBlock(ctx)),
      )
      ..addScenario(
        'No Copy Button',
        Builder(builder: (ctx) => noCopyCodeBlock(ctx)),
      );

    await tester.pumpWidgetBuilder(
      builderDark.build(),
      surfaceSize: const Size(800, 1200),
      wrapper: (child) =>
          buildThemedChild(child, ThemeData.dark(), RefractionThemeData.dark()),
    );
    await screenMatchesGolden(
      tester,
      'code_block_use_cases_dark',
      customPump: (tester) => tester.pump(),
    );
  });
}
