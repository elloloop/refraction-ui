import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/marquee_strip.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: child),
      ),
    );
  }

  testWidgets('RefractionMarqueeStrip renders in static mode with label and items', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionMarqueeStrip(
          label: 'BRAND_LABEL',
          items: ['BRAND_A', 'BRAND_B'],
        ),
      ),
    );

    expect(find.text('BRAND_LABEL'), findsOneWidget);
    expect(find.text('BRAND_A'), findsOneWidget);
    expect(find.text('BRAND_B'), findsOneWidget);
    expect(find.byType(ListView), findsNothing);
  });

  testWidgets('RefractionMarqueeStrip renders in scroll mode', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionMarqueeStrip(
          scroll: true,
          items: ['BRAND_A', 'BRAND_B'],
        ),
      ),
    );

    expect(find.byType(ListView), findsOneWidget);
  });
}
