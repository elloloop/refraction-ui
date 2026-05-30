import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Linear (Default)', type: RefractionProgressDisplay)
Widget linearDefault(BuildContext context) {
  return const SizedBox(
    width: 300,
    child: RefractionProgressDisplay(value: 0.6, label: 'Uploading...'),
  );
}

@widgetbook.UseCase(name: 'Linear (No Label)', type: RefractionProgressDisplay)
Widget linearNoLabel(BuildContext context) {
  return const SizedBox(
    width: 300,
    child: RefractionProgressDisplay(value: 0.8),
  );
}

@widgetbook.UseCase(name: 'Circular', type: RefractionProgressDisplay)
Widget circular(BuildContext context) {
  return const RefractionProgressDisplay(
    value: 0.45,
    type: ProgressDisplayType.circular,
    label: 'Processing',
  );
}

@widgetbook.UseCase(
  name: 'Circular (No Label)',
  type: RefractionProgressDisplay,
)
Widget circularNoLabel(BuildContext context) {
  return const RefractionProgressDisplay(
    value: 0.75,
    type: ProgressDisplayType.circular,
  );
}

@widgetbook.UseCase(name: 'Custom Color', type: RefractionProgressDisplay)
Widget customColor(BuildContext context) {
  return const SizedBox(
    width: 300,
    child: RefractionProgressDisplay(
      value: 1.0,
      label: 'Completed',
      color: Colors.green,
    ),
  );
}
