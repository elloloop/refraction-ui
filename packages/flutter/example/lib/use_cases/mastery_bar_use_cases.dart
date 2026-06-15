import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/mastery_bar.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default', type: RefractionMasteryBar)
Widget masteryBarDefaultUseCase(BuildContext context) {
  return const RefractionMasteryBar(
    value: 75.0,
    leadingLabel: 'Flutter',
    label: 'Advanced',
  );
}

@widgetbook.UseCase(name: 'Muted Large', type: RefractionMasteryBar)
Widget masteryBarMutedLargeUseCase(BuildContext context) {
  return const RefractionMasteryBar(
    value: 40.0,
    leadingLabel: 'React',
    label: 'Intermediate',
    size: RefractionMasteryBarSize.lg,
    muted: true,
  );
}
