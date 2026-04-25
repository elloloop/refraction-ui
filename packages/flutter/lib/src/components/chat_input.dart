import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/refraction_theme.dart';

class RefractionRichChatInput extends StatefulWidget {
  final TextEditingController? controller;
  final String placeholder;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final ValueChanged<String>? onSubmitted;
  final ValueChanged<String>? onChanged;
  final int minLines;
  final int maxLines;
  final bool disabled;

  const RefractionRichChatInput({
    Key? key,
    this.controller,
    this.placeholder = "Message...",
    this.prefixIcon,
    this.suffixIcon,
    this.onSubmitted,
    this.onChanged,
    this.minLines = 1,
    this.maxLines = 5,
    this.disabled = false,
  }) : super(key: key);

  @override
  _RefractionRichChatInputState createState() => _RefractionRichChatInputState();
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
