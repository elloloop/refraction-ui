import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Horizontal', type: RefractionSeparator)
Widget horizontalSeparator(BuildContext context) {
  return const SizedBox(
    width: 280,
    child: Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text('Above'),
        SizedBox(height: 12),
        RefractionSeparator(),
        SizedBox(height: 12),
        Text('Below'),
      ],
    ),
  );
}

@widgetbook.UseCase(name: 'Labeled', type: RefractionSeparator)
Widget labeledSeparator(BuildContext context) {
  return const SizedBox(
    width: 280,
    child: RefractionSeparator(label: Text('OR')),
  );
}

@widgetbook.UseCase(name: 'Vertical', type: RefractionSeparator)
Widget verticalSeparator(BuildContext context) {
  return const SizedBox(
    height: 40,
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text('Left'),
        SizedBox(width: 12),
        RefractionSeparator(
          orientation: RefractionSeparatorOrientation.vertical,
        ),
        SizedBox(width: 12),
        Text('Right'),
      ],
    ),
  );
}
