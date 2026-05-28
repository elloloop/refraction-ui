import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default', type: RefractionTabs)
Widget defaultTabs(BuildContext context) {
  return RefractionTabs(
    initialIndex: 0,
    tabs: ['Account', 'Password', 'Sessions'],
    children: [
      Text('Account Settings Content'),
      Text('Password Settings Content'),
      Text('Active Sessions Content'),
    ],
  );
}

@widgetbook.UseCase(name: 'Preselected Index', type: RefractionTabs)
Widget preselectedTabs(BuildContext context) {
  return RefractionTabs(
    initialIndex: 2,
    tabs: ['Account', 'Password', 'Sessions'],
    children: [
      Text('Account Settings Content'),
      Text('Password Settings Content'),
      Text('Active Sessions Content'),
    ],
  );
}
