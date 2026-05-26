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

  testWidgets('RefractionCodeEditor renders correctly with default props', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(buildTestWidget(const RefractionCodeEditor()));

    // It should render the plaintext language label
    expect(find.text('Plaintext'), findsOneWidget);
    // It should render the editable text
    expect(find.byType(EditableText), findsOneWidget);
  });

  testWidgets('RefractionCodeEditor uses provided controller and placeholder', (
    WidgetTester tester,
  ) async {
    final controller = TextEditingController(text: 'print("Hello");');
    await tester.pumpWidget(
      buildTestWidget(
        RefractionCodeEditor(
          controller: controller,
          language: 'python',
          placeholder: 'Enter code here',
        ),
      ),
    );

    expect(find.text('Python'), findsOneWidget);
    expect(find.text('print("Hello");'), findsOneWidget);
  });

  testWidgets('RefractionCodeEditor actions are rendered and clickable', (
    WidgetTester tester,
  ) async {
    bool clicked = false;
    await tester.pumpWidget(
      buildTestWidget(
        RefractionCodeEditor(
          language: 'typescript',
          actions: [
            RefractionCodeEditorAction(
              label: 'Copy',
              onClick: () {
                clicked = true;
              },
            ),
          ],
        ),
      ),
    );

    expect(find.text('TypeScript'), findsOneWidget);
    final copyButton = find.text('Copy');
    expect(copyButton, findsOneWidget);

    await tester.tap(copyButton);
    await tester.pumpAndSettle();

    expect(clicked, isTrue);
  });

  testWidgets('RefractionCodeEditor readOnly prevents input', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestWidget(
        const RefractionCodeEditor(readOnly: true, language: 'javascript'),
      ),
    );

    final editableText = tester.widget<EditableText>(find.byType(EditableText));
    expect(editableText.readOnly, isTrue);
  });

  testWidgets('RefractionCodeEditor triggers onChanged callback', (
    WidgetTester tester,
  ) async {
    String value = '';
    await tester.pumpWidget(
      buildTestWidget(
        RefractionCodeEditor(
          onChanged: (val) {
            value = val;
          },
        ),
      ),
    );

    await tester.enterText(find.byType(EditableText), 'const x = 1;');
    await tester.pumpAndSettle();

    expect(value, 'const x = 1;');
  });
}
