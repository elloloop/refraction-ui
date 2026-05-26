import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildTestableWidget(Widget child) {
    return MaterialApp(
      home: Scaffold(
        body: RefractionTheme(
          data: RefractionThemeData.light(),
          child: child,
        ),
      ),
    );
  }

  testWidgets('RefractionRichEditor renders correctly with placeholder', (WidgetTester tester) async {
    await tester.pumpWidget(buildTestableWidget(
      const RefractionRichEditor(
        placeholder: 'Enter your rich text here...',
      ),
    ));

    expect(find.byType(TextField), findsOneWidget);
    expect(find.text('Enter your rich text here...'), findsOneWidget);
    // There are 8 formatting buttons
    expect(find.byType(RefractionButton), findsNWidgets(8));
  });

  testWidgets('RefractionRichEditor handles text input and updates controller', (WidgetTester tester) async {
    final controller = TextEditingController();
    await tester.pumpWidget(buildTestableWidget(
      RefractionRichEditor(
        controller: controller,
      ),
    ));

    await tester.enterText(find.byType(TextField), 'Hello world');
    expect(controller.text, 'Hello world');
  });

  testWidgets('RefractionRichEditor inserts bold markdown via toolbar', (WidgetTester tester) async {
    final controller = TextEditingController();
    await tester.pumpWidget(buildTestableWidget(
      RefractionRichEditor(
        controller: controller,
      ),
    ));

    await tester.enterText(find.byType(TextField), 'Hello ');
    
    // Tap Bold button
    final boldButton = find.byTooltip('Bold');
    expect(boldButton, findsOneWidget);
    await tester.tap(boldButton);
    await tester.pumpAndSettle();

    expect(controller.text, 'Hello ****');
    expect(controller.selection.baseOffset, 8); // After Hello **
  });

  testWidgets('RefractionRichEditor inserts italic markdown via toolbar', (WidgetTester tester) async {
    String? changedText;
    await tester.pumpWidget(buildTestableWidget(
      RefractionRichEditor(
        onChanged: (val) => changedText = val,
      ),
    ));

    final italicButton = find.byTooltip('Italic');
    await tester.tap(italicButton);
    await tester.pumpAndSettle();

    expect(changedText, '__');
  });

  testWidgets('RefractionRichEditor inserts list markdown and updates cursor', (WidgetTester tester) async {
    final controller = TextEditingController();
    await tester.pumpWidget(buildTestableWidget(
      RefractionRichEditor(
        controller: controller,
      ),
    ));

    final bulletButton = find.byTooltip('Bullet List');
    await tester.tap(bulletButton);
    await tester.pumpAndSettle();

    expect(controller.text, '- ');
    expect(controller.selection.baseOffset, 2);
  });
  
  testWidgets('RefractionRichEditor wraps selected text with markdown', (WidgetTester tester) async {
    final controller = TextEditingController(text: 'Hello world');
    controller.selection = const TextSelection(baseOffset: 6, extentOffset: 11); // selects 'world'
    
    await tester.pumpWidget(buildTestableWidget(
      RefractionRichEditor(
        controller: controller,
      ),
    ));

    final boldButton = find.byTooltip('Bold');
    await tester.tap(boldButton);
    await tester.pumpAndSettle();

    expect(controller.text, 'Hello **world**');
    expect(controller.selection.baseOffset, 15);
  });
}
