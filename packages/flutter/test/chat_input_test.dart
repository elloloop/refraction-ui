import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.light(),
        child: Scaffold(body: child),
      ),
    );
  }

  group('RefractionRichChatInput', () {
    testWidgets('renders placeholder and icon slots', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionRichChatInput(
            placeholder: 'Send a message...',
            prefixIcon: Icon(Icons.add),
            suffixIcon: Icon(Icons.send),
          ),
        ),
      );

      expect(find.text('Send a message...'), findsOneWidget);
      expect(find.byIcon(Icons.add), findsOneWidget);
      expect(find.byIcon(Icons.send), findsOneWidget);
    });

    testWidgets('forwards keystrokes to onChanged', (
      WidgetTester tester,
    ) async {
      String typed = '';
      await tester.pumpWidget(
        buildApp(RefractionRichChatInput(onChanged: (text) => typed = text)),
      );

      await tester.enterText(find.byType(TextField), 'hello');
      expect(typed, 'hello');
    });

    testWidgets('Enter submits the text and clears the field', (
      WidgetTester tester,
    ) async {
      String? submitted;
      await tester.pumpWidget(
        buildApp(
          RefractionRichChatInput(onSubmitted: (text) => submitted = text),
        ),
      );

      await tester.enterText(find.byType(TextField), 'ship it');
      await tester.tap(find.byType(TextField));
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pump();

      expect(submitted, 'ship it');
      expect(find.text('ship it'), findsNothing);
    });

    testWidgets('whitespace-only submissions are ignored', (
      WidgetTester tester,
    ) async {
      var calls = 0;
      await tester.pumpWidget(
        buildApp(RefractionRichChatInput(onSubmitted: (_) => calls++)),
      );

      await tester.enterText(find.byType(TextField), '   ');
      await tester.tap(find.byType(TextField));
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pump();

      expect(calls, 0);
    });
  });
}
