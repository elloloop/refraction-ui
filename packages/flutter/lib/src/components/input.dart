import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A single-line (or, with [maxLines] > 1, multi-line) text input field.
///
/// The border animates between [RefractionColors.input] and
/// [RefractionColors.ring] as focus changes; setting [disabled] dims the
/// field and renders it read-only. Use [prefix] and [suffix] to embed icons
/// or affordances on either side of the text.
///
/// Mirrors the shadcn-ui `Input` primitive shipped in the React, Angular, and
/// Astro Refraction UI packages. For a multi-line text area with a sensible
/// default height see [RefractionTextarea].
///
/// ```dart
/// RefractionInput(
///   placeholder: 'Search...',
///   prefix: const Icon(Icons.search, size: 16),
///   onChanged: (value) => setState(() => query = value),
/// )
/// ```
class RefractionInput extends StatefulWidget {
  /// Optional externally-managed controller. If null, an empty one is
  /// created for the lifetime of the widget.
  final TextEditingController? controller;

  /// Hint text shown when the field is empty.
  final String? placeholder;

  /// When true, the entered text is masked (e.g. for passwords).
  final bool obscureText;

  /// When true, the field is rendered with the muted palette and is
  /// read-only.
  final bool disabled;

  /// Optional widget placed before the text — typically a small icon.
  final Widget? prefix;

  /// Optional widget placed after the text — typically a clear button or
  /// status indicator.
  final Widget? suffix;

  /// Called on every keystroke with the current text.
  final ValueChanged<String>? onChanged;

  /// Maximum number of lines. `1` (the default) creates a single-line
  /// field; higher values allow line wrapping.
  final int maxLines;

  /// Creates a [RefractionInput].
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

/// A multi-line text area for longer free-form input.
///
/// A thin convenience wrapper over [RefractionInput] with `maxLines` set to
/// `4`. Use [RefractionInput] directly when you need finer control over
/// line count or affordances.
///
/// ```dart
/// RefractionTextarea(
///   placeholder: 'Tell us what happened...',
///   onChanged: (value) => description = value,
/// )
/// ```
class RefractionTextarea extends StatelessWidget {
  /// Optional externally-managed controller.
  final TextEditingController? controller;

  /// Hint text shown when empty.
  final String? placeholder;

  /// When true, the field is read-only and rendered with the muted palette.
  final bool disabled;

  /// Called on every keystroke with the current text.
  final ValueChanged<String>? onChanged;

  /// Creates a [RefractionTextarea].
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
