import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A standard radio button styled with Refraction tokens.
///
/// Controlled by [value] and [groupValue].
/// When [value] == [groupValue], it is selected.
/// When tapped, [onChanged] is called with [value].
///
/// Mirrors the shadcn-ui `RadioGroupItem` primitive.
class RefractionRadio<T> extends StatefulWidget {
  /// The value associated with this radio button.
  final T value;

  /// The currently selected value for the group.
  final T? groupValue;

  /// Called when the user selects this radio button.
  final ValueChanged<T?>? onChanged;

  /// When true, the radio button is rendered at half opacity and ignores taps.
  final bool disabled;

  /// Creates a [RefractionRadio].
  const RefractionRadio({
    super.key,
    required this.value,
    required this.groupValue,
    required this.onChanged,
    this.disabled = false,
  });

  @override
  State<RefractionRadio<T>> createState() => _RefractionRadioState<T>();
}

class _RefractionRadioState<T> extends State<RefractionRadio<T>> {
  bool _isHovered = false;

  bool get _isSelected => widget.value == widget.groupValue;

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    final borderColor = _isHovered && !widget.disabled
        ? colors.ring
        : colors.input;
    final backgroundColor = _isSelected ? colors.primary : Colors.transparent;
    final dotColor = colors.primaryForeground;

    return Semantics(
      checked: _isSelected,
      enabled: !widget.disabled,
      child: MouseRegion(
        onEnter: (_) => setState(() => _isHovered = true),
        onExit: (_) => setState(() => _isHovered = false),
        cursor: widget.disabled
            ? SystemMouseCursors.forbidden
            : SystemMouseCursors.click,
        child: GestureDetector(
          onTap: widget.disabled
              ? null
              : () {
                  if (widget.onChanged != null) {
                    widget.onChanged!(widget.value);
                  }
                },
          child: Opacity(
            opacity: widget.disabled ? 0.5 : 1.0,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              width: 16,
              height: 16,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: backgroundColor,
                border: Border.all(
                  color: _isSelected ? colors.primary : borderColor,
                ),
              ),
              child: _isSelected
                  ? Center(
                      child: Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: dotColor,
                        ),
                      ),
                    )
                  : null,
            ),
          ),
        ),
      ),
    );
  }
}
