import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/mastery_bar.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: child),
      ),
    );
  }

  testWidgets('RefractionMasteryBar renders labels and clamps value', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionMasteryBar(
          value: 120.0,
          leadingLabel: 'LANG_FLUTTER',
          label: 'LEVEL_ADVANCED',
        ),
      ),
    );

    expect(find.text('LANG_FLUTTER'), findsOneWidget);
    expect(find.text('LEVEL_ADVANCED'), findsOneWidget);

    final fractionallySizedBoxFinder = find.byType(FractionallySizedBox);
    expect(fractionallySizedBoxFinder, findsOneWidget);

    final FractionallySizedBox box = tester.widget(fractionallySizedBoxFinder);
    expect(box.widthFactor, 1.0); // Clamped to 100%
  });
}
