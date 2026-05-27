import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// Visual tone for a [RefractionCallout].
enum RefractionCalloutVariant {
  /// Default informational tone using muted theme tokens.
  standard,

  /// Indicates a successful operation.
  success,

  /// Indicates a non-blocking warning.
  warning,

  /// Indicates an error or destructive condition.
  error,

  /// Specific informational variant (often blue or brand color).
  info,
}

/// A stylized, prominent banner used for hints, warnings, or highlights.
///
/// Displays an optional [icon], an optional [title], and a required [description].
class RefractionCallout extends StatelessWidget {
  /// Optional leading icon, tinted to match [variant].
  /// If not provided, a default icon is used based on the variant.
  final Widget? icon;

  /// Optional headline displayed in bold.
  final String? title;

  /// The main content of the callout.
  final String description;

  /// Color palette applied to the callout. Defaults to
  /// [RefractionCalloutVariant.standard].
  final RefractionCalloutVariant variant;

  /// Creates a [RefractionCallout].
  const RefractionCallout({
    super.key,
    this.icon,
    this.title,
    required this.description,
    this.variant = RefractionCalloutVariant.standard,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;

    Color backgroundColor;
    Color foregroundColor;
    Color borderColor;
    IconData defaultIconData;

    switch (variant) {
      case RefractionCalloutVariant.error:
        backgroundColor = theme.colors.destructive.withValues(alpha: 0.1);
        foregroundColor = theme.colors.destructive;
        borderColor = theme.colors.destructive.withValues(alpha: 0.2);
        defaultIconData = Icons.error_outline;
        break;
      case RefractionCalloutVariant.warning:
        backgroundColor = Colors.orange.withValues(alpha: 0.1);
        foregroundColor = Colors.orange;
        borderColor = Colors.orange.withValues(alpha: 0.2);
        defaultIconData = Icons.warning_amber_rounded;
        break;
      case RefractionCalloutVariant.success:
        backgroundColor = Colors.green.withValues(alpha: 0.1);
        foregroundColor = Colors.green;
        borderColor = Colors.green.withValues(alpha: 0.2);
        defaultIconData = Icons.check_circle_outline;
        break;
      case RefractionCalloutVariant.info:
        backgroundColor = Colors.blue.withValues(alpha: 0.1);
        foregroundColor = Colors.blue;
        borderColor = Colors.blue.withValues(alpha: 0.2);
        defaultIconData = Icons.info_outline;
        break;
      case RefractionCalloutVariant.standard:
        backgroundColor = theme.colors.muted;
        foregroundColor = theme.colors.foreground;
        borderColor = theme.colors.border;
        defaultIconData = Icons.lightbulb_outline;
        break;
    }

    final effectiveIcon = icon ?? Icon(defaultIconData);

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
          IconTheme(
            data: IconThemeData(color: foregroundColor, size: 20),
            child: effectiveIcon,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (title != null) ...[
                  Text(
                    title!,
                    style: theme.textStyle.copyWith(
                      color: foregroundColor,
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 4),
                ],
                Text(
                  description,
                  style: theme.textStyle.copyWith(
                    color: variant == RefractionCalloutVariant.standard
                        ? theme.colors.mutedForeground
                        : foregroundColor.withValues(alpha: 0.8),
                    fontSize: 14,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
