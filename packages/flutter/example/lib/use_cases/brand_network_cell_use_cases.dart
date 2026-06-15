import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/brand_network_cell.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default', type: RefractionBrandNetworkCell)
Widget brandNetworkCellDefaultUseCase(BuildContext context) {
  return RefractionBrandNetworkCell(
    glyph: 'D',
    glyphBg: Colors.purple,
    glyphColor: Colors.white,
    domain: 'docs.easyloops.dev',
    body: 'The developer documentation for easyloops, guide on setup and deployment.',
    onTap: () {},
  );
}

@widgetbook.UseCase(name: 'Current Product', type: RefractionBrandNetworkCell)
Widget brandNetworkCellCurrentUseCase(BuildContext context) {
  return const RefractionBrandNetworkCell(
    glyph: 'M',
    glyphBg: Colors.blue,
    glyphColor: Colors.white,
    domain: 'easyloops.dev',
    body: 'The easyloops main dashboard for creating and managing product networks.',
    current: true,
  );
}
