import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';
import 'package:refraction_ui/refraction_ui.dart';

import '../example/lib/use_cases/composer_use_cases.dart';
import 'golden_test_helper.dart';

// Goldens for the issue #432 enhancements: the filled/soft surface and the
// open keyboard-replacement accessory panel (built-in emoji picker). Kept in
// a separate file so the 0.45.0 `composer_use_cases_*` goldens stay unchanged.
void main() {
  setUpAll(() async {
    await loadAppFonts();
  });

  Widget scene() => Column(
    mainAxisSize: MainAxisSize.min,
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      Padding(
        padding: const EdgeInsets.all(16),
        child: Builder(builder: filledSurfaceComposerUseCase),
      ),
      Padding(
        padding: const EdgeInsets.all(16),
        child: Builder(builder: accessoryPanelComposerUseCase),
      ),
    ],
  );

  testGoldens('Composer enhancements Goldens', (WidgetTester tester) async {
    await tester.pumpWidgetBuilder(
      scene(),
      wrapper: (child) => buildThemedChild(
        child,
        ThemeData.light(),
        RefractionThemeData.light(),
      ),
      surfaceSize: const Size(460, 640),
    );
    // Second pump lets the accessory-panel scene arm (post-frame) and open.
    await tester.pump();
    await screenMatchesGolden(
      tester,
      'composer_enhancements_use_cases_light',
      customPump: (tester) => tester.pump(),
    );

    await tester.pumpWidgetBuilder(
      scene(),
      wrapper: (child) =>
          buildThemedChild(child, ThemeData.dark(), RefractionThemeData.dark()),
      surfaceSize: const Size(460, 640),
    );
    await tester.pump();
    await screenMatchesGolden(
      tester,
      'composer_enhancements_use_cases_dark',
      customPump: (tester) => tester.pump(),
    );
  });
}
