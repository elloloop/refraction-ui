import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Custom keyboard action', type: RefractionFocusRing)
Widget customKeyboardFocus(BuildContext context) => RefractionFocusRing(
  onActivate: () {},
  child: const Padding(
    padding: EdgeInsets.all(12),
    child: Text('Tab to focus; Enter or Space to activate'),
  ),
);
