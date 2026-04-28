import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// Visual tone for a [RefractionAlert] or [RefractionCallout].
///
/// Selects the color palette — background, foreground, border — applied to
/// the alert. See [RefractionAlert] for typical usage.
enum RefractionAlertVariant {
  /// Neutral informational tone using muted theme tokens.
  ///
  /// Best for general announcements that do not imply success or failure.
  standard,

  /// Indicates an error or destructive condition.
  ///
  /// Painted with [RefractionColors.destructive]. Use for failures, deletions,
  /// or other negative outcomes the user should not miss.
  destructive,

  /// Indicates a non-blocking warning the user should consider.
  ///
  /// Painted with an orange palette. Use for cautions, deprecations, or
  /// "are you sure?" notices that are not yet errors.
  warning,

  /// Indicates a successful operation.
  ///
  /// Painted with [RefractionColors.primary]. Use to confirm a completed
  /// action.
  success,
}

/// A prominent banner for surfacing status, warnings, or errors.
///
/// Displays an optional [icon], a required [title], an optional [description],
/// and an optional trailing [action] widget. The [variant] selects the color
/// palette; see [RefractionAlertVariant] for guidance.
///
/// Mirrors the shadcn-ui `Alert` component shipped in the React, Angular, and
/// Astro Refraction UI packages.
///
/// ```dart
/// RefractionAlert(
///   icon: Icon(Icons.error_outline),
///   title: 'Could not save changes',
///   description: 'Please check your network connection and retry.',
///   variant: RefractionAlertVariant.destructive,
/// )
/// ```
///
/// For a simpler, info-only banner with a default icon, see [RefractionCallout].
class RefractionAlert extends StatelessWidget {
  /// Optional leading icon, tinted to match [variant].
  final Widget? icon;

  /// Headline displayed in bold; the primary message.
  final String title;

  /// Optional secondary line of supporting text.
  final String? description;

  /// Color palette applied to the banner. Defaults to
  /// [RefractionAlertVariant.standard].
  final RefractionAlertVariant variant;

  /// Optional trailing widget — typically an action button such as
  /// `Retry` or `Dismiss`.
  final Widget? action;

  /// Creates a [RefractionAlert].
  ///
  /// [title] is required. All other slots are optional.
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

/// A simplified informational banner.
///
/// A thin convenience wrapper over [RefractionAlert] that supplies a default
/// `info_outline` icon and omits the trailing action slot. Use [RefractionAlert]
/// directly when you need an action button.
///
/// ```dart
/// RefractionCallout(
///   title: 'New feature',
///   description: 'You can now drag-and-drop files into the editor.',
/// )
/// ```
class RefractionCallout extends StatelessWidget {
  /// Optional leading icon. If null, an `Icons.info_outline` is used.
  final Widget? icon;

  /// Headline displayed in bold.
  final String title;

  /// Optional secondary line of supporting text.
  final String? description;

  /// Color palette applied to the callout. Defaults to
  /// [RefractionAlertVariant.standard].
  final RefractionAlertVariant variant;

  /// Creates a [RefractionCallout] with the given content.
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
