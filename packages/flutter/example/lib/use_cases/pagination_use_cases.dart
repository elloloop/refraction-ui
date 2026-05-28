import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionPagination)
Widget defaultPagination(BuildContext context) {
  return const RefractionPagination(currentPage: 1, totalPages: 10);
}

@widgetbook.UseCase(name: 'Middle Page', type: RefractionPagination)
Widget middlePagination(BuildContext context) {
  return const RefractionPagination(currentPage: 5, totalPages: 10);
}

@widgetbook.UseCase(name: 'No Controls', type: RefractionPagination)
Widget noControlsPagination(BuildContext context) {
  return const RefractionPagination(
    currentPage: 1,
    totalPages: 5,
    showControls: false,
  );
}
