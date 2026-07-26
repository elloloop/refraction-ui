import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Horizontal', type: RefractionInputGroup)
Widget horizontalInputGroup(BuildContext context) {
  return const SizedBox(
    width: 360,
    child: RefractionInputGroup(
      children: [
        RefractionInputGroupAddon(child: Text('\$')),
        RefractionInput(placeholder: '0.00'),
      ],
    ),
  );
}

@widgetbook.UseCase(name: 'Vertical', type: RefractionInputGroup)
Widget verticalInputGroup(BuildContext context) {
  return const SizedBox(
    width: 360,
    child: RefractionInputGroup(
      orientation: RefractionInputGroupOrientation.vertical,
      children: [
        RefractionInput(placeholder: 'First name'),
        RefractionInput(placeholder: 'Last name'),
      ],
    ),
  );
}
