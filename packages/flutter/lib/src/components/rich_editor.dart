import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import 'button.dart';

/// A rich text editor that provides markdown-like formatting shortcuts.
///
/// RefractionRichEditor gives users a formatted text area to input and
/// style text. It displays a top toolbar with common rich-text formatting
/// options (bold, italic, strikethrough, code, links, lists).
///
/// Because it is a headless-inspired component built directly over
/// [TextField], it manages its own internal styling state using
/// RefractionUI's semantic palette, mapping visual choices to
/// [RefractionTheme.of(context)].
class RefractionRichEditor extends StatefulWidget {
  /// The optional text controller to use for the editor.
  /// If null, the editor creates its own.
  final TextEditingController? controller;

  /// Optional hint text shown when the editor is empty.
  final String? placeholder;

  /// Callback fired whenever the text changes.
  final ValueChanged<String>? onChanged;

  /// Minimum number of lines to display. Defaults to 3.
  final int? minLines;

  /// Maximum number of lines to display. Defaults to 10.
  final int? maxLines;

  /// Creates a [RefractionRichEditor].
  const RefractionRichEditor({
    super.key,
    this.controller,
    this.placeholder,
    this.onChanged,
    this.minLines = 3,
    this.maxLines = 10,
  });

  @override
  State<RefractionRichEditor> createState() => _RefractionRichEditorState();
}

class _RefractionRichEditorState extends State<RefractionRichEditor> {
  late TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = widget.controller ?? TextEditingController();
  }

  @override
  void didUpdateWidget(RefractionRichEditor oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.controller != oldWidget.controller) {
      if (oldWidget.controller == null) {
        // If the old widget passed a controller but the new one doesn't,
        // we take over its text if we can, or just start fresh.
        final text = _controller.text;
        _controller = TextEditingController(text: text);
      } else {
        // If it used to be null and now we got one, or it's a new controller entirely.
        if (oldWidget.controller == null) {
          _controller.dispose();
        }
        _controller = widget.controller!;
      }
    }
  }

  @override
  void dispose() {
    if (widget.controller == null) {
      _controller.dispose();
    }
    super.dispose();
  }

  /// Injects markdown formatting at the current selection.
  void _insertMarkdown(String prefix, [String suffix = '']) {
    final text = _controller.text;
    final selection = _controller.selection;

    if (!selection.isValid || selection.start < 0 || selection.end < 0) {
      // Just append at end
      _controller.text = text + prefix + suffix;
      _controller.selection = TextSelection.collapsed(
        offset: _controller.text.length,
      );
      if (widget.onChanged != null) widget.onChanged!(_controller.text);
      return;
    }

    final start = selection.start;
    final end = selection.end;

    final selectedText = text.substring(start, end);
    final newText = text.replaceRange(
      start,
      end,
      '$prefix$selectedText$suffix',
    );

    _controller.text = newText;

    // Position cursor appropriately.
    if (selectedText.isEmpty) {
      // Empty selection: put cursor between prefix and suffix
      _controller.selection = TextSelection.collapsed(
        offset: start + prefix.length,
      );
    } else {
      // Selected text: keep text selected along with markdown,
      // or collapse to end. We'll collapse to end here for simplicity.
      _controller.selection = TextSelection.collapsed(
        offset: start + prefix.length + selectedText.length + suffix.length,
      );
    }

    if (widget.onChanged != null) {
      widget.onChanged!(_controller.text);
    }
  }

  Widget _buildToolbarButton(
    IconData icon,
    String tooltip,
    VoidCallback onPressed,
    Color iconColor,
  ) {
    return Tooltip(
      message: tooltip,
      child: RefractionButton(
        variant: RefractionButtonVariant.ghost,
        size: RefractionButtonSize.icon,
        onPressed: onPressed,
        child: Icon(icon, size: 16, color: iconColor),
      ),
    );
  }

  Widget _buildDivider(Color color) {
    return Container(
      width: 1,
      height: 16,
      color: color,
      margin: const EdgeInsets.symmetric(horizontal: 4),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    return Container(
      decoration: BoxDecoration(
        color: colors.background,
        border: Border.all(color: colors.border),
        borderRadius: BorderRadius.circular(theme.borderRadius),
        boxShadow: theme.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Toolbar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: colors.border)),
              color: colors.muted.withValues(alpha: 0.3),
              borderRadius: BorderRadius.vertical(
                top: Radius.circular(theme.borderRadius),
              ),
            ),
            child: Wrap(
              crossAxisAlignment: WrapCrossAlignment.center,
              spacing: 2,
              children: [
                _buildToolbarButton(
                  Icons.format_bold,
                  'Bold',
                  () => _insertMarkdown('**', '**'),
                  colors.foreground,
                ),
                _buildToolbarButton(
                  Icons.format_italic,
                  'Italic',
                  () => _insertMarkdown('_', '_'),
                  colors.foreground,
                ),
                _buildToolbarButton(
                  Icons.strikethrough_s,
                  'Strikethrough',
                  () => _insertMarkdown('~~', '~~'),
                  colors.foreground,
                ),
                _buildDivider(colors.border),
                _buildToolbarButton(
                  Icons.code,
                  'Code',
                  () => _insertMarkdown('`', '`'),
                  colors.foreground,
                ),
                _buildToolbarButton(
                  Icons.link,
                  'Link',
                  () => _insertMarkdown('[', '](url)'),
                  colors.foreground,
                ),
                _buildDivider(colors.border),
                _buildToolbarButton(
                  Icons.format_list_bulleted,
                  'Bullet List',
                  () => _insertMarkdown('- '),
                  colors.foreground,
                ),
                _buildToolbarButton(
                  Icons.format_list_numbered,
                  'Numbered List',
                  () => _insertMarkdown('1. '),
                  colors.foreground,
                ),
                _buildToolbarButton(
                  Icons.format_quote,
                  'Quote',
                  () => _insertMarkdown('> '),
                  colors.foreground,
                ),
              ],
            ),
          ),
          // Editor Area
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: TextField(
              controller: _controller,
              onChanged: widget.onChanged,
              minLines: widget.minLines,
              maxLines: widget.maxLines,
              style: theme.textStyle,
              decoration: InputDecoration(
                hintText: widget.placeholder,
                hintStyle: theme.textStyle.copyWith(
                  color: colors.mutedForeground,
                ),
                border: InputBorder.none,
                isDense: true,
                contentPadding: EdgeInsets.zero,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
