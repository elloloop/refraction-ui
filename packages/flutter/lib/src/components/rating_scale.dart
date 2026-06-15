import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/refraction_theme.dart';

/// Visual size of a [RefractionRatingScale].
enum RefractionRatingScaleSize {
  /// Compact size (32x32px buttons)
  sm,

  /// Default size (40x40px buttons)
  md,
}

/// A single selectable point on the rating scale.
class RefractionRatingScalePoint {
  /// The value this point represents (e.g. 1, 2, 3, etc.).
  final int value;

  /// Optional accessible/visible label for the point.
  final String? label;

  /// Creates a [RefractionRatingScalePoint].
  const RefractionRatingScalePoint({
    required this.value,
    this.label,
  });
}

/// A single-select ordinal rating / Likert control.
///
/// Mirrors the React/Astro `RatingScale` component. Supports controlled (`value`)
/// and uncontrolled (`defaultValue`) usage. Supports custom points or count-based auto points.
/// Includes keyboard navigation (arrow keys to navigate, Home/End to jump to ends).
///
/// ```dart
/// RefractionRatingScale(
///   value: rating,
///   onValueChange: (val) => setState(() => rating = val),
///   minLabel: const Text('Low'),
///   maxLabel: const Text('High'),
/// )
/// ```
class RefractionRatingScale extends StatefulWidget {
  /// Controlled selected value.
  final int? value;

  /// Initial value for uncontrolled usage.
  final int? defaultValue;

  /// Called when the selected value changes.
  final ValueChanged<int>? onValueChange;

  /// Number of points (1..count). Ignored when [points] is provided.
  final int count;

  /// Explicit points.
  final List<RefractionRatingScalePoint>? points;

  /// Label shown before the scale (the low end).
  final Widget? minLabel;

  /// Label shown after the scale (the high end).
  final Widget? maxLabel;

  /// Visual size of the points. Defaults to [RefractionRatingScaleSize.md].
  final RefractionRatingScaleSize size;

  /// Disables the whole scale.
  final bool disabled;

  /// Creates a [RefractionRatingScale].
  const RefractionRatingScale({
    super.key,
    this.value,
    this.defaultValue,
    this.onValueChange,
    this.count = 5,
    this.points,
    this.minLabel,
    this.maxLabel,
    this.size = RefractionRatingScaleSize.md,
    this.disabled = false,
  });

  @override
  State<RefractionRatingScale> createState() => _RefractionRatingScaleState();
}

class _RefractionRatingScaleState extends State<RefractionRatingScale> {
  int? _internalValue;
  late List<FocusNode> _focusNodes;

  bool get _isControlled => widget.value != null;
  int? get _selected => _isControlled ? widget.value : _internalValue;

  List<RefractionRatingScalePoint> get _resolvedPoints {
    if (widget.points != null && widget.points!.isNotEmpty) {
      return widget.points!;
    }
    final cnt = widget.count < 0 ? 0 : widget.count;
    return List.generate(cnt, (i) => RefractionRatingScalePoint(value: i + 1));
  }

  @override
  void initState() {
    super.initState();
    _internalValue = widget.defaultValue;
    _focusNodes = List.generate(_resolvedPoints.length, (_) => FocusNode());
  }

  @override
  void didUpdateWidget(RefractionRatingScale oldWidget) {
    super.didUpdateWidget(oldWidget);
    final oldLen = (oldWidget.points != null && oldWidget.points!.isNotEmpty)
        ? oldWidget.points!.length
        : (oldWidget.count < 0 ? 0 : oldWidget.count);
    final newLen = _resolvedPoints.length;
    if (oldLen != newLen) {
      for (final node in _focusNodes) {
        node.dispose();
      }
      _focusNodes = List.generate(newLen, (_) => FocusNode());
    }
  }

  @override
  void dispose() {
    for (final node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  void _select(int val) {
    if (widget.disabled) return;
    if (!_isControlled) {
      setState(() {
        _internalValue = val;
      });
    }
    widget.onValueChange?.call(val);
  }

  int _nextIndex(int current, LogicalKeyboardKey key) {
    final count = _resolvedPoints.length;
    if (count <= 0) return current;
    if (key == LogicalKeyboardKey.arrowRight || key == LogicalKeyboardKey.arrowUp) {
      return (current + 1).clamp(0, count - 1);
    }
    if (key == LogicalKeyboardKey.arrowLeft || key == LogicalKeyboardKey.arrowDown) {
      return (current - 1).clamp(0, count - 1);
    }
    if (key == LogicalKeyboardKey.home) return 0;
    if (key == LogicalKeyboardKey.end) return count - 1;
    return current;
  }

  KeyEventResult _handleKey(int index, KeyEvent event) {
    if (widget.disabled) return KeyEventResult.ignored;
    if (event is! KeyDownEvent) return KeyEventResult.ignored;
    final key = event.logicalKey;
    final target = _nextIndex(index, key);
    if (target != index) {
      _select(_resolvedPoints[target].value);
      _focusNodes[target].requestFocus();
      return KeyEventResult.handled;
    }
    if (key == LogicalKeyboardKey.space || key == LogicalKeyboardKey.enter) {
      _select(_resolvedPoints[index].value);
      return KeyEventResult.handled;
    }
    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;
    final points = _resolvedPoints;

    final labelStyle = theme.data.textStyle.copyWith(
      fontSize: 12.0,
      color: colors.mutedForeground,
    );

    return Semantics(
      container: true,
      label: 'Rating Scale',
      enabled: !widget.disabled,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          if (widget.minLabel != null) ...[
            DefaultTextStyle(
              style: labelStyle,
              child: widget.minLabel!,
            ),
            const SizedBox(width: 12.0),
          ],
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              for (var i = 0; i < points.length; i++)
                Padding(
                  padding: EdgeInsets.only(left: i == 0 ? 0 : 6.0),
                  child: _RatingScaleItem(
                    value: points[i].value,
                    label: points[i].label ?? points[i].value.toString(),
                    selected: points[i].value == _selected,
                    disabled: widget.disabled,
                    size: widget.size,
                    focusNode: _focusNodes[i],
                    onTap: () => _select(points[i].value),
                    onKey: (event) => _handleKey(i, event),
                  ),
                ),
            ],
          ),
          if (widget.maxLabel != null) ...[
            const SizedBox(width: 12.0),
            DefaultTextStyle(
              style: labelStyle,
              child: widget.maxLabel!,
            ),
          ],
        ],
      ),
    );
  }
}

class _RatingScaleItem extends StatefulWidget {
  final int value;
  final String label;
  final bool selected;
  final bool disabled;
  final RefractionRatingScaleSize size;
  final FocusNode focusNode;
  final VoidCallback onTap;
  final KeyEventResult Function(KeyEvent) onKey;

  const _RatingScaleItem({
    required this.value,
    required this.label,
    required this.selected,
    required this.disabled,
    required this.size,
    required this.focusNode,
    required this.onTap,
    required this.onKey,
  });

  @override
  State<_RatingScaleItem> createState() => _RatingScaleItemState();
}

class _RatingScaleItemState extends State<_RatingScaleItem> {
  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;
    final selected = widget.selected;
    final disabled = widget.disabled;
    final isSm = widget.size == RefractionRatingScaleSize.sm;

    final double buttonSize = isSm ? 32.0 : 40.0;
    final double fontSize = isSm ? 12.0 : 14.0;

    Color backgroundColor;
    Color foregroundColor;
    Color borderColor;

    if (disabled) {
      if (selected) {
        backgroundColor = colors.primary.withValues(alpha: 0.5);
        foregroundColor = colors.primaryForeground.withValues(alpha: 0.5);
        borderColor = colors.primary.withValues(alpha: 0.5);
      } else {
        backgroundColor = colors.background.withValues(alpha: 0.5);
        foregroundColor = colors.mutedForeground.withValues(alpha: 0.5);
        borderColor = colors.input.withValues(alpha: 0.5);
      }
    } else {
      if (selected) {
        backgroundColor = colors.primary;
        foregroundColor = colors.primaryForeground;
        borderColor = colors.primary;
      } else {
        backgroundColor = _hovered ? colors.accent : colors.background;
        foregroundColor = _hovered ? colors.accentForeground : colors.foreground;
        borderColor = colors.input;
      }
    }

    return Semantics(
      button: true,
      selected: selected,
      enabled: !disabled,
      label: widget.label,
      child: Focus(
        focusNode: widget.focusNode,
        onKeyEvent: (_, event) => widget.onKey(event),
        child: MouseRegion(
          cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
          onEnter: (_) => setState(() => _hovered = true),
          onExit: (_) => setState(() => _hovered = false),
          child: GestureDetector(
            onTap: () {
              if (disabled) return;
              widget.focusNode.requestFocus();
              widget.onTap();
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              width: buttonSize,
              height: buttonSize,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: backgroundColor,
                borderRadius: BorderRadius.circular(theme.borderRadius),
                border: Border.all(color: borderColor),
              ),
              child: Text(
                widget.label,
                style: theme.data.textStyle.copyWith(
                  color: foregroundColor,
                  fontSize: fontSize,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
