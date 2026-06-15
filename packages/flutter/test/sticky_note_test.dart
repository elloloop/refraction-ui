import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/sticky_note.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: child),
      ),
    );
  }

  testWidgets('RefractionStickyNote renders text and author', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionStickyNote(
          text: 'This is a sticky note',
          author: 'Alice',
          color: StickyNoteColor.pink,
        ),
      ),
    );

    // Verify text is displayed
    expect(find.text('This is a sticky note'), findsOneWidget);

    // Verify author is displayed
    expect(find.text('Alice'), findsOneWidget);

    // Verify no text field exists when onTextChange is null
    expect(find.byType(TextField), findsNothing);
  });

  testWidgets('RefractionStickyNote renders editable text field when onTextChange is provided', (
    WidgetTester tester,
  ) async {
    String? changedText;

    await tester.pumpWidget(
      buildTestApp(
        RefractionStickyNote(
          text: 'Editable note',
          onTextChange: (val) => changedText = val,
        ),
      ),
    );

    // Verify text field exists
    final textFieldFinder = find.byType(TextField);
    expect(textFieldFinder, findsOneWidget);

    // Enter some text
    await tester.enterText(textFieldFinder, 'Updated text');
    await tester.pump();

    // Verify callback was triggered
    expect(changedText, equals('Updated text'));
  });
}
