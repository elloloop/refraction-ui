import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

enum RefractionAlertVariant {
  standard,
  destructive,
  warning,
  success,
}

class RefractionAlert extends StatelessWidget {
  final Widget? icon;
  final String title;
  final String? description;
  final RefractionAlertVariant variant;
  final Widget? action;

  const RefractionAlert({
    super.key,
    this.icon,
    required this.title,
    this.description,
    this.variant = RefractionAlertVariant.standard,
    this.action,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;

    Color backgroundColor;
    Color foregroundColor;
    Color borderColor;

    switch (variant) {
      case RefractionAlertVariant.destructive:
        backgroundColor = theme.colors.destructive.withValues(alpha: 0.1);
        foregroundColor = theme.colors.destructive;
        borderColor = theme.colors.destructive.withValues(alpha: 0.2);
        break;
      case RefractionAlertVariant.warning:
        backgroundColor = Colors.orange.withValues(alpha: 0.1);
        foregroundColor = Colors.orange;
        borderColor = Colors.orange.withValues(alpha: 0.2);
        break;
      case RefractionAlertVariant.success:
        backgroundColor = theme.colors.primary.withValues(alpha: 0.1);
        foregroundColor = theme.colors.primary;
        borderColor = theme.colors.primary.withValues(alpha: 0.2);
        break;
      case RefractionAlertVariant.standard:
        backgroundColor = theme.colors.muted;
        foregroundColor = theme.colors.foreground;
        borderColor = theme.colors.border;
        break;
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(theme.borderRadius),
        border: Border.all(color: borderColor),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (icon != null) ...[
            IconTheme(
              data: IconThemeData(color: foregroundColor, size: 20),
              child: icon!,
            ),
            const SizedBox(width: 12),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: theme.textStyle.copyWith(
                    color: foregroundColor,
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                    height: 1.4,
                  ),
                ),
                if (description != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    description!,
                    style: theme.textStyle.copyWith(
                      color: variant == RefractionAlertVariant.standard
                          ? theme.colors.mutedForeground
                          : foregroundColor.withValues(alpha: 0.8),
                      fontSize: 14,
                      height: 1.5,
                    ),
                  ),
                ],
              ],
            ),
          ),
          if (action != null) ...[
            const SizedBox(width: 12),
            action!,
          ],
        ],
      ),
    );
  }
}

class RefractionCallout extends StatelessWidget {
  final Widget? icon;
  final String title;
  final String? description;
  final RefractionAlertVariant variant;

  const RefractionCallout({
    super.key,
    this.icon,
    required this.title,
    this.description,
    this.variant = RefractionAlertVariant.standard,
  });

  @override
  Widget build(BuildContext context) {
    return RefractionAlert(
      icon: icon ?? const Icon(Icons.info_outline),
      title: title,
      description: description,
      variant: variant,
    );
  }
}
