import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/stat_grid.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default', type: RefractionStatGrid)
Widget statGridDefaultUseCase(BuildContext context) {
  return const RefractionStatGrid(
    items: [
      RefractionStatGridItem(
        value: Text('99.9%'),
        label: Text('Uptime guarantee with SLA.'),
      ),
      RefractionStatGridItem(
        value: Text('24/7'),
        label: Text('Customer support response time.'),
      ),
      RefractionStatGridItem(
        value: Text('10M+'),
        label: Text('API requests processed daily.'),
      ),
    ],
  );
}

@widgetbook.UseCase(name: 'Two Columns', type: RefractionStatGrid)
Widget statGridTwoColumnsUseCase(BuildContext context) {
  return const RefractionStatGrid(
    columns: 2,
    items: [
      RefractionStatGridItem(
        value: Text('\$1.2M'),
        label: Text('Saved in processing fees.'),
      ),
      RefractionStatGridItem(
        value: Text('150k'),
        label: Text('Active monthly developers.'),
      ),
    ],
  );
}
