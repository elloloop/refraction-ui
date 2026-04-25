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

  testWidgets('RefractionDropdownMenu renders and opens', (WidgetTester tester) async {
    await tester.pumpWidget(
      buildTestApp(
        RefractionDropdownMenu(
          trigger: const Text('Trigger Button'),
          items: [
            RefractionMenuItem(label: 'Item 1', onSelected: () {}),
            RefractionMenuItem(label: 'Item 2', onSelected: () {}),
          ],
        ),
      ),
    );

    expect(find.text('Trigger Button'), findsOneWidget);
    expect(find.text('Item 1'), findsNothing);

    await tester.tap(find.text('Trigger Button'));
    await tester.pumpAndSettle();

    expect(find.text('Item 1'), findsOneWidget);
    expect(find.text('Item 2'), findsOneWidget);
  });
}
