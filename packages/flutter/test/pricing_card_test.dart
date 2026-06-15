import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/pricing_card.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: child),
      ),
    );
  }

  testWidgets('RefractionPricingCard renders all fields correctly', (
    WidgetTester tester,
  ) async {
    bool ctaPressed = false;

    await tester.pumpWidget(
      buildTestApp(
        RefractionPricingCard(
          badge: 'BEST_VALUE',
          name: 'PRO_PLAN',
          price: r'$99',
          period: '/ yr',
          description: 'PLAN_DESC',
          features: const ['FEATURE_1', 'FEATURE_2'],
          cta: 'CTA_LABEL',
          onCtaPressed: () {
            ctaPressed = true;
          },
        ),
      ),
    );

    expect(find.text('BEST_VALUE'), findsOneWidget);
    expect(find.text('PRO_PLAN'), findsOneWidget);
    expect(find.text(r'$99'), findsOneWidget);
    expect(find.text('/ yr'), findsOneWidget);
    expect(find.text('PLAN_DESC'), findsOneWidget);
    expect(find.text('FEATURE_1'), findsOneWidget);
    expect(find.text('FEATURE_2'), findsOneWidget);
    expect(find.text('CTA_LABEL'), findsOneWidget);

    await tester.tap(find.text('CTA_LABEL'));
    await tester.pump();
    expect(ctaPressed, isTrue);
  });
}
