import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/refraction_colors.dart';
import '../theme/refraction_theme.dart';

/// A date picker component that matches the Refraction UI headless structure.
///
/// Mirrors the React `DatePicker` component. Displays a trigger button that,
/// when tapped, opens a popover containing a calendar grid. Optionally
/// supports time selection.
class RefractionDatePicker extends StatefulWidget {
  /// The currently selected date.
  final DateTime? value;

  /// Called when a date is selected or time is changed.
  final ValueChanged<DateTime>? onChanged;

  /// The minimum allowed date.
  final DateTime? minDate;

  /// The maximum allowed date.
  final DateTime? maxDate;

  /// Whether to show time inputs below the calendar grid.
  final bool showTime;

  /// The format string used for the display value.
  /// Supports `YYYY`, `MM`, `DD`, `HH`, `mm`.
  final String format;

  /// The placeholder text when no date is selected.
  final String placeholder;

  /// Creates a date picker.
  const RefractionDatePicker({
    super.key,
    this.value,
    this.onChanged,
    this.minDate,
    this.maxDate,
    this.showTime = false,
    this.format = 'YYYY-MM-DD',
    this.placeholder = 'Select date...',
  });

  @override
  State<RefractionDatePicker> createState() => _RefractionDatePickerState();
}

class _RefractionDatePickerState extends State<RefractionDatePicker> {
  final LayerLink _layerLink = LayerLink();
  OverlayEntry? _overlayEntry;
  bool _isOpen = false;

  @override
  void didUpdateWidget(RefractionDatePicker oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.value != widget.value) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          _overlayEntry?.markNeedsBuild();
        }
      });
    }
  }

  String get _displayValue {
    if (widget.value == null) return widget.placeholder;
    final format = widget.showTime
        ? (widget.format == 'YYYY-MM-DD' ? 'YYYY-MM-DD HH:mm' : widget.format)
        : widget.format;

    final year = widget.value!.year.toString();
    final month = widget.value!.month.toString().padLeft(2, '0');
    final day = widget.value!.day.toString().padLeft(2, '0');
    final hours = widget.value!.hour.toString().padLeft(2, '0');
    final minutes = widget.value!.minute.toString().padLeft(2, '0');

    var result = format
        .replaceAll('YYYY', year)
        .replaceAll('MM', month)
        .replaceAll('DD', day);

    if (widget.showTime) {
      result = result.replaceAll('HH', hours).replaceAll('mm', minutes);
    }
    return result;
  }

  void _togglePicker() {
    if (_isOpen) {
      _closePicker();
    } else {
      _openPicker();
    }
  }

  void _openPicker() {
    final RenderBox renderBox = context.findRenderObject() as RenderBox;
    final size = renderBox.size;
    final themeData = RefractionTheme.of(context).data;

    _overlayEntry = OverlayEntry(
      builder: (context) => Stack(
        children: [
          Positioned.fill(
            child: GestureDetector(
              behavior: HitTestBehavior.translucent,
              onTap: _closePicker,
              child: Container(color: Colors.transparent),
            ),
          ),
          Positioned(
            width: 280,
            child: CompositedTransformFollower(
              link: _layerLink,
              showWhenUnlinked: false,
              offset: Offset(0, size.height + 4),
              child: Material(
                color: Colors.transparent,
                child: TweenAnimationBuilder<double>(
                  duration: const Duration(milliseconds: 150),
                  curve: Curves.easeOutCubic,
                  tween: Tween(begin: 0.95, end: 1.0),
                  builder: (context, scale, child) {
                    return Transform.scale(
                      scale: scale,
                      alignment: Alignment.topCenter,
                      child: Opacity(
                        opacity: ((scale - 0.95) * 20).clamp(0.0, 1.0),
                        child: RefractionTheme(
                          data: themeData,
                          child: _DatePickerDropdown(
                            value: widget.value,
                            onSelect: (date) {
                              widget.onChanged?.call(date);
                              if (!widget.showTime) {
                                _closePicker();
                              } else {
                                _overlayEntry?.markNeedsBuild();
                              }
                            },
                            minDate: widget.minDate,
                            maxDate: widget.maxDate,
                            showTime: widget.showTime,
                            onClose: _closePicker,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
          ),
        ],
      ),
    );

    Overlay.of(context).insert(_overlayEntry!);
    setState(() => _isOpen = true);
  }

  void _closePicker() {
    _overlayEntry?.remove();
    _overlayEntry?.dispose();
    _overlayEntry = null;
    if (mounted) {
      setState(() => _isOpen = false);
    }
  }

  @override
  void dispose() {
    if (_overlayEntry != null) {
      _overlayEntry!.remove();
      _overlayEntry!.dispose();
      _overlayEntry = null;
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    return CompositedTransformTarget(
      link: _layerLink,
      child: GestureDetector(
        onTap: _togglePicker,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: colors.background,
            border: Border.all(color: colors.input),
            borderRadius: BorderRadius.circular(theme.borderRadius),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                _displayValue,
                style: theme.data.textStyle.copyWith(
                  fontSize: 14,
                  color: widget.value == null
                      ? colors.mutedForeground
                      : colors.foreground,
                ),
              ),
              const SizedBox(width: 8),
              Icon(
                Icons.calendar_today,
                size: 16,
                color: colors.mutedForeground,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

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
    final gridStart = first.subtract(Duration(days: startDow));

    final days = <_CalendarDay>[];
    for (int i = 0; i < 42; i++) {
      final date = gridStart.add(Duration(days: i));
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

    final days = _buildDays();
    const shortDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
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
      width: 280,
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
          // Header
          Row(
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
                  child: Icon(
                    Icons.chevron_left,
                    size: 16,
                    color: colors.foreground,
                  ),
                ),
              ),
              Text(
                monthLabel,
                style: theme.data.textStyle.copyWith(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
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
          ),
          const SizedBox(height: 12),
          // Days Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: shortDays
                .map(
                  (d) => SizedBox(
                    width: 32,
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
          // Grid
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
                    width: 32,
                    height: 32,
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
          if (widget.showTime) ...[
            const SizedBox(height: 12),
            Divider(color: colors.border),
            const SizedBox(height: 12),
            Row(
              children: [
                Text(
                  'Time:',
                  style: theme.data.textStyle.copyWith(
                    fontSize: 14,
                    color: colors.mutedForeground,
                  ),
                ),
                const SizedBox(width: 8),
                _buildTimeInput(
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
                _buildTimeInput(
                  _minutesController,
                  (val) => _handleTimeChange(),
                  theme,
                  colors,
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildTimeInput(
    TextEditingController controller,
    ValueChanged<String> onChanged,
    RefractionTheme theme,
    RefractionColors colors,
  ) {
    return SizedBox(
      width: 48,
      child: TextField(
        controller: controller,
        keyboardType: TextInputType.number,
        textAlign: TextAlign.center,
        inputFormatters: [FilteringTextInputFormatter.digitsOnly],
        onChanged: onChanged,
        style: theme.data.textStyle.copyWith(fontSize: 14),
        decoration: InputDecoration(
          contentPadding: const EdgeInsets.symmetric(
            vertical: 4,
            horizontal: 8,
          ),
          isDense: true,
          filled: true,
          fillColor: colors.background,
          enabledBorder: OutlineInputBorder(
            borderSide: BorderSide(color: colors.input),
            borderRadius: BorderRadius.circular(theme.borderRadius),
          ),
          focusedBorder: OutlineInputBorder(
            borderSide: BorderSide(color: colors.ring, width: 2),
            borderRadius: BorderRadius.circular(theme.borderRadius),
          ),
        ),
      ),
    );
  }
}
