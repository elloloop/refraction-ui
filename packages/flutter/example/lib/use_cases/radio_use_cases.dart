import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionRadio)
Widget defaultRadio(BuildContext context) {
  return const Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          RefractionRadio<int>(value: 1, groupValue: 2, onChanged: null),
          SizedBox(width: 8),
          Text('Unselected'),
        ],
      ),
      SizedBox(height: 16),
      Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          RefractionRadio<int>(value: 1, groupValue: 1, onChanged: null),
          SizedBox(width: 8),
          Text('Selected'),
        ],
      ),
    ],
  );
}

@widgetbook.UseCase(name: 'Disabled', type: RefractionRadio)
Widget disabledRadio(BuildContext context) {
  return const Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          RefractionRadio<int>(
            value: 1,
            groupValue: 2,
            onChanged: null,
            disabled: true,
          ),
          SizedBox(width: 8),
          Text('Disabled Unselected'),
        ],
      ),
      SizedBox(height: 16),
      Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          RefractionRadio<int>(
            value: 1,
            groupValue: 1,
            onChanged: null,
            disabled: true,
          ),
          SizedBox(width: 8),
          Text('Disabled Selected'),
        ],
      ),
    ],
  );
}
