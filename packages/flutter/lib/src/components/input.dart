import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

class RefractionInput extends StatefulWidget {
  final TextEditingController? controller;
  final String? placeholder;
  final bool obscureText;
  final bool disabled;
  final Widget? prefix;
  final Widget? suffix;
  final ValueChanged<String>? onChanged;
  final int maxLines;

  const RefractionInput({
    super.key,
    this.controller,
    this.placeholder,
    this.obscureText = false,
    this.disabled = false,
    this.prefix,
    this.suffix,
    this.onChanged,
    this.maxLines = 1,
  });

  @override
  State<RefractionInput> createState() => _RefractionInputState();
}

class _RefractionInputState extends State<RefractionInput> {
  final FocusNode _focusNode = FocusNode();
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(() {
      setState(() {
        _isFocused = _focusNode.hasFocus;
      });
    });
  }

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    final borderColor = _isFocused ? colors.ring : colors.input;
    final backgroundColor = widget.disabled ? colors.muted : colors.background;

    return Opacity(
      opacity: widget.disabled ? 0.5 : 1.0,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        decoration: BoxDecoration(
          color: backgroundColor,
          borderRadius: BorderRadius.circular(theme.borderRadius),
          border: Border.all(color: borderColor, width: _isFocused ? 2 : 1),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Row(
          crossAxisAlignment: widget.maxLines > 1
              ? CrossAxisAlignment.start
              : CrossAxisAlignment.center,
          children: [
            if (widget.prefix != null) ...[
              widget.prefix!,
              const SizedBox(width: 8),
            ],
            Expanded(
              child: EditableText(
                controller: widget.controller ?? TextEditingController(),
                focusNode: _focusNode,
                style: TextStyle(color: colors.foreground, fontSize: 14),
                cursorColor: colors.primary,
                backgroundCursorColor: colors.muted,
                obscureText: widget.obscureText,
                readOnly: widget.disabled,
                onChanged: widget.onChanged,
                maxLines: widget.maxLines,
              ),
            ),
            if (widget.suffix != null) ...[
              const SizedBox(width: 8),
              widget.suffix!,
            ],
          ],
        ),
      ),
    );
  }
}

class RefractionTextarea extends StatelessWidget {
  final TextEditingController? controller;
  final String? placeholder;
  final bool disabled;
  final ValueChanged<String>? onChanged;

  const RefractionTextarea({
    super.key,
    this.controller,
    this.placeholder,
    this.disabled = false,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return RefractionInput(
      controller: controller,
      placeholder: placeholder,
      disabled: disabled,
      onChanged: onChanged,
      maxLines: 4,
    );
  }
}
