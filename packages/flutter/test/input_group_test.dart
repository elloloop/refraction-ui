import 'package:flutter/material.dart';
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

  group('RefractionInputGroup', () {
    testWidgets('horizontal orientation lays children out in an expanded row', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionInputGroup(
            children: [
              RefractionInputGroupAddon(child: Text('\$')),
              RefractionInput(placeholder: 'Amount'),
            ],
          ),
        ),
      );

      expect(find.text('\$'), findsOneWidget);
      expect(find.text('Amount'), findsOneWidget);

      final rows = tester.widgetList<Row>(
        find.descendant(
          of: find.byType(RefractionInputGroup),
          matching: find.byType(Row),
        ),
      );
      final groupRow = rows.singleWhere(
        (row) =>
            row.children.length == 2 &&
            row.children.every((child) => child is Expanded),
      );
      expect(groupRow.children.length, 2);
    });

    testWidgets('vertical orientation stacks children in a column', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionInputGroup(
            orientation: RefractionInputGroupOrientation.vertical,
            children: [Text('First'), Text('Second')],
          ),
        ),
      );

      final column = tester.widget<Column>(
        find.descendant(
          of: find.byType(RefractionInputGroup),
          matching: find.byType(Column),
        ),
      );
      expect(column.children.length, 2);
    });

    testWidgets('addon paints the muted token surface', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(const RefractionInputGroupAddon(child: Text('kg'))),
      );

      final container = tester.widget<Container>(
        find.descendant(
          of: find.byType(RefractionInputGroupAddon),
          matching: find.byType(Container),
        ),
      );
      final decoration = container.decoration! as BoxDecoration;
      expect(decoration.color, RefractionThemeData.light().colors.muted);
    });
  });
}
