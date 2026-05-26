import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildTestApp({required Widget child}) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.light(),
        child: Scaffold(body: Center(child: child)),
      ),
    );
  }

  group('RefractionDatePicker', () {
    testWidgets('renders placeholder when no value is provided', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestApp(
          child: const RefractionDatePicker(
            placeholder: 'Select your birthday',
          ),
        ),
      );

      expect(find.text('Select your birthday'), findsOneWidget);
    });

    testWidgets('renders formatted date when value is provided', (
      WidgetTester tester,
    ) async {
      final date = DateTime(2023, 10, 5); // October 5, 2023
      await tester.pumpWidget(
        buildTestApp(child: RefractionDatePicker(value: date)),
      );

      expect(find.text('2023-10-05'), findsOneWidget);
    });

    testWidgets('renders formatted date with time when showTime is true', (
      WidgetTester tester,
    ) async {
      final date = DateTime(2023, 10, 5, 14, 30); // October 5, 2023, 14:30
      await tester.pumpWidget(
        buildTestApp(child: RefractionDatePicker(value: date, showTime: true)),
      );

      expect(find.text('2023-10-05 14:30'), findsOneWidget);
    });

    testWidgets('opens dropdown when tapped', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestApp(child: const RefractionDatePicker()),
      );

      // Dropdown should not be visible initially
      expect(find.byType(Wrap), findsNothing);

      // Tap trigger
      await tester.tap(find.byIcon(Icons.calendar_today));
      await tester.pumpAndSettle();

      // Dropdown should be visible
      expect(find.byType(Wrap), findsOneWidget);
      expect(find.text('Su'), findsOneWidget); // Days header
    });

    testWidgets('can select a date and it calls onChanged', (
      WidgetTester tester,
    ) async {
      DateTime? selectedDate;

      // Use a fixed initial date so the calendar is predictable
      final initialDate = DateTime(2023, 10, 15);

      await tester.pumpWidget(
        buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return RefractionDatePicker(
                value: selectedDate ?? initialDate,
                onChanged: (date) {
                  setState(() => selectedDate = date);
                },
              );
            },
          ),
        ),
      );

      // Open the picker
      await tester.tap(find.byType(RefractionDatePicker));
      await tester.pumpAndSettle();

      // Tap on day '20'
      await tester.tap(find.text('20').first);
      await tester.pumpAndSettle();

      expect(selectedDate, isNotNull);
      expect(selectedDate!.year, 2023);
      expect(selectedDate!.month, 10);
      expect(selectedDate!.day, 20);

      // Picker should be closed
      expect(find.byType(Wrap), findsNothing);
    });

    testWidgets('disabled dates cannot be selected', (
      WidgetTester tester,
    ) async {
      DateTime? selectedDate = DateTime(2023, 10, 15);
      final minDate = DateTime(2023, 10, 10);

      await tester.pumpWidget(
        buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return RefractionDatePicker(
                value: selectedDate,
                minDate: minDate,
                onChanged: (date) {
                  setState(() => selectedDate = date);
                },
              );
            },
          ),
        ),
      );

      // Open the picker
      await tester.tap(find.byType(RefractionDatePicker));
      await tester.pumpAndSettle();

      // Tap on day '5' which is before minDate
      await tester.tap(find.text('5').first);
      await tester.pumpAndSettle();

      // Should not have changed
      expect(selectedDate!.day, 15);

      // Picker should still be open (click was ignored)
      expect(find.byType(Wrap), findsOneWidget);

      // Close the picker to clean up
      await tester.tap(find.byType(RefractionDatePicker));
      await tester.pumpAndSettle();
    });
  });
}
