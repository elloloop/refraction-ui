import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/stat_grid.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: child),
      ),
    );
  }

  testWidgets('RefractionStatGrid renders all stat values and labels', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionStatGrid(
          items: [
            RefractionStatGridItem(
              value: Text('99.9%'),
              label: Text('UPTIME_LABEL'),
            ),
            RefractionStatGridItem(
              value: Text('10M+'),
              label: Text('REQUESTS_LABEL'),
            ),
          ],
        ),
      ),
    );

    expect(find.text('99.9%'), findsOneWidget);
    expect(find.text('UPTIME_LABEL'), findsOneWidget);
    expect(find.text('10M+'), findsOneWidget);
    expect(find.text('REQUESTS_LABEL'), findsOneWidget);
  });
}
