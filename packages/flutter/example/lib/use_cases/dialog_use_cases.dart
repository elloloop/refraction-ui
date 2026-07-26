import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionDialog)
Widget defaultDialog(BuildContext context) {
  return RefractionButton(
    onPressed: () {
      RefractionDialog.show<void>(
        context: context,
        title: const Text('Delete file?'),
        content: const Text(
          'This action cannot be undone. The file will be permanently removed from your project.',
        ),
        actions: [
          RefractionButton(
            variant: RefractionButtonVariant.outline,
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          RefractionButton(
            variant: RefractionButtonVariant.destructive,
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Delete'),
          ),
        ],
      );
    },
    child: const Text('Open dialog'),
  );
}

@widgetbook.UseCase(name: 'Info Only', type: RefractionDialog)
Widget infoOnlyDialog(BuildContext context) {
  return RefractionButton(
    variant: RefractionButtonVariant.outline,
    onPressed: () {
      RefractionDialog.show<void>(
        context: context,
        title: const Text('New in 0.47'),
        content: const Text(
          'Status colors now flow through the theme — restyle success, '
          'warning, and info hues in one place.',
        ),
      );
    },
    child: const Text('What\'s new'),
  );
}
