import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/audience_feature_card.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: child),
      ),
    );
  }

  testWidgets('RefractionAudienceFeatureCard renders kicker, title, body, and footer', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionAudienceFeatureCard(
          kicker: Text('CARD_KICKER'),
          title: Text('CARD_TITLE'),
          body: Text('CARD_BODY'),
          footer: Text('CARD_FOOTER'),
        ),
      ),
    );

    expect(find.text('CARD_KICKER'), findsOneWidget);
    expect(find.text('CARD_TITLE'), findsOneWidget);
    expect(find.text('CARD_BODY'), findsOneWidget);
    expect(find.text('CARD_FOOTER'), findsOneWidget);
  });
}
