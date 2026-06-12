import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';
import 'package:refraction_ui/refraction_ui.dart';

import '../example/lib/use_cases/empty_state_use_cases.dart';
import '../example/lib/use_cases/password_input_use_cases.dart';
import '../example/lib/use_cases/segmented_control_use_cases.dart';
import '../example/lib/use_cases/separator_use_cases.dart';
import '../example/lib/use_cases/social_auth_button_use_cases.dart';
import 'golden_test_helper.dart';

void main() {
  Future<void> matchBoth(
    WidgetTester tester,
    GoldenBuilder builder,
    String name,
    Size size,
  ) async {
    await tester.pumpWidgetBuilder(
      builder.build(),
      wrapper: (child) => buildThemedChild(
        child,
        ThemeData.light(),
        RefractionThemeData.light(),
      ),
      surfaceSize: size,
    );
    await screenMatchesGolden(tester, '${name}_light', customPump: (t) => t.pump());

    await tester.pumpWidgetBuilder(
      builder.build(),
      wrapper: (child) => buildThemedChild(
        child,
        ThemeData.dark(),
        RefractionThemeData.dark(),
      ),
      surfaceSize: size,
    );
    await screenMatchesGolden(tester, '${name}_dark', customPump: (t) => t.pump());
  }

  testGoldens('SegmentedControl', (tester) async {
    final builder = GoldenBuilder.column()
      ..addScenario('Default', Builder(builder: defaultSegmentedControl))
      ..addScenario('Small + icons', Builder(builder: smallSegmentedControl));
    await matchBoth(
      tester,
      builder,
      'segmented_control_use_cases',
      const Size(420, 400),
    );
  });

  testGoldens('PasswordField & Input validation', (tester) async {
    final builder = GoldenBuilder.column()
      ..addScenario('Password', Builder(builder: defaultPasswordField))
      ..addScenario('Validation', Builder(builder: validationPasswordField));
    await matchBoth(
      tester,
      builder,
      'password_input_use_cases',
      const Size(420, 420),
    );
  });

  testGoldens('SocialAuthButton', (tester) async {
    final builder = GoldenBuilder.column()
      ..addScenario('Buttons', Builder(builder: socialAuthButtons));
    await matchBoth(
      tester,
      builder,
      'social_auth_button_use_cases',
      const Size(560, 460),
    );
  });

  testGoldens('Separator', (tester) async {
    final builder = GoldenBuilder.column()
      ..addScenario('Horizontal', Builder(builder: horizontalSeparator))
      ..addScenario('Labeled', Builder(builder: labeledSeparator))
      ..addScenario('Vertical', Builder(builder: verticalSeparator));
    await matchBoth(
      tester,
      builder,
      'separator_use_cases',
      const Size(360, 400),
    );
  });

  testGoldens('EmptyState', (tester) async {
    final builder = GoldenBuilder.column()
      ..addScenario('Default', Builder(builder: defaultEmptyState))
      ..addScenario('Tones', Builder(builder: toneEmptyState))
      ..addScenario('Confirmation', Builder(builder: confirmationCard));
    await matchBoth(
      tester,
      builder,
      'empty_state_use_cases',
      const Size(440, 900),
    );
  });
}
