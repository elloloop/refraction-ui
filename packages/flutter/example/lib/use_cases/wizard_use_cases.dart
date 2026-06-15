import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default (Vertical)', type: RefractionWizard)
Widget defaultWizard(BuildContext context) {
  return const _WizardDemo(
    orientation: RefractionWizardOrientation.vertical,
  );
}

@widgetbook.UseCase(name: 'Horizontal', type: RefractionWizard)
Widget horizontalWizard(BuildContext context) {
  return const _WizardDemo(
    orientation: RefractionWizardOrientation.horizontal,
  );
}

class _WizardDemo extends StatefulWidget {
  final RefractionWizardOrientation orientation;

  const _WizardDemo({
    required this.orientation,
  });

  @override
  State<_WizardDemo> createState() => _WizardDemoState();
}

class _WizardDemoState extends State<_WizardDemo> {
  int _step = 0;

  final List<RefractionWizardStep> _steps = const [
    RefractionWizardStep(id: 'account', label: 'Create Account'),
    RefractionWizardStep(id: 'profile', label: 'Profile Settings', optional: true),
    RefractionWizardStep(id: 'billing', label: 'Billing Details'),
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: RefractionWizard(
        steps: _steps,
        step: _step,
        orientation: widget.orientation,
        onStepChange: (index) {
          setState(() {
            _step = index;
          });
        },
        onComplete: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Wizard Completed!')),
          );
        },
        builder: (context, index) {
          switch (index) {
            case 0:
              return const Text('Step 1: Enter email and password');
            case 1:
              return const Text('Step 2 (Optional): Add photo and bio');
            case 2:
              return const Text('Step 3: Enter credit card details');
            default:
              return const SizedBox.shrink();
          }
        },
      ),
    );
  }
}
