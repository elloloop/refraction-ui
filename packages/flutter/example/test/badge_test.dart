import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  testWidgets('Test Badge rendering', (WidgetTester tester) async {
    await tester.pumpWidget(
      RefractionTheme(
        data: RefractionThemeData.minimalDark(),
        child: const MaterialApp(
          home: Scaffold(
            body: Center(
              child: RefractionBadge(
                child: Text("Primary"),
              ),
            ),
          ),
        ),
      ),
    );

    expect(find.byType(RefractionBadge), findsOneWidget);
    expect(find.text("Primary"), findsOneWidget);
  });
}
