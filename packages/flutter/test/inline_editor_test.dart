import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildTestWidget(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.light(),
        child: Scaffold(body: Center(child: child)),
      ),
    );
  }

  testWidgets('RefractionInlineEditor renders in view mode by default', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestWidget(const RefractionInlineEditor(value: 'Initial value')),
    );

    // Should display the value text
    expect(find.text('Initial value'), findsOneWidget);
    // Should NOT display the toolbar buttons
    expect(find.text('Save'), findsNothing);
    expect(find.text('Cancel'), findsNothing);
  });

  testWidgets('RefractionInlineEditor switches to edit mode on tap', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestWidget(const RefractionInlineEditor(value: 'Initial value')),
    );

    // Tap to enter edit mode
    await tester.tap(find.text('Initial value'));
    await tester.pumpAndSettle();

    // Now it should show the editor, toolbar buttons
    expect(find.text('Save'), findsOneWidget);
    expect(find.text('Cancel'), findsOneWidget);
    expect(find.text('bold'), findsOneWidget);

    // There should be a TextField
    expect(find.byType(TextField), findsOneWidget);
    // And it should have the value
    expect(find.text('Initial value'), findsWidgets); // Editor and Preview
  });

  testWidgets('RefractionInlineEditor cancels editing', (
    WidgetTester tester,
  ) async {
    bool cancelled = false;
    await tester.pumpWidget(
      buildTestWidget(
        RefractionInlineEditor(
          value: 'Initial value',
          onCancel: () {
            cancelled = true;
          },
        ),
      ),
    );

    await tester.tap(find.text('Initial value'));
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextField), 'Changed value');
    await tester.pumpAndSettle();

    await tester.tap(find.text('Cancel'));
    await tester.pumpAndSettle();

    expect(cancelled, isTrue);
    // Should revert back to view mode showing initial value
    expect(find.text('Initial value'), findsOneWidget);
    expect(find.text('Changed value'), findsNothing);
    expect(find.text('Save'), findsNothing);
  });

  testWidgets('RefractionInlineEditor saves changes', (
    WidgetTester tester,
  ) async {
    String savedValue = '';
    await tester.pumpWidget(
      buildTestWidget(
        RefractionInlineEditor(
          value: 'Initial value',
          onSave: (val) {
            savedValue = val;
          },
        ),
      ),
    );

    await tester.tap(find.text('Initial value'));
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextField), 'Changed value');
    await tester.pumpAndSettle();

    await tester.tap(find.text('Save'));
    await tester.pumpAndSettle();

    expect(savedValue, 'Changed value');
    // Should be back in view mode
    expect(find.text('Save'), findsNothing);
  });

  testWidgets('RefractionInlineEditor toolbar actions insert syntax', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestWidget(const RefractionInlineEditor(value: 'Text')),
    );

    await tester.tap(find.text('Text'));
    await tester.pumpAndSettle();

    await tester.tap(find.text('bold'));
    await tester.pumpAndSettle();

    // The text field should now contain the syntax
    expect(find.text('Text**'), findsWidgets);

    await tester.tap(find.text('heading'));
    await tester.pumpAndSettle();

    expect(find.text('Text**# '), findsWidgets);
  });
}
