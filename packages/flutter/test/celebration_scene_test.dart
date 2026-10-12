import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  for (final brightness in Brightness.values) {
    testWidgets(
      '20 scenes finish and respect reduced motion in ${brightness.name}',
      (tester) async {
        tester.view.physicalSize = const Size(320, 640);
        tester.view.devicePixelRatio = 1;
        addTearDown(tester.view.reset);
        for (final style in refractionCelebrationStyles) {
          for (final reduced in [false, true]) {
            await tester.pumpWidget(
              MaterialApp(
                home: Scaffold(
                  body: MediaQuery(
                    data: MediaQueryData(disableAnimations: reduced),
                    child: RefractionTheme(
                      data: brightness == Brightness.dark
                          ? RefractionThemeData.dark()
                          : RefractionThemeData.light(),
                      child: RefractionCelebrationScene(style: style),
                    ),
                  ),
                ),
              ),
            );
            await tester.pumpAndSettle();
            expect(tester.hasRunningAnimations, isFalse, reason: style);
            expect(tester.takeException(), isNull, reason: style);
            expect(find.byType(CustomPaint), findsWidgets);
          }
        }
      },
    );
  }
}
