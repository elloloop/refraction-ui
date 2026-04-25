import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(
          body: child,
        ),
      ),
    );
  }

  testWidgets('RefractionAlert renders correctly', (WidgetTester tester) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionAlert(
          title: 'Heads up!',
          description: 'You can add components.',
        ),
      ),
    );

    expect(find.text('Heads up!'), findsOneWidget);
    expect(find.text('You can add components.'), findsOneWidget);
  });

  testWidgets('RefractionCallout renders correctly', (WidgetTester tester) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionCallout(
          title: 'Documentation Update',
        ),
      ),
    );

    expect(find.text('Documentation Update'), findsOneWidget);
    expect(find.byIcon(Icons.info_outline), findsOneWidget);
  });
}
