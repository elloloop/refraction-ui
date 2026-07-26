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

  const links = [
    NavLink(label: 'Home', href: '/'),
    NavLink(label: 'Pricing', href: '/pricing'),
    NavLink(label: 'Docs', href: '/docs'),
  ];

  group('RefractionNavbar', () {
    testWidgets('renders logo, links, and actions on a wide viewport', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionNavbar(
            logo: Text('Acme'),
            links: links,
            currentPath: '/pricing',
            actions: Text('Sign in'),
          ),
        ),
      );

      expect(find.text('Acme'), findsOneWidget);
      expect(find.text('Home'), findsOneWidget);
      expect(find.text('Pricing'), findsOneWidget);
      expect(find.text('Docs'), findsOneWidget);
      expect(find.text('Sign in'), findsOneWidget);

      final active = tester.widget<Text>(find.text('Pricing'));
      expect(active.style!.fontWeight, FontWeight.w600);
    });

    testWidgets('tapping a link emits its href', (WidgetTester tester) async {
      String? navigated;
      await tester.pumpWidget(
        buildApp(
          RefractionNavbar(
            links: links,
            onNavigate: (href) => navigated = href,
          ),
        ),
      );

      await tester.tap(find.text('Docs'));
      expect(navigated, '/docs');
    });

    testWidgets('mobile layout collapses the links but keeps logo/actions', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionNavbar(
            logo: Text('Acme'),
            links: links,
            actions: Text('Sign in'),
            forceMobileLayout: true,
          ),
        ),
      );

      expect(find.text('Acme'), findsOneWidget);
      expect(find.text('Sign in'), findsOneWidget);
      expect(find.text('Pricing'), findsNothing);
    });

    testWidgets('reserves the fixed h-14 height', (WidgetTester tester) async {
      await tester.pumpWidget(buildApp(const RefractionNavbar()));

      expect(tester.getSize(find.byType(RefractionNavbar)).height, 56.0);
    });
  });
}
