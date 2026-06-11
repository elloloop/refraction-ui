import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionEmptyState)
Widget defaultEmptyState(BuildContext context) {
  return SizedBox(
    width: 360,
    child: RefractionEmptyState(
      icon: const Icon(Icons.inbox_outlined),
      title: const Text('No messages yet'),
      description: const Text('When someone writes to you, it shows up here.'),
      actions: [
        RefractionButton(onPressed: () {}, child: const Text('Refresh')),
      ],
    ),
  );
}

@widgetbook.UseCase(name: 'Tones', type: RefractionEmptyState)
Widget toneEmptyState(BuildContext context) {
  return const SizedBox(
    width: 360,
    child: RefractionEmptyState(
      icon: Icon(Icons.warning_amber_outlined),
      tone: RefractionEmptyStateTone.warning,
      title: Text('Quota almost reached'),
      description: Text('You have used 90% of your monthly quota.'),
    ),
  );
}

@widgetbook.UseCase(name: 'Confirmation card', type: RefractionConfirmationCard)
Widget confirmationCard(BuildContext context) {
  return const SizedBox(
    width: 360,
    child: RefractionConfirmationCard(
      icon: Icon(Icons.mark_email_read_outlined),
      tone: RefractionEmptyStateTone.success,
      title: Text('Check your email'),
      description: Text('We sent a confirmation link to your inbox.'),
    ),
  );
}
