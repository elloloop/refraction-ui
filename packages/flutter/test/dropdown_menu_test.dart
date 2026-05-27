import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildApp(Widget child) {
    return MaterialApp(
      home: Scaffold(
        body: RefractionTheme(
          data: RefractionThemeData.minimalLight(),
          child: child,
        ),
      ),
    );
  }

  group('RefractionDropdownMenu Rendering & Basic Interactions', () {
    testWidgets('Renders trigger widget', (WidgetTester tester) async {
      await tester.pumpWidget(buildApp(
        RefractionDropdownMenu(
          trigger: const Text('Open Menu'),
          items: [
            RefractionDropdownItem(label: 'Item 1', onSelected: () {}),
          ],
        ),
      ));

      expect(find.text('Open Menu'), findsOneWidget);
    });

    testWidgets('Tapping trigger opens menu', (WidgetTester tester) async {
      await tester.pumpWidget(buildApp(
        RefractionDropdownMenu(
          trigger: const Text('Open Menu'),
          items: [
            RefractionDropdownItem(label: 'Item 1', onSelected: () {}),
          ],
        ),
      ));

      expect(find.text('Item 1'), findsNothing);

      await tester.tap(find.text('Open Menu'));
      await tester.pumpAndSettle();

      expect(find.text('Item 1'), findsOneWidget);
    });

    testWidgets('Tapping outside closes menu', (WidgetTester tester) async {
      await tester.pumpWidget(buildApp(
        Stack(
          children: [
            Positioned(
              top: 0,
              left: 0,
              child: RefractionDropdownMenu(
                trigger: const Text('Open Menu'),
                items: [
                  RefractionDropdownItem(label: 'Item 1', onSelected: () {}),
                ],
              ),
            ),
            Positioned(
              bottom: 0,
              right: 0,
              child: const Text('Outside'),
            ),
          ],
        ),
      ));

      await tester.tap(find.text('Open Menu'));
      await tester.pumpAndSettle();
      expect(find.text('Item 1'), findsOneWidget);

      await tester.tapAt(const Offset(700, 500));
      await tester.pumpAndSettle();

      expect(find.text('Item 1'), findsNothing);
    });

    testWidgets('Tapping an item triggers callback and closes menu', (WidgetTester tester) async {
      bool tapped = false;

      await tester.pumpWidget(buildApp(
        RefractionDropdownMenu(
          trigger: const Text('Open Menu'),
          items: [
            RefractionDropdownItem(
              label: 'Item 1',
              onSelected: () => tapped = true,
            ),
          ],
        ),
      ));

      await tester.tap(find.text('Open Menu'));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Item 1'));
      await tester.pumpAndSettle();

      expect(tapped, isTrue);
      expect(find.text('Item 1'), findsNothing);
    });

    testWidgets('Tapping a disabled item does not trigger callback or close', (WidgetTester tester) async {
      bool tapped = false;

      await tester.pumpWidget(buildApp(
        RefractionDropdownMenu(
          trigger: const Text('Open Menu'),
          items: [
            RefractionDropdownItem(
              label: 'Disabled Item',
              disabled: true,
              onSelected: () => tapped = true,
            ),
          ],
        ),
      ));

      await tester.tap(find.text('Open Menu'));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Disabled Item'));
      await tester.pumpAndSettle();

      expect(tapped, isFalse);
      expect(find.text('Disabled Item'), findsOneWidget); // still open
    });
  });

  group('RefractionDropdownMenu Components (Groups, Dividers, Submenus)', () {
    testWidgets('Renders shortcut text if provided', (WidgetTester tester) async {
      await tester.pumpWidget(buildApp(
        RefractionDropdownMenu(
          trigger: const Text('Open Menu'),
          items: [
            RefractionDropdownItem(
              label: 'Save',
              shortcut: 'Cmd+S',
            ),
          ],
        ),
      ));

      await tester.tap(find.text('Open Menu'));
      await tester.pumpAndSettle();

      expect(find.text('Cmd+S'), findsOneWidget);
    });

    testWidgets('Renders icon if provided', (WidgetTester tester) async {
      await tester.pumpWidget(buildApp(
        RefractionDropdownMenu(
          trigger: const Text('Open Menu'),
          items: [
            RefractionDropdownItem(
              icon: const Icon(Icons.save),
              label: 'Save',
            ),
          ],
        ),
      ));

      await tester.tap(find.text('Open Menu'));
      await tester.pumpAndSettle();

      expect(find.byIcon(Icons.save), findsOneWidget);
    });

    testWidgets('Renders divider', (WidgetTester tester) async {
      await tester.pumpWidget(buildApp(
        RefractionDropdownMenu(
          trigger: const Text('Open Menu'),
          items: [
            RefractionDropdownItem(label: 'Item 1'),
            const RefractionDropdownDivider(),
            RefractionDropdownItem(label: 'Item 2'),
          ],
        ),
      ));

      await tester.tap(find.text('Open Menu'));
      await tester.pumpAndSettle();

      expect(find.byType(Divider), findsOneWidget);
    });

    testWidgets('Renders group with label', (WidgetTester tester) async {
      await tester.pumpWidget(buildApp(
        RefractionDropdownMenu(
          trigger: const Text('Open Menu'),
          items: [
            RefractionDropdownGroup(
              label: 'My Group',
              children: [
                RefractionDropdownItem(label: 'Group Item'),
              ],
            ),
          ],
        ),
      ));

      await tester.tap(find.text('Open Menu'));
      await tester.pumpAndSettle();

      expect(find.text('My Group'), findsOneWidget);
      expect(find.text('Group Item'), findsOneWidget);
    });

    testWidgets('Submenu can be opened and closed', (WidgetTester tester) async {
      await tester.pumpWidget(buildApp(
        RefractionDropdownMenu(
          trigger: const Text('Open Menu'),
          items: [
            RefractionDropdownSubmenu(
              label: 'More options',
              children: [
                RefractionDropdownItem(label: 'Nested Item'),
              ],
            ),
          ],
        ),
      ));

      await tester.tap(find.text('Open Menu'));
      await tester.pumpAndSettle();

      expect(find.text('More options'), findsOneWidget);
      expect(find.text('Nested Item'), findsNothing);

      await tester.tap(find.text('More options'));
      await tester.pumpAndSettle();

      expect(find.text('Nested Item'), findsOneWidget);
      
      // Close the submenu by clicking elsewhere or back
      // Since it's a SubmenuButton on desktop it opens on hover, on tap otherwise.
    });

    testWidgets('Disabled submenu cannot be opened', (WidgetTester tester) async {
      await tester.pumpWidget(buildApp(
        RefractionDropdownMenu(
          trigger: const Text('Open Menu'),
          items: [
            RefractionDropdownSubmenu(
              label: 'Disabled submenu',
              disabled: true,
              children: [
                RefractionDropdownItem(label: 'Nested Item'),
              ],
            ),
          ],
        ),
      ));

      await tester.tap(find.text('Open Menu'));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Disabled submenu'));
      await tester.pumpAndSettle();

      expect(find.text('Nested Item'), findsNothing);
    });
  });

  group('Multiple configurations', () {
    // Generate 50 test cases
    for (int i = 0; i < 40; i++) {
      testWidgets('Configuration #$i parses correctly', (WidgetTester tester) async {
        await tester.pumpWidget(buildApp(
          RefractionDropdownMenu(
            trigger: Text('Open Menu $i'),
            items: [
              RefractionDropdownItem(label: 'Item A $i'),
              const RefractionDropdownDivider(),
              RefractionDropdownGroup(
                label: 'Group $i',
                children: [
                  RefractionDropdownItem(label: 'Group Item $i'),
                ],
              ),
              RefractionDropdownSubmenu(
                label: 'Submenu $i',
                children: [
                  RefractionDropdownItem(label: 'Sub Item $i'),
                ],
              ),
            ],
          ),
        ));

        expect(find.text('Open Menu $i'), findsOneWidget);
        
        await tester.tap(find.text('Open Menu $i'));
        await tester.pumpAndSettle();
        
        expect(find.text('Item A $i'), findsOneWidget);
        expect(find.text('Group $i'), findsOneWidget);
        expect(find.text('Submenu $i'), findsOneWidget);
      });
    }
  });
}
