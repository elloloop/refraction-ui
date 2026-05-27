import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A single heading item in the [RefractionTableOfContents].
class RefractionTocItem {
  /// Unique identifier for this heading.
  final String id;

  /// Display text for this heading.
  final String text;

  /// Heading level (e.g., 2 for h2, 3 for h3).
  /// Determines indentation in the table of contents.
  final int level;

  /// Creates a new TOC item.
  const RefractionTocItem({
    required this.id,
    required this.text,
    this.level = 2,
  });
}

/// A headless, styleable table of contents component.
///
/// Takes a list of [RefractionTocItem]s and renders them as a vertical
/// list of links. Indentation is based on heading level.
class RefractionTableOfContents extends StatelessWidget {
  /// The list of heading items to display.
  final List<RefractionTocItem> items;

  /// The currently active heading ID, if any.
  final String? activeId;

  /// Callback fired when an item is tapped.
  final ValueChanged<String>? onActiveIdChange;

  /// Creates a table of contents.
  const RefractionTableOfContents({
    super.key,
    required this.items,
    this.activeId,
    this.onActiveIdChange,
  });

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: items.map((item) {
        return _TocItemWidget(
          item: item,
          isActive: activeId == item.id,
          onTap: () {
            onActiveIdChange?.call(item.id);
          },
        );
      }).toList(),
    );
  }
}

class _TocItemWidget extends StatefulWidget {
  final RefractionTocItem item;
  final bool isActive;
  final VoidCallback onTap;

  const _TocItemWidget({
    required this.item,
    required this.isActive,
    required this.onTap,
  });

  @override
  State<_TocItemWidget> createState() => _TocItemWidgetState();
}

class _TocItemWidgetState extends State<_TocItemWidget> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    double leftPadding = 0;
    if (widget.item.level == 3) {
      leftPadding = 16.0;
    } else if (widget.item.level >= 4) {
      leftPadding = 32.0;
    }

    final isHighlighted = widget.isActive || _isHovered;
    final baseStyle = DefaultTextStyle.of(context).style;

    return Padding(
      padding: EdgeInsets.only(left: leftPadding, top: 4.0, bottom: 4.0),
      child: MouseRegion(
        cursor: SystemMouseCursors.click,
        onEnter: (_) => setState(() => _isHovered = true),
        onExit: (_) => setState(() => _isHovered = false),
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: widget.onTap,
          child: AnimatedDefaultTextStyle(
            duration: const Duration(milliseconds: 150),
            style: baseStyle.copyWith(
              fontSize: 14.0,
              fontWeight: widget.isActive ? FontWeight.w500 : FontWeight.normal,
              color: isHighlighted ? colors.foreground : colors.mutedForeground,
            ),
            child: Text(widget.item.text),
          ),
        ),
      ),
    );
  }
}
