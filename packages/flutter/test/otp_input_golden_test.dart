import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';
import 'package:refraction_ui/refraction_ui.dart';

import '../example/lib/use_cases/otp_input_use_cases.dart';

import 'golden_test_helper.dart';

void main() {
  testGoldens('OtpInput Goldens', (WidgetTester tester) async {
    final builderLight = GoldenBuilder.column()
      ..addScenario('Default', Builder(builder: (ctx) => defaultOtpInput(ctx)))
      ..addScenario('Short', Builder(builder: (ctx) => shortOtpInput(ctx)));

    await tester.pumpWidgetBuilder(
      builderLight.build(),
      wrapper: (child) => buildThemedChild(
        child,
        ThemeData.light(),
        RefractionThemeData.light(),
      ),
    );
    await screenMatchesGolden(
      tester,
      'otp_input_use_cases_light',
      customPump: (tester) => tester.pump(),
    );

    final builderDark = GoldenBuilder.column()
      ..addScenario('Default', Builder(builder: (ctx) => defaultOtpInput(ctx)))
      ..addScenario('Short', Builder(builder: (ctx) => shortOtpInput(ctx)));

    await tester.pumpWidgetBuilder(
      builderDark.build(),
      wrapper: (child) =>
          buildThemedChild(child, ThemeData.dark(), RefractionThemeData.dark()),
    );
    await screenMatchesGolden(
      tester,
      'otp_input_use_cases_dark',
      customPump: (tester) => tester.pump(),
    );
  });
}
