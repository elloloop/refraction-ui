import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionSlider)
Widget defaultSlider(BuildContext context) {
  return const SizedBox(
    width: 300,
    child: RefractionSlider(value: 0.5, min: 0.0, max: 1.0),
  );
}

@widgetbook.UseCase(name: 'Custom Colors', type: RefractionSlider)
Widget customColorsSlider(BuildContext context) {
  return const SizedBox(
    width: 300,
    child: RefractionSlider(
      value: 0.7,
      min: 0.0,
      max: 1.0,
      activeColor: Colors.green,
      inactiveColor: Colors.red,
    ),
  );
}

@widgetbook.UseCase(name: 'Disabled', type: RefractionSlider)
Widget disabledSlider(BuildContext context) {
  return const SizedBox(
    width: 300,
    child: RefractionSlider(
      value: 0.3,
      min: 0.0,
      max: 1.0,
      // Leaving onChanged null disables it
    ),
  );
}
