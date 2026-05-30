import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';
import 'package:refraction_ui/refraction_ui.dart';

import '../example/lib/use_cases/popover_use_cases.dart';

Widget buildThemedChild(
  Widget child,
  ThemeData themeData,
  RefractionThemeData refractionData,
) {
  return MaterialApp(
    theme: themeData,
    debugShowCheckedModeBanner: false,
    home: RefractionTheme(
      data: refractionData,
      child: Scaffold(
        backgroundColor: refractionData.colors.background,
        body: Center(
          child: DefaultTextStyle(
            style: refractionData.textStyle.copyWith(
              color: refractionData.colors.foreground,
            ),
            child: child,
          ),
        ),
      ),
    ),
  );
}

void main() {
  testGoldens('Popover Goldens', (WidgetTester tester) async {
    final builderLight = GoldenBuilder.grid(columns: 2, widthToHeightRatio: 1)
      ..addScenario('Default', Builder(builder: (ctx) => defaultPopover(ctx)))
      ..addScenario(
        'With Offset',
        Builder(builder: (ctx) => offsetPopover(ctx)),
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
      'popover_use_cases_light',
      customPump: (tester) => tester.pump(),
    );

    final builderDark = GoldenBuilder.grid(columns: 2, widthToHeightRatio: 1)
      ..addScenario('Default', Builder(builder: (ctx) => defaultPopover(ctx)))
      ..addScenario(
        'With Offset',
        Builder(builder: (ctx) => offsetPopover(ctx)),
      );

    await tester.pumpWidgetBuilder(
      builderDark.build(),
      wrapper: (child) =>
          buildThemedChild(child, ThemeData.dark(), RefractionThemeData.dark()),
      surfaceSize: const Size(800, 3000),
    );
    await screenMatchesGolden(
      tester,
      'popover_use_cases_dark',
      customPump: (tester) => tester.pump(),
    );
  });
}
