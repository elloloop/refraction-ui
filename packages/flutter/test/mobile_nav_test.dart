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

  const items = [
    RefractionMobileNavItem<String>(
      label: 'Home',
      icon: Icon(Icons.home_outlined),
      activeIcon: Icon(Icons.home),
      value: 'home',
    ),
    RefractionMobileNavItem<String>(
      label: 'Search',
      icon: Icon(Icons.search),
      value: 'search',
    ),
  ];

  group('RefractionMobileNav', () {
    testWidgets('renders icons and labels', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionMobileNav<String>(items: items)),
      );

      expect(find.text('Home'), findsOneWidget);
      expect(find.text('Search'), findsOneWidget);
      expect(find.byIcon(Icons.home_outlined), findsOneWidget);
      expect(find.byIcon(Icons.search), findsOneWidget);
    });

    testWidgets('selected item uses the active icon and primary color', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionMobileNav<String>(
            items: items,
            selectedValue: 'home',
          ),
        ),
      );

      expect(find.byIcon(Icons.home), findsOneWidget);
      expect(find.byIcon(Icons.home_outlined), findsNothing);

      final label = tester.widget<Text>(find.text('Home'));
      expect(label.style!.color, RefractionThemeData.light().colors.primary);
    });

    testWidgets('tapping an item emits its value', (WidgetTester tester) async {
      String? selected;
      await tester.pumpWidget(
        buildApp(
          RefractionMobileNav<String>(
            items: items,
            onSelect: (value) => selected = value,
          ),
        ),
      );

      await tester.tap(find.text('Search'));
      expect(selected, 'search');
    });

    testWidgets('showLabels false hides the labels', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionMobileNav<String>(items: items, showLabels: false),
        ),
      );

      expect(find.text('Home'), findsNothing);
      expect(find.byIcon(Icons.home_outlined), findsOneWidget);
    });
  });
}
