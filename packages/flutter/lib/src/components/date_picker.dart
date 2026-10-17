import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/refraction_colors.dart';
import '../theme/refraction_theme.dart';
import '../theme/refraction_theme_data.dart';

part 'date_picker_dropdown.dart';
part 'date_picker_time.dart';

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

class _RefractionDatePickerState extends State<RefractionDatePicker>
    with WidgetsBindingObserver {
  final LayerLink _layerLink = LayerLink();
  OverlayEntry? _overlayEntry;
  bool _isOpen = false;
  bool _positionUpdatePending = false;
  bool _contentsDirty = false;
  Rect? _anchorRect;

  @override
  void didUpdateWidget(RefractionDatePicker oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.value != widget.value ||
        oldWidget.minDate != widget.minDate ||
        oldWidget.maxDate != widget.maxDate ||
        oldWidget.showTime != widget.showTime) {
      _contentsDirty = true;
      _schedulePositionUpdate();
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _contentsDirty = true;
    _schedulePositionUpdate();
  }

  @override
  void didChangeMetrics() {
    _contentsDirty = true;
    _schedulePositionUpdate();
  }

  void _schedulePositionUpdate() {
    if (_overlayEntry == null || _positionUpdatePending) return;
    _positionUpdatePending = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _positionUpdatePending = false;
      if (!mounted || _overlayEntry == null) return;
      final box = context.findRenderObject() as RenderBox;
      final rect = box.localToGlobal(Offset.zero) & box.size;
      if (_contentsDirty || rect != _anchorRect) {
        _contentsDirty = false;
        _overlayEntry?.markNeedsBuild();
      }
      // Follow parent layout animations on frames they already request.
      // One pending callback, no timer and no idle frame scheduling.
      _schedulePositionUpdate();
    });
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
    _overlayEntry = OverlayEntry(
      builder: (context) => _buildOverlay(
        context,
        renderBox,
        RefractionTheme.of(this.context).data,
      ),
    );

    WidgetsBinding.instance.addObserver(this);
    Overlay.of(context).insert(_overlayEntry!);
    setState(() => _isOpen = true);
    _schedulePositionUpdate();
  }

  Widget _buildOverlay(
    BuildContext context,
    RenderBox renderBox,
    RefractionThemeData themeData,
  ) {
    const edge = 16.0;
    const gap = 4.0;
    final media = MediaQuery.of(context);
    final scale = media.textScaler.scale(14) / 14;
    final width = math.min(
      280.0 * math.max(1.0, scale),
      math.max(0.0, media.size.width - edge * 2),
    );
    final anchor = renderBox.localToGlobal(Offset.zero);
    _anchorRect = anchor & renderBox.size;
    final left = anchor.dx.clamp(
      edge,
      math.max(edge, media.size.width - width - edge),
    );
    final above = math.max(0.0, anchor.dy - media.padding.top - edge - gap);
    final below = math.max(
      0.0,
      media.size.height -
          media.viewInsets.bottom -
          media.padding.bottom -
          edge -
          anchor.dy -
          renderBox.size.height -
          gap,
    );
    final opensAbove = above > below;
    final height = opensAbove ? above : below;
    return Stack(
      children: [
        Positioned.fill(
          child: GestureDetector(
            behavior: HitTestBehavior.translucent,
            onTap: _closePicker,
            child: Container(color: Colors.transparent),
          ),
        ),
        Positioned(
          width: width,
          child: CompositedTransformFollower(
            link: _layerLink,
            showWhenUnlinked: false,
            targetAnchor: opensAbove ? Alignment.topLeft : Alignment.bottomLeft,
            followerAnchor: opensAbove
                ? Alignment.bottomLeft
                : Alignment.topLeft,
            offset: Offset(left - anchor.dx, opensAbove ? -gap : gap),
            child: Material(
              color: Colors.transparent,
              child: TweenAnimationBuilder<double>(
                duration: const Duration(milliseconds: 150),
                curve: Curves.easeOutCubic,
                tween: Tween(begin: 0.95, end: 1.0),
                builder: (context, scale, child) => Transform.scale(
                  scale: scale,
                  alignment: opensAbove
                      ? Alignment.bottomCenter
                      : Alignment.topCenter,
                  child: Opacity(
                    opacity: ((scale - 0.95) * 20).clamp(0.0, 1.0),
                    child: ConstrainedBox(
                      constraints: BoxConstraints(maxHeight: height),
                      child: SingleChildScrollView(
                        child: _pickerContents(themeData),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _pickerContents(RefractionThemeData themeData) => RefractionTheme(
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
  );

  void _closePicker() {
    WidgetsBinding.instance.removeObserver(this);
    _overlayEntry?.remove();
    _overlayEntry?.dispose();
    _overlayEntry = null;
    _anchorRect = null;
    if (mounted) {
      setState(() => _isOpen = false);
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
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
              // Respect the parent's available width without shrinking the
              // user's text scale or hiding the selected date/time.
              Flexible(
                child: Text(
                  _displayValue,
                  style: theme.data.textStyle.copyWith(
                    fontSize: 14,
                    color: widget.value == null
                        ? colors.mutedForeground
                        : colors.foreground,
                  ),
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
