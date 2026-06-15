import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

// Exporting types directly needed for cases
import 'package:refraction_ui/src/components/slot_picker.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionSlotPicker)
Widget defaultSlotPickerUseCase(BuildContext context) {
  return const _SlotPickerDemo();
}

class _SlotPickerDemo extends StatefulWidget {
  const _SlotPickerDemo();

  @override
  State<_SlotPickerDemo> createState() => _SlotPickerDemoState();
}

class _SlotPickerDemoState extends State<_SlotPickerDemo> {
  final List<SlotDay> _days = const [
    SlotDay(id: 'mon', weekday: 'Mon', dayNum: 15),
    SlotDay(id: 'tue', weekday: 'Tue', dayNum: 16),
    SlotDay(id: 'wed', weekday: 'Wed', dayNum: 17),
  ];

  final Map<String, List<String>> _slotsByDay = const {
    'mon': ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM'],
    'tue': ['09:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM'],
    'wed': ['10:00 AM', '11:00 AM', '03:00 PM'],
  };

  SlotSelection? _selection;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          RefractionSlotPicker(
            days: _days,
            slotsByDay: _slotsByDay,
            value: _selection,
            timezoneLabel: 'EST (UTC-5)',
            disabledSlots: const ['10:00 AM'],
            onChange: (sel) {
              setState(() {
                _selection = sel;
              });
            },
          ),
          const SizedBox(height: 24),
          if (_selection != null && _selection!.slot.isNotEmpty)
            Text(
              'Selected: ${_selection!.dayId} at ${_selection!.slot}',
              style: const TextStyle(fontWeight: FontWeight.bold),
            )
          else
            const Text(
              'No slot selected',
              style: TextStyle(fontStyle: FontStyle.italic),
            ),
        ],
      ),
    );
  }
}
