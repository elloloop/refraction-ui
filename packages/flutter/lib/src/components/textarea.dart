import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A multi-line text area for longer free-form input.
///
/// The border animates between [RefractionColors.input] and
/// [RefractionColors.ring] as focus changes; setting [disabled] dims the
/// field and renders it read-only.
///
/// Mirrors the shadcn-ui `Textarea` primitive shipped in the React and
/// Astro Refraction UI packages.
///
/// ```dart
/// RefractionTextarea(
///   placeholder: 'Type your message here.',
///   minLines: 3,
///   maxLines: null,
///   onChanged: (value) => setState(() => message = value),
/// )
/// ```
class RefractionTextarea extends StatefulWidget {
  /// Optional externally-managed controller. If null, an empty one is
  /// created for the lifetime of the widget.
  final TextEditingController? controller;

  /// Hint text shown when the field is empty.
  final String? placeholder;

  /// When true, the field is rendered with the muted palette and is
  /// read-only.
  final bool disabled;

  /// Called on every keystroke with the current text.
  final ValueChanged<String>? onChanged;

  /// Minimum number of lines. Default is 3.
  final int? minLines;

  /// Maximum number of lines. Default is null (allows infinite vertical expansion).
  final int? maxLines;

  /// Optional externally-managed focus node.
  final FocusNode? focusNode;

  /// Called when the user indicates that they are done editing the text in the field.
  final ValueChanged<String>? onSubmitted;

  /// Creates a [RefractionTextarea].
  const RefractionTextarea({
    super.key,
    this.controller,
    this.focusNode,
    this.placeholder,
    this.disabled = false,
    this.onChanged,
    this.onSubmitted,
    this.minLines = 3,
    this.maxLines,
  });

  @override
  State<RefractionTextarea> createState() => _RefractionTextareaState();
}

class _RefractionTextareaState extends State<RefractionTextarea> {
  late FocusNode _focusNode;
  late TextEditingController _controller;
  bool _isFocused = false;
  bool _internalFocusNode = false;
  bool _internalController = false;

  @override
  void initState() {
    super.initState();
    _focusNode = widget.focusNode ?? FocusNode();
    _internalFocusNode = widget.focusNode == null;
    _focusNode.addListener(_handleFocusChange);

    _controller = widget.controller ?? TextEditingController();
    _internalController = widget.controller == null;
    _controller.addListener(_handleTextChange);
  }

  void _handleFocusChange() {
    setState(() {
      _isFocused = _focusNode.hasFocus;
    });
  }

  void _handleTextChange() {
    setState(() {});
  }

  @override
  void didUpdateWidget(RefractionTextarea oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.focusNode != oldWidget.focusNode) {
      if (oldWidget.focusNode == null) {
        _focusNode.dispose();
      } else {
        oldWidget.focusNode!.removeListener(_handleFocusChange);
      }
      _focusNode = widget.focusNode ?? FocusNode();
      _internalFocusNode = widget.focusNode == null;
      _focusNode.addListener(_handleFocusChange);
      _isFocused = _focusNode.hasFocus;
    }

    if (widget.controller != oldWidget.controller) {
      if (oldWidget.controller == null) {
        _controller.dispose();
      } else {
        oldWidget.controller!.removeListener(_handleTextChange);
      }
      _controller = widget.controller ?? TextEditingController();
      _internalController = widget.controller == null;
      _controller.addListener(_handleTextChange);
    }
  }

  @override
  void dispose() {
    _focusNode.removeListener(_handleFocusChange);
    if (_internalFocusNode) {
      _focusNode.dispose();
    }
    _controller.removeListener(_handleTextChange);
    if (_internalController) {
      _controller.dispose();
    }
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
        child: TextSelectionTheme(
          data: TextSelectionThemeData(
            cursorColor: colors.primary,
            selectionColor: colors.primary.withValues(alpha: 0.2),
            selectionHandleColor: colors.primary,
          ),
          child: TextField(
            controller: _controller,
            focusNode: _focusNode,
            style: TextStyle(color: colors.foreground, fontSize: 14),
            cursorColor: colors.primary,
            readOnly: widget.disabled,
            onChanged: widget.onChanged,
            onSubmitted: widget.onSubmitted,
            minLines: widget.minLines,
            maxLines: widget.maxLines,
            keyboardType: TextInputType.multiline,
            decoration: InputDecoration.collapsed(
              hintText: widget.placeholder,
              hintStyle: TextStyle(color: colors.mutedForeground, fontSize: 14),
            ),
          ),
        ),
      ),
    );
  }
}
