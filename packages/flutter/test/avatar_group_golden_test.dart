import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';
import 'package:refraction_ui/refraction_ui.dart';

import '../example/lib/use_cases/avatar_group_use_cases.dart';
import 'golden_test_helper.dart';

void main() {
  group('RefractionAvatarGroup Golden Tests', () {
    testGoldens('AvatarGroup Use Cases', (tester) async {
      await loadAppFonts();

      final builder = GoldenBuilder.column()
        ..addScenario(
          'Default',
          Builder(builder: (ctx) => avatarGroupDefaultUseCase(ctx)),
        )
        ..addScenario(
          'Custom Size',
          Builder(builder: (ctx) => avatarGroupCustomSizeUseCase(ctx)),
        )
        ..addScenario(
          'No Overflow',
          Builder(builder: (ctx) => avatarGroupNoOverflowUseCase(ctx)),
        )
        ..addScenario(
          'Many Avatars',
          Builder(builder: (ctx) => avatarGroupManyAvatarsUseCase(ctx)),
        );

      await tester.pumpWidgetBuilder(
        builder.build(),
        wrapper: (child) => buildThemedChild(
          child,
          ThemeData.light(),
          RefractionThemeData.light(),
        ),
        surfaceSize: const Size(600, 600),
      );

      await tester.pumpAndSettle();

      await screenMatchesGolden(tester, 'avatar_group_use_cases_light');

      await tester.pumpWidgetBuilder(
        builder.build(),
        wrapper: (child) => buildThemedChild(
          child,
          ThemeData.dark(),
          RefractionThemeData.dark(),
        ),
        surfaceSize: const Size(600, 600),
      );

      await tester.pumpAndSettle();

      await screenMatchesGolden(tester, 'avatar_group_use_cases_dark');
    });
  });
}
