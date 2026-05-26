import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import 'button.dart';

/// A headless-style inline editor component.
///
/// In its view mode, it displays the [value] as plain text and enters edit mode
/// when tapped. In edit mode, it provides a toolbar with basic Markdown formatting
/// actions, a text area, a preview pane, and buttons to save or cancel.
class RefractionInlineEditor extends StatefulWidget {
  /// The initial value of the editor.
  final String value;

  /// Called when the user saves their changes.
  final ValueChanged<String>? onSave;

  /// Called when the user cancels editing.
  final VoidCallback? onCancel;

  const RefractionInlineEditor({
    super.key,
    required this.value,
    this.onSave,
    this.onCancel,
  });

  @override
  State<RefractionInlineEditor> createState() => _RefractionInlineEditorState();
}

class _RefractionInlineEditorState extends State<RefractionInlineEditor> {
  bool _isEditing = false;
  late TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.value);
  }

  @override
  void didUpdateWidget(RefractionInlineEditor oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!_isEditing && oldWidget.value != widget.value) {
      _controller.text = widget.value;
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _startEditing() {
    setState(() {
      _isEditing = true;
      _controller.text = widget.value;
    });
  }

  void _cancelEditing() {
    setState(() {
      _isEditing = false;
      _controller.text = widget.value;
    });
    widget.onCancel?.call();
  }

  void _saveEditing() {
    setState(() {
      _isEditing = false;
    });
    widget.onSave?.call(_controller.text);
  }

  void _insertSyntax(String syntax) {
    final text = _controller.text;
    final selection = _controller.selection;

    if (selection.isValid && selection.start >= 0 && selection.end >= 0) {
      final newText = text.replaceRange(selection.start, selection.end, syntax);
      _controller.value = _controller.value.copyWith(
        text: newText,
        selection: TextSelection.collapsed(
          offset: selection.start + syntax.length,
        ),
      );
    } else {
      _controller.text = text + syntax;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    if (!_isEditing) {
      return Semantics(
        button: true,
        label: 'Click to edit',
        child: InkWell(
          onTap: _startEditing,
          borderRadius: BorderRadius.circular(theme.borderRadius),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.transparent),
              borderRadius: BorderRadius.circular(theme.borderRadius),
            ),
            child: Text(
              widget.value.isEmpty ? 'Click to edit...' : widget.value,
              style: theme.textStyle.copyWith(
                color: widget.value.isEmpty
                    ? colors.mutedForeground
                    : colors.foreground,
              ),
            ),
          ),
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: colors.border),
        borderRadius: BorderRadius.circular(theme.borderRadius),
        color: colors.background,
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
              color: colors.muted.withValues(alpha: 0.5),
            ),
            child: Wrap(
              spacing: 8,
              children: [
                _ToolbarButton(
                  label: 'bold',
                  syntax: '**',
                  onInsert: _insertSyntax,
                ),
                _ToolbarButton(
                  label: 'heading',
                  syntax: '# ',
                  onInsert: _insertSyntax,
                ),
                _ToolbarButton(
                  label: 'list',
                  syntax: '- ',
                  onInsert: _insertSyntax,
                ),
                _ToolbarButton(
                  label: 'link',
                  syntax: '[text](url)',
                  onInsert: _insertSyntax,
                ),
              ],
            ),
          ),

          // Editor Area
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        border: Border.all(color: colors.border),
                        borderRadius: BorderRadius.circular(theme.borderRadius),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      child: TextField(
                        controller: _controller,
                        maxLines: null,
                        minLines: 4,
                        decoration: const InputDecoration(
                          border: InputBorder.none,
                          isDense: true,
                          contentPadding: EdgeInsets.symmetric(vertical: 8),
                        ),
                        style: theme.textStyle.copyWith(
                          color: colors.foreground,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: colors.muted.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(theme.borderRadius),
                      ),
                      child: ValueListenableBuilder<TextEditingValue>(
                        valueListenable: _controller,
                        builder: (context, value, child) {
                          return Text(
                            value.text,
                            style: theme.textStyle.copyWith(
                              color: colors.foreground,
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Actions
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              border: Border(top: BorderSide(color: colors.border)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                RefractionButton(
                  variant: RefractionButtonVariant.outline,
                  size: RefractionButtonSize.sm,
                  onPressed: _cancelEditing,
                  child: const Text('Cancel'),
                ),
                const SizedBox(width: 8),
                RefractionButton(
                  variant: RefractionButtonVariant.primary,
                  size: RefractionButtonSize.sm,
                  onPressed: _saveEditing,
                  child: const Text('Save'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ToolbarButton extends StatelessWidget {
  final String label;
  final String syntax;
  final ValueChanged<String> onInsert;

  const _ToolbarButton({
    required this.label,
    required this.syntax,
    required this.onInsert,
  });

  @override
  Widget build(BuildContext context) {
    return RefractionButton(
      variant: RefractionButtonVariant.ghost,
      size: RefractionButtonSize.sm,
      onPressed: () => onInsert(syntax),
      child: Text(label),
    );
  }
}
