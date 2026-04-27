import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

class RefractionCheckbox extends StatefulWidget {
  final bool value;
  final ValueChanged<bool?>? onChanged;
  final bool disabled;

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
