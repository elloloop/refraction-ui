import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/sortable_list.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: child),
      ),
    );
  }

  testWidgets('RefractionSortableList renders list items correctly', (
    WidgetTester tester,
  ) async {
    final items = ['Apple', 'Banana', 'Orange'];

    await tester.pumpWidget(
      buildTestApp(
        RefractionSortableList<String>(
          items: items,
          getKey: (item, index) => item,
          renderItem: (item, {required index, required dragHandle}) {
            return Text(item);
          },
        ),
      ),
    );

    expect(find.text('Apple'), findsOneWidget);
    expect(find.text('Banana'), findsOneWidget);
    expect(find.text('Orange'), findsOneWidget);
  });

  testWidgets('RefractionSortableList calls onReorder when items are dragged', (
    WidgetTester tester,
  ) async {
    final items = ['Apple', 'Banana', 'Orange'];
    List<String>? updatedItems;

    await tester.pumpWidget(
      buildTestApp(
        RefractionSortableList<String>(
          items: items,
          getKey: (item, index) => item,
          onReorder: (newList) {
            updatedItems = newList;
          },
          renderItem: (item, {required index, required dragHandle}) {
            return Text(item);
          },
        ),
      ),
    );

    // Start drag at the center of the first item's drag handle (grip icon)
    final dragHandleFinder = find.byType(ReorderableDragStartListener).first;
    expect(dragHandleFinder, findsOneWidget);
    final dragHandleLocation = tester.getCenter(dragHandleFinder);

    final thirdItemLocation = tester.getCenter(find.text('Orange'));

    final TestGesture gesture = await tester.startGesture(dragHandleLocation);
    await tester.pump(const Duration(milliseconds: 100));
    // Drag down to the third item
    await gesture.moveTo(thirdItemLocation);
    await tester.pump(const Duration(milliseconds: 100));
    await gesture.up();
    await tester.pumpAndSettle();

    expect(updatedItems, isNotNull);
  });
}
