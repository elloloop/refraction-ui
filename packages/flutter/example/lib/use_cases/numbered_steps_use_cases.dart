import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/numbered_steps.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default', type: RefractionNumberedSteps)
Widget numberedStepsDefaultUseCase(BuildContext context) {
  return const RefractionNumberedSteps(
    items: [
      RefractionNumberedStepItem(
        title: Text('Sign Up'),
        body: Text('Create a free developer account in seconds.'),
      ),
      RefractionNumberedStepItem(
        title: Text('Install Package'),
        body: Text('Add the Refraction UI adapter to your dependencies.'),
      ),
      RefractionNumberedStepItem(
        title: Text('Build Interfaces'),
        body: Text('Compose theme-driven layouts that work everywhere.'),
      ),
    ],
  );
}
