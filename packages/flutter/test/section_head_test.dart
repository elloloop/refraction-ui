import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/section_head.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: child),
      ),
    );
  }

  testWidgets('RefractionSectionHead renders kicker, title, and lede', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionSectionHead(
          kicker: Text('KICKER_TEXT'),
          title: Text('TITLE_TEXT'),
          lede: Text('LEDE_TEXT'),
        ),
      ),
    );

    expect(find.text('KICKER_TEXT'), findsOneWidget);
    expect(find.text('TITLE_TEXT'), findsOneWidget);
    expect(find.text('LEDE_TEXT'), findsOneWidget);
  });

  testWidgets('RefractionSectionHead handles alignment options', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionSectionHead(
          title: Text('CENTER_TITLE'),
          align: RefractionSectionHeadAlign.center,
        ),
      ),
    );

    final centerFinder = find.byType(Center);
    expect(centerFinder, findsOneWidget);

    await tester.pumpWidget(
      buildTestApp(
        const RefractionSectionHead(
          title: Text('LEFT_TITLE'),
          align: RefractionSectionHeadAlign.left,
        ),
      ),
    );

    expect(find.byType(Center), findsNothing);
  });
}
