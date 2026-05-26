import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// An action button displayed in the header of a [RefractionCodeEditor].
class RefractionCodeEditorAction {
  /// The text label for the action.
  final String label;

  /// The callback invoked when the action is tapped.
  final VoidCallback onClick;

  /// Creates a new action with the given [label] and [onClick] handler.
  const RefractionCodeEditorAction({
    required this.label,
    required this.onClick,
  });
}

const Map<String, String> _languageLabels = {
  'js': 'JavaScript',
  'javascript': 'JavaScript',
  'ts': 'TypeScript',
  'typescript': 'TypeScript',
  'jsx': 'JSX',
  'tsx': 'TSX',
  'py': 'Python',
  'python': 'Python',
  'rb': 'Ruby',
  'ruby': 'Ruby',
  'go': 'Go',
  'rust': 'Rust',
  'rs': 'Rust',
  'java': 'Java',
  'cpp': 'C++',
  'c': 'C',
  'cs': 'C#',
  'csharp': 'C#',
  'html': 'HTML',
  'css': 'CSS',
  'json': 'JSON',
  'yaml': 'YAML',
  'yml': 'YAML',
  'md': 'Markdown',
  'markdown': 'Markdown',
  'sql': 'SQL',
  'sh': 'Shell',
  'bash': 'Bash',
  'zsh': 'Zsh',
  'xml': 'XML',
  'toml': 'TOML',
  'swift': 'Swift',
  'kotlin': 'Kotlin',
  'dart': 'Dart',
  'php': 'PHP',
  'lua': 'Lua',
  'r': 'R',
  'scala': 'Scala',
};

String _getLanguageLabel(String lang) {
  final lowerLang = lang.toLowerCase();
  if (_languageLabels.containsKey(lowerLang)) {
    return _languageLabels[lowerLang]!;
  }
  if (lang.isEmpty) return '';
  return lang[0].toUpperCase() + lang.substring(1);
}

/// A headless-styled code editor container.
///
/// Wraps a plain text input with a monospace font and an optional header bar
/// that displays the current language and action buttons (e.g. for copying).
///
/// Mirrors the core `@refraction-ui/code-editor` component from the web.
class RefractionCodeEditor extends StatefulWidget {
  /// Optional externally-managed controller.
  final TextEditingController? controller;

  /// Hint text shown when the field is empty.
  final String? placeholder;

  /// The programming language identifier (e.g., 'ts', 'python', 'dart').
  final String language;

  /// When true, the field is read-only.
  final bool readOnly;

  /// Optional list of actions rendered in the top-right header area.
  final List<RefractionCodeEditorAction>? actions;

  /// Called on every keystroke with the current text.
  final ValueChanged<String>? onChanged;

  /// Creates a [RefractionCodeEditor].
  const RefractionCodeEditor({
    super.key,
    this.controller,
    this.placeholder,
    this.language = 'plaintext',
    this.readOnly = false,
    this.actions,
    this.onChanged,
  });

  @override
  State<RefractionCodeEditor> createState() => _RefractionCodeEditorState();
}

class _RefractionCodeEditorState extends State<RefractionCodeEditor> {
  late TextEditingController _internalController;
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    _internalController = widget.controller ?? TextEditingController();
  }

  @override
  void didUpdateWidget(RefractionCodeEditor oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.controller != null && widget.controller != _internalController) {
      if (oldWidget.controller == null) {
        _internalController.dispose();
      }
      _internalController = widget.controller!;
    }
  }

  @override
  void dispose() {
    _focusNode.dispose();
    if (widget.controller == null) {
      _internalController.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    final headerBgColor = colors.muted.withValues(alpha: 0.5);

    return Container(
      decoration: BoxDecoration(
        color: colors.background,
        borderRadius: BorderRadius.circular(theme.borderRadius),
        border: Border.all(color: colors.border, width: 1),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: headerBgColor,
              border: Border(
                bottom: BorderSide(color: colors.border, width: 1),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _getLanguageLabel(widget.language),
                  style: TextStyle(fontSize: 12, color: colors.mutedForeground),
                ),
                if (widget.actions != null && widget.actions!.isNotEmpty)
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: widget.actions!.map((action) {
                      return Padding(
                        padding: const EdgeInsets.only(left: 4.0),
                        child: InkWell(
                          onTap: action.onClick,
                          borderRadius: BorderRadius.circular(4),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8.0,
                              vertical: 4.0,
                            ),
                            child: Text(
                              action.label,
                              style: TextStyle(
                                fontSize: 12,
                                color: colors.mutedForeground,
                              ),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
              ],
            ),
          ),
          ConstrainedBox(
            constraints: const BoxConstraints(minHeight: 200),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: EditableText(
                controller: _internalController,
                focusNode: _focusNode,
                style: TextStyle(
                  color: colors.foreground,
                  fontSize: 14,
                  fontFamily: 'monospace',
                ),
                cursorColor: colors.primary,
                backgroundCursorColor: colors.muted,
                readOnly: widget.readOnly,
                onChanged: widget.onChanged,
                maxLines: null,
                keyboardType: TextInputType.multiline,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
