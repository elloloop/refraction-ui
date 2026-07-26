import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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

  group('RefractionCommandMenu', () {
    List<RefractionCommandGroup> groups({
      VoidCallback? onSettings,
      VoidCallback? onProfile,
    }) {
      return [
        RefractionCommandGroup(
          heading: 'General',
          items: [
            RefractionCommandItem(
              icon: const Icon(Icons.settings),
              label: 'Open Settings',
              shortcut: 'Cmd+,',
              onSelected: onSettings ?? () {},
            ),
            RefractionCommandItem(
              icon: const Icon(Icons.person),
              label: 'View Profile',
              onSelected: onProfile ?? () {},
            ),
          ],
        ),
      ];
    }

    testWidgets('renders group heading, items, and placeholder', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(RefractionCommandMenu(groups: groups())),
      );

      expect(find.text('GENERAL'), findsOneWidget);
      expect(find.text('Open Settings'), findsOneWidget);
      expect(find.text('View Profile'), findsOneWidget);
      expect(find.text('Type a command or search...'), findsOneWidget);
      expect(find.text('Cmd+,'), findsOneWidget);
    });

    testWidgets('typing filters items and shows the empty state', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(RefractionCommandMenu(groups: groups())),
      );

      await tester.enterText(find.byType(TextField), 'sett');
      await tester.pump();
      expect(find.text('Open Settings'), findsOneWidget);
      expect(find.text('View Profile'), findsNothing);

      await tester.enterText(find.byType(TextField), 'zzzz');
      await tester.pump();
      expect(find.text('No results found.'), findsOneWidget);
    });

    testWidgets('arrow keys move the highlight and Enter invokes it', (
      WidgetTester tester,
    ) async {
      var settings = 0;
      var profile = 0;
      await tester.pumpWidget(
        buildApp(
          RefractionCommandMenu(
            groups: groups(
              onSettings: () => settings++,
              onProfile: () => profile++,
            ),
          ),
        ),
      );
      // Let the post-frame callback focus the keyboard listener.
      await tester.pump();

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pump();
      expect(profile, 1);
      expect(settings, 0);

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowUp);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pump();
      expect(settings, 1);
    });

    testWidgets('tapping an item invokes onSelected', (
      WidgetTester tester,
    ) async {
      var settings = 0;
      await tester.pumpWidget(
        buildApp(
          RefractionCommandMenu(groups: groups(onSettings: () => settings++)),
        ),
      );

      await tester.tap(find.text('Open Settings'));
      expect(settings, 1);
    });
  });
}
