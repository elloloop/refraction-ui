import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class CalendarPage extends StatefulWidget {
  const CalendarPage({super.key});

  @override
  State<CalendarPage> createState() => _CalendarPageState();
}

class _CalendarPageState extends State<CalendarPage> {
  DateTime? _selectedSingleDate;
  List<DateTime> _selectedMultipleDates = [];
  DateTimeRange? _selectedRange;

  @override
  void initState() {
    super.initState();
    _selectedSingleDate = DateTime.now();
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Calendar'),
        backgroundColor: theme.colors.background,
        foregroundColor: theme.colors.foreground,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: theme.colors.border, height: 1),
        ),
      ),
      backgroundColor: theme.colors.background,
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          _buildSectionTitle('Single Selection', theme),
          const SizedBox(height: 16),
          Center(
            child: SizedBox(
              width: 320,
              child: Card(
                color: theme.colors.popover,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  side: BorderSide(color: theme.colors.border),
                  borderRadius: BorderRadius.circular(theme.borderRadius),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: RefractionCalendar(
                    selectedDate: _selectedSingleDate,
                    onDateSelected: (date) {
                      setState(() {
                        _selectedSingleDate = date;
                      });
                    },
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Selected: ${_selectedSingleDate?.toString().split(' ')[0] ?? "None"}',
            style: theme.data.textStyle,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 48),

          _buildSectionTitle('Multiple Selection', theme),
          const SizedBox(height: 16),
          Center(
            child: SizedBox(
              width: 320,
              child: Card(
                color: theme.colors.popover,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  side: BorderSide(color: theme.colors.border),
                  borderRadius: BorderRadius.circular(theme.borderRadius),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: RefractionCalendar(
                    selectionMode: RefractionCalendarSelectionMode.multiple,
                    selectedDates: _selectedMultipleDates,
                    onDatesSelected: (dates) {
                      setState(() {
                        _selectedMultipleDates = dates;
                      });
                    },
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Selected: ${_selectedMultipleDates.map((d) => d.toString().split(' ')[0]).join(', ')}',
            style: theme.data.textStyle,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 48),

          _buildSectionTitle('Range Selection', theme),
          const SizedBox(height: 16),
          Center(
            child: SizedBox(
              width: 320,
              child: Card(
                color: theme.colors.popover,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  side: BorderSide(color: theme.colors.border),
                  borderRadius: BorderRadius.circular(theme.borderRadius),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: RefractionCalendar(
                    selectionMode: RefractionCalendarSelectionMode.range,
                    selectedRange: _selectedRange,
                    onRangeSelected: (range) {
                      setState(() {
                        _selectedRange = range;
                      });
                    },
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Selected Range: ${_selectedRange?.start.toString().split(' ')[0] ?? "None"} - ${_selectedRange?.end.toString().split(' ')[0] ?? "None"}',
            style: theme.data.textStyle,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 48),

          _buildSectionTitle('Custom Markers & Min/Max', theme),
          const SizedBox(height: 16),
          Center(
            child: SizedBox(
              width: 320,
              child: Card(
                color: theme.colors.popover,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  side: BorderSide(color: theme.colors.border),
                  borderRadius: BorderRadius.circular(theme.borderRadius),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: RefractionCalendar(
                    selectionMode: RefractionCalendarSelectionMode.none,
                    minDate: DateTime.now().subtract(const Duration(days: 7)),
                    maxDate: DateTime.now().add(const Duration(days: 14)),
                    eventMarkersBuilder: (context, date) {
                      if (date.day % 5 == 0) {
                        return [
                          Container(
                            width: 4,
                            height: 4,
                            margin: const EdgeInsets.symmetric(horizontal: 1),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: theme.colors.primary,
                            ),
                          ),
                        ];
                      }
                      return [];
                    },
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title, RefractionTheme theme) {
    return Text(
      title,
      style: theme.data.textStyle.copyWith(
        fontSize: 18,
        fontWeight: FontWeight.w600,
      ),
    );
  }
}
