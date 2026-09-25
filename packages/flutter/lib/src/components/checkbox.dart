import 'package:flutter/material.dart';
import '../theme/motion.dart';
import '../theme/refraction_theme.dart';
import 'pressable.dart';

/// A square checkbox styled with Refraction tokens.
///
/// Controlled by [value] and [onChanged]: when the user taps the checkbox,
/// [onChanged] is called with the toggled value (the opposite of [value]).
/// Pass `null` for [onChanged] (or set [disabled] to true) to render the
/// checkbox as non-interactive.
///
/// Mirrors the shadcn-ui `Checkbox` primitive shipped in the React
/// and Astro Refraction UI packages.
///
/// ```dart
/// bool agreed = false;
///
/// StatefulBuilder(
///   builder: (context, setState) => RefractionCheckbox(
///     value: agreed,
///     onChanged: (v) => setState(() => agreed = v ?? false),
///   ),
/// )
/// ```
class RefractionCheckbox extends StatefulWidget {
  /// Current checked state.
  final bool value;

  /// Called when the user toggles the checkbox.
  ///
  /// The argument is the new desired value (`!value`). It is typed as
  /// `bool?` for compatibility with tri-state callbacks but never null in
  /// practice.
  final ValueChanged<bool?>? onChanged;

  /// When true, the checkbox is rendered at half opacity and ignores taps.
  final bool disabled;

  /// Accessible name announced by screen readers and exposed to web
  /// automation. Set it when no adjacent text labels the control.
  final String? semanticLabel;

  /// Creates a [RefractionCheckbox].
  const RefractionCheckbox({
    super.key,
    required this.value,
    this.onChanged,
    this.disabled = false,
    this.semanticLabel,
  });

  @override
  State<RefractionCheckbox> createState() => _RefractionCheckboxState();
}

class _RefractionCheckboxState extends State<RefractionCheckbox> {
  VoidCallback? get _onPressed => widget.disabled || widget.onChanged == null
      ? null
      : () => widget.onChanged!(!widget.value);

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;
    const radius = BorderRadius.all(Radius.circular(4));

    return Semantics(
      checked: widget.value,
      enabled: !widget.disabled,
      label: widget.semanticLabel,
      onTap: _onPressed,
      child: RefractionPressable(
        onPressed: _onPressed,
        borderRadius: radius,
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
                color: widget.value ? colors.primary : Colors.transparent,
                border: Border.all(
                  color: widget.value ? colors.primary : borderColor,
                ),
                borderRadius: radius,
              ),
              child: widget.value
                  ? Icon(Icons.check, size: 14, color: colors.primaryForeground)
                  : null,
            ),
          );
        },
      ),
    );
  }
}
