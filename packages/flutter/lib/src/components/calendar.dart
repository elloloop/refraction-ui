import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

enum RefractionCalendarSelectionMode { none, single, multiple, range }

class RefractionCalendarDayState {
  final bool isSelected;
  final bool isToday;
  final bool isOutsideMonth;
  final bool isDisabled;
  final bool isRangeStart;
  final bool isRangeEnd;
  final bool isRangeMiddle;

  const RefractionCalendarDayState({
    this.isSelected = false,
    this.isToday = false,
    this.isOutsideMonth = false,
    this.isDisabled = false,
    this.isRangeStart = false,
    this.isRangeEnd = false,
    this.isRangeMiddle = false,
  });
}

class RefractionCalendar extends StatefulWidget {
  final DateTime? initialMonth;
  final DateTime? minDate;
  final DateTime? maxDate;
  final RefractionCalendarSelectionMode selectionMode;

  final DateTime? selectedDate;
  final ValueChanged<DateTime?>? onDateSelected;

  final List<DateTime>? selectedDates;
  final ValueChanged<List<DateTime>>? onDatesSelected;

  final DateTimeRange? selectedRange;
  final ValueChanged<DateTimeRange?>? onRangeSelected;

  final ValueChanged<DateTime>? onMonthChanged;
  final bool showOutsideDays;

  final Widget Function(
    BuildContext context,
    DateTime date,
    RefractionCalendarDayState state,
  )?
  dayBuilder;
  final List<Widget> Function(BuildContext context, DateTime date)?
  eventMarkersBuilder;

  final List<String> weekdayLabels;
  final List<String> monthLabels;

  const RefractionCalendar({
    super.key,
    this.initialMonth,
    this.minDate,
    this.maxDate,
    this.selectionMode = RefractionCalendarSelectionMode.single,
    this.selectedDate,
    this.onDateSelected,
    this.selectedDates,
    this.onDatesSelected,
    this.selectedRange,
    this.onRangeSelected,
    this.onMonthChanged,
    this.showOutsideDays = true,
    this.dayBuilder,
    this.eventMarkersBuilder,
    this.weekdayLabels = const ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    this.monthLabels = const [
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
    ],
  });

  @override
  State<RefractionCalendar> createState() => _RefractionCalendarState();
}

class _RefractionCalendarState extends State<RefractionCalendar> {
  late DateTime _currentMonth;
  late DateTime _now;

  DateTime? _rangeStart;
  DateTime? _rangeEnd;

  @override
  void initState() {
    super.initState();
    _now = DateTime.now();
    _now = DateTime(_now.year, _now.month, _now.day);

    final initial =
        widget.initialMonth ??
        (widget.selectedDate != null
            ? DateTime(widget.selectedDate!.year, widget.selectedDate!.month, 1)
            : DateTime(_now.year, _now.month, 1));
    _currentMonth = DateTime(initial.year, initial.month, 1);
  }

  @override
  void didUpdateWidget(RefractionCalendar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initialMonth != null &&
        widget.initialMonth != oldWidget.initialMonth) {
      _currentMonth =
          DateTime(widget.initialMonth!.year, widget.initialMonth!.month, 1);
    }
    if (widget.selectedRange != oldWidget.selectedRange && widget.selectedRange == null) {
      _rangeStart = null;
      _rangeEnd = null;
    }
  }

  bool _isSameDay(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }

  bool _isDisabled(DateTime date) {
    if (widget.minDate != null) {
      final min = DateTime(
        widget.minDate!.year,
        widget.minDate!.month,
        widget.minDate!.day,
      );
      if (date.isBefore(min)) return true;
    }
    if (widget.maxDate != null) {
      final max = DateTime(
        widget.maxDate!.year,
        widget.maxDate!.month,
        widget.maxDate!.day,
      );
      if (date.isAfter(max)) return true;
    }
    return false;
  }

  void _handleDayTap(DateTime date) {
    if (_isDisabled(date)) return;

    if (widget.selectionMode == RefractionCalendarSelectionMode.single) {
      if (widget.selectedDate != null &&
          _isSameDay(widget.selectedDate!, date)) {
        widget.onDateSelected?.call(null);
      } else {
        widget.onDateSelected?.call(date);
      }
    } else if (widget.selectionMode ==
        RefractionCalendarSelectionMode.multiple) {
      final List<DateTime> current = List.of(widget.selectedDates ?? []);
      final existingIndex = current.indexWhere((d) => _isSameDay(d, date));
      if (existingIndex >= 0) {
        current.removeAt(existingIndex);
      } else {
        current.add(date);
      }
      widget.onDatesSelected?.call(current);
    } else if (widget.selectionMode == RefractionCalendarSelectionMode.range) {
      if (_rangeStart == null || (_rangeStart != null && _rangeEnd != null)) {
        setState(() {
          _rangeStart = date;
          _rangeEnd = null;
        });
        widget.onRangeSelected?.call(DateTimeRange(start: date, end: date));
      } else {
        if (date.isBefore(_rangeStart!)) {
          setState(() {
            _rangeStart = date;
          });
          widget.onRangeSelected?.call(DateTimeRange(start: date, end: date));
        } else {
          setState(() {
            _rangeEnd = date;
          });
          widget.onRangeSelected
              ?.call(DateTimeRange(start: _rangeStart!, end: date));
        }
      }
    }
  }

  void _nextMonth() {
    setState(() {
      _currentMonth = DateTime(_currentMonth.year, _currentMonth.month + 1, 1);
      widget.onMonthChanged?.call(_currentMonth);
    });
  }

  void _prevMonth() {
    setState(() {
      _currentMonth = DateTime(_currentMonth.year, _currentMonth.month - 1, 1);
      widget.onMonthChanged?.call(_currentMonth);
    });
  }

  List<DateTime> _buildDays() {
    final days = <DateTime>[];
    final firstDayOfMonth = DateTime(
      _currentMonth.year,
      _currentMonth.month,
      1,
    );
    final lastDayOfMonth = DateTime(
      _currentMonth.year,
      _currentMonth.month + 1,
      0,
    );

    final firstWeekday = firstDayOfMonth.weekday; // 1 = Mon, 7 = Sun
    // Adjust to 0 = Sun, 6 = Sat
    final leadingDays = firstWeekday == 7 ? 0 : firstWeekday;

    // Previous month days
    for (int i = leadingDays - 1; i >= 0; i--) {
      days.add(firstDayOfMonth.subtract(Duration(days: i + 1)));
    }

    // Current month days
    for (int i = 1; i <= lastDayOfMonth.day; i++) {
      days.add(DateTime(_currentMonth.year, _currentMonth.month, i));
    }

    // Next month days
    final remainingDays = 42 - days.length; // 6 rows of 7 days
    for (int i = 1; i <= remainingDays; i++) {
      days.add(lastDayOfMonth.add(Duration(days: i)));
    }

    return days;
  }

  RefractionCalendarDayState _getDayState(DateTime date) {
    bool isSelected = false;
    bool isRangeStart = false;
    bool isRangeEnd = false;
    bool isRangeMiddle = false;

    if (widget.selectionMode == RefractionCalendarSelectionMode.single) {
      if (widget.selectedDate != null &&
          _isSameDay(widget.selectedDate!, date)) {
        isSelected = true;
      }
    } else if (widget.selectionMode ==
        RefractionCalendarSelectionMode.multiple) {
      if (widget.selectedDates != null) {
        isSelected = widget.selectedDates!.any((d) => _isSameDay(d, date));
      }
    } else if (widget.selectionMode == RefractionCalendarSelectionMode.range) {
      final start = _rangeStart ?? widget.selectedRange?.start;
      final end = (_rangeStart != null) ? _rangeEnd : (widget.selectedRange?.end);

      if (start != null && _isSameDay(start, date)) {
        isRangeStart = true;
        isSelected = true;
        // If there's no end yet, it's not a range end
        if (end != null && _isSameDay(end, date) && _rangeEnd != null) {
          isRangeEnd = true;
        }
      } else if (end != null && _isSameDay(end, date)) {
        isRangeEnd = true;
        isSelected = true;
      }

      if (start != null && end != null) {
        if (date.isAfter(start) && date.isBefore(end)) {
          isRangeMiddle = true;
          isSelected = true;
        }
        if (_isSameDay(start, date) && _isSameDay(end, date)) {
          isRangeStart = true;
          isRangeEnd = true;
          isSelected = true;
        }
      }
    }

    return RefractionCalendarDayState(
      isSelected: isSelected,
      isToday: _isSameDay(_now, date),
      isOutsideMonth: date.month != _currentMonth.month,
      isDisabled: _isDisabled(date),
      isRangeStart: isRangeStart,
      isRangeEnd: isRangeEnd,
      isRangeMiddle: isRangeMiddle,
    );
  }

  Widget _buildDay(BuildContext context, DateTime date, RefractionTheme theme) {
    final state = _getDayState(date);

    if (state.isOutsideMonth && !widget.showOutsideDays) {
      return const SizedBox(width: 36, height: 36);
    }

    if (widget.dayBuilder != null) {
      return widget.dayBuilder!(context, date, state);
    }

    Color bgColor = Colors.transparent;
    Color textColor = theme.colors.foreground;
    BoxBorder? border;

    if (state.isDisabled) {
      textColor = theme.colors.mutedForeground;
    } else if (state.isRangeMiddle) {
      bgColor = theme.colors.accent;
      textColor = theme.colors.accentForeground;
      border = Border.all(color: Colors.transparent);
    } else if (state.isRangeStart || state.isRangeEnd) {
      bgColor = theme.colors.primary;
      textColor = theme.colors.primaryForeground;
    } else if (state.isSelected) {
      bgColor = theme.colors.primary;
      textColor = theme.colors.primaryForeground;
    } else if (state.isToday) {
      bgColor = theme.colors.accent;
      textColor = theme.colors.accentForeground;
    }

    if (state.isOutsideMonth) {
      textColor = theme.colors.mutedForeground.withValues(alpha: 0.5);
    }

    BorderRadiusGeometry radius = BorderRadius.circular(theme.borderRadius);
    if (state.isRangeStart && state.isRangeEnd) {
      // both, standard radius
    } else if (state.isRangeStart) {
      radius = BorderRadius.only(
        topLeft: Radius.circular(theme.borderRadius),
        bottomLeft: Radius.circular(theme.borderRadius),
      );
    } else if (state.isRangeEnd) {
      radius = BorderRadius.only(
        topRight: Radius.circular(theme.borderRadius),
        bottomRight: Radius.circular(theme.borderRadius),
      );
    } else if (state.isRangeMiddle) {
      radius = BorderRadius.zero;
    }

    final markers = widget.eventMarkersBuilder?.call(context, date) ?? [];

    return GestureDetector(
      onTap: state.isDisabled ? null : () => _handleDayTap(date),
      behavior: HitTestBehavior.opaque,
      child: Container(
        height: 36,
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: radius,
          border: border,
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            Text(
              date.day.toString(),
              style: theme.data.textStyle.copyWith(
                color: textColor,
                fontSize: 14,
                fontWeight: state.isSelected || state.isToday
                    ? FontWeight.w600
                    : FontWeight.w400,
              ),
            ),
            if (markers.isNotEmpty)
              Positioned(
                bottom: 2,
                child: Row(mainAxisSize: MainAxisSize.min, children: markers),
              ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final days = _buildDays();

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            GestureDetector(
              onTap: _prevMonth,
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  border: Border.all(color: theme.colors.border),
                  borderRadius: BorderRadius.circular(theme.borderRadius),
                ),
                child: Icon(
                  Icons.chevron_left,
                  size: 16,
                  color: theme.colors.foreground,
                ),
              ),
            ),
            Text(
              '${widget.monthLabels[_currentMonth.month - 1]} ${_currentMonth.year}',
              style: theme.data.textStyle.copyWith(
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
            GestureDetector(
              onTap: _nextMonth,
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  border: Border.all(color: theme.colors.border),
                  borderRadius: BorderRadius.circular(theme.borderRadius),
                ),
                child: Icon(
                  Icons.chevron_right,
                  size: 16,
                  color: theme.colors.foreground,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        // Weekdays Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: widget.weekdayLabels
              .map(
                (w) => Expanded(
                  child: Text(
                    w,
                    textAlign: TextAlign.center,
                    style: theme.data.textStyle.copyWith(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: theme.colors.mutedForeground,
                    ),
                  ),
                ),
              )
              .toList(),
        ),
        const SizedBox(height: 8),
        // Days Grid
        LayoutBuilder(
          builder: (context, constraints) {
            return GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: days.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 7,
                mainAxisSpacing: 4,
                crossAxisSpacing: 0,
              ),
              itemBuilder: (context, index) {
                return _buildDay(context, days[index], theme);
              },
            );
          },
        ),
      ],
    );
  }
}
