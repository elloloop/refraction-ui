part of 'date_picker.dart';

class _CalendarDay {
  final DateTime date;
  final bool isToday;
  final bool isSelected;
  final bool isCurrentMonth;
  final bool isDisabled;

  _CalendarDay({
    required this.date,
    required this.isToday,
    required this.isSelected,
    required this.isCurrentMonth,
    required this.isDisabled,
  });
}

class _DatePickerDropdown extends StatefulWidget {
  final DateTime? value;
  final ValueChanged<DateTime> onSelect;
  final DateTime? minDate;
  final DateTime? maxDate;
  final bool showTime;
  final VoidCallback onClose;

  const _DatePickerDropdown({
    required this.value,
    required this.onSelect,
    required this.minDate,
    required this.maxDate,
    required this.showTime,
    required this.onClose,
  });

  @override
  State<_DatePickerDropdown> createState() => _DatePickerDropdownState();
}

class _DatePickerDropdownState extends State<_DatePickerDropdown> {
  late DateTime _currentMonth;
  late TextEditingController _hoursController;
  late TextEditingController _minutesController;

  @override
  void initState() {
    super.initState();
    final initialDate = widget.value ?? DateTime.now();
    _currentMonth = DateTime(initialDate.year, initialDate.month, 1);
    _hoursController = TextEditingController(
      text: widget.value?.hour.toString().padLeft(2, '0') ?? '00',
    );
    _minutesController = TextEditingController(
      text: widget.value?.minute.toString().padLeft(2, '0') ?? '00',
    );
  }

  @override
  void didUpdateWidget(_DatePickerDropdown oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value != oldWidget.value) {
      if (widget.value != null) {
        final newH = widget.value!.hour.toString().padLeft(2, '0');
        final newM = widget.value!.minute.toString().padLeft(2, '0');
        if (_hoursController.text != newH) _hoursController.text = newH;
        if (_minutesController.text != newM) _minutesController.text = newM;
      }
    }
  }

  @override
  void dispose() {
    _hoursController.dispose();
    _minutesController.dispose();
    super.dispose();
  }

  bool _isSameDay(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }

  bool _isDateDisabled(DateTime date) {
    final d = DateTime(date.year, date.month, date.day);
    if (widget.minDate != null) {
      final min = DateTime(
        widget.minDate!.year,
        widget.minDate!.month,
        widget.minDate!.day,
      );
      if (d.isBefore(min)) return true;
    }
    if (widget.maxDate != null) {
      final max = DateTime(
        widget.maxDate!.year,
        widget.maxDate!.month,
        widget.maxDate!.day,
        23,
        59,
        59,
        999,
      );
      if (d.isAfter(max)) return true;
    }
    return false;
  }

  List<_CalendarDay> _buildDays() {
    final today = DateTime.now();
    final year = _currentMonth.year;
    final month = _currentMonth.month;
    final first = DateTime(year, month, 1);
    final startDow = first.weekday % 7; // Sunday = 0
    final gridStart = DateTime(year, month, 1 - startDow);

    final days = <_CalendarDay>[];
    for (int i = 0; i < 42; i++) {
      final date = DateTime(gridStart.year, gridStart.month, gridStart.day + i);
      days.add(
        _CalendarDay(
          date: date,
          isToday: _isSameDay(date, today),
          isSelected: widget.value != null && _isSameDay(date, widget.value!),
          isCurrentMonth: date.month == month,
          isDisabled: _isDateDisabled(date),
        ),
      );
    }
    return days;
  }

  void _handleSelectDate(DateTime date) {
    var newDate = date;
    if (widget.value != null) {
      newDate = DateTime(
        date.year,
        date.month,
        date.day,
        widget.value!.hour,
        widget.value!.minute,
      );
    } else {
      int h = int.tryParse(_hoursController.text) ?? 0;
      int m = int.tryParse(_minutesController.text) ?? 0;
      newDate = DateTime(date.year, date.month, date.day, h, m);
    }
    widget.onSelect(newDate);
  }

  void _handleTimeChange() {
    if (widget.value == null) return;
    int h = int.tryParse(_hoursController.text) ?? widget.value!.hour;
    int m = int.tryParse(_minutesController.text) ?? widget.value!.minute;
    h = h.clamp(0, 23);
    m = m.clamp(0, 59);
    final newDate = DateTime(
      widget.value!.year,
      widget.value!.month,
      widget.value!.day,
      h,
      m,
    );
    widget.onSelect(newDate);
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    final digits = TextPainter(
      text: TextSpan(
        text: '88',
        style: theme.data.textStyle.copyWith(fontSize: 14),
      ),
      textDirection: Directionality.of(context),
      textScaler: MediaQuery.textScalerOf(context),
    )..layout();
    final cell = math.max(32.0, math.max(digits.width, digits.height) + 8);
    digits.dispose();
    final days = _buildDays();
    const monthNames = [
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
    final monthLabel =
        '${monthNames[_currentMonth.month - 1]} ${_currentMonth.year}';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colors.popover,
        borderRadius: BorderRadius.circular(theme.borderRadius),
        border: Border.all(color: colors.border),
        boxShadow: theme.data.heavyShadow,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildHeader(theme, colors, monthLabel),
          const SizedBox(height: 12),
          // Keep seven aligned columns at the user's text scale. When they
          // cannot fit the viewport, scroll the calendar rather than overlap.
          _buildGrid(theme, colors, cell, days),
          if (widget.showTime) ...[
            const SizedBox(height: 12),
            Divider(color: colors.border),
            const SizedBox(height: 12),
            _buildTimeRow(theme, colors),
          ],
        ],
      ),
    );
  }

  Widget _buildHeader(
    RefractionTheme theme,
    RefractionColors colors,
    String monthLabel,
  ) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        GestureDetector(
          onTap: () => setState(() {
            _currentMonth = DateTime(
              _currentMonth.year,
              _currentMonth.month - 1,
              1,
            );
          }),
          child: Container(
            padding: const EdgeInsets.all(4),
            child: Icon(Icons.chevron_left, size: 16, color: colors.foreground),
          ),
        ),
        Flexible(
          child: Text(
            monthLabel,
            textAlign: TextAlign.center,
            style: theme.data.textStyle.copyWith(
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        GestureDetector(
          onTap: () => setState(() {
            _currentMonth = DateTime(
              _currentMonth.year,
              _currentMonth.month + 1,
              1,
            );
          }),
          child: Container(
            padding: const EdgeInsets.all(4),
            child: Icon(
              Icons.chevron_right,
              size: 16,
              color: colors.foreground,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildGrid(
    RefractionTheme theme,
    RefractionColors colors,
    double cell,
    List<_CalendarDay> days,
  ) {
    const shortDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: SizedBox(
        width: cell * 7 + 4 * 6,
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: shortDays
                  .map(
                    (d) => SizedBox(
                      width: cell,
                      child: Text(
                        d,
                        textAlign: TextAlign.center,
                        style: theme.data.textStyle.copyWith(
                          fontSize: 12,
                          color: colors.mutedForeground,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  )
                  .toList(),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 4,
              runSpacing: 4,
              children: days.map((day) {
                Color bgColor = Colors.transparent;
                Color textColor = colors.foreground;
                BoxBorder? border;
                double opacity = 1.0;

                if (day.isDisabled) {
                  textColor = colors.mutedForeground;
                  opacity = 0.5;
                } else if (day.isSelected) {
                  bgColor = colors.primary;
                  textColor = colors.primaryForeground;
                } else if (day.isToday) {
                  border = Border.all(color: colors.accentForeground);
                } else if (!day.isCurrentMonth) {
                  textColor = colors.mutedForeground;
                  opacity = 0.3;
                }

                return GestureDetector(
                  onTap: day.isDisabled
                      ? null
                      : () => _handleSelectDate(day.date),
                  child: Opacity(
                    opacity: opacity,
                    child: Container(
                      width: cell,
                      height: cell,
                      decoration: BoxDecoration(
                        color: bgColor,
                        borderRadius: BorderRadius.circular(theme.borderRadius),
                        border: border,
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        day.date.day.toString(),
                        style: theme.data.textStyle.copyWith(
                          fontSize: 14,
                          color: textColor,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimeRow(RefractionTheme theme, RefractionColors colors) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        Text(
          'Time:',
          style: theme.data.textStyle.copyWith(
            fontSize: 14,
            color: colors.mutedForeground,
          ),
        ),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _datePickerTimeInput(
              context,
              _hoursController,
              (val) => _handleTimeChange(),
              theme,
              colors,
            ),
            const SizedBox(width: 4),
            Text(
              ':',
              style: theme.data.textStyle.copyWith(
                color: colors.mutedForeground,
              ),
            ),
            const SizedBox(width: 4),
            _datePickerTimeInput(
              context,
              _minutesController,
              (val) => _handleTimeChange(),
              theme,
              colors,
            ),
          ],
        ),
      ],
    );
  }
}
