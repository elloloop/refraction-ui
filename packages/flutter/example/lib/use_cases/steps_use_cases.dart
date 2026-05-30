import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Vertical', type: RefractionSteps)
Widget verticalSteps(BuildContext context) {
  return const Padding(
    padding: EdgeInsets.all(24.0),
    child: RefractionSteps(
      currentStep: 1,
      steps: [
        RefractionStepItem(
          title: Text('Personal Info'),
          description: Text('Enter your personal details.'),
        ),
        RefractionStepItem(
          title: Text('Account Settings'),
          description: Text('Configure your account preferences.'),
        ),
        RefractionStepItem(
          title: Text('Confirm'),
          description: Text('Review and submit your data.'),
        ),
      ],
    ),
  );
}

@widgetbook.UseCase(name: 'Horizontal', type: RefractionSteps)
Widget horizontalSteps(BuildContext context) {
  return const Padding(
    padding: EdgeInsets.all(24.0),
    child: RefractionSteps(
      orientation: Axis.horizontal,
      currentStep: 2,
      steps: [
        RefractionStepItem(title: Text('Cart')),
        RefractionStepItem(title: Text('Shipping')),
        RefractionStepItem(title: Text('Payment')),
      ],
    ),
  );
}
