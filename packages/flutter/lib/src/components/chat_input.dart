import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/refraction_theme.dart';

/// A multi-line text input tailored for chat composition.
///
/// Pressing `Enter` submits the message via [onSubmitted] and clears the
/// field; `Shift+Enter` inserts a newline. The field grows from [minLines] up
/// to [maxLines] before scrolling. Optional [prefixIcon] and [suffixIcon]
/// slots host attachment buttons, send buttons, etc.
///
/// The controller may be provided externally; if omitted, an internal
/// controller is created and disposed automatically.
///
/// ```dart
/// RefractionRichChatInput(
///   placeholder: 'Send a message...',
///   onSubmitted: (text) => sendMessage(text),
///   suffixIcon: const Icon(Icons.send),
/// )
/// ```
class RefractionRichChatInput extends StatefulWidget {
  /// Optional externally-managed controller. If null, an internal one is
  /// created and disposed with the widget.
  final TextEditingController? controller;

  /// Hint text shown when the field is empty. Defaults to `'Message...'`.
  final String placeholder;

  /// Optional widget rendered to the left of the text field.
  final Widget? prefixIcon;

  /// Optional widget rendered to the right of the text field, typically a
  /// send button.
  final Widget? suffixIcon;

  /// Called with the trimmed text content when the user presses `Enter`.
  ///
  /// The field is cleared after a successful submission. Empty (whitespace
  /// only) submissions are ignored.
  final ValueChanged<String>? onSubmitted;

  /// Called on every keystroke with the current text content.
  final ValueChanged<String>? onChanged;

  /// Minimum number of lines the field renders at. Defaults to `1`.
  final int minLines;

  /// Maximum number of lines before the field starts scrolling internally.
  /// Defaults to `5`.
  final int maxLines;

  /// When true, the field is read-only and rendered with the muted palette.
  final bool disabled;

  /// Creates a [RefractionRichChatInput].
  const RefractionRichChatInput({
    super.key,
    this.controller,
    this.placeholder = "Message...",
    this.prefixIcon,
    this.suffixIcon,
    this.onSubmitted,
    this.onChanged,
    this.minLines = 1,
    this.maxLines = 5,
    this.disabled = false,
  });

  @override
  State<RefractionRichChatInput> createState() => _RefractionRichChatInputState();
}

class _RefractionRichChatInputState extends State<RefractionRichChatInput> {
  late TextEditingController _controller;
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    _controller = widget.controller ?? TextEditingController();
    _controller.addListener(_handleTextChange);
  }

  @override
  void didUpdateWidget(RefractionRichChatInput oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.controller != null && widget.controller != _controller) {
      _controller.removeListener(_handleTextChange);
      _controller = widget.controller!;
      _controller.addListener(_handleTextChange);
    }
  }

  @override
  void dispose() {
    if (widget.controller == null) {
      _controller.dispose();
    } else {
      _controller.removeListener(_handleTextChange);
    }
    _focusNode.dispose();
    super.dispose();
  }

  void _handleTextChange() {
    if (widget.onChanged != null) {
      widget.onChanged!(_controller.text);
    }
    setState(() {}); // Rebuild for suffix icon state (e.g., enable/disable submit button based on text)
  }

  void _submit() {
    if (_controller.text.trim().isNotEmpty && widget.onSubmitted != null) {
      widget.onSubmitted!(_controller.text);
      _controller.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    return Focus(
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent && event.logicalKey == LogicalKeyboardKey.enter) {
          if (!HardwareKeyboard.instance.isShiftPressed) {
            _submit();
            return KeyEventResult.handled;
          }
        }
        return KeyEventResult.ignored;
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOutCubic,
        decoration: BoxDecoration(
          color: widget.disabled ? colors.muted : colors.background,
          border: Border.all(color: colors.border),
          borderRadius: BorderRadius.circular(theme.borderRadius),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 4,
              offset: const Offset(0, 2),
            )
          ],
        ),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            if (widget.prefixIcon != null) ...[
              Padding(
                padding: const EdgeInsets.only(bottom: 4, right: 8),
                child: widget.prefixIcon!,
              ),
            ],
            Expanded(
              child: TextField(
                controller: _controller,
                focusNode: _focusNode,
                minLines: widget.minLines,
                maxLines: widget.maxLines,
                enabled: !widget.disabled,
                textInputAction: TextInputAction.newline,
                style: theme.textStyle.copyWith(
                  fontSize: 15,
                  color: widget.disabled ? colors.mutedForeground : colors.foreground,
                ),
                decoration: InputDecoration(
                  hintText: widget.placeholder,
                  hintStyle: theme.textStyle.copyWith(
                    color: colors.mutedForeground,
                  ),
                  isDense: true,
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(vertical: 8),
                ),
              ),
            ),
            if (widget.suffixIcon != null) ...[
              Padding(
                padding: const EdgeInsets.only(bottom: 4, left: 8),
                child: widget.suffixIcon!,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
