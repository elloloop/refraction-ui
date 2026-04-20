import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  group('Refraction Inputs Parity', () {
    testWidgets('Input updates text properly', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            colors: RefractionColors.light,
            child: Scaffold(
              body: const RefractionInput(placeholder: 'Enter name'),
            ),
          ),
        ),
      );

      await tester.enterText(find.byType(EditableText), 'Test User');
      expect(find.text('Test User'), findsOneWidget);
    });

    testWidgets('Checkbox toggles state', (WidgetTester tester) async {
      bool toggled = false;
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            colors: RefractionColors.light,
            child: Scaffold(
              body: RefractionCheckbox(
                value: false,
                onChanged: (v) => toggled = true,
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.byType(RefractionCheckbox));
      expect(toggled, isTrue);
    });

    testWidgets('Switch triggers callback', (WidgetTester tester) async {
      bool toggled = false;
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            colors: RefractionColors.light,
            child: Scaffold(
              body: RefractionSwitch(
                value: false,
                onChanged: (v) => toggled = true,
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.byType(RefractionSwitch));
      expect(toggled, isTrue);
    });
  });
}
