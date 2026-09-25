import 'package:flutter/material.dart';
import '../theme/motion.dart';
import '../theme/refraction_theme.dart';
import 'pressable.dart';

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

  /// Accessible name announced by screen readers and exposed to web
  /// automation. Set it when no adjacent text labels the control.
  final String? semanticLabel;

  /// Creates a [RefractionRadio].
  const RefractionRadio({
    super.key,
    required this.value,
    required this.groupValue,
    required this.onChanged,
    this.disabled = false,
    this.semanticLabel,
  });

  @override
  State<RefractionRadio<T>> createState() => _RefractionRadioState<T>();
}

class _RefractionRadioState<T> extends State<RefractionRadio<T>> {
  bool get _isSelected => widget.value == widget.groupValue;

  VoidCallback? get _onPressed => widget.disabled || widget.onChanged == null
      ? null
      : () => widget.onChanged!(widget.value);

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    return Semantics(
      checked: _isSelected,
      inMutuallyExclusiveGroup: true,
      enabled: !widget.disabled,
      label: widget.semanticLabel,
      onTap: _onPressed,
      child: RefractionPressable(
        onPressed: _onPressed,
        borderRadius: const BorderRadius.all(Radius.circular(8)),
        builder: (context, state) {
          final borderColor = state.hovered ? colors.ring : colors.input;
          return Opacity(
            opacity: widget.disabled ? 0.5 : 1.0,
            child: AnimatedContainer(
              duration: RefractionMotion.duration(
                context,
                theme.data.motionFast,
              ),
              width: 16,
              height: 16,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _isSelected ? colors.primary : Colors.transparent,
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
                          color: colors.primaryForeground,
                        ),
                      ),
                    )
                  : null,
            ),
          );
        },
      ),
    );
  }
}
