import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionOtpInput)
Widget defaultOtpInput(BuildContext context) {
  return const RefractionOtpInput(length: 6);
}

@widgetbook.UseCase(name: 'Short', type: RefractionOtpInput)
Widget shortOtpInput(BuildContext context) {
  return const RefractionOtpInput(length: 4);
}
