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

  group('RefractionAlert', () {
    testWidgets('renders title and description', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionAlert(
            title: 'Could not save changes',
            description: 'Check your connection and retry.',
          ),
        ),
      );

      expect(find.text('Could not save changes'), findsOneWidget);
      expect(find.text('Check your connection and retry.'), findsOneWidget);
    });

    testWidgets('tints title with the destructive token for destructive '
        'variant', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionAlert(
            title: 'Delete failed',
            variant: RefractionAlertVariant.destructive,
          ),
        ),
      );

      final title = tester.widget<Text>(find.text('Delete failed'));
      expect(
        title.style!.color,
        RefractionThemeData.light().colors.destructive,
      );
    });

    testWidgets('renders icon and tappable action slot', (
      WidgetTester tester,
    ) async {
      var retries = 0;
      await tester.pumpWidget(
        buildApp(
          RefractionAlert(
            icon: const Icon(Icons.error_outline),
            title: 'Sync paused',
            action: GestureDetector(
              onTap: () => retries++,
              child: const Text('Retry'),
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.error_outline), findsOneWidget);
      await tester.tap(find.text('Retry'));
      expect(retries, 1);
    });
  });
}
