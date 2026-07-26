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

  const footerColumns = [
    FooterColumn(
      title: 'Product',
      links: [
        FooterLink(label: 'Pricing', href: '/pricing'),
        FooterLink(label: 'Docs', href: '/docs'),
      ],
    ),
  ];

  group('RefractionFooter', () {
    testWidgets('renders columns, copyright, and social links', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionFooter(
            copyright: '© 2026 Acme',
            columns: footerColumns,
            socialLinks: [
              SocialLink(label: 'Twitter', href: 'https://x.com/acme'),
            ],
          ),
        ),
      );

      expect(find.text('Product'), findsOneWidget);
      expect(find.text('Pricing'), findsOneWidget);
      expect(find.text('Docs'), findsOneWidget);
      expect(find.text('© 2026 Acme'), findsOneWidget);
      expect(find.text('Twitter'), findsOneWidget);
    });

    testWidgets('emits hrefs for column and social links', (
      WidgetTester tester,
    ) async {
      final navigated = <String>[];
      await tester.pumpWidget(
        buildApp(
          RefractionFooter(
            copyright: '© 2026 Acme',
            columns: footerColumns,
            socialLinks: const [
              SocialLink(label: 'Twitter', href: 'https://x.com/acme'),
            ],
            onNavigate: navigated.add,
          ),
        ),
      );

      await tester.tap(find.text('Pricing'));
      expect(navigated, ['/pricing']);

      await tester.tap(find.text('Twitter'));
      expect(navigated, ['/pricing', 'https://x.com/acme']);
    });
  });
}
