import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/marquee_strip.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default Static', type: RefractionMarqueeStrip)
Widget marqueeStripDefaultUseCase(BuildContext context) {
  return const RefractionMarqueeStrip(
    label: 'TRUSTED BY LEADING BRANDS',
    items: [
      'Acme Corp',
      'Globex',
      'Initech',
      'Umbrella Corp',
      'Hooli',
      'Vehement',
    ],
  );
}

@widgetbook.UseCase(name: 'Continuous Scroll', type: RefractionMarqueeStrip)
Widget marqueeStripScrollUseCase(BuildContext context) {
  return const RefractionMarqueeStrip(
    scroll: true,
    items: [
      'Fast deployments',
      'Zero downtime',
      'Secure connections',
      'Instant scaling',
      'Open source adapters',
    ],
  );
}
