import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionVersionSelector)
Widget defaultVersionSelector(BuildContext context) {
  return RefractionVersionSelector(
    versions: const [
      RefractionVersionOption(value: 'v1', label: 'v1.0.0'),
      RefractionVersionOption(value: 'v2', label: 'v2.0.0', isLatest: true),
    ],
    value: 'v1',
    onChanged: (val) {},
  );
}

@widgetbook.UseCase(name: 'Disabled', type: RefractionVersionSelector)
Widget disabledVersionSelector(BuildContext context) {
  return const RefractionVersionSelector(
    versions: [
      RefractionVersionOption(value: 'v1', label: 'v1.0.0'),
      RefractionVersionOption(value: 'v2', label: 'v2.0.0', isLatest: true),
    ],
    value: 'v2',
    disabled: true,
  );
}
