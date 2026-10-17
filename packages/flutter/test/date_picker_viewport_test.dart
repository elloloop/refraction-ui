import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  for (final dark in [false, true]) {
    testWidgets('popup respects viewport and keyboard with 2x text ($dark)', (
      tester,
    ) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1;
      tester.view.padding = const FakeViewPadding(top: 24, bottom: 20);
      addTearDown(tester.view.reset);
      var value = DateTime(2026, 10, 5, 7);
      await tester.pumpWidget(
        MaterialApp(
          theme: ThemeData(useMaterial3: true),
          builder: (context, child) => MediaQuery(
            data: MediaQuery.of(
              context,
            ).copyWith(textScaler: TextScaler.linear(2)),
            child: child!,
          ),
          home: RefractionTheme(
            data: dark
                ? RefractionThemeData.dark()
                : RefractionThemeData.light(),
            child: Scaffold(
              body: StatefulBuilder(
                builder: (context, setState) {
                  return Align(
                    alignment: Alignment.bottomCenter,
                    child: SizedBox(
                      width: 364,
                      child: RefractionDatePicker(
                        value: value,
                        showTime: true,
                        onChanged: (next) => setState(() => value = next),
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        ),
      );
      await tester.tap(find.byIcon(Icons.calendar_today));
      await tester.pumpAndSettle();
      final popup = find.byType(Material).last;
      void expectInside(double bottom) {
        final rect = tester.getRect(popup);
        expect(rect.top, greaterThanOrEqualTo(24));
        expect(rect.bottom, lessThanOrEqualTo(bottom));
        expect(rect.left, greaterThanOrEqualTo(0));
        expect(rect.right, lessThanOrEqualTo(390));
      }

      expectInside(824);
      final fields = find.byType(TextField);
      Future<void> expectDigitsFit(Finder field) async {
        await tester.ensureVisible(field);
        await tester.pumpAndSettle();
        final editableFinder = find.descendant(
          of: field,
          matching: find.byType(EditableText),
        );
        final editable = tester.widget<EditableText>(editableFinder);
        final digits = TextPainter(
          text: TextSpan(text: editable.controller.text, style: editable.style),
          textDirection: TextDirection.ltr,
          textScaler: TextScaler.linear(2),
        )..layout();
        final render = tester
            .state<EditableTextState>(editableFinder)
            .renderEditable;
        expect(
          render.size.width,
          greaterThanOrEqualTo(digits.width + editable.cursorWidth),
        );
        expect(render.maxScrollExtent, 0);
        digits.dispose();
      }

      await expectDigitsFit(fields.first);
      tester.view.viewInsets = const FakeViewPadding(bottom: 300);
      await tester.pumpAndSettle();
      expectInside(544);
      expect(tester.binding.hasScheduledFrame, isFalse);
      await expectDigitsFit(fields.first);
      await tester.enterText(fields.first, '08');
      await tester.pumpAndSettle();
      await expectDigitsFit(fields.first);
      await tester.enterText(fields.last, '15');
      await tester.pumpAndSettle();
      await expectDigitsFit(fields.last);
      expect(value, DateTime(2026, 10, 5, 8, 15));
      expect(tester.takeException(), isNull);
      await tester.pumpWidget(const SizedBox.shrink());
      await tester.pumpAndSettle();
    });
  }
}
