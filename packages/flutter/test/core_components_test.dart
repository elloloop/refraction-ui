import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  group('Refraction Core Components Parity', () {
    testWidgets('Button renders variants and handles taps', (
      WidgetTester tester,
    ) async {
      bool tapped = false;
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: Scaffold(
              body: RefractionButton(
                onPressed: () => tapped = true,
                child: const Text('Primary'),
              ),
            ),
          ),
        ),
      );

      expect(find.text('Primary'), findsOneWidget);
      await tester.tap(find.text('Primary'));
      expect(tapped, isTrue);
    });

    testWidgets('Badge renders content safely', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: Scaffold(body: const RefractionBadge(child: Text('Beta'))),
          ),
        ),
      );

      expect(find.text('Beta'), findsOneWidget);
    });
  });
}
