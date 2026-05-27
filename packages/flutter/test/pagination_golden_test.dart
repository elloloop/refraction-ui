import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';
import 'package:refraction_ui/refraction_ui.dart';

import '../example/lib/use_cases/pagination_use_cases.dart';

Widget buildThemedChild(Widget child, ThemeData themeData, RefractionThemeData refractionData) {
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
  testGoldens('Pagination Goldens', (WidgetTester tester) async {
    final builderLight = GoldenBuilder.column()
      ..addScenario('Default', Builder(builder: (ctx) => defaultPagination(ctx)))
      ..addScenario('Middle Page', Builder(builder: (ctx) => middlePagination(ctx)))
      ..addScenario('No Controls', Builder(builder: (ctx) => noControlsPagination(ctx)));

    await tester.pumpWidgetBuilder(
      builderLight.build(),
      wrapper: (child) => buildThemedChild(child, ThemeData.light(), RefractionThemeData.light()),
      surfaceSize: const Size(800, 1200),
    );
    await screenMatchesGolden(tester, 'pagination_use_cases_light');

    final builderDark = GoldenBuilder.column()
      ..addScenario('Default', Builder(builder: (ctx) => defaultPagination(ctx)))
      ..addScenario('Middle Page', Builder(builder: (ctx) => middlePagination(ctx)))
      ..addScenario('No Controls', Builder(builder: (ctx) => noControlsPagination(ctx)));

    await tester.pumpWidgetBuilder(
      builderDark.build(),
      wrapper: (child) => buildThemedChild(child, ThemeData.dark(), RefractionThemeData.dark()),
      surfaceSize: const Size(800, 1200),
    );
    await screenMatchesGolden(tester, 'pagination_use_cases_dark');
  });
}
