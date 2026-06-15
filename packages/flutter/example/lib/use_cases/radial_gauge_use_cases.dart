import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionRadialGauge)
Widget defaultRadialGauge(BuildContext context) {
  return const Center(
    child: RefractionRadialGauge(
      value: 65.0,
    ),
  );
}

@widgetbook.UseCase(name: 'Large with Sublabel', type: RefractionRadialGauge)
Widget largeRadialGauge(BuildContext context) {
  return const Center(
    child: RefractionRadialGauge(
      value: 85.0,
      size: RefractionRadialGaugeSize.lg,
      sublabel: Text('SCORE'),
    ),
  );
}

@widgetbook.UseCase(name: 'Colored Zones', type: RefractionRadialGauge)
Widget coloredZonesRadialGauge(BuildContext context) {
  return Center(
    child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const RefractionRadialGauge(
          value: 20.0,
          sublabel: Text('Danger'),
          zones: [
            RefractionGaugeZone(upTo: 30.0, tone: RefractionGaugeTone.danger),
            RefractionGaugeZone(upTo: 70.0, tone: RefractionGaugeTone.warning),
            RefractionGaugeZone(upTo: 100.0, tone: RefractionGaugeTone.success),
          ],
        ),
        const SizedBox(height: 20.0),
        const RefractionRadialGauge(
          value: 55.0,
          sublabel: Text('Warning'),
          zones: [
            RefractionGaugeZone(upTo: 30.0, tone: RefractionGaugeTone.danger),
            RefractionGaugeZone(upTo: 70.0, tone: RefractionGaugeTone.warning),
            RefractionGaugeZone(upTo: 100.0, tone: RefractionGaugeTone.success),
          ],
        ),
        const SizedBox(height: 20.0),
        const RefractionRadialGauge(
          value: 95.0,
          sublabel: Text('Success'),
          zones: [
            RefractionGaugeZone(upTo: 30.0, tone: RefractionGaugeTone.danger),
            RefractionGaugeZone(upTo: 70.0, tone: RefractionGaugeTone.warning),
            RefractionGaugeZone(upTo: 100.0, tone: RefractionGaugeTone.success),
          ],
        ),
      ],
    ),
  );
}
