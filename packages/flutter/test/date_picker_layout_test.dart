import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  for (final brightness in Brightness.values) {
    testWidgets('date and time fit narrow 2x text in $brightness', (
      tester,
    ) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      await tester.binding.setSurfaceSize(const Size(390, 844));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      final semantics = tester.ensureSemantics();
      DateTime? selected;
      await tester.pumpWidget(
        MaterialApp(
          builder: (context, child) => MediaQuery(
            data: MediaQuery.of(
              context,
            ).copyWith(textScaler: TextScaler.linear(2)),
            child: child!,
          ),
          home: RefractionTheme(
            data: brightness == Brightness.dark
                ? RefractionThemeData.dark()
                : RefractionThemeData.light(),
            child: Scaffold(
              body: Align(
                alignment: Alignment.topLeft,
                child: SizedBox(
                  width: 364,
                  child: RefractionDatePicker(
                    value: DateTime(2026, 10, 5, 7),
                    showTime: true,
                    onChanged: (value) => selected = value,
                  ),
                ),
              ),
            ),
          ),
        ),
      );
      expect(tester.takeException(), isNull);
      final label = find.text('2026-10-05 07:00');
      expect(label, findsOneWidget);
      expect(tester.getSemantics(label).label, contains('2026-10-05 07:00'));
      expect(
        tester.getRect(label).right,
        lessThan(tester.getRect(find.byIcon(Icons.calendar_today)).left),
      );
      await tester.tap(find.byIcon(Icons.calendar_today));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      final popup = tester.getRect(find.byType(Material).last);
      expect(popup.left, greaterThanOrEqualTo(0));
      expect(popup.right, lessThanOrEqualTo(390));
      expect(
        tester.getRect(find.text('19').first).right,
        lessThan(tester.getRect(find.text('20').first).left),
        reason: 'Scaled two-digit dates must not overlap adjacent days',
      );
      for (final field in tester.widgetList<TextField>(
        find.byType(TextField),
      )) {
        final text = TextPainter(
          text: TextSpan(text: '00', style: field.style),
          textDirection: TextDirection.ltr,
          textScaler: TextScaler.linear(2),
        )..layout();
        final input = find.byWidget(field);
        expect(
          tester.getSize(input).width,
          greaterThanOrEqualTo(text.width + 16 + 2 + field.cursorWidth),
          reason:
              'Both enlarged digits plus the caret must fit inside padding and border',
        );
        text.dispose();
      }
      await tester.tap(find.text('20').first);
      await tester.pumpAndSettle();
      expect(selected, DateTime(2026, 10, 20, 7));
      expect(tester.takeException(), isNull);
      await tester.pumpWidget(const SizedBox());
      semantics.dispose();
    });
  }
}
