import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';
import 'package:refraction_ui/refraction_ui.dart';

import '../example/lib/use_cases/presence_indicator_use_cases.dart';

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
  testGoldens('PresenceIndicator Goldens', (WidgetTester tester) async {
    final builderLight = GoldenBuilder.column()
      ..addScenario('Online', Builder(builder: (ctx) => onlinePresence(ctx)))
      ..addScenario(
        'Away with Label',
        Builder(builder: (ctx) => awayPresence(ctx)),
      )
      ..addScenario('Large Busy', Builder(builder: (ctx) => busyPresence(ctx)));

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
      'presence_indicator_use_cases_light',
      customPump: (tester) => tester.pump(),
    );

    final builderDark = GoldenBuilder.column()
      ..addScenario('Online', Builder(builder: (ctx) => onlinePresence(ctx)))
      ..addScenario(
        'Away with Label',
        Builder(builder: (ctx) => awayPresence(ctx)),
      )
      ..addScenario('Large Busy', Builder(builder: (ctx) => busyPresence(ctx)));

    await tester.pumpWidgetBuilder(
      builderDark.build(),
      wrapper: (child) =>
          buildThemedChild(child, ThemeData.dark(), RefractionThemeData.dark()),
      surfaceSize: const Size(800, 3000),
    );
    await screenMatchesGolden(
      tester,
      'presence_indicator_use_cases_dark',
      customPump: (tester) => tester.pump(),
    );
  });
}
