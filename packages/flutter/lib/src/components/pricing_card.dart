import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import 'button.dart';

/// Visual style of the CTA button in a [RefractionPricingCard].
enum RefractionPricingCtaVariant {
  /// Standard filled button, using the theme's primary colors.
  defaultVariant,

  /// Outlined button, using the theme's outline / input colors.
  outline,
}

/// RefractionPricingCard — a self-contained pricing plan card.
///
/// Renders an optional badge, the plan name, price + optional period, optional
/// description, a feature checklist, and a full-width CTA button.
///
/// Mirrors the react-pricing-card / astro-pricing-card equivalents.
class RefractionPricingCard extends StatelessWidget {
  /// Optional badge label shown above the plan name (e.g. "Most popular").
  final String? badge;

  /// Plan name (e.g. "Pro", "Starter").
  final String name;

  /// Price string (e.g. "$29", "Free").
  final String price;

  /// Billing period or qualifier (e.g. "/ month", "forever").
  final String? period;

  /// Short marketing description.
  final String? description;

  /// List of included features to render as a checklist.
  final List<String> features;

  /// CTA button label.
  final String cta;

  /// Visual variant for the CTA. Defaults to [RefractionPricingCtaVariant.defaultVariant].
  final RefractionPricingCtaVariant ctaVariant;

  /// Highlights the card with a primary border/ring.
  final bool featured;

  /// Click handler for the CTA button.
  final VoidCallback? onCtaPressed;

  /// Creates a [RefractionPricingCard].
  const RefractionPricingCard({
    super.key,
    this.badge,
    required this.name,
    required this.price,
    this.period,
    this.description,
    required this.features,
    required this.cta,
    this.ctaVariant = RefractionPricingCtaVariant.defaultVariant,
    this.featured = false,
    this.onCtaPressed,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    Widget? badgeWidget;
    if (badge != null) {
      badgeWidget = Align(
        alignment: Alignment.centerLeft,
        child: Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
          decoration: BoxDecoration(
            color: colors.primary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(100),
          ),
          child: Text(
            badge!,
            style: theme.textStyle.copyWith(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: colors.primary,
            ),
          ),
        ),
      );
    }

    final nameWidget = Text(
      name,
      style: theme.textStyle.copyWith(
        fontSize: 18,
        fontWeight: FontWeight.bold,
        color: colors.foreground,
      ),
    );

    final priceWidget = Row(
      crossAxisAlignment: CrossAxisAlignment.baseline,
      textBaseline: TextBaseline.alphabetic,
      children: [
        Text(
          price,
          style: theme.textStyle.copyWith(
            fontSize: 30,
            fontWeight: FontWeight.bold,
            color: colors.foreground,
          ),
        ),
        if (period != null) ...[
          const SizedBox(width: 4),
          Text(
            period!,
            style: theme.textStyle.copyWith(
              fontSize: 14,
              color: colors.mutedForeground,
            ),
          ),
        ],
      ],
    );

    Widget? descWidget;
    if (description != null) {
      descWidget = Padding(
        padding: const EdgeInsets.only(top: 8),
        child: Text(
          description!,
          style: theme.textStyle.copyWith(
            fontSize: 14,
            color: colors.mutedForeground,
          ),
        ),
      );
    }

    final featuresWidget = Padding(
      padding: const EdgeInsets.only(top: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: features.map((feature) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(
                  Icons.check_rounded,
                  size: 16,
                  color: colors.primary,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    feature,
                    style: theme.textStyle.copyWith(
                      fontSize: 14,
                      color: colors.foreground,
                    ),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );

    final ctaButton = SizedBox(
      width: double.infinity,
      child: RefractionButton(
        onPressed: onCtaPressed,
        variant: ctaVariant == RefractionPricingCtaVariant.defaultVariant
            ? RefractionButtonVariant.primary
            : RefractionButtonVariant.outline,
        child: Text(cta),
      ),
    );

    return Semantics(
      container: true,
      label: '$name Pricing Plan',
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: colors.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: featured ? colors.primary : colors.border,
            width: featured ? 2.0 : 1.0,
          ),
          boxShadow: theme.softShadow,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            if (badgeWidget != null) badgeWidget,
            nameWidget,
            const SizedBox(height: 16),
            priceWidget,
            if (descWidget != null) descWidget,
            featuresWidget,
            const SizedBox(height: 24),
            ctaButton,
          ],
        ),
      ),
    );
  }
}
