import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import '../theme/refraction_theme_data.dart';

/// A single reaction item used in a [RefractionReactionBar].
class RefractionReaction {
  /// Unique identifier for this reaction (e.g., 'thumbs_up', 'heart').
  final String id;

  /// The visual representation of the reaction, typically a [Text] with an emoji
  /// or an [Icon].
  final Widget icon;

  /// The number of times this reaction has been selected. Defaults to 0.
  final int count;

  /// Whether the current user has selected this reaction. Defaults to false.
  final bool isActive;

  /// Creates a [RefractionReaction].
  const RefractionReaction({
    required this.id,
    required this.icon,
    this.count = 0,
    this.isActive = false,
  });

  /// Creates a copy of this reaction with the given fields replaced.
  RefractionReaction copyWith({
    String? id,
    Widget? icon,
    int? count,
    bool? isActive,
  }) {
    return RefractionReaction(
      id: id ?? this.id,
      icon: icon ?? this.icon,
      count: count ?? this.count,
      isActive: isActive ?? this.isActive,
    );
  }
}

/// A row of emoji or icon reactions that can be tapped, showing selection state
/// and optionally counts.
class RefractionReactionBar extends StatelessWidget {
  /// The list of reactions to display.
  final List<RefractionReaction> reactions;

  /// Callback fired when a reaction is tapped. Provides the [RefractionReaction.id].
  final ValueChanged<String>? onReactionTapped;

  /// Whether to show the count next to each reaction. Defaults to true.
  final bool showCounts;

  /// The spacing between reaction items. Defaults to 8.0.
  final double spacing;

  /// Creates a [RefractionReactionBar].
  const RefractionReactionBar({
    super.key,
    required this.reactions,
    this.onReactionTapped,
    this.showCounts = true,
    this.spacing = 8.0,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;

    return Wrap(
      spacing: spacing,
      runSpacing: spacing,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: reactions.map((reaction) {
        return _ReactionButton(
          reaction: reaction,
          onTap: () => onReactionTapped?.call(reaction.id),
          showCount: showCounts,
          theme: theme,
        );
      }).toList(),
    );
  }
}

class _ReactionButton extends StatefulWidget {
  final RefractionReaction reaction;
  final VoidCallback onTap;
  final bool showCount;
  final RefractionThemeData theme;

  const _ReactionButton({
    required this.reaction,
    required this.onTap,
    required this.showCount,
    required this.theme,
  });

  @override
  State<_ReactionButton> createState() => _ReactionButtonState();
}

class _ReactionButtonState extends State<_ReactionButton> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final colors = widget.theme.colors;
    final isActive = widget.reaction.isActive;

    final bgColor = isActive
        ? colors.primary.withOpacity(0.1)
        : (_isHovered ? colors.accent : colors.background);
    final borderColor = isActive
        ? colors.primary.withOpacity(0.3)
        : (_isHovered ? colors.border : colors.border.withOpacity(0.5));
    final contentColor = isActive ? colors.primary : colors.mutedForeground;

    Widget content = Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        IconTheme(
          data: IconThemeData(color: contentColor, size: 16),
          child: DefaultTextStyle(
            style: TextStyle(color: contentColor, fontSize: 14),
            child: widget.reaction.icon,
          ),
        ),
        if (widget.showCount && widget.reaction.count > 0) ...[
          const SizedBox(width: 6),
          Text(
            widget.reaction.count.toString(),
            style: TextStyle(
              color: contentColor,
              fontSize: 13,
              fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
            ),
          ),
        ],
      ],
    );

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: widget.onTap,
        behavior: HitTestBehavior.opaque,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(widget.theme.borderRadius),
            border: Border.all(color: borderColor, width: 1),
          ),
          child: content,
        ),
      ),
    );
  }
}
