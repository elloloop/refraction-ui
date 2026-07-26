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

  /// The icon tint inside a [RefractionCallout] is the variant's foreground
  /// color, so sampling the IconTheme proves which token the variant read.
  IconThemeData iconThemeOf(WidgetTester tester) {
    return tester
        .widget<IconTheme>(
          find.descendant(
            of: find.byType(RefractionCallout),
            matching: find.byType(IconTheme),
          ),
        )
        .data;
  }

  group('RefractionCallout', () {
    testWidgets('renders title, description, and default standard icon', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionCallout(
            title: 'Tip',
            description: 'You can drag files into the editor.',
          ),
        ),
      );

      expect(find.text('Tip'), findsOneWidget);
      expect(find.text('You can drag files into the editor.'), findsOneWidget);
      expect(find.byIcon(Icons.lightbulb_outline), findsOneWidget);
    });

    testWidgets('status variants route through the theme color tokens', (
      WidgetTester tester,
    ) async {
      final colors = RefractionThemeData.light().colors;
      final cases = <(RefractionCalloutVariant, IconData, Color)>[
        (
          RefractionCalloutVariant.success,
          Icons.check_circle_outline,
          colors.success,
        ),
        (
          RefractionCalloutVariant.warning,
          Icons.warning_amber_rounded,
          colors.warning,
        ),
        (RefractionCalloutVariant.info, Icons.info_outline, colors.info),
        (
          RefractionCalloutVariant.error,
          Icons.error_outline,
          colors.destructive,
        ),
      ];

      for (final (variant, icon, expectedColor) in cases) {
        await tester.pumpWidget(
          buildApp(RefractionCallout(description: 'msg', variant: variant)),
        );

        expect(find.byIcon(icon), findsOneWidget);
        expect(iconThemeOf(tester).color, expectedColor);
      }
    });
  });
}
