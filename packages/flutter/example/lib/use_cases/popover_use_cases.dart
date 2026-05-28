import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionPopover)
Widget defaultPopover(BuildContext context) {
  return RefractionPopover(
    trigger: RefractionButton(
      onPressed: () {},
      child: const Text('Open Popover'),
    ),
    content: const Padding(
      padding: EdgeInsets.all(16.0),
      child: Text('Popover Content'),
    ),
  );
}

@widgetbook.UseCase(name: 'With Offset', type: RefractionPopover)
Widget offsetPopover(BuildContext context) {
  return RefractionPopover(
    offset: const Offset(0, 20),
    trigger: RefractionButton(
      onPressed: () {},
      child: const Text('Open Popover with Offset'),
    ),
    content: const Padding(
      padding: EdgeInsets.all(16.0),
      child: Text('Popover Content'),
    ),
  );
}
