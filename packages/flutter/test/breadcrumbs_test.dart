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
    BreadcrumbItem(label: 'Home', href: '/'),
    BreadcrumbItem(label: 'Docs', href: '/docs'),
    BreadcrumbItem(label: 'Breadcrumbs'),
  ];

  group('RefractionBreadcrumbs', () {
    testWidgets('renders all segments with separators', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(const RefractionBreadcrumbs(items: items)),
      );

      expect(find.text('Home'), findsOneWidget);
      expect(find.text('Docs'), findsOneWidget);
      expect(find.text('Breadcrumbs'), findsOneWidget);
      expect(find.text('/'), findsNWidgets(2));
    });

    testWidgets('tapping a link segment emits its href', (
      WidgetTester tester,
    ) async {
      String? navigated;
      await tester.pumpWidget(
        buildApp(
          RefractionBreadcrumbs(
            items: items,
            onNavigate: (href) => navigated = href,
          ),
        ),
      );

      await tester.tap(find.text('Docs'));
      expect(navigated, '/docs');
    });

    testWidgets('the final segment is emphasized and not tappable', (
      WidgetTester tester,
    ) async {
      String? navigated;
      await tester.pumpWidget(
        buildApp(
          RefractionBreadcrumbs(
            items: items,
            onNavigate: (href) => navigated = href,
          ),
        ),
      );

      final current = tester.widget<Text>(find.text('Breadcrumbs'));
      expect(current.style!.fontWeight, FontWeight.w600);

      await tester.tap(find.text('Breadcrumbs'));
      expect(navigated, isNull);
    });
  });
}
