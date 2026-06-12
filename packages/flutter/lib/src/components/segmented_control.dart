import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/refraction_theme.dart';

/// Visual size of a [RefractionSegmentedControl].
enum RefractionSegmentedControlSize {
  /// Compact padding and extra-small text.
  sm,

  /// Default padding and small text.
  md,
}

/// A single segment within a [RefractionSegmentedControl].
class RefractionSegmentedControlItem<T> {
  /// Value identifying this segment; selected when it matches the group value.
  final T value;

  /// Label shown on the segment.
  final String label;

  /// Optional leading icon shown before the label.
  final Widget? icon;

  /// Creates a [RefractionSegmentedControlItem].
  const RefractionSegmentedControlItem({
    required this.value,
    required this.label,
    this.icon,
  });
}

/// A pill-shaped single-select control with radio semantics.
///
/// Mirrors the React/Astro `SegmentedControl`: an animated active segment,
/// `sm`/`md` sizes, controlled ([value]) and uncontrolled ([initialValue])
/// usage, and roving keyboard navigation — arrow keys wrap, Home/End jump to
/// the ends.
///
/// ```dart
/// RefractionSegmentedControl<String>(
///   value: view,
///   onValueChange: (v) => setState(() => view = v),
///   items: const [
///     RefractionSegmentedControlItem(value: 'list', label: 'List'),
///     RefractionSegmentedControlItem(value: 'grid', label: 'Grid'),
///   ],
/// )
/// ```
class RefractionSegmentedControl<T> extends StatefulWidget {
  /// The available segments, in display/navigation order.
  final List<RefractionSegmentedControlItem<T>> items;

  /// Controlled selected value. When non-null the widget is controlled and
  /// the parent must update it via [onValueChange].
  final T? value;

  /// Initial selected value for uncontrolled usage. Ignored when [value] is
  /// non-null.
  final T? initialValue;

  /// Called with the newly selected value.
  final ValueChanged<T>? onValueChange;

  /// Visual size of the control.
  final RefractionSegmentedControlSize size;

  /// Creates a [RefractionSegmentedControl].
  const RefractionSegmentedControl({
    super.key,
    required this.items,
    this.value,
    this.initialValue,
    this.onValueChange,
    this.size = RefractionSegmentedControlSize.md,
  });

  @override
  State<RefractionSegmentedControl<T>> createState() =>
      _RefractionSegmentedControlState<T>();
}

class _RefractionSegmentedControlState<T>
    extends State<RefractionSegmentedControl<T>> {
  late T? _internalValue;
  late List<FocusNode> _focusNodes;

  bool get _isControlled => widget.value != null;
  T? get _selected => _isControlled ? widget.value : _internalValue;

  @override
  void initState() {
    super.initState();
    _internalValue = widget.initialValue ??
        (widget.items.isNotEmpty ? widget.items.first.value : null);
    _focusNodes = List.generate(widget.items.length, (_) => FocusNode());
  }

  @override
  void didUpdateWidget(RefractionSegmentedControl<T> oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.items.length != oldWidget.items.length) {
      for (final node in _focusNodes) {
        node.dispose();
      }
      _focusNodes = List.generate(widget.items.length, (_) => FocusNode());
    }
  }

  @override
  void dispose() {
    for (final node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  void _select(T value) {
    if (!_isControlled) setState(() => _internalValue = value);
    widget.onValueChange?.call(value);
  }

  /// Pure roving-navigation rule shared with the React core: arrows wrap,
  /// Home/End jump to the ends.
  int _nextIndex(int current, LogicalKeyboardKey key) {
    final count = widget.items.length;
    if (count <= 0) return current;
    if (key == LogicalKeyboardKey.arrowRight ||
        key == LogicalKeyboardKey.arrowDown) {
      return (current + 1) % count;
    }
    if (key == LogicalKeyboardKey.arrowLeft ||
        key == LogicalKeyboardKey.arrowUp) {
      return (current - 1 + count) % count;
    }
    if (key == LogicalKeyboardKey.home) return 0;
    if (key == LogicalKeyboardKey.end) return count - 1;
    return current;
  }

  KeyEventResult _handleKey(int index, KeyEvent event) {
    if (event is! KeyDownEvent) return KeyEventResult.ignored;
    final key = event.logicalKey;
    final target = _nextIndex(index, key);
    if (target != index) {
      _select(widget.items[target].value);
      _focusNodes[target].requestFocus();
      return KeyEventResult.handled;
    }
    if (key == LogicalKeyboardKey.space || key == LogicalKeyboardKey.enter) {
      _select(widget.items[index].value);
      return KeyEventResult.handled;
    }
    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;
    final isSm = widget.size == RefractionSegmentedControlSize.sm;

    return Semantics(
      container: true,
      explicitChildNodes: true,
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: colors.muted,
          borderRadius: BorderRadius.circular(theme.borderRadius),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (var i = 0; i < widget.items.length; i++)
              Padding(
                padding: EdgeInsets.only(left: i == 0 ? 0 : 4),
                child: _Segment<T>(
                  item: widget.items[i],
                  selected: widget.items[i].value == _selected,
                  size: widget.size,
                  isSm: isSm,
                  focusNode: _focusNodes[i],
                  onTap: () => _select(widget.items[i].value),
                  onKey: (event) => _handleKey(i, event),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _Segment<T> extends StatefulWidget {
  final RefractionSegmentedControlItem<T> item;
  final bool selected;
  final RefractionSegmentedControlSize size;
  final bool isSm;
  final FocusNode focusNode;
  final VoidCallback onTap;
  final KeyEventResult Function(KeyEvent) onKey;

  const _Segment({
    super.key,
    required this.item,
    required this.selected,
    required this.size,
    required this.isSm,
    required this.focusNode,
    required this.onTap,
    required this.onKey,
  });

  @override
  State<_Segment<T>> createState() => _SegmentState<T>();
}

class _SegmentState<T> extends State<_Segment<T>> {
  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;
    final selected = widget.selected;

    final foreground = selected
        ? colors.foreground
        : (_hovered ? colors.foreground : colors.mutedForeground);

    return Semantics(
      inMutuallyExclusiveGroup: true,
      checked: selected,
      label: widget.item.label,
      child: Focus(
        focusNode: widget.focusNode,
        onKeyEvent: (_, event) => widget.onKey(event),
        child: MouseRegion(
          cursor: SystemMouseCursors.click,
          onEnter: (_) => setState(() => _hovered = true),
          onExit: (_) => setState(() => _hovered = false),
          child: GestureDetector(
            onTap: () {
              widget.focusNode.requestFocus();
              widget.onTap();
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              padding: EdgeInsets.symmetric(
                horizontal: widget.isSm ? 10 : 12,
                vertical: widget.isSm ? 4 : 6,
              ),
              decoration: BoxDecoration(
                color: selected ? colors.background : Colors.transparent,
                borderRadius: BorderRadius.circular(theme.borderRadius * 0.75),
                boxShadow: selected ? theme.data.softShadow : null,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (widget.item.icon != null) ...[
                    IconTheme.merge(
                      data: IconThemeData(
                        color: foreground,
                        size: widget.isSm ? 14 : 16,
                      ),
                      child: widget.item.icon!,
                    ),
                    const SizedBox(width: 6),
                  ],
                  Text(
                    widget.item.label,
                    style: TextStyle(
                      color: foreground,
                      fontSize: widget.isSm ? 12 : 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
