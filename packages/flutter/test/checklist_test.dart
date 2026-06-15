import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/checklist.dart';

void main() {
  group('RefractionChecklist Tests', () {
    final List<RefractionChecklistItemData> testItems = const [
      RefractionChecklistItemData(
        id: '1',
        label: 'Task One',
        description: 'Detail of Task One',
        checked: true,
      ),
      RefractionChecklistItemData(
        id: '2',
        label: 'Task Two',
      ),
      RefractionChecklistItemData(
        id: '3',
        label: 'Task Three',
      ),
    ];

    testWidgets('Renders items with labels and descriptions', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: Scaffold(
              body: RefractionChecklist(
                items: testItems,
              ),
            ),
          ),
        ),
      );

      expect(find.text('Task One'), findsOneWidget);
      expect(find.text('Detail of Task One'), findsOneWidget);
      expect(find.text('Task Two'), findsOneWidget);
      expect(find.text('Task Three'), findsOneWidget);
    });

    testWidgets('Displays progress summary when showProgress is true', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: Scaffold(
              body: RefractionChecklist(
                items: testItems,
                showProgress: true,
              ),
            ),
          ),
        ),
      );

      // 1 out of 3 is checked, so it should display "1/3 completed"
      expect(find.text('1/3 completed'), findsOneWidget);
    });

    testWidgets('Tapping an item toggles checked state and fires callbacks', (WidgetTester tester) async {
      List<RefractionChecklistItemData> currentItems = List.from(testItems);
      String? toggledId;

      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: Scaffold(
              body: StatefulBuilder(
                builder: (context, setState) {
                  return RefractionChecklist(
                    items: currentItems,
                    onChange: (next) {
                      setState(() {
                        currentItems = next;
                      });
                    },
                    onItemToggle: (id) {
                      toggledId = id;
                    },
                  );
                },
              ),
            ),
          ),
        ),
      );

      // Tap the second task (Task Two, currently unchecked)
      await tester.tap(find.text('Task Two'));
      await tester.pumpAndSettle();

      expect(toggledId, equals('2'));
      expect(currentItems[1].checked, isTrue);

      // Tap it again -> should check back to false
      await tester.tap(find.text('Task Two'));
      await tester.pumpAndSettle();

      expect(currentItems[1].checked, isFalse);
    });
  });
}
