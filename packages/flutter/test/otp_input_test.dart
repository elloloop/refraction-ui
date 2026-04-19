import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  group('RefractionOtpInput Widget Tests', () {
    testWidgets('renders correct number of fields', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            colors: RefractionColors.light,
            child: const Scaffold(body: RefractionOtpInput(length: 4)),
          ),
        ),
      );

      expect(find.byType(TextField), findsNWidgets(4));
    });

    testWidgets('auto-advances to next field on typed character', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            colors: RefractionColors.light,
            child: const Scaffold(body: RefractionOtpInput(length: 3)),
          ),
        ),
      );

      final textFields = find.byType(TextField);

      // Tap first field to focus
      await tester.tap(textFields.at(0));
      await tester.pumpAndSettle();

      // Enter a digit
      await tester.enterText(textFields.at(0), '1');
      await tester.pumpAndSettle();

      // The focus should have organically shifted to the second text field
      final textField1 = tester.widget<TextField>(textFields.at(0));
      final textField2 = tester.widget<TextField>(textFields.at(1));

      expect(textField1.focusNode?.hasFocus, isFalse);
      expect(textField2.focusNode?.hasFocus, isTrue);
    });

    testWidgets(
      'hardware backspace gracefully shifts focus backward even if empty',
      (WidgetTester tester) async {
        await tester.pumpWidget(
          MaterialApp(
            home: RefractionTheme(
              colors: RefractionColors.light,
              child: const Scaffold(body: RefractionOtpInput(length: 3)),
            ),
          ),
        );

        final textFields = find.byType(TextField);

        // Manually request focus on the 2nd field
        final secondNode = tester
            .widget<TextField>(textFields.at(1))
            .focusNode!;
        secondNode.requestFocus();
        await tester.pumpAndSettle();

        expect(secondNode.hasFocus, isTrue);

        // Send a strict hardware Backspace KeyDownEvent
        await tester.sendKeyEvent(LogicalKeyboardKey.backspace);
        await tester.pumpAndSettle();

        // Ensure the focus reversed to the 1st field
        final firstNode = tester.widget<TextField>(textFields.at(0)).focusNode!;
        expect(secondNode.hasFocus, isFalse);
        expect(firstNode.hasFocus, isTrue);
      },
    );
  });
}
