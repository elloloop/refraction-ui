import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionLinkCard)
Widget defaultLinkCard(BuildContext context) {
  return RefractionLinkCard(
    title: 'Documentation',
    description: 'Learn how to integrate Refraction UI into your app.',
    url: 'elloloop.github.io/refraction-ui',
    icon: const Icon(Icons.menu_book),
    onTap: () {},
  );
}

@widgetbook.UseCase(name: 'Minimal', type: RefractionLinkCard)
Widget minimalLinkCard(BuildContext context) {
  return RefractionLinkCard(title: 'API Reference', onTap: () {});
}

@widgetbook.UseCase(name: 'Disabled', type: RefractionLinkCard)
Widget disabledLinkCard(BuildContext context) {
  return const RefractionLinkCard(
    title: 'Billing Portal',
    description: 'Manage your subscription and billing details.',
    url: 'billing.example.com',
    icon: Icon(Icons.credit_card),
    onTap: null,
  );
}
