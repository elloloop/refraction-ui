import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  group('RefractionTabs Widget Tests', () {
    testWidgets('renders all tabs and initial content', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            colors: RefractionColors.light,
            child: Scaffold(
              body: RefractionTabs(
                tabs: const ['Tab 1', 'Tab 2', 'Tab 3'],
                children: const [
                  Text('Content 1'),
                  Text('Content 2'),
                  Text('Content 3'),
                ],
              ),
            ),
          ),
        ),
      );

      // Verify all tabs are rendered
      expect(find.text('Tab 1'), findsOneWidget);
      expect(find.text('Tab 2'), findsOneWidget);
      expect(find.text('Tab 3'), findsOneWidget);

      // Verify initial content is visible (index 0)
      expect(find.text('Content 1'), findsOneWidget);
      expect(find.text('Content 2'), findsNothing);
    });

    testWidgets('swaps content when tab is tapped', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            colors: RefractionColors.light,
            child: Scaffold(
              body: RefractionTabs(
                tabs: const ['Tab 1', 'Tab 2'],
                children: const [Text('Content 1'), Text('Content 2')],
              ),
            ),
          ),
        ),
      );

      // Tap second tab
      await tester.tap(find.text('Tab 2'));
      await tester.pumpAndSettle();

      // Verify content swapped
      expect(find.text('Content 1'), findsNothing);
      expect(find.text('Content 2'), findsOneWidget);
    });

    testWidgets('scrolls horizontally to prevent RenderFlex overflow', (
      WidgetTester tester,
    ) async {
      // Set a very narrow viewport to force overflow if no scroll view exists
      tester.view.physicalSize = const Size(200, 800);
      tester.view.devicePixelRatio = 1.0;

      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            colors: RefractionColors.light,
            child: Scaffold(
              body: RefractionTabs(
                tabs: const [
                  'Very Long Tab Name 1',
                  'Very Long Tab Name 2',
                  'Very Long Tab Name 3',
                ],
                children: const [Text('C1'), Text('C2'), Text('C3')],
              ),
            ),
          ),
        ),
      );

      // If it throws an overflow exception, this test will fail automatically.
      expect(find.byType(SingleChildScrollView), findsOneWidget);

      // Let's scroll to the last tab to prove it works
      await tester.drag(
        find.byType(SingleChildScrollView),
        const Offset(-500, 0),
      );
      await tester.pumpAndSettle();

      expect(
        tester.takeException(),
        isNull,
      ); // Ensures no rendering exceptions like overflow were thrown

      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
    });
  });
}
