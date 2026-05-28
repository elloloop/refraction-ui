import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default', type: RefractionTextarea)
Widget defaultTextarea(BuildContext context) {
  return const Padding(
    padding: EdgeInsets.all(16.0),
    child: RefractionTextarea(placeholder: 'Type your message here.'),
  );
}

@widgetbook.UseCase(name: 'With Text', type: RefractionTextarea)
Widget withTextTextarea(BuildContext context) {
  final controller = TextEditingController(
    text:
        'This is a multi-line text area.\nIt supports multiple lines of text.',
  );
  return Padding(
    padding: const EdgeInsets.all(16.0),
    child: RefractionTextarea(controller: controller),
  );
}

@widgetbook.UseCase(name: 'Disabled', type: RefractionTextarea)
Widget disabledTextarea(BuildContext context) {
  return const Padding(
    padding: EdgeInsets.all(16.0),
    child: RefractionTextarea(
      placeholder: 'This field is disabled...',
      disabled: true,
    ),
  );
}

@widgetbook.UseCase(name: 'Custom Min/Max Lines', type: RefractionTextarea)
Widget customLinesTextarea(BuildContext context) {
  return const Padding(
    padding: EdgeInsets.all(16.0),
    child: RefractionTextarea(
      placeholder: 'Min 5 lines, Max 10 lines...',
      minLines: 5,
      maxLines: 10,
    ),
  );
}
