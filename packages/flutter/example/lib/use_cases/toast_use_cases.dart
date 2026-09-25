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

@widgetbook.UseCase(name: 'Undo and retry', type: RefractionToast)
Widget actionToasts(BuildContext context) {
  return Wrap(
    spacing: 8,
    runSpacing: 8,
    alignment: WrapAlignment.center,
    children: [
      RefractionButton(
        variant: RefractionButtonVariant.outline,
        onPressed: () => RefractionToast.show(
          context: context,
          title: 'Message deleted',
          action: RefractionToastAction(label: 'Undo', onPressed: () {}),
        ),
        child: const Text('Delete message'),
      ),
      RefractionButton(
        variant: RefractionButtonVariant.outline,
        onPressed: () => RefractionToast.show(
          context: context,
          title: "Couldn't send message",
          description: 'Check your connection and try again.',
          variant: RefractionToastVariant.destructive,
          duration: Duration.zero,
          action: RefractionToastAction(label: 'Retry', onPressed: () {}),
        ),
        child: const Text('Fail a send'),
      ),
    ],
  );
}

/// Shows one toast of every variant on load, in a local toaster, so the
/// full set can be reviewed (and screenshotted) without clicking.
@widgetbook.UseCase(name: 'All variants', type: RefractionToaster)
Widget toastShowcase(BuildContext context) {
  return const _ToastShowcase();
}

class _ToastShowcase extends StatefulWidget {
  const _ToastShowcase();

  @override
  State<_ToastShowcase> createState() => _ToastShowcaseState();
}

class _ToastShowcaseState extends State<_ToastShowcase> {
  final _controller = RefractionToastController(maxVisible: 5);

  @override
  void initState() {
    super.initState();
    const persistent = Duration.zero;
    _controller
      ..show(
        const RefractionToastData(title: 'Link copied', duration: persistent),
      )
      ..show(
        const RefractionToastData(
          title: 'Saved to Content review',
          variant: RefractionToastVariant.success,
          duration: persistent,
        ),
      )
      ..show(
        const RefractionToastData(
          title: "You're offline",
          description: 'Messages will send when you reconnect.',
          variant: RefractionToastVariant.warning,
          duration: persistent,
        ),
      )
      ..show(
        RefractionToastData(
          title: 'Message deleted',
          variant: RefractionToastVariant.info,
          duration: persistent,
          action: RefractionToastAction(label: 'Undo', onPressed: () {}),
        ),
      )
      ..show(
        RefractionToastData(
          title: "Couldn't send message",
          description: 'Check your connection and try again.',
          variant: RefractionToastVariant.destructive,
          duration: persistent,
          action: RefractionToastAction(label: 'Retry', onPressed: () {}),
        ),
      );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return RefractionToaster(
      controller: _controller,
      child: const SizedBox.expand(),
    );
  }
}
