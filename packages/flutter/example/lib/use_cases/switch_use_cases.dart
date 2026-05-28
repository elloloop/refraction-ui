import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionSwitch)
Widget defaultSwitch(BuildContext context) {
  return const Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          RefractionSwitch(value: false),
          SizedBox(width: 8),
          Text('Off'),
        ],
      ),
      SizedBox(height: 16),
      Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          RefractionSwitch(value: true),
          SizedBox(width: 8),
          Text('On'),
        ],
      ),
    ],
  );
}

@widgetbook.UseCase(name: 'Disabled', type: RefractionSwitch)
Widget disabledSwitch(BuildContext context) {
  return const Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          RefractionSwitch(value: false, disabled: true),
          SizedBox(width: 8),
          Text('Disabled Off'),
        ],
      ),
      SizedBox(height: 16),
      Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          RefractionSwitch(value: true, disabled: true),
          SizedBox(width: 8),
          Text('Disabled On'),
        ],
      ),
    ],
  );
}
