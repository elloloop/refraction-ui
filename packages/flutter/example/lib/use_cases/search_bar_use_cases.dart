import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionSearchBar)
Widget defaultSearchBar(BuildContext context) {
  return SizedBox(
    width: 360,
    child: RefractionSearchBar(
      placeholder: 'Search components...',
      onSearch: (_) {},
    ),
  );
}

@widgetbook.UseCase(name: 'Loading', type: RefractionSearchBar)
Widget loadingSearchBar(BuildContext context) {
  return const SizedBox(
    width: 360,
    child: RefractionSearchBar(placeholder: 'Searching...', isLoading: true),
  );
}
