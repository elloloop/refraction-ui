import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A square checkbox styled with Refraction tokens.
///
/// Controlled by [value] and [onChanged]: when the user taps the checkbox,
/// [onChanged] is called with the toggled value (the opposite of [value]).
/// Pass `null` for [onChanged] (or set [disabled] to true) to render the
/// checkbox as non-interactive.
///
/// Mirrors the shadcn-ui `Checkbox` primitive shipped in the React, Angular,
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

  /// Creates a [RefractionCheckbox].
  const RefractionCheckbox({
    super.key,
    required this.value,
    this.onChanged,
    this.disabled = false,
  });

  @override
  State<RefractionCheckbox> createState() => _RefractionCheckboxState();
}

class _RefractionCheckboxState extends State<RefractionCheckbox> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    final borderColor = _isHovered && !widget.disabled
        ? colors.ring
        : colors.input;
    final backgroundColor = widget.value ? colors.primary : Colors.transparent;
    final checkColor = colors.primaryForeground;

    return Semantics(
      checked: widget.value,
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
                    widget.onChanged!(!widget.value);
                  }
                },
          child: Opacity(
            opacity: widget.disabled ? 0.5 : 1.0,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              width: 16,
              height: 16,
              decoration: BoxDecoration(
                color: backgroundColor,
                border: Border.all(
                  color: widget.value ? colors.primary : borderColor,
                ),
                borderRadius: BorderRadius.circular(4),
              ),
              child: widget.value
                  ? Icon(Icons.check, size: 14, color: checkColor)
                  : null,
            ),
          ),
        ),
      ),
    );
  }
}
