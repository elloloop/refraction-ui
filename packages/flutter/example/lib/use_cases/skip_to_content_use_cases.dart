import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionSkipToContent)
Widget defaultSkipToContent(BuildContext context) {
  final focusNode = FocusNode();
  return RefractionSkipToContent(targetNode: focusNode);
}

@widgetbook.UseCase(name: 'Custom Label', type: RefractionSkipToContent)
Widget customLabelSkipToContent(BuildContext context) {
  final focusNode = FocusNode();
  return RefractionSkipToContent(targetNode: focusNode, label: 'Skip to form');
}
