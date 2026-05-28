import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default Bars', type: RefractionWaveform)
Widget defaultWaveform(BuildContext context) {
  return const RefractionWaveform(
    samples: [0.1, 0.5, 0.9, 0.3, 0.6, -0.2, -0.8, -0.4],
    variant: WaveformVariant.bars,
    height: 80,
  );
}

@widgetbook.UseCase(name: 'Line Variant', type: RefractionWaveform)
Widget lineWaveform(BuildContext context) {
  return const RefractionWaveform(
    samples: [0.1, 0.5, 0.9, 0.3, 0.6, -0.2, -0.8, -0.4],
    variant: WaveformVariant.line,
    height: 80,
  );
}

@widgetbook.UseCase(name: 'Rings Variant', type: RefractionWaveform)
Widget ringsWaveform(BuildContext context) {
  return const RefractionWaveform(
    samples: [0.1, 0.5, 0.9, 0.3, 0.6, -0.2, -0.8, -0.4],
    variant: WaveformVariant.rings,
    height: 80,
  );
}
