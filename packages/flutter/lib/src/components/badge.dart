import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// Visual style for a [RefractionBadge].
enum RefractionBadgeVariant {
  /// High-emphasis badge using [RefractionColors.primary]. Use to highlight
  /// an active or featured state.
  primary,

  /// Lower-emphasis badge using [RefractionColors.secondary]. Use for
  /// neutral metadata such as tags.
  secondary,

  /// Indicates an error or destructive state, using
  /// [RefractionColors.destructive]. Use sparingly for failures or warnings.
  destructive,

  /// Transparent badge with a border, using [RefractionColors.foreground]
  /// for text and [RefractionColors.border] for the outline. Use when the
  /// surrounding surface is already colored.
  outline,
}

/// A small pill-shaped label used to highlight status, count, or category.
///
/// Wraps an arbitrary [child] (typically a [Text]) in a rounded container
/// styled by [variant]. Mirrors the shadcn-ui `Badge` primitive shipped in
/// the React, Angular, and Astro Refraction UI packages.
///
/// ```dart
/// RefractionBadge(
///   variant: RefractionBadgeVariant.secondary,
///   child: Text('New'),
/// )
/// ```
class RefractionBadge extends StatelessWidget {
  /// The widget displayed inside the badge — typically a short [Text].
  final Widget child;

  /// Color treatment applied to the badge. Defaults to
  /// [RefractionBadgeVariant.primary].
  final RefractionBadgeVariant variant;

  /// Creates a [RefractionBadge] containing [child].
  const RefractionBadge({
    super.key,
    required this.child,
    this.variant = RefractionBadgeVariant.primary,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    Color backgroundColor;
    Color foregroundColor;
    Color? borderColor;

    switch (variant) {
      case RefractionBadgeVariant.secondary:
        backgroundColor = colors.secondary;
        foregroundColor = colors.secondaryForeground;
        break;
      case RefractionBadgeVariant.destructive:
        backgroundColor = colors.destructive;
        foregroundColor = colors.destructiveForeground;
        break;
      case RefractionBadgeVariant.outline:
        backgroundColor = Colors.transparent;
        foregroundColor = colors.foreground;
        borderColor = colors.border;
        break;
      case RefractionBadgeVariant.primary:
        backgroundColor = colors.primary;
        foregroundColor = colors.primaryForeground;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(16),
        border: borderColor != null ? Border.all(color: borderColor) : null,
      ),
      child: DefaultTextStyle(
        style: TextStyle(
          color: foregroundColor,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
        child: child,
      ),
    );
  }
}
