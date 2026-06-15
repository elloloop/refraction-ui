import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A single tab entry in the editor tab bar.
class EditorTabData {
  /// Unique identifier for the tab.
  final String id;

  /// Display label (e.g. "solution.py").
  final String label;

  /// Optional icon (typically a Text widget with an emoji or an Icon).
  final Widget? icon;

  /// Whether the tab has unsaved changes (shows a dirty dot).
  final bool dirty;

  /// Whether the tab shows a close button.
  final bool closable;

  const EditorTabData({
    required this.id,
    required this.label,
    this.icon,
    this.dirty = false,
    this.closable = false,
  });
}

/// An IDE-style open-file tab bar.
class RefractionEditorTabs extends StatelessWidget {
  /// The list of tab entries to render.
  final List<EditorTabData> tabs;

  /// The id of the currently active tab.
  final String activeId;

  /// Called when the user clicks or navigates to a tab.
  final void Function(String id) onSelect;

  /// Called when the user clicks the close button on a tab.
  final void Function(String id)? onClose;

  const RefractionEditorTabs({
    super.key,
    required this.tabs,
    required this.activeId,
    required this.onSelect,
    this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    return Container(
      decoration: BoxDecoration(
        color: colors.muted.withValues(alpha: 0.4),
        border: Border(
          bottom: BorderSide(color: colors.border),
        ),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: tabs.map((tab) {
            final isActive = tab.id == activeId;

            return _EditorTabItem(
              tab: tab,
              isActive: isActive,
              onSelect: () => onSelect(tab.id),
              onClose: onClose != null ? () => onClose!(tab.id) : null,
            );
          }).toList(),
        ),
      ),
    );
  }
}

class _EditorTabItem extends StatefulWidget {
  final EditorTabData tab;
  final bool isActive;
  final VoidCallback onSelect;
  final VoidCallback? onClose;

  const _EditorTabItem({
    required this.tab,
    required this.isActive,
    required this.onSelect,
    this.onClose,
  });

  @override
  State<_EditorTabItem> createState() => _EditorTabItemState();
}

class _EditorTabItemState extends State<_EditorTabItem> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    final fontColor = widget.isActive ? colors.foreground : colors.mutedForeground;
    final bgColor = widget.isActive
        ? colors.background
        : (_isHovered ? colors.background.withValues(alpha: 0.6) : Colors.transparent);

    // active tab border: bottom is same as background, others are border color
    final border = Border(
      top: BorderSide(color: widget.isActive ? colors.border : Colors.transparent),
      left: BorderSide(color: widget.isActive ? colors.border : Colors.transparent),
      right: BorderSide(color: widget.isActive ? colors.border : Colors.transparent),
      bottom: BorderSide(
        color: widget.isActive ? colors.primary : Colors.transparent,
        width: 2.0,
      ),
    );

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: widget.onSelect,
        behavior: HitTestBehavior.opaque,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          decoration: BoxDecoration(
            color: bgColor,
            border: border,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (widget.tab.icon != null) ...[
                widget.tab.icon!,
                const SizedBox(width: 6),
              ],
              Text(
                widget.tab.label,
                style: theme.textStyle.copyWith(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: fontColor,
                ),
              ),
              if (widget.tab.dirty) ...[
                const SizedBox(width: 6),
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    color: Colors.amber,
                    shape: BoxShape.circle,
                  ),
                ),
              ],
              if (widget.tab.closable && widget.onClose != null) ...[
                const SizedBox(width: 6),
                // Close button only visible on hover or if active
                Opacity(
                  opacity: (widget.isActive || _isHovered) ? 1.0 : 0.0,
                  child: MouseRegion(
                    cursor: SystemMouseCursors.click,
                    child: GestureDetector(
                      onTap: () {
                        widget.onClose?.call();
                      },
                      child: Container(
                        padding: const EdgeInsets.all(2),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(theme.borderRadius),
                        ),
                        child: Text(
                          '×',
                          style: theme.textStyle.copyWith(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: colors.mutedForeground,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
