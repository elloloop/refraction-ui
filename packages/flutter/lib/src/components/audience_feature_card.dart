import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// RefractionAudienceFeatureCard — a marketing feature/audience card.
///
/// Accepts kicker, title, body, and an optional footer slot.
///
/// Mirrors the react-audience-feature-card / astro-audience-feature-card equivalents.
class RefractionAudienceFeatureCard extends StatelessWidget {
  /// Kicker text displayed above the title (e.g. "For teams").
  final Widget? kicker;

  /// Main title.
  final Widget title;

  /// Body copy.
  final Widget body;

  /// Footer slot.
  final Widget? footer;

  /// Creates a [RefractionAudienceFeatureCard].
  const RefractionAudienceFeatureCard({
    super.key,
    this.kicker,
    required this.title,
    required this.body,
    this.footer,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    return Semantics(
      container: true,
      label: 'Audience Feature Card',
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: colors.card,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: colors.border),
          boxShadow: theme.softShadow,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            if (kicker != null) ...[
              DefaultTextStyle(
                style: theme.textStyle.copyWith(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                  color: colors.primary,
                ),
                child: kicker!,
              ),
              const SizedBox(height: 8),
            ],
            DefaultTextStyle(
              style: theme.textStyle.copyWith(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: colors.foreground,
              ),
              child: title,
            ),
            const SizedBox(height: 4),
            DefaultTextStyle(
              style: theme.textStyle.copyWith(
                fontSize: 14,
                color: colors.mutedForeground,
                height: 1.5,
              ),
              child: body,
            ),
            if (footer != null) ...[
              const SizedBox(height: 16),
              DefaultTextStyle(
                style: theme.textStyle.copyWith(
                  fontSize: 12,
                  color: colors.mutedForeground,
                ),
                child: footer!,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
