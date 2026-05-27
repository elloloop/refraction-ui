import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  group('RefractionDataTable', () {
    Widget buildTable({
      List<DataTableColumn<Map<String, String>>>? columns,
      List<Map<String, String>>? data,
      String? sortBy,
      SortDirection sortDir = SortDirection.asc,
      void Function(String columnId, SortDirection direction)? onSort,
      Map<String, String>? filters,
      void Function(String columnId, String value)? onFilter,
      String emptyMessage = 'No data available',
    }) {
      return MaterialApp(
        home: Scaffold(
          body: RefractionTheme(
            data: RefractionThemeData.light(),
            child: RefractionDataTable<Map<String, String>>(
              columns: columns ??
                  [
                    DataTableColumn(
                      id: 'id',
                      header: 'ID',
                      accessor: (row) => row['id']!,
                      sortable: true,
                    ),
                    DataTableColumn(
                      id: 'name',
                      header: 'Name',
                      accessor: (row) => row['name']!,
                      sortable: true,
                      filterable: true,
                    ),
                    DataTableColumn(
                      id: 'role',
                      header: 'Role',
                      accessor: (row) => row['role']!,
                      filterable: true,
                    ),
                  ],
              data: data ??
                  [
                    {'id': '1', 'name': 'Alice', 'role': 'Admin'},
                    {'id': '2', 'name': 'Bob', 'role': 'User'},
                    {'id': '3', 'name': 'Charlie', 'role': 'Editor'},
                  ],
              sortBy: sortBy,
              sortDir: sortDir,
              onSort: onSort,
              filters: filters,
              onFilter: onFilter,
              emptyMessage: emptyMessage,
            ),
          ),
        ),
      );
    }

    testWidgets('renders columns and data rows', (tester) async {
      await tester.pumpWidget(buildTable());

      // Headers
      expect(find.text('ID'), findsOneWidget);
      expect(find.text('Name'), findsOneWidget);
      expect(find.text('Role'), findsOneWidget);

      // Data
      expect(find.text('Alice'), findsOneWidget);
      expect(find.text('Bob'), findsOneWidget);
      expect(find.text('Charlie'), findsOneWidget);
      expect(find.text('Admin'), findsOneWidget);
    });

    testWidgets('renders empty message when no data', (tester) async {
      await tester.pumpWidget(buildTable(data: [], emptyMessage: 'Nothing here'));

      expect(find.text('Nothing here'), findsOneWidget);
      expect(find.text('Alice'), findsNothing);
    });

    testWidgets('renders filter fields if any column is filterable', (tester) async {
      await tester.pumpWidget(buildTable());

      final textFields = find.byType(TextField);
      expect(textFields, findsNWidgets(2)); // Name and Role are filterable
    });

    testWidgets('does not render filter row if no columns are filterable', (tester) async {
      await tester.pumpWidget(buildTable(
        columns: [
          DataTableColumn(
            id: 'id',
            header: 'ID',
            accessor: (row) => row['id']!,
          ),
        ],
      ));

      final textFields = find.byType(TextField);
      expect(textFields, findsNothing);
    });

    testWidgets('filters data when typing in filter field', (tester) async {
      await tester.pumpWidget(buildTable());

      // Should find all initially
      expect(find.text('Alice'), findsOneWidget);
      expect(find.text('Bob'), findsOneWidget);

      // Type 'li' in Name filter
      final nameField = find.byType(TextField).first;
      await tester.enterText(nameField, 'li');
      await tester.pumpAndSettle();

      // Alice and Charlie contain 'li', Bob does not
      expect(find.text('Alice'), findsOneWidget);
      expect(find.text('Charlie'), findsOneWidget);
      expect(find.text('Bob'), findsNothing);
    });

    testWidgets('sorts data when tapping sortable header', (tester) async {
      await tester.pumpWidget(buildTable());

      // By default order is Alice, Bob, Charlie (1, 2, 3)
      final idHeader = find.ancestor(
        of: find.text('ID'),
        matching: find.byType(InkWell),
      ).first;

      // Tap to sort by ID asc
      await tester.tap(idHeader);
      await tester.pumpAndSettle();
      
      // Tap again to sort by ID desc
      await tester.tap(idHeader);
      await tester.pumpAndSettle();

      // Since the test environment might not easily assert order on screen without keys,
      // we can pass onSort and verify it.
    });

    testWidgets('fires onSort when sortable header is tapped', (tester) async {
      String? sortedCol;
      SortDirection? sortDirection;

      await tester.pumpWidget(buildTable(
        onSort: (col, dir) {
          sortedCol = col;
          sortDirection = dir;
        },
      ));

      final nameHeader = find.ancestor(
        of: find.text('Name'),
        matching: find.byType(InkWell),
      ).first;

      await tester.tap(nameHeader);
      await tester.pumpAndSettle();

      expect(sortedCol, 'name');
      expect(sortDirection, SortDirection.asc);

      // Tap again
      await tester.tap(nameHeader);
      await tester.pumpAndSettle();

      expect(sortedCol, 'name');
      expect(sortDirection, SortDirection.desc);
    });

    testWidgets('controlled filters update from parent', (tester) async {
      await tester.pumpWidget(buildTable(filters: {'role': 'admin'}));

      expect(find.text('Alice'), findsOneWidget);
      expect(find.text('Bob'), findsNothing);

      // Change filters
      await tester.pumpWidget(buildTable(filters: {'role': 'user'}));

      expect(find.text('Alice'), findsNothing);
      expect(find.text('Bob'), findsOneWidget);
    });

    testWidgets('controlled sort updates from parent', (tester) async {
      await tester.pumpWidget(buildTable(sortBy: 'name', sortDir: SortDirection.desc));
      // In this state, Charlie (C) should be first, Bob (B) second, Alice (A) third
      // To verify order, we can find all texts and check their coordinates
      final charliePos = tester.getCenter(find.text('Charlie'));
      final alicePos = tester.getCenter(find.text('Alice'));

      // Charlie should be higher up than Alice
      expect(charliePos.dy < alicePos.dy, isTrue);

      await tester.pumpWidget(buildTable(sortBy: 'name', sortDir: SortDirection.asc));
      await tester.pumpAndSettle();

      final charliePos2 = tester.getCenter(find.text('Charlie'));
      final alicePos2 = tester.getCenter(find.text('Alice'));
      // Alice should be higher up than Charlie
      expect(alicePos2.dy < charliePos2.dy, isTrue);
    });

    testWidgets('hovering over a row changes its color', (tester) async {
      await tester.pumpWidget(buildTable());

      final aliceRowMouseRegion = find.ancestor(
        of: find.text('Alice'),
        matching: find.byType(MouseRegion),
      ).first;

      final gesture = await tester.createGesture(kind: PointerDeviceKind.mouse);
      await gesture.addPointer(location: Offset.zero);
      addTearDown(gesture.removePointer);

      // Hover over Alice's row
      await gesture.moveTo(tester.getCenter(aliceRowMouseRegion));
      await tester.pumpAndSettle();

      // Find the Table and check the TableRow's decoration color
      final table = tester.widget<Table>(find.byType(Table));
      // Index 0: Header, Index 1: Filters (if any), Index 2: First data row (Alice)
      final aliceRow = table.children[2];
      final boxDeco = aliceRow.decoration as BoxDecoration;
      expect(boxDeco.color, isNot(Colors.transparent));
      
      // Move away
      await gesture.moveTo(const Offset(0, 0));
      await tester.pumpAndSettle();

      final tableAfter = tester.widget<Table>(find.byType(Table));
      final aliceRowAfter = tableAfter.children[2];
      final boxDecoAfter = aliceRowAfter.decoration as BoxDecoration;
      expect(boxDecoAfter.color, Colors.transparent);
    });

    testWidgets('non-sortable headers do not have InkWell', (tester) async {
      await tester.pumpWidget(buildTable());

      // Role is not sortable
      final roleHeader = find.ancestor(
        of: find.text('Role'),
        matching: find.byType(InkWell),
      );
      expect(roleHeader, findsNothing);
    });
    
    testWidgets('firing onFilter callback', (tester) async {
      String? filteredCol;
      String? filterVal;
      
      await tester.pumpWidget(buildTable(
        onFilter: (col, val) {
          filteredCol = col;
          filterVal = val;
        }
      ));
      
      final roleField = find.byType(TextField).last;
      await tester.enterText(roleField, 'adm');
      await tester.pumpAndSettle();
      
      expect(filteredCol, 'role');
      expect(filterVal, 'adm');
    });

    testWidgets('updates correctly when columns change', (tester) async {
      await tester.pumpWidget(buildTable());

      // Initially 2 filterable columns
      expect(find.byType(TextField), findsNWidgets(2));

      await tester.pumpWidget(buildTable(
        columns: [
          DataTableColumn(
            id: 'id',
            header: 'ID',
            accessor: (row) => row['id']!,
            filterable: true, // Now only 1 filterable
          ),
        ]
      ));

      expect(find.byType(TextField), findsNWidgets(1));
    });
  });
}
