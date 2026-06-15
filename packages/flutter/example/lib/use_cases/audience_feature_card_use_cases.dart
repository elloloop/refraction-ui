import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/audience_feature_card.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default', type: RefractionAudienceFeatureCard)
Widget audienceFeatureCardDefaultUseCase(BuildContext context) {
  return const RefractionAudienceFeatureCard(
    kicker: Text('For Teams'),
    title: Text('Collaborative Dashboards'),
    body: Text('Manage team permissions, invite new members, and review audit logs from one unified dashboard.'),
    footer: Text('Learn more about teams →'),
  );
}

@widgetbook.UseCase(name: 'Without Kicker', type: RefractionAudienceFeatureCard)
Widget audienceFeatureCardNoKickerUseCase(BuildContext context) {
  return const RefractionAudienceFeatureCard(
    title: Text('Instant Deployments'),
    body: Text('Deploy code modifications seamlessly with integrated continuous integration hooks.'),
  );
}
