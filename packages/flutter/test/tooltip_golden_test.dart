import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';
import 'package:refraction_ui/refraction_ui.dart';

import '../example/lib/use_cases/tooltip_use_cases.dart';
import 'golden_test_helper.dart';

void main() {
  group('RefractionTooltip Goldens', () {
    testGoldens('tooltip_use_cases_light', (tester) async {
      final builder = GoldenBuilder.column()
        ..addScenario('Default', Builder(builder: (ctx) => defaultTooltip(ctx)))
        ..addScenario(
          'Rich Content',
          Builder(builder: (ctx) => richTooltip(ctx)),
        );

      await tester.pumpWidgetBuilder(
        builder.build(),
        wrapper: (child) => buildThemedChild(
          child,
          ThemeData.light(),
          RefractionThemeData.light(),
        ),
      );

      await screenMatchesGolden(
        tester,
        'tooltip_use_cases_light',
        customPump: (tester) async {
          final gesture = await tester.createGesture(
            kind: PointerDeviceKind.mouse,
          );
          await gesture.addPointer(
            location: tester.getCenter(find.byIcon(Icons.library_add)),
          );
          await tester.pump(const Duration(milliseconds: 400));
        },
      );
    });

    testGoldens('tooltip_use_cases_dark', (tester) async {
      final builder = GoldenBuilder.column()
        ..addScenario('Default', Builder(builder: (ctx) => defaultTooltip(ctx)))
        ..addScenario(
          'Rich Content',
          Builder(builder: (ctx) => richTooltip(ctx)),
        );

      await tester.pumpWidgetBuilder(
        builder.build(),
        wrapper: (child) => buildThemedChild(
          child,
          ThemeData.dark(),
          RefractionThemeData.dark(),
        ),
      );

      await screenMatchesGolden(
        tester,
        'tooltip_use_cases_dark',
        customPump: (tester) async {
          final gesture = await tester.createGesture(
            kind: PointerDeviceKind.mouse,
          );
          await gesture.addPointer(
            location: tester.getCenter(find.text('Hover me')),
          );
          await tester.pump(const Duration(milliseconds: 400));
        },
      );
    });
  });
}
