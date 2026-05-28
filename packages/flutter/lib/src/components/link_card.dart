import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A card that acts entirely as a clickable link.
///
/// Typically used to display external resources, documentation links,
/// or navigational shortcuts. It highlights on hover to indicate interactivity.
class RefractionLinkCard extends StatefulWidget {
  /// The main title of the card.
  final String title;

  /// An optional supplementary description displayed below the title.
  final String? description;

  /// An optional URL or text string displayed to indicate the destination.
  final String? url;

  /// An optional icon displayed next to the text.
  final Widget? icon;

  /// Called when the card is tapped. If null, the card is disabled.
  final VoidCallback? onTap;

  /// Creates a [RefractionLinkCard].
  const RefractionLinkCard({
    super.key,
    required this.title,
    this.description,
    this.url,
    this.icon,
    this.onTap,
  });

  @override
  State<RefractionLinkCard> createState() => _RefractionLinkCardState();
}

class _RefractionLinkCardState extends State<RefractionLinkCard> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    final isDisabled = widget.onTap == null;

    final backgroundColor = _isHovered && !isDisabled
        ? colors.accent
        : colors.card;
    final borderColor = colors.border;

    return Semantics(
      button: true,
      enabled: !isDisabled,
      child: MouseRegion(
        onEnter: (_) => setState(() => _isHovered = true),
        onExit: (_) => setState(() => _isHovered = false),
        cursor: isDisabled
            ? SystemMouseCursors.forbidden
            : SystemMouseCursors.click,
        child: GestureDetector(
          onTap: widget.onTap,
          behavior: HitTestBehavior.opaque,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            curve: Curves.easeInOut,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: backgroundColor,
              borderRadius: BorderRadius.circular(theme.borderRadius),
              border: Border.all(color: borderColor),
              boxShadow: theme.softShadow,
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (widget.icon != null) ...[
                  IconTheme(
                    data: IconThemeData(color: colors.foreground, size: 24),
                    child: widget.icon!,
                  ),
                  const SizedBox(width: 16),
                ],
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        widget.title,
                        style: theme.textStyle.copyWith(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: colors.foreground,
                          letterSpacing: -0.4,
                        ),
                      ),
                      if (widget.description != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          widget.description!,
                          style: theme.textStyle.copyWith(
                            fontSize: 14,
                            color: colors.mutedForeground,
                            height: 1.5,
                          ),
                        ),
                      ],
                      if (widget.url != null) ...[
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(
                              Icons.link,
                              size: 14,
                              color: colors.mutedForeground,
                            ),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                widget.url!,
                                style: theme.textStyle.copyWith(
                                  fontSize: 13,
                                  color: colors.mutedForeground,
                                  height: 1.5,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
