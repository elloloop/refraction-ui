import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default', type: RefractionTooltip)
Widget defaultTooltip(BuildContext context) {
  return const Center(
    child: RefractionTooltip(
      message: Text('Add to library'),
      child: Icon(Icons.library_add),
    ),
  );
}

@widgetbook.UseCase(name: 'Rich Content', type: RefractionTooltip)
Widget richTooltip(BuildContext context) {
  return const Center(
    child: RefractionTooltip(
      message: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.info_outline, size: 14),
          SizedBox(width: 6),
          Text('Pro feature'),
        ],
      ),
      child: Text('Hover me'),
    ),
  );
}
