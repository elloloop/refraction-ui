import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  group('refractionDateProblem', () {
    RefractionDateProblem? problem(
      String day,
      String month,
      String year, {
      DateTime? minDate,
      DateTime? maxDate,
    }) => refractionDateProblem(
      day: day,
      month: month,
      year: year,
      minDate: minDate,
      maxDate: maxDate,
    );

    test('a real date is no problem', () {
      expect(problem('15', '04', '1998'), isNull);
      expect(problem('1', '1', '2000'), isNull);
    });

    test('an empty segment or a short year is incomplete', () {
      expect(problem('', '04', '1998'), RefractionDateProblem.incomplete);
      expect(problem('15', '', '1998'), RefractionDateProblem.incomplete);
      expect(problem('15', '04', '199'), RefractionDateProblem.incomplete);
    });

    test('dates the calendar does not have are not real', () {
      expect(problem('31', '04', '1998'), RefractionDateProblem.notReal);
      expect(problem('00', '04', '1998'), RefractionDateProblem.notReal);
      expect(problem('15', '13', '1998'), RefractionDateProblem.notReal);
      expect(problem('15', '00', '1998'), RefractionDateProblem.notReal);
      expect(problem('15', '04', '0000'), RefractionDateProblem.notReal);
    });

    test('29 February follows the leap-year rules', () {
      expect(problem('29', '02', '2024'), isNull);
      expect(problem('29', '02', '2000'), isNull);
      expect(problem('29', '02', '2023'), RefractionDateProblem.notReal);
      expect(problem('29', '02', '1900'), RefractionDateProblem.notReal);
    });

    test('min and max are inclusive and compared by day', () {
      final min = DateTime(2000, 1, 10, 18, 30);
      final max = DateTime(2000, 1, 20, 6);
      expect(problem('10', '01', '2000', minDate: min), isNull);
      expect(problem('20', '01', '2000', maxDate: max), isNull);
      expect(
        problem('09', '01', '2000', minDate: min),
        RefractionDateProblem.beforeMin,
      );
      expect(
        problem('21', '01', '2000', maxDate: max),
        RefractionDateProblem.afterMax,
      );
    });
  });

  group('RefractionDatePicker typed entry', () {
    Widget app(Widget child, {double width = 400, double textScale = 1}) =>
        MaterialApp(
          home: MediaQuery(
            data: MediaQueryData(
              size: Size(width, 800),
              textScaler: TextScaler.linear(textScale),
            ),
            child: RefractionTheme(
              data: RefractionThemeData.light(),
              child: Scaffold(
                body: Center(
                  child: SizedBox(width: width - 32, child: child),
                ),
              ),
            ),
          ),
        );

    Finder segment(String name) =>
        find.byKey(ValueKey<String>('refraction-date-picker-$name'));

    String text(WidgetTester tester, String name) =>
        tester.widget<TextField>(segment(name)).controller!.text;

    bool focused(WidgetTester tester, String name) =>
        tester.widget<TextField>(segment(name)).focusNode!.hasFocus;

    /// A picker that keeps what it reports, the way a form would.
    Future<({List<DateTime> dates, List<RefractionDateProblem?> problems})>
    pumpPicker(
      WidgetTester tester, {
      RefractionDateFieldOrder order = RefractionDateFieldOrder.dayMonthYear,
      DateTime? value,
      DateTime? minDate,
      DateTime? maxDate,
      bool disabled = false,
      String? errorText,
    }) async {
      final dates = <DateTime>[];
      final problems = <RefractionDateProblem?>[];
      await tester.pumpWidget(
        app(
          RefractionDatePicker(
            entry: RefractionDateEntry.typed,
            fieldOrder: order,
            value: value,
            minDate: minDate,
            maxDate: maxDate,
            disabled: disabled,
            errorText: errorText,
            semanticLabel: 'Date of birth',
            onChanged: dates.add,
            onProblemChanged: problems.add,
          ),
        ),
      );
      return (dates: dates, problems: problems);
    }

    testWidgets('starts empty and shows no calendar trigger', (tester) async {
      await pumpPicker(tester);
      for (final name in ['day', 'month', 'year']) {
        expect(text(tester, name), isEmpty);
      }
      expect(find.text('Day'), findsOneWidget);
      expect(find.text('Month'), findsOneWidget);
      expect(find.text('Year'), findsOneWidget);
      expect(find.byIcon(Icons.calendar_today), findsNothing);
    });

    testWidgets('typing a whole date moves focus along and reports it', (
      tester,
    ) async {
      final seen = await pumpPicker(tester);
      await tester.tap(segment('day'));
      await tester.enterText(segment('day'), '15');
      expect(focused(tester, 'month'), isTrue);
      await tester.enterText(segment('month'), '04');
      expect(focused(tester, 'year'), isTrue);
      await tester.enterText(segment('year'), '1998');
      await tester.pump();

      expect(seen.dates, [DateTime(1998, 4, 15)]);
      expect(seen.problems, [null]);
    });

    testWidgets('only digits are kept, up to each segment\'s length', (
      tester,
    ) async {
      await pumpPicker(tester);
      await tester.enterText(segment('year'), '19a98x7');
      expect(text(tester, 'year'), '1998');
      await tester.enterText(segment('day'), '123');
      expect(text(tester, 'day'), '12');
    });

    testWidgets('an impossible date is reported and never sent', (
      tester,
    ) async {
      final seen = await pumpPicker(tester);
      await tester.enterText(segment('day'), '31');
      await tester.enterText(segment('month'), '02');
      await tester.enterText(segment('year'), '2001');
      await tester.pump();

      expect(seen.dates, isEmpty);
      expect(seen.problems, [RefractionDateProblem.notReal]);
    });

    testWidgets('a date outside min and max is reported, not sent', (
      tester,
    ) async {
      final seen = await pumpPicker(
        tester,
        minDate: DateTime(1900, 1, 1),
        maxDate: DateTime(2026, 11, 17),
      );
      await tester.enterText(segment('day'), '18');
      await tester.enterText(segment('month'), '11');
      await tester.enterText(segment('year'), '2026');
      await tester.pump();
      expect(seen.problems.last, RefractionDateProblem.afterMax);

      await tester.enterText(segment('year'), '1899');
      await tester.pump();
      expect(seen.problems.last, RefractionDateProblem.beforeMin);
      expect(seen.dates, isEmpty);

      await tester.enterText(segment('year'), '2000');
      await tester.pump();
      expect(seen.problems.last, isNull);
      expect(seen.dates, [DateTime(2000, 11, 18)]);
    });

    testWidgets('a date that becomes incomplete again is reported', (
      tester,
    ) async {
      final seen = await pumpPicker(tester);
      await tester.enterText(segment('day'), '15');
      await tester.enterText(segment('month'), '04');
      await tester.enterText(segment('year'), '1998');
      await tester.enterText(segment('year'), '199');
      await tester.pump();
      expect(seen.problems, [null, RefractionDateProblem.incomplete]);
    });

    testWidgets('Backspace in an empty segment goes back to the one before', (
      tester,
    ) async {
      await pumpPicker(tester);
      await tester.enterText(segment('day'), '15');
      expect(focused(tester, 'month'), isTrue);
      await tester.sendKeyEvent(LogicalKeyboardKey.backspace);
      await tester.pump();
      expect(focused(tester, 'day'), isTrue);
      expect(text(tester, 'day'), '15');
    });

    for (final (order, first, last) in [
      (RefractionDateFieldOrder.dayMonthYear, 'day', 'year'),
      (RefractionDateFieldOrder.monthDayYear, 'month', 'year'),
      (RefractionDateFieldOrder.yearMonthDay, 'year', 'day'),
    ]) {
      testWidgets('$order puts $first first and $last last', (tester) async {
        await pumpPicker(tester, order: order);
        final xs = {
          for (final name in ['day', 'month', 'year'])
            name: tester.getTopLeft(segment(name)).dx,
        };
        final sorted = xs.keys.toList()
          ..sort((a, b) => xs[a]!.compareTo(xs[b]!));
        expect(sorted.first, first);
        expect(sorted.last, last);
      });
    }

    testWidgets('an existing value fills the segments', (tester) async {
      final seen = await pumpPicker(tester, value: DateTime(1998, 4, 5));
      expect(text(tester, 'day'), '05');
      expect(text(tester, 'month'), '04');
      expect(text(tester, 'year'), '1998');
      expect(seen.dates, isEmpty, reason: 'filling is not a change');
    });

    testWidgets('a new value from the caller replaces the segments', (
      tester,
    ) async {
      DateTime? value = DateTime(1998, 4, 5);
      late StateSetter set;
      await tester.pumpWidget(
        app(
          StatefulBuilder(
            builder: (context, setState) {
              set = setState;
              return RefractionDatePicker(
                entry: RefractionDateEntry.typed,
                value: value,
                onChanged: (date) => setState(() => value = date),
              );
            },
          ),
        ),
      );
      set(() => value = DateTime(2001, 12, 31));
      await tester.pump();
      expect(text(tester, 'day'), '31');
      expect(text(tester, 'month'), '12');
      expect(text(tester, 'year'), '2001');

      set(() => value = null);
      await tester.pump();
      expect(text(tester, 'year'), isEmpty);
    });

    testWidgets('a late echo of its own date does not overwrite typing', (
      tester,
    ) async {
      // The caller stores each date it is sent, but the rebuild carrying it
      // back lands only after the person has typed another digit.
      DateTime? value = DateTime(2001, 2, 15);
      DateTime? pending;
      late StateSetter set;
      await tester.pumpWidget(
        app(
          StatefulBuilder(
            builder: (context, setState) {
              set = setState;
              return RefractionDatePicker(
                entry: RefractionDateEntry.typed,
                fieldOrder: RefractionDateFieldOrder.dayMonthYear,
                value: value,
                onChanged: (date) => pending = date,
              );
            },
          ),
        ),
      );
      await tester.enterText(segment('day'), '3');
      expect(pending, DateTime(2001, 2, 3));
      await tester.enterText(segment('day'), '31');
      set(() => value = pending);
      await tester.pump();

      expect(text(tester, 'day'), '31');
    });

    testWidgets('moving on into a filled segment selects what it holds', (
      tester,
    ) async {
      await pumpPicker(tester, value: DateTime(2001, 2, 15));
      await tester.enterText(segment('day'), '28');
      await tester.pump();
      final month = tester.widget<TextField>(segment('month')).controller!;
      expect(focused(tester, 'month'), isTrue);
      expect(
        month.selection,
        const TextSelection(baseOffset: 0, extentOffset: 2),
      );
    });

    testWidgets('disabled segments take no input', (tester) async {
      await pumpPicker(tester, disabled: true);
      for (final name in ['day', 'month', 'year']) {
        expect(tester.widget<TextField>(segment(name)).enabled, isFalse);
      }
    });

    testWidgets('errorText is shown under the segments', (tester) async {
      await pumpPicker(tester, errorText: 'That date does not exist');
      expect(find.text('That date does not exist'), findsOneWidget);
    });

    testWidgets('segments are named for screen readers', (tester) async {
      final handle = tester.ensureSemantics();
      await pumpPicker(tester);
      expect(find.bySemanticsLabel('Date of birth'), findsOneWidget);
      expect(find.bySemanticsLabel('Day'), findsOneWidget);
      expect(find.bySemanticsLabel('Month'), findsOneWidget);
      expect(find.bySemanticsLabel('Year'), findsOneWidget);
      handle.dispose();
    });

    testWidgets('fits a 320 px screen at twice the text size', (tester) async {
      tester.view.physicalSize = const Size(320, 800);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.reset);
      await tester.pumpWidget(
        app(
          RefractionDatePicker(
            entry: RefractionDateEntry.typed,
            value: DateTime(1998, 12, 28),
            errorText: 'That date does not exist',
          ),
          width: 320,
          textScale: 2,
        ),
      );
      expect(tester.takeException(), isNull);
      expect(find.text('1998'), findsOneWidget);
      for (final name in ['day', 'month', 'year']) {
        expect(tester.getSize(segment(name)).height, greaterThan(0));
      }
    });

    testWidgets('every segment is at least 44 px tall', (tester) async {
      await pumpPicker(tester);
      for (final name in ['day', 'month', 'year']) {
        final box = find.ancestor(
          of: segment(name),
          matching: find.byType(AnimatedContainer),
        );
        expect(tester.getSize(box.first).height, greaterThanOrEqualTo(44));
      }
    });
  });

  group('RefractionDatePicker calendar entry', () {
    testWidgets('disabled does not open the calendar', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(body: RefractionDatePicker(disabled: true)),
          ),
        ),
      );
      await tester.tap(find.byIcon(Icons.calendar_today));
      await tester.pumpAndSettle();
      expect(find.text('Su'), findsNothing);
    });
  });
}
