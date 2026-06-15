import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/section_head.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default', type: RefractionSectionHead)
Widget sectionHeadDefaultUseCase(BuildContext context) {
  return const RefractionSectionHead(
    kicker: Text('Features'),
    title: Text('Designed for builders'),
    lede: Text('A headless, token-driven UI component library shipped across multiple frameworks.'),
  );
}

@widgetbook.UseCase(name: 'Left Aligned', type: RefractionSectionHead)
Widget sectionHeadLeftAlignedUseCase(BuildContext context) {
  return const RefractionSectionHead(
    align: RefractionSectionHeadAlign.left,
    kicker: Text('Documentation'),
    title: Text('Getting Started Guide'),
    lede: Text('Wrap your app in a RefractionTheme near the root and pass a RefractionThemeData.'),
  );
}

@widgetbook.UseCase(name: 'Title Only', type: RefractionSectionHead)
Widget sectionHeadTitleOnlyUseCase(BuildContext context) {
  return const RefractionSectionHead(
    title: Text('Frequently Asked Questions'),
  );
}
