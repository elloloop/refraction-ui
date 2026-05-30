import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';
import 'package:refraction_ui/refraction_ui.dart';

import '../example/lib/use_cases/voice_pill_use_cases.dart';
import 'golden_test_helper.dart';

void main() {
  group('RefractionVoicePill Golden Tests', () {
    testGoldens('Voice Pill Use Cases', (tester) async {
      final builder = GoldenBuilder.column()
        ..addScenario(
          'Default AI',
          Builder(builder: (ctx) => defaultVoicePill(ctx)),
        )
        ..addScenario(
          'User Muted',
          Builder(builder: (ctx) => userMutedVoicePill(ctx)),
        );

      await tester.pumpWidgetBuilder(
        builder.build(),
        wrapper: (child) => buildThemedChild(
          child,
          ThemeData.light(),
          RefractionThemeData.light(),
        ),
        surfaceSize: const Size(400, 600),
      );

      await tester.pump(const Duration(milliseconds: 500));

      await screenMatchesGolden(
        tester,
        'voice_pill_use_cases_light',
        customPump: (tester) async {
          await tester.pump(const Duration(milliseconds: 500));
        },
      );

      await tester.pumpWidgetBuilder(
        builder.build(),
        wrapper: (child) => buildThemedChild(
          child,
          ThemeData.dark(),
          RefractionThemeData.dark(),
        ),
        surfaceSize: const Size(400, 600),
      );

      await tester.pump(const Duration(milliseconds: 500));

      await screenMatchesGolden(
        tester,
        'voice_pill_use_cases_dark',
        customPump: (tester) async {
          await tester.pump(const Duration(milliseconds: 500));
        },
      );
    });
  });
}
