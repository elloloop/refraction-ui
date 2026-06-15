import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/pricing_card.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default', type: RefractionPricingCard)
Widget pricingCardDefaultUseCase(BuildContext context) {
  return RefractionPricingCard(
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for exploring and hobby projects.',
    features: const [
      '3 active projects',
      '128MB memory limit',
      'Basic analytics',
      'Community support',
    ],
    cta: 'Start for Free',
    onCtaPressed: () {},
  );
}

@widgetbook.UseCase(name: 'Featured Pro Plan', type: RefractionPricingCard)
Widget pricingCardFeaturedUseCase(BuildContext context) {
  return RefractionPricingCard(
    badge: 'Most Popular',
    name: 'Pro',
    price: '\$29',
    period: '/ month',
    description: 'For growing teams needing more scale.',
    features: const [
      'Unlimited projects',
      '2GB memory limit',
      'Advanced telemetry',
      '24/7 SLA support',
      'Custom domains',
    ],
    cta: 'Upgrade to Pro',
    featured: true,
    onCtaPressed: () {},
  );
}
