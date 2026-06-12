import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionPasswordField)
Widget defaultPasswordField(BuildContext context) {
  return const SizedBox(
    width: 320,
    child: RefractionPasswordField(
      placeholder: 'Password',
      leadingIcon: Icon(Icons.lock_outline),
    ),
  );
}

@widgetbook.UseCase(name: 'Validation', type: RefractionPasswordField)
Widget validationPasswordField(BuildContext context) {
  return const SizedBox(
    width: 320,
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        RefractionInput(
          placeholder: 'Valid input',
          validationState: RefractionInputValidationState.valid,
        ),
        SizedBox(height: 12),
        RefractionInput(
          placeholder: 'Invalid input',
          leadingIcon: Icon(Icons.mail_outline),
          validationState: RefractionInputValidationState.invalid,
        ),
      ],
    ),
  );
}
