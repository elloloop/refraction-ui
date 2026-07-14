import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';
import 'package:refraction_ui/refraction_ui.dart';

import '../example/lib/use_cases/composer_use_cases.dart';
import 'golden_test_helper.dart';

void main() {
  setUpAll(() async {
    await loadAppFonts();
  });

  GoldenBuilder buildScenarios() =>
      GoldenBuilder.grid(columns: 2, widthToHeightRatio: 1)
        ..addScenario(
          'Default',
          Builder(builder: (ctx) => defaultComposerUseCase(ctx)),
        )
        ..addScenario(
          'Multiline',
          Builder(builder: (ctx) => multilineComposerUseCase(ctx)),
        )
        ..addScenario(
          'Token inserted',
          Builder(builder: (ctx) => tokenComposerUseCase(ctx)),
        )
        ..addScenario(
          'Overlay open',
          Builder(builder: (ctx) => overlayComposerUseCase(ctx)),
        )
        ..addScenario(
          'Disabled',
          Builder(builder: (ctx) => disabledComposerUseCase(ctx)),
        )
        ..addScenario(
          'Read only',
          Builder(builder: (ctx) => readOnlyComposerUseCase(ctx)),
        )
        ..addScenario(
          'Error',
          Builder(builder: (ctx) => errorComposerUseCase(ctx)),
        )
        ..addScenario(
          'Counter near limit',
          Builder(builder: (ctx) => counterComposerUseCase(ctx)),
        )
        ..addScenario('RTL', Builder(builder: (ctx) => rtlComposerUseCase(ctx)))
        ..addScenario(
          'Attachments',
          Builder(builder: (ctx) => attachmentsComposerUseCase(ctx)),
        )
        ..addScenario(
          'Densities',
          Builder(builder: (ctx) => densitiesComposerUseCase(ctx)),
        )
        ..addScenario(
          'High contrast',
          Builder(builder: (ctx) => highContrastComposerUseCase(ctx)),
        );

  testGoldens('Composer Goldens', (WidgetTester tester) async {
    await tester.pumpWidgetBuilder(
      buildScenarios().build(),
      wrapper: (child) => buildThemedChild(
        child,
        ThemeData.light(),
        RefractionThemeData.light(),
      ),
      surfaceSize: const Size(900, 3200),
    );
    // Second pump lets the overlay-open scene arm its suggestion menu
    // (post-frame) and insert the overlay entry.
    await tester.pump();
    await screenMatchesGolden(
      tester,
      'composer_use_cases_light',
      customPump: (tester) => tester.pump(),
    );

    await tester.pumpWidgetBuilder(
      buildScenarios().build(),
      wrapper: (child) =>
          buildThemedChild(child, ThemeData.dark(), RefractionThemeData.dark()),
      surfaceSize: const Size(900, 3200),
    );
    await tester.pump();
    await screenMatchesGolden(
      tester,
      'composer_use_cases_dark',
      customPump: (tester) => tester.pump(),
    );
  });
}
