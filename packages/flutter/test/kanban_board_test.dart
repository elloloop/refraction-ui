import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/kanban_board.dart';

class TestCard {
  final String id;
  final String name;
  final String stage;

  const TestCard({required this.id, required this.name, required this.stage});
}

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: child),
      ),
    );
  }

  testWidgets('RefractionKanbanBoard renders columns and cards correctly', (
    WidgetTester tester,
  ) async {
    final columns = [
      const KanbanColumnDef(id: 'todo', title: 'To Do', note: 'Note 1'),
      const KanbanColumnDef(id: 'done', title: 'Done'),
    ];

    final cards = [
      const TestCard(id: 'c1', name: 'Task A', stage: 'todo'),
      const TestCard(id: 'c2', name: 'Task B', stage: 'todo'),
      const TestCard(id: 'c3', name: 'Task C', stage: 'done'),
    ];

    await tester.pumpWidget(
      buildTestApp(
        RefractionKanbanBoard<TestCard>(
          columns: columns,
          cards: cards,
          getCardColumnId: (c) => c.stage,
          getCardKey: (c) => c.id,
          renderCard: (c, def) => Text(c.name),
        ),
      ),
    );

    // Columns exist
    expect(find.text('To Do'), findsOneWidget);
    expect(find.text('Done'), findsOneWidget);

    // Notes exist
    expect(find.text('Note 1'), findsOneWidget);

    // Cards exist
    expect(find.text('Task A'), findsOneWidget);
    expect(find.text('Task B'), findsOneWidget);
    expect(find.text('Task C'), findsOneWidget);
  });

  testWidgets('RefractionKanbanBoard enforces card cap and displays overflow', (
    WidgetTester tester,
  ) async {
    final columns = [
      const KanbanColumnDef(id: 'todo', title: 'To Do'),
    ];

    final cards = [
      const TestCard(id: 'c1', name: 'Task A', stage: 'todo'),
      const TestCard(id: 'c2', name: 'Task B', stage: 'todo'),
      const TestCard(id: 'c3', name: 'Task C', stage: 'todo'),
    ];

    String? tappedCol;

    await tester.pumpWidget(
      buildTestApp(
        RefractionKanbanBoard<TestCard>(
          columns: columns,
          cards: cards,
          cardCap: 2,
          getCardColumnId: (c) => c.stage,
          getCardKey: (c) => c.id,
          onShowMore: (colId) {
            tappedCol = colId;
          },
          renderCard: (c, def) => Text(c.name),
        ),
      ),
    );

    // First two cards are rendered
    expect(find.text('Task A'), findsOneWidget);
    expect(find.text('Task B'), findsOneWidget);

    // Third card is hidden due to cap
    expect(find.text('Task C'), findsNothing);

    // "+1 more" button is rendered
    expect(find.text('+1 more'), findsOneWidget);

    // Tap overflow button
    await tester.tap(find.text('+1 more'));
    await tester.pumpAndSettle();

    expect(tappedCol, equals('todo'));
  });
}
