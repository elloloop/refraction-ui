import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionStatusIndicator)
Widget defaultStatusIndicator(BuildContext context) {
  return const Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      RefractionStatusIndicator(type: RefractionStatusType.success),
      SizedBox(height: 8),
      RefractionStatusIndicator(type: RefractionStatusType.error),
      SizedBox(height: 8),
      RefractionStatusIndicator(type: RefractionStatusType.warning),
      SizedBox(height: 8),
      RefractionStatusIndicator(type: RefractionStatusType.info),
      SizedBox(height: 8),
      RefractionStatusIndicator(
        type: RefractionStatusType.pending,
        pulse: false,
      ),
      SizedBox(height: 8),
      RefractionStatusIndicator(type: RefractionStatusType.neutral),
    ],
  );
}

@widgetbook.UseCase(name: 'Custom Labels', type: RefractionStatusIndicator)
Widget customLabelStatusIndicator(BuildContext context) {
  return const Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      RefractionStatusIndicator(
        type: RefractionStatusType.success,
        label: 'All systems operational',
      ),
      SizedBox(height: 8),
      RefractionStatusIndicator(
        type: RefractionStatusType.error,
        label: 'Outage detected',
      ),
      SizedBox(height: 8),
      RefractionStatusIndicator(
        type: RefractionStatusType.neutral,
        showLabel: false,
      ),
    ],
  );
}
