import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/slot_picker.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: child),
      ),
    );
  }

  final testDays = [
    const SlotDay(id: 'd1', weekday: 'Mon', dayNum: '1'),
    const SlotDay(id: 'd2', weekday: 'Tue', dayNum: '2'),
  ];

  final testSlots = {
    'd1': ['09:00 AM', '10:00 AM'],
    'd2': ['11:00 AM', '12:00 PM'],
  };

  testWidgets('RefractionSlotPicker renders days and displays slots on selection', (
    WidgetTester tester,
  ) async {
    SlotSelection? selectedValue;

    await tester.pumpWidget(
      buildTestApp(
        RefractionSlotPicker(
          days: testDays,
          slotsByDay: testSlots,
          onChange: (val) {
            selectedValue = val;
          },
        ),
      ),
    );

    // Days are displayed
    expect(find.text('Mon'), findsOneWidget);
    expect(find.text('Tue'), findsOneWidget);

    // No slots displayed yet because no day is selected
    expect(find.text('09:00 AM'), findsNothing);

    // Select first day
    await tester.tap(find.text('Mon'));
    await tester.pumpAndSettle();

    // Now slots should render
    expect(find.text('09:00 AM'), findsOneWidget);
    expect(find.text('10:00 AM'), findsOneWidget);

    // Select a slot
    await tester.tap(find.text('09:00 AM'));
    await tester.pumpAndSettle();

    expect(selectedValue, isNotNull);
    expect(selectedValue!.dayId, equals('d1'));
    expect(selectedValue!.slot, equals('09:00 AM'));
  });

  testWidgets('RefractionSlotPicker disabled slots are not clickable', (
    WidgetTester tester,
  ) async {
    SlotSelection? selectedValue;

    await tester.pumpWidget(
      buildTestApp(
        RefractionSlotPicker(
          days: testDays,
          slotsByDay: testSlots,
          defaultValue: const SlotSelection(dayId: 'd1', slot: ''),
          disabledSlots: const ['09:00 AM'],
          onChange: (val) {
            selectedValue = val;
          },
        ),
      ),
    );

    // Slots are visible because dayId 'd1' is preselected
    expect(find.text('09:00 AM'), findsOneWidget);

    // Try tapping the disabled slot
    await tester.tap(find.text('09:00 AM'));
    await tester.pumpAndSettle();

    // The callback should not have been called with that slot
    expect(selectedValue, isNull);

    // Tap the enabled slot
    await tester.tap(find.text('10:00 AM'));
    await tester.pumpAndSettle();

    expect(selectedValue, isNotNull);
    expect(selectedValue!.slot, equals('10:00 AM'));
  });
}
