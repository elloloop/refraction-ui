import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';
import 'package:refraction_ui/refraction_ui.dart';

import '../example/lib/use_cases/slide_viewer_use_cases.dart';
import 'golden_test_helper.dart';

void main() {
  group('RefractionSlideViewer Golden Tests', () {
    testGoldens('Slide Viewer Use Cases', (tester) async {
      final builder = GoldenBuilder.column()
        ..addScenario(
          'Default',
          Builder(builder: (ctx) => defaultSlideViewer(ctx)),
        )
        ..addScenario(
          'Custom Renderer',
          Builder(builder: (ctx) => customRendererSlideViewer(ctx)),
        );

      await tester.pumpWidgetBuilder(
        builder.build(),
        wrapper: (child) => buildThemedChild(
          child,
          ThemeData.light(),
          RefractionThemeData.light(),
        ),
        surfaceSize: const Size(800, 1000),
      );

      await screenMatchesGolden(
        tester,
        'slide_viewer_use_cases_light',
        customPump: (tester) => tester.pump(),
      );

      await tester.pumpWidgetBuilder(
        builder.build(),
        wrapper: (child) => buildThemedChild(
          child,
          ThemeData.dark(),
          RefractionThemeData.dark(),
        ),
        surfaceSize: const Size(800, 1000),
      );

      await screenMatchesGolden(
        tester,
        'slide_viewer_use_cases_dark',
        customPump: (tester) => tester.pump(),
      );
    });
  });
}
