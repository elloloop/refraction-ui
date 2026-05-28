import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

class TestCalendarWrapper extends StatefulWidget {
  final DateTime? initialMonth;
  final DateTime? minDate;
  final DateTime? maxDate;
  final RefractionCalendarSelectionMode selectionMode;
  final DateTime? initialSelectedDate;
  final ValueChanged<DateTime?>? onDateSelected;
  final List<DateTime>? initialSelectedDates;
  final ValueChanged<List<DateTime>>? onDatesSelected;
  final DateTimeRange? initialSelectedRange;
  final ValueChanged<DateTimeRange?>? onRangeSelected;
  final ValueChanged<DateTime>? onMonthChanged;
  final bool showOutsideDays;
  final Widget Function(BuildContext, DateTime, RefractionCalendarDayState)?
  dayBuilder;
  final List<Widget> Function(BuildContext, DateTime)? eventMarkersBuilder;

  TestCalendarWrapper({
    super.key,
    this.initialMonth,
    this.minDate,
    this.maxDate,
    this.selectionMode = RefractionCalendarSelectionMode.single,
    this.initialSelectedDate,
    this.onDateSelected,
    this.initialSelectedDates,
    this.onDatesSelected,
    this.initialSelectedRange,
    this.onRangeSelected,
    this.onMonthChanged,
    this.showOutsideDays = true,
    this.dayBuilder,
    this.eventMarkersBuilder,
  });

  @override
  State<TestCalendarWrapper> createState() => _TestCalendarWrapperState();
}

class _TestCalendarWrapperState extends State<TestCalendarWrapper> {
  DateTime? _selectedDate;
  List<DateTime>? _selectedDates;
  DateTimeRange? _selectedRange;

  @override
  void initState() {
    super.initState();
    _selectedDate = widget.initialSelectedDate;
    _selectedDates = widget.initialSelectedDates;
    _selectedRange = widget.initialSelectedRange;
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.light(),
        child: Scaffold(
          body: SingleChildScrollView(
            child: RefractionCalendar(
              initialMonth: widget.initialMonth,
              minDate: widget.minDate,
              maxDate: widget.maxDate,
              selectionMode: widget.selectionMode,
              selectedDate: _selectedDate,
              onDateSelected: (d) {
                setState(() => _selectedDate = d);
                widget.onDateSelected?.call(d);
              },
              selectedDates: _selectedDates,
              onDatesSelected: (d) {
                setState(() => _selectedDates = d);
                widget.onDatesSelected?.call(d);
              },
              selectedRange: _selectedRange,
              onRangeSelected: (r) {
                setState(() => _selectedRange = r);
                widget.onRangeSelected?.call(r);
              },
              onMonthChanged: widget.onMonthChanged,
              showOutsideDays: widget.showOutsideDays,
              dayBuilder: widget.dayBuilder,
              eventMarkersBuilder: widget.eventMarkersBuilder,
            ),
          ),
        ),
      ),
    );
  }
}

void main() {
  group('RefractionCalendar Navigation', () {
    testWidgets('renders initial month correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        TestCalendarWrapper(initialMonth: DateTime(2023, 10, 15)),
      );
      expect(find.text('October 2023'), findsOneWidget);
    });

    testWidgets('navigates to next month', (WidgetTester tester) async {
      DateTime? changedMonth;
      await tester.pumpWidget(
        TestCalendarWrapper(
          initialMonth: DateTime(2023, 10, 15),
          onMonthChanged: (m) => changedMonth = m,
        ),
      );

      final nextButton = find.byIcon(Icons.chevron_right);
      await tester.tap(nextButton);
      await tester.pumpAndSettle();

      expect(find.text('November 2023'), findsOneWidget);
      expect(changedMonth, isNotNull);
      expect(changedMonth!.month, 11);
      expect(changedMonth!.year, 2023);
    });

    testWidgets('navigates to prev month', (WidgetTester tester) async {
      DateTime? changedMonth;
      await tester.pumpWidget(
        TestCalendarWrapper(
          initialMonth: DateTime(2023, 10, 15),
          onMonthChanged: (m) => changedMonth = m,
        ),
      );

      final prevButton = find.byIcon(Icons.chevron_left);
      await tester.tap(prevButton);
      await tester.pumpAndSettle();

      expect(find.text('September 2023'), findsOneWidget);
      expect(changedMonth, isNotNull);
      expect(changedMonth!.month, 9);
      expect(changedMonth!.year, 2023);
    });

    for (int i = 1; i <= 12; i++) {
      testWidgets('renders month $i correctly', (WidgetTester tester) async {
        await tester.pumpWidget(
          TestCalendarWrapper(initialMonth: DateTime(2023, i, 15)),
        );
        final monthLabels = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ];
        expect(find.text('${monthLabels[i - 1]} 2023'), findsOneWidget);
      });
    }

    testWidgets('respects selectedDate to set initial month', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        TestCalendarWrapper(initialSelectedDate: DateTime(2022, 5, 20)),
      );
      expect(find.text('May 2022'), findsOneWidget);
    });

    testWidgets('shows weekdays', (WidgetTester tester) async {
      await tester.pumpWidget(
        TestCalendarWrapper(initialMonth: DateTime(2023, 10, 15)),
      );
      for (final d in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']) {
        expect(find.text(d), findsOneWidget);
      }
    });

    testWidgets('handles leap year correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        TestCalendarWrapper(initialMonth: DateTime(2024, 2, 1)),
      );
      expect(find.text('February 2024'), findsOneWidget);
      expect(find.text('29'), findsWidgets);
    });
  });

  group('RefractionCalendar Single Selection', () {
    testWidgets('selects date when tapped', (WidgetTester tester) async {
      DateTime? selected;
      await tester.pumpWidget(
        TestCalendarWrapper(
          initialMonth: DateTime(2023, 10, 1),
          onDateSelected: (d) => selected = d,
        ),
      );

      final day15 = find.text('15').first;
      await tester.tap(day15);
      await tester.pumpAndSettle();

      expect(selected, isNotNull);
      expect(selected!.year, 2023);
      expect(selected!.month, 10);
      expect(selected!.day, 15);
    });

    testWidgets('unselects date when tapped again', (
      WidgetTester tester,
    ) async {
      DateTime? selected;
      bool called = false;
      await tester.pumpWidget(
        TestCalendarWrapper(
          initialMonth: DateTime(2023, 10, 1),
          initialSelectedDate: DateTime(2023, 10, 15),
          onDateSelected: (d) {
            called = true;
            selected = d;
          },
        ),
      );

      final day15 = find.text('15').first;
      await tester.tap(day15);
      await tester.pumpAndSettle();

      expect(called, isTrue);
      expect(selected, isNull);
    });

    testWidgets('changes selected date when new date tapped', (
      WidgetTester tester,
    ) async {
      DateTime? selected;
      await tester.pumpWidget(
        TestCalendarWrapper(
          initialMonth: DateTime(2023, 10, 1),
          initialSelectedDate: DateTime(2023, 10, 15),
          onDateSelected: (d) => selected = d,
        ),
      );

      final day20 = find.text('20').first;
      await tester.tap(day20);
      await tester.pumpAndSettle();

      expect(selected, isNotNull);
      expect(selected!.day, 20);
    });

    for (int day = 1; day <= 5; day++) {
      testWidgets('selects single day $day', (WidgetTester tester) async {
        DateTime? selected;
        await tester.pumpWidget(
          TestCalendarWrapper(
            initialMonth: DateTime(2023, 10, 1),
            onDateSelected: (d) => selected = d,
          ),
        );
        await tester.tap(find.text('$day').first);
        await tester.pumpAndSettle();
        expect(selected!.day, day);
      });
    }
  });

  group('RefractionCalendar Multiple Selection', () {
    testWidgets('selects multiple dates', (WidgetTester tester) async {
      List<DateTime>? selected;
      await tester.pumpWidget(
        TestCalendarWrapper(
          initialMonth: DateTime(2023, 10, 1),
          selectionMode: RefractionCalendarSelectionMode.multiple,
          initialSelectedDates: const [],
          onDatesSelected: (dates) => selected = dates,
        ),
      );

      await tester.tap(find.text('10').first);
      await tester.pumpAndSettle();
      await tester.tap(find.text('15').first);
      await tester.pumpAndSettle();

      expect(selected, isNotNull);
      expect(selected!.length, 2);
      expect(selected![0].day, 10);
      expect(selected![1].day, 15);
    });

    testWidgets('deselects date when already selected', (
      WidgetTester tester,
    ) async {
      List<DateTime>? selected;
      await tester.pumpWidget(
        TestCalendarWrapper(
          initialMonth: DateTime(2023, 10, 1),
          selectionMode: RefractionCalendarSelectionMode.multiple,
          initialSelectedDates: [
            DateTime(2023, 10, 10),
            DateTime(2023, 10, 15),
          ],
          onDatesSelected: (dates) => selected = dates,
        ),
      );

      await tester.tap(find.text('10').first);
      await tester.pumpAndSettle();

      expect(selected!.length, 1);
      expect(selected![0].day, 15);
    });

    testWidgets('can select three dates', (WidgetTester tester) async {
      List<DateTime>? selected;
      await tester.pumpWidget(
        TestCalendarWrapper(
          initialMonth: DateTime(2023, 10, 1),
          selectionMode: RefractionCalendarSelectionMode.multiple,
          initialSelectedDates: const [],
          onDatesSelected: (dates) => selected = dates,
        ),
      );

      await tester.tap(find.text('5').first);
      await tester.pumpAndSettle();
      await tester.tap(find.text('15').first);
      await tester.pumpAndSettle();
      await tester.tap(find.text('25').first);
      await tester.pumpAndSettle();

      expect(selected!.length, 3);
      expect(selected!.map((d) => d.day).toList(), [5, 15, 25]);
    });

    for (int i = 0; i < 5; i++) {
      testWidgets('deselect multiple date flow $i', (
        WidgetTester tester,
      ) async {
        List<DateTime>? selected;
        await tester.pumpWidget(
          TestCalendarWrapper(
            initialMonth: DateTime(2023, 10, 1),
            selectionMode: RefractionCalendarSelectionMode.multiple,
            initialSelectedDates: [DateTime(2023, 10, i + 1)],
            onDatesSelected: (dates) => selected = dates,
          ),
        );
        await tester.tap(find.text('${i + 1}').first);
        await tester.pumpAndSettle();
        expect(selected!.isEmpty, isTrue);
      });
    }
  });

  group('RefractionCalendar Range Selection', () {
    testWidgets('selects range', (WidgetTester tester) async {
      DateTimeRange? range;
      await tester.pumpWidget(
        TestCalendarWrapper(
          initialMonth: DateTime(2023, 10, 1),
          selectionMode: RefractionCalendarSelectionMode.range,
          onRangeSelected: (r) => range = r,
        ),
      );

      await tester.tap(find.text('10').first); // start
      await tester.pumpAndSettle();
      expect(range, isNotNull);
      expect(range!.start.day, 10);
      expect(range!.end.day, 10); // temporary end

      await tester.tap(find.text('15').first); // end
      await tester.pumpAndSettle();
      expect(range!.start.day, 10);
      expect(range!.end.day, 15);
    });

    testWidgets('selects backwards range correctly', (
      WidgetTester tester,
    ) async {
      DateTimeRange? range;
      await tester.pumpWidget(
        TestCalendarWrapper(
          initialMonth: DateTime(2023, 10, 1),
          selectionMode: RefractionCalendarSelectionMode.range,
          onRangeSelected: (r) => range = r,
        ),
      );

      await tester.tap(find.text('15').first); // start
      await tester.pumpAndSettle();
      await tester.tap(find.text('10').first); // new start
      await tester.pumpAndSettle();

      expect(range!.start.day, 10);
      expect(range!.end.day, 10);
    });

    testWidgets('starts new range if range already selected', (
      WidgetTester tester,
    ) async {
      DateTimeRange? range;
      await tester.pumpWidget(
        TestCalendarWrapper(
          initialMonth: DateTime(2023, 10, 1),
          selectionMode: RefractionCalendarSelectionMode.range,
          initialSelectedRange: DateTimeRange(
            start: DateTime(2023, 10, 10),
            end: DateTime(2023, 10, 15),
          ),
          onRangeSelected: (r) => range = r,
        ),
      );

      await tester.tap(find.text('20').first); // new start
      await tester.pumpAndSettle();

      expect(range!.start.day, 20);
      expect(range!.end.day, 20);
    });

    for (int d = 2; d <= 6; d++) {
      testWidgets('selects range from 1 to $d', (WidgetTester tester) async {
        DateTimeRange? range;
        await tester.pumpWidget(
          TestCalendarWrapper(
            initialMonth: DateTime(2023, 10, 1),
            selectionMode: RefractionCalendarSelectionMode.range,
            onRangeSelected: (r) => range = r,
          ),
        );
        await tester.tap(find.text('1').first);
        await tester.pumpAndSettle();
        await tester.tap(find.text('$d').first);
        await tester.pumpAndSettle();
        expect(range!.start.day, 1);
        expect(range!.end.day, d);
      });
    }
  });

  group('RefractionCalendar None Selection', () {
    testWidgets('does not select when selectionMode is none', (
      WidgetTester tester,
    ) async {
      DateTime? selected;
      await tester.pumpWidget(
        TestCalendarWrapper(
          initialMonth: DateTime(2023, 10, 1),
          selectionMode: RefractionCalendarSelectionMode.none,
          onDateSelected: (d) => selected = d,
        ),
      );

      await tester.tap(find.text('15').first);
      await tester.pumpAndSettle();

      expect(selected, isNull);
    });
  });

  group('RefractionCalendar Bounds and Disabled', () {
    testWidgets('cannot select date before minDate', (
      WidgetTester tester,
    ) async {
      DateTime? selected;
      await tester.pumpWidget(
        TestCalendarWrapper(
          initialMonth: DateTime(2023, 10, 1),
          minDate: DateTime(2023, 10, 10),
          onDateSelected: (d) => selected = d,
        ),
      );

      await tester.tap(find.text('5').first);
      await tester.pumpAndSettle();
      expect(selected, isNull);

      await tester.tap(find.text('15').first);
      await tester.pumpAndSettle();
      expect(selected, isNotNull);
    });

    testWidgets('cannot select date after maxDate', (
      WidgetTester tester,
    ) async {
      DateTime? selected;
      await tester.pumpWidget(
        TestCalendarWrapper(
          initialMonth: DateTime(2023, 10, 1),
          maxDate: DateTime(2023, 10, 20),
          onDateSelected: (d) => selected = d,
        ),
      );

      await tester.tap(find.text('25').first);
      await tester.pumpAndSettle();
      expect(selected, isNull);

      await tester.tap(find.text('15').first);
      await tester.pumpAndSettle();
      expect(selected, isNotNull);
    });

    for (int day = 1; day <= 9; day++) {
      testWidgets('cannot select $day if minDate is 10th', (
        WidgetTester tester,
      ) async {
        DateTime? selected;
        await tester.pumpWidget(
          TestCalendarWrapper(
            initialMonth: DateTime(2023, 10, 1),
            minDate: DateTime(2023, 10, 10),
            onDateSelected: (d) => selected = d,
          ),
        );
        await tester.tap(find.text('$day').first);
        await tester.pumpAndSettle();
        expect(selected, isNull);
      });
    }
  });

  group('RefractionCalendar Outside Days', () {
    testWidgets('shows outside days by default', (WidgetTester tester) async {
      await tester.pumpWidget(
        TestCalendarWrapper(initialMonth: DateTime(2023, 10, 1)),
      );
      expect(find.text('1'), findsNWidgets(2));
    });

    testWidgets('hides outside days when showOutsideDays is false', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        TestCalendarWrapper(
          initialMonth: DateTime(2023, 10, 1),
          showOutsideDays: false,
        ),
      );
      expect(find.text('1'), findsOneWidget);
    });
  });

  group('RefractionCalendar Custom Rendering', () {
    testWidgets('uses dayBuilder to render custom day', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        TestCalendarWrapper(
          initialMonth: DateTime(2023, 10, 1),
          dayBuilder: (context, date, state) {
            return Center(child: Text('D${date.day}'));
          },
        ),
      );

      expect(find.text('D15'), findsOneWidget);
      expect(find.text('15'), findsNothing);
    });

    testWidgets('uses eventMarkersBuilder to render markers', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        TestCalendarWrapper(
          initialMonth: DateTime(2023, 10, 1),
          eventMarkersBuilder: (context, date) {
            if (date.day == 15) {
              return [const Icon(Icons.star, size: 8)];
            }
            return [];
          },
        ),
      );

      expect(find.byIcon(Icons.star), findsOneWidget);
    });

    for (int day = 10; day <= 14; day++) {
      testWidgets('custom builder day $day', (WidgetTester tester) async {
        await tester.pumpWidget(
          TestCalendarWrapper(
            initialMonth: DateTime(2023, 10, 1),
            dayBuilder: (c, d, s) {
              if (d.day == day && d.month == 10)
                return const Text("CUSTOM_DAY");
              return Text(d.day.toString());
            },
          ),
        );
        expect(find.text('CUSTOM_DAY'), findsOneWidget);
      });
    }
  });

  group('RefractionCalendar Additional Tests', () {
    testWidgets('selects date on edge of month', (WidgetTester tester) async {
      DateTime? selected;
      await tester.pumpWidget(
        TestCalendarWrapper(
          initialMonth: DateTime(2023, 1, 1),
          onDateSelected: (d) => selected = d,
        ),
      );
      await tester.ensureVisible(find.text("31").first);
      await tester.tap(find.text("31").first);
      await tester.pumpAndSettle();
      expect(selected!.day, 31);
    });

    testWidgets('multiple selection can toggle multiple times', (
      WidgetTester tester,
    ) async {
      List<DateTime>? selected;
      await tester.pumpWidget(
        TestCalendarWrapper(
          initialMonth: DateTime(2023, 1, 1),
          selectionMode: RefractionCalendarSelectionMode.multiple,
          initialSelectedDates: const [],
          onDatesSelected: (d) => selected = d,
        ),
      );
      await tester.tap(find.text('15').first);
      await tester.pumpAndSettle();
      expect(selected!.length, 1);
      await tester.tap(find.text('15').first);
      await tester.pumpAndSettle();
      expect(selected!.isEmpty, isTrue);
      await tester.tap(find.text('15').first);
      await tester.pumpAndSettle();
      expect(selected!.length, 1);
    });

    testWidgets('range selection clears on third tap', (
      WidgetTester tester,
    ) async {
      DateTimeRange? range;
      await tester.pumpWidget(
        TestCalendarWrapper(
          initialMonth: DateTime(2023, 1, 1),
          selectionMode: RefractionCalendarSelectionMode.range,
          onRangeSelected: (r) => range = r,
        ),
      );
      await tester.tap(find.text('10').first); // start
      await tester.pumpAndSettle();
      await tester.tap(find.text('20').first); // end
      await tester.pumpAndSettle();
      expect(range!.start.day, 10);
      expect(range!.end.day, 20);

      await tester.tap(find.text('25').first); // start new
      await tester.pumpAndSettle();
      expect(range!.start.day, 25);
      expect(range!.end.day, 25);
    });
  });
}
