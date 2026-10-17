import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  for (final month in [4, 10]) {
    testWidgets('calendar uses successive wall days for 2026-$month', (
      tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: Scaffold(
              body: Align(
                alignment: Alignment.topLeft,
                child: RefractionDatePicker(value: DateTime(2026, month, 1)),
              ),
            ),
          ),
        ),
      );
      await tester.tap(find.byIcon(Icons.calendar_today));
      await tester.pumpAndSettle();
      final days = tester
          .widgetList<Text>(find.byType(Text))
          .map((text) => text.data ?? '')
          .where((text) => RegExp(r'^\d{1,2}$').hasMatch(text))
          .map(int.parse)
          .toList();
      final start = 1 - DateTime.utc(2026, month, 1).weekday % 7;
      expect(
        days,
        [for (var i = 0; i < 42; i++) DateTime.utc(2026, month, start + i).day],
        reason: 'Calendar cells follow wall dates across DST, not elapsed 24h.',
      );
      await tester.pumpWidget(const SizedBox.shrink());
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
    });
  }
}
