import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/brand_network_cell.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: child),
      ),
    );
  }

  testWidgets('RefractionBrandNetworkCell renders glyph, domain, and body', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionBrandNetworkCell(
          glyph: 'G',
          domain: 'example.com',
          body: 'CELL_BODY',
        ),
      ),
    );

    expect(find.text('G'), findsOneWidget);
    expect(find.text('example.com'), findsOneWidget);
    expect(find.text('CELL_BODY'), findsOneWidget);
    expect(find.text('You are here'), findsNothing);
  });

  testWidgets('RefractionBrandNetworkCell renders badge when current', (
    WidgetTester tester,
  ) async {
    bool tapped = false;

    await tester.pumpWidget(
      buildTestApp(
        RefractionBrandNetworkCell(
          glyph: 'G',
          domain: 'example.com',
          body: 'CELL_BODY',
          current: true,
          linkLabel: 'VISIT_LINK',
          onTap: () {
            tapped = true;
          },
        ),
      ),
    );

    expect(find.text('You are here'), findsOneWidget);
    expect(find.text('VISIT_LINK'), findsOneWidget);

    await tester.tap(find.text('VISIT_LINK'));
    await tester.pump();
    expect(tapped, isTrue);
  });
}
