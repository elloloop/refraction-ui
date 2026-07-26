import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionBreadcrumbs)
Widget defaultBreadcrumbs(BuildContext context) {
  return const RefractionBreadcrumbs(
    items: [
      BreadcrumbItem(label: 'Home', href: '/'),
      BreadcrumbItem(label: 'Docs', href: '/docs'),
      BreadcrumbItem(label: 'Components', href: '/docs/components'),
      BreadcrumbItem(label: 'Breadcrumbs'),
    ],
  );
}

@widgetbook.UseCase(name: 'Custom Separator', type: RefractionBreadcrumbs)
Widget customSeparatorBreadcrumbs(BuildContext context) {
  return const RefractionBreadcrumbs(
    separator: '›',
    items: [
      BreadcrumbItem(label: 'Store', href: '/store'),
      BreadcrumbItem(label: 'Books', href: '/store/books'),
      BreadcrumbItem(label: 'Design Systems'),
    ],
  );
}
