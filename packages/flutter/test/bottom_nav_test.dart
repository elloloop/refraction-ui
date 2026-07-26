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

  const tabs = [
    NavTab(label: 'Home', href: '/home', icon: Icon(Icons.home_outlined)),
    NavTab(label: 'Search', href: '/search', icon: Icon(Icons.search)),
    NavTab(
      label: 'Profile',
      href: '/profile',
      icon: Icon(Icons.person_outline),
    ),
  ];

  group('RefractionBottomNav', () {
    testWidgets('renders every tab label', (WidgetTester tester) async {
      await tester.pumpWidget(buildApp(const RefractionBottomNav(tabs: tabs)));

      expect(find.text('Home'), findsOneWidget);
      expect(find.text('Search'), findsOneWidget);
      expect(find.text('Profile'), findsOneWidget);
    });

    testWidgets('highlights the tab matching currentPath', (
      WidgetTester tester,
    ) async {
      final colors = RefractionThemeData.light().colors;
      await tester.pumpWidget(
        buildApp(const RefractionBottomNav(tabs: tabs, currentPath: '/search')),
      );

      final active = tester.widget<Text>(find.text('Search'));
      final inactive = tester.widget<Text>(find.text('Home'));
      expect(active.style!.color, colors.primary);
      expect(active.style!.fontWeight, FontWeight.w600);
      expect(inactive.style!.color, colors.mutedForeground);
    });

    testWidgets('emits the tapped tab href through onNavigate', (
      WidgetTester tester,
    ) async {
      String? navigated;
      await tester.pumpWidget(
        buildApp(
          RefractionBottomNav(
            tabs: tabs,
            onNavigate: (href) => navigated = href,
          ),
        ),
      );

      await tester.tap(find.text('Profile'));
      expect(navigated, '/profile');
    });
  });
}
