import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default', type: RefractionToast)
Widget defaultToast(BuildContext context) {
  return Center(
    child: RefractionButton(
      onPressed: () {
        RefractionToast.show(context: context, title: 'Message Sent');
      },
      child: const Text('Show Default Toast'),
    ),
  );
}

@widgetbook.UseCase(name: 'With Description', type: RefractionToast)
Widget descriptionToast(BuildContext context) {
  return Center(
    child: RefractionButton(
      onPressed: () {
        RefractionToast.show(
          context: context,
          title: 'Account updated',
          description: 'Your profile information has been saved successfully.',
        );
      },
      child: const Text('Show Description Toast'),
    ),
  );
}
