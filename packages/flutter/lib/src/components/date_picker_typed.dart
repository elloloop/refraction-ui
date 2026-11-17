import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../theme/refraction_theme.dart';

/// How a [RefractionDatePicker] takes its date.
enum RefractionDateEntry {
  /// A trigger that opens a calendar popover (the default).
  calendar,

  /// Day, month and year typed into three numeric segments. Suited to a date
  /// the person already knows and that may be far from today, such as a date
  /// of birth.
  typed,
}

/// The order of the segments in [RefractionDateEntry.typed].
enum RefractionDateFieldOrder {
  /// Day, month, year (15 / 04 / 1998).
  dayMonthYear,

  /// Month, day, year (04 / 15 / 1998).
  monthDayYear,

  /// Year, month, day (1998 / 04 / 15).
  yearMonthDay,
}

/// Why the typed segments of a [RefractionDatePicker] do not make a date.
enum RefractionDateProblem {
  /// A segment is empty, or the year has fewer than four digits.
  incomplete,

  /// The segments make no calendar date (month 13, 31 April, 29 February in a
  /// common year, year 0000).
  notReal,

  /// The date is before the picker's `minDate`.
  beforeMin,

  /// The date is after the picker's `maxDate`.
  afterMax,
}

/// Why the typed `day`, `month` and `year` do not make a date inside
/// [minDate]..[maxDate] (both inclusive, compared by day), or null when they
/// do. Pure, with no widget or clock: the caller supplies every input.
RefractionDateProblem? refractionDateProblem({
  required String day,
  required String month,
  required String year,
  DateTime? minDate,
  DateTime? maxDate,
}) {
  if (day.isEmpty || month.isEmpty || year.length < 4) {
    return RefractionDateProblem.incomplete;
  }
  final y = int.tryParse(year);
  final m = int.tryParse(month);
  final d = int.tryParse(day);
  if (y == null || m == null || d == null) return RefractionDateProblem.notReal;
  if (y < 1 || m < 1 || m > 12 || d < 1 || d > _daysInMonth(y, m)) {
    return RefractionDateProblem.notReal;
  }
  final date = DateTime(y, m, d);
  if (minDate != null && date.isBefore(_dateOnly(minDate))) {
    return RefractionDateProblem.beforeMin;
  }
  if (maxDate != null && date.isAfter(_dateOnly(maxDate))) {
    return RefractionDateProblem.afterMax;
  }
  return null;
}

/// Day 0 of the next month is the last day of this one.
int _daysInMonth(int year, int month) => DateTime(year, month + 1, 0).day;

DateTime _dateOnly(DateTime date) => DateTime(date.year, date.month, date.day);

enum _Segment { day, month, year }

/// The typed entry of [RefractionDatePicker]: three digit-only segments in
/// [order], each under its own label, with an optional error line beneath.
/// Not exported: callers use `RefractionDatePicker(entry: typed)`.
class TypedDateSegments extends StatefulWidget {
  const TypedDateSegments({
    super.key,
    required this.value,
    required this.onChanged,
    required this.onProblemChanged,
    required this.minDate,
    required this.maxDate,
    required this.order,
    required this.dayLabel,
    required this.monthLabel,
    required this.yearLabel,
    required this.semanticLabel,
    required this.errorText,
    required this.disabled,
  });

  final DateTime? value;
  final ValueChanged<DateTime>? onChanged;
  final ValueChanged<RefractionDateProblem?>? onProblemChanged;
  final DateTime? minDate;
  final DateTime? maxDate;
  final RefractionDateFieldOrder order;
  final String dayLabel;
  final String monthLabel;
  final String yearLabel;
  final String? semanticLabel;
  final String? errorText;
  final bool disabled;

  @override
  State<TypedDateSegments> createState() => _TypedDateSegmentsState();
}

class _TypedDateSegmentsState extends State<TypedDateSegments> {
  final Map<_Segment, TextEditingController> _controllers = {
    for (final s in _Segment.values) s: TextEditingController(),
  };
  final Map<_Segment, FocusNode> _focusNodes = {
    for (final s in _Segment.values) s: FocusNode(),
  };

  RefractionDateProblem? _problem;
  DateTime? _emitted;

  /// The last date passed to `onChanged`. A caller that stores it hands it
  /// back as `value` a frame later, by which time the person may have typed
  /// on; that echo is not a new value and must not overwrite their typing.
  DateTime? _lastSent;

  List<_Segment> get _order => switch (widget.order) {
    RefractionDateFieldOrder.dayMonthYear => const [
      _Segment.day,
      _Segment.month,
      _Segment.year,
    ],
    RefractionDateFieldOrder.monthDayYear => const [
      _Segment.month,
      _Segment.day,
      _Segment.year,
    ],
    RefractionDateFieldOrder.yearMonthDay => const [
      _Segment.year,
      _Segment.month,
      _Segment.day,
    ],
  };

  @override
  void initState() {
    super.initState();
    _fill(widget.value);
    _problem = _currentProblem();
    _emitted = _problem == null ? _typedDate() : null;
    for (final node in _focusNodes.values) {
      node.addListener(_focusChanged);
    }
  }

  @override
  void didUpdateWidget(TypedDateSegments oldWidget) {
    super.didUpdateWidget(oldWidget);
    final value = widget.value;
    if (value == oldWidget.value) return;
    if (value != null && _lastSent != null && _sameDay(value, _lastSent!)) {
      return;
    }
    final typed = _typedDate();
    final adopt = value != null
        ? typed == null || !_sameDay(typed, value)
        // Cleared by the caller: empty the segments only if they still hold
        // the date the caller just dropped, never a half-typed new one.
        : typed != null &&
              oldWidget.value != null &&
              _sameDay(typed, oldWidget.value!);
    if (!adopt) return;
    _fill(value);
    _lastSent = null;
    _emitted = _currentProblem() == null ? _typedDate() : null;
    _reportProblemAfterBuild();
  }

  /// Tells the caller the problem the caller's own `value` produced. Not
  /// during this build: the caller's handler will usually call setState.
  void _reportProblemAfterBuild() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final problem = _currentProblem();
      if (problem == _problem) return;
      _problem = problem;
      widget.onProblemChanged?.call(problem);
    });
  }

  @override
  void dispose() {
    for (final c in _controllers.values) {
      c.dispose();
    }
    for (final n in _focusNodes.values) {
      n.dispose();
    }
    super.dispose();
  }

  void _focusChanged() => setState(() {});

  void _fill(DateTime? value) {
    _controllers[_Segment.day]!.text = value == null
        ? ''
        : value.day.toString().padLeft(2, '0');
    _controllers[_Segment.month]!.text = value == null
        ? ''
        : value.month.toString().padLeft(2, '0');
    _controllers[_Segment.year]!.text = value == null
        ? ''
        : value.year.toString().padLeft(4, '0');
  }

  RefractionDateProblem? _currentProblem() => refractionDateProblem(
    day: _controllers[_Segment.day]!.text,
    month: _controllers[_Segment.month]!.text,
    year: _controllers[_Segment.year]!.text,
    minDate: widget.minDate,
    maxDate: widget.maxDate,
  );

  /// The typed date when the segments make a real date (range ignored).
  DateTime? _typedDate() {
    final problem = refractionDateProblem(
      day: _controllers[_Segment.day]!.text,
      month: _controllers[_Segment.month]!.text,
      year: _controllers[_Segment.year]!.text,
    );
    if (problem != null) return null;
    return DateTime(
      int.parse(_controllers[_Segment.year]!.text),
      int.parse(_controllers[_Segment.month]!.text),
      int.parse(_controllers[_Segment.day]!.text),
    );
  }

  static bool _sameDay(DateTime a, DateTime b) =>
      a.year == b.year && a.month == b.month && a.day == b.day;

  static int _length(_Segment s) => s == _Segment.year ? 4 : 2;

  void _typed(_Segment segment, String text) {
    final order = _order;
    final index = order.indexOf(segment);
    if (text.length == _length(segment) && index < order.length - 1) {
      // Select what the next segment holds, so typing on replaces it rather
      // than being refused by its length limit.
      final next = _controllers[order[index + 1]]!;
      next.selection = TextSelection(
        baseOffset: 0,
        extentOffset: next.text.length,
      );
      _focusNodes[order[index + 1]]!.requestFocus();
    }
    final problem = _currentProblem();
    if (problem != _problem) {
      _problem = problem;
      widget.onProblemChanged?.call(problem);
    }
    final date = problem == null ? _typedDate() : null;
    if (date != null && (_emitted == null || !_sameDay(date, _emitted!))) {
      _lastSent = date;
      widget.onChanged?.call(date);
    }
    _emitted = date;
  }

  KeyEventResult _key(_Segment segment, KeyEvent event) {
    if (event is! KeyDownEvent ||
        event.logicalKey != LogicalKeyboardKey.backspace ||
        _controllers[segment]!.text.isNotEmpty) {
      return KeyEventResult.ignored;
    }
    final order = _order;
    final index = order.indexOf(segment);
    if (index == 0) return KeyEventResult.ignored;
    final previous = order[index - 1];
    final controller = _controllers[previous]!;
    _focusNodes[previous]!.requestFocus();
    controller.selection = TextSelection.collapsed(
      offset: controller.text.length,
    );
    return KeyEventResult.handled;
  }

  String _label(_Segment s) => switch (s) {
    _Segment.day => widget.dayLabel,
    _Segment.month => widget.monthLabel,
    _Segment.year => widget.yearLabel,
  };

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;
    final hasError = widget.errorText != null;
    final order = _order;

    Widget segment(_Segment s) {
      final focused = _focusNodes[s]!.hasFocus;
      final borderColor = hasError
          ? colors.destructive
          : focused
          ? colors.ring
          : colors.input;
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ExcludeSemantics(
            child: Text(
              _label(s),
              style: theme.data.textStyle.copyWith(
                fontSize: 13,
                color: colors.mutedForeground,
              ),
            ),
          ),
          const SizedBox(height: 4),
          AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            constraints: const BoxConstraints(minHeight: 44),
            alignment: Alignment.centerLeft,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: widget.disabled ? colors.muted : colors.background,
              borderRadius: BorderRadius.circular(theme.borderRadius),
              border: Border.all(color: borderColor, width: focused ? 2 : 1),
            ),
            child: Focus(
              onKeyEvent: (_, event) => _key(s, event),
              child: Semantics(
                label: _label(s),
                child: TextField(
                  key: ValueKey<String>('refraction-date-picker-${s.name}'),
                  controller: _controllers[s],
                  focusNode: _focusNodes[s],
                  enabled: !widget.disabled,
                  keyboardType: TextInputType.number,
                  textInputAction: s == order.last
                      ? TextInputAction.done
                      : TextInputAction.next,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(_length(s)),
                  ],
                  onChanged: (text) => _typed(s, text),
                  style: theme.data.textStyle.copyWith(
                    fontSize: 14,
                    color: colors.foreground,
                  ),
                  cursorColor: colors.primary,
                  decoration: const InputDecoration.collapsed(hintText: null),
                ),
              ),
            ),
          ),
        ],
      );
    }

    return Opacity(
      opacity: widget.disabled ? 0.5 : 1.0,
      child: Semantics(
        container: true,
        label: widget.semanticLabel,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                for (final (index, s) in order.indexed) ...[
                  if (index > 0) const SizedBox(width: 8),
                  Expanded(flex: s == _Segment.year ? 3 : 2, child: segment(s)),
                ],
              ],
            ),
            if (hasError) ...[
              const SizedBox(height: 6),
              Semantics(
                liveRegion: true,
                child: Text(
                  widget.errorText!,
                  style: theme.data.textStyle.copyWith(
                    fontSize: 13,
                    color: colors.destructive,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
