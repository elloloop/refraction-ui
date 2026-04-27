import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

class RefractionSelect<T> extends StatefulWidget {
  final List<DropdownMenuItem<T>> items;
  final T? value;
  final ValueChanged<T?>? onChanged;
  final String? placeholder;
  final bool disabled;

  const RefractionSelect({
    super.key,
    required this.items,
    this.value,
    this.onChanged,
    this.placeholder,
    this.disabled = false,
  });

  @override
  State<RefractionSelect> createState() => _RefractionSelectState();
}

class _RefractionSelectState<T> extends State<RefractionSelect<T>> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    final backgroundColor = widget.disabled ? colors.muted : colors.background;
    final borderColor = _isHovered && !widget.disabled
        ? colors.ring
        : colors.input;

    return Semantics(
      button: true,
      enabled: !widget.disabled,
      child: MouseRegion(
        onEnter: (_) => setState(() => _isHovered = true),
        onExit: (_) => setState(() => _isHovered = false),
        child: Opacity(
          opacity: widget.disabled ? 0.5 : 1.0,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: backgroundColor,
              border: Border.all(color: borderColor),
              borderRadius: BorderRadius.circular(theme.borderRadius),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<T>(
                value: widget.value,
                hint: widget.placeholder != null
                    ? Text(
                        widget.placeholder!,
                        style: TextStyle(
                          color: colors.mutedForeground,
                          fontSize: 14,
                        ),
                      )
                    : null,
                items: widget.items,
                onChanged: widget.disabled ? null : widget.onChanged,
                icon: Icon(Icons.arrow_drop_down, color: colors.foreground),
                isExpanded: true,
                dropdownColor: colors.popover,
                style: TextStyle(color: colors.foreground, fontSize: 14),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
