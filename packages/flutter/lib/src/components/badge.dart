import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

enum RefractionBadgeVariant { primary, secondary, destructive, outline }

class RefractionBadge extends StatelessWidget {
  final Widget child;
  final RefractionBadgeVariant variant;

  const RefractionBadge({
    Key? key,
    required this.child,
    this.variant = RefractionBadgeVariant.primary,
  }) : super(key: key);

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
      default:
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
