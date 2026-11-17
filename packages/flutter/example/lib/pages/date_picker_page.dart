import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import '../dev_tools/preview_canvas.dart';

class DatePickerPage extends StatefulWidget {
  const DatePickerPage({super.key});

  @override
  State<DatePickerPage> createState() => _DatePickerPageState();
}

class _DatePickerPageState extends State<DatePickerPage> {
  DateTime? _selectedDate;
  DateTime? _selectedDateTime;
  DateTime? _birthDate;
  RefractionDateProblem? _birthDateProblem;

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);

    return PreviewCanvas(
      title: "Date Picker",
      description: "A component to select dates with an optional time picker.",
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 600),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Standard Date Picker",
                style: theme.data.textStyle.copyWith(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
              const SizedBox(height: 16),
              RefractionDatePicker(
                value: _selectedDate,
                onChanged: (date) {
                  setState(() {
                    _selectedDate = date;
                  });
                },
              ),
              const SizedBox(height: 48),
              Text(
                "Date & Time Picker",
                style: theme.data.textStyle.copyWith(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
              const SizedBox(height: 16),
              RefractionDatePicker(
                value: _selectedDateTime,
                showTime: true,
                onChanged: (date) {
                  setState(() {
                    _selectedDateTime = date;
                  });
                },
              ),
              const SizedBox(height: 48),
              Text(
                "Date Picker (with Min/Max constraints)",
                style: theme.data.textStyle.copyWith(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
              const SizedBox(height: 16),
              RefractionDatePicker(
                minDate: DateTime.now().subtract(const Duration(days: 7)),
                maxDate: DateTime.now().add(const Duration(days: 7)),
                placeholder: "Next/prev 7 days only",
              ),
              const SizedBox(height: 48),
              Text(
                "Typed entry (date of birth)",
                style: theme.data.textStyle.copyWith(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
              const SizedBox(height: 16),
              RefractionDatePicker(
                entry: RefractionDateEntry.typed,
                fieldOrder: RefractionDateFieldOrder.dayMonthYear,
                semanticLabel: "Date of birth",
                value: _birthDate,
                maxDate: DateTime.now(),
                onChanged: (date) => setState(() => _birthDate = date),
                onProblemChanged: (problem) =>
                    setState(() => _birthDateProblem = problem),
                errorText: switch (_birthDateProblem) {
                  RefractionDateProblem.notReal => "That date does not exist.",
                  RefractionDateProblem.afterMax =>
                    "That date is in the future.",
                  _ => null,
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
