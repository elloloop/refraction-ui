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

  testWidgets('RefractionAccordion renders correctly', (WidgetTester tester) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionAccordion(
          children: [
            RefractionAccordionItem(
              title: Text('Item 1'),
              content: Text('Content 1'),
            ),
          ],
        ),
      ),
    );

    expect(find.text('Item 1'), findsOneWidget);
  });

  testWidgets('RefractionAccordion toggles content', (WidgetTester tester) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionAccordion(
          children: [
            RefractionAccordionItem(
              title: Text('Item 1'),
              content: Text('Content 1'),
            ),
          ],
        ),
      ),
    );

    await tester.tap(find.text('Item 1'));
    await tester.pumpAndSettle();
    
    await tester.tap(find.text('Item 1'));
    await tester.pumpAndSettle();
  });

  testWidgets('RefractionAccordion allowMultiple works', (WidgetTester tester) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionAccordion(
          allowMultiple: true,
          children: [
            RefractionAccordionItem(
              title: Text('Item 1'),
              content: Text('Content 1'),
            ),
            RefractionAccordionItem(
              title: Text('Item 2'),
              content: Text('Content 2'),
            ),
          ],
        ),
      ),
    );

    await tester.tap(find.text('Item 1'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Item 2'));
    await tester.pumpAndSettle();
  });
}
