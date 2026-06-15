import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// RefractionBrandNetworkCell — a card for surfacing related products in a brand network.
///
/// Renders a glyph monogram (brand tint via background/foreground colors), the product domain,
/// a "You are here" badge when [current] is true, body copy, and an optional visit link.
///
/// Mirrors the react-brand-network-cell / astro-brand-network-cell equivalents.
class RefractionBrandNetworkCell extends StatelessWidget {
  /// Single character or short string used as the brand monogram.
  final String glyph;

  /// Brand tint color for the glyph box background.
  final Color? glyphBg;

  /// Color for the glyph text.
  final Color? glyphColor;

  /// Primary identifier shown below the glyph (product domain or name).
  final String domain;

  /// Supporting description text.
  final String body;

  /// Marks this cell as the current/active product in the network.
  final bool current;

  /// Label for the link. Defaults to "Visit →".
  final String? linkLabel;

  /// Click handler for the card/link.
  final VoidCallback? onTap;

  /// Creates a [RefractionBrandNetworkCell].
  const RefractionBrandNetworkCell({
    super.key,
    required this.glyph,
    this.glyphBg,
    this.glyphColor,
    required this.domain,
    required this.body,
    this.current = false,
    this.linkLabel,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    final glyphWidget = Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: glyphBg ?? colors.primary,
        borderRadius: BorderRadius.circular(8),
      ),
      alignment: Alignment.center,
      child: Text(
        glyph,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.bold,
          color: glyphColor ?? colors.primaryForeground,
        ),
      ),
    );

    Widget? currentBadge;
    if (current) {
      currentBadge = Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(
          color: colors.primary.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          'You are here',
          style: theme.textStyle.copyWith(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: colors.primary,
          ),
        ),
      );
    }

    final domainRow = Row(
      children: [
        Text(
          domain,
          style: theme.textStyle.copyWith(
            fontWeight: FontWeight.bold,
            color: colors.foreground,
          ),
        ),
        if (currentBadge != null) ...[
          const SizedBox(width: 8),
          currentBadge,
        ],
      ],
    );

    final bodyWidget = Text(
      body,
      style: theme.textStyle.copyWith(
        fontSize: 14,
        color: colors.mutedForeground,
      ),
    );

    Widget? linkWidget;
    if (onTap != null) {
      linkWidget = Text(
        linkLabel ?? 'Visit →',
        style: theme.textStyle.copyWith(
          fontSize: 14,
          color: colors.primary,
          fontWeight: FontWeight.w500,
        ),
      );
    }

    Widget content = Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: current ? colors.primary : colors.border,
          width: current ? 1.5 : 1.0,
        ),
        boxShadow: theme.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          glyphWidget,
          const SizedBox(height: 12),
          domainRow,
          const SizedBox(height: 8),
          bodyWidget,
          if (linkWidget != null) ...[
            const SizedBox(height: 12),
            linkWidget,
          ],
        ],
      ),
    );

    if (onTap != null) {
      content = GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: MouseRegion(
          cursor: SystemMouseCursors.click,
          child: content,
        ),
      );
    }

    return Semantics(
      container: true,
      label: '$domain Brand Cell',
      child: content,
    );
  }
}
