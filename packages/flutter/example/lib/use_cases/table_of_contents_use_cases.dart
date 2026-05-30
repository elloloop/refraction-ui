import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default', type: RefractionTableOfContents)
Widget defaultTableOfContents(BuildContext context) {
  return const RefractionTableOfContents(
    items: [
      RefractionTocItem(id: 'intro', text: 'Introduction'),
      RefractionTocItem(id: 'usage', text: 'Usage'),
      RefractionTocItem(id: 'api', text: 'API Reference', level: 3),
      RefractionTocItem(id: 'examples', text: 'Examples', level: 3),
    ],
  );
}

@widgetbook.UseCase(name: 'With Active Item', type: RefractionTableOfContents)
Widget activeTableOfContents(BuildContext context) {
  return const RefractionTableOfContents(
    activeId: 'api',
    items: [
      RefractionTocItem(id: 'intro', text: 'Introduction'),
      RefractionTocItem(id: 'usage', text: 'Usage'),
      RefractionTocItem(id: 'api', text: 'API Reference', level: 3),
      RefractionTocItem(id: 'examples', text: 'Examples', level: 3),
    ],
  );
}
