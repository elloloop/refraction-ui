import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/numbered_steps.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: child),
      ),
    );
  }

  testWidgets('RefractionNumberedSteps renders items with zero-padded ordinals', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionNumberedSteps(
          items: [
            RefractionNumberedStepItem(
              title: Text('FIRST_TITLE'),
              body: Text('FIRST_BODY'),
            ),
            RefractionNumberedStepItem(
              title: Text('SECOND_TITLE'),
              body: Text('SECOND_BODY'),
            ),
          ],
        ),
      ),
    );

    expect(find.text('01'), findsOneWidget);
    expect(find.text('FIRST_TITLE'), findsOneWidget);
    expect(find.text('FIRST_BODY'), findsOneWidget);

    expect(find.text('02'), findsOneWidget);
    expect(find.text('SECOND_TITLE'), findsOneWidget);
    expect(find.text('SECOND_BODY'), findsOneWidget);
  });
}
