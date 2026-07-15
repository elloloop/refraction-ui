import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

List<ComposerTrigger> _demoTriggers() => [
  ComposerTrigger(
    id: 'mention',
    symbol: '@',
    resolve: (query) => [
      for (final c in const [
        ComposerCandidate(
          id: 'u_jordan',
          display: 'Jordan Lee',
          subtitle: '@jordan',
        ),
        ComposerCandidate(id: 'u_alex', display: 'Alex Kim', subtitle: '@alex'),
        ComposerCandidate(id: 'u_sam', display: 'Sam Field', subtitle: '@sam'),
      ])
        if (c.display.toLowerCase().startsWith(query.toLowerCase())) c,
    ],
  ),
];

/// K1 — empty pill with placeholder, attach + send slots.
@widgetbook.UseCase(name: 'Default', type: RefractionComposer)
Widget defaultComposerUseCase(BuildContext context) {
  return RefractionComposer(onSubmit: (_) {}, onAttachRequested: () {});
}

/// K2 — grown to four lines.
@widgetbook.UseCase(name: 'Multiline', type: RefractionComposer)
Widget multilineComposerUseCase(BuildContext context) {
  return _ControllerScope(
    create: () => RefractionComposerController(
      initialValue:
          'This message has wrapped\nacross several lines\n'
          'because the sender had\na lot to say',
    ),
    builder: (controller) => RefractionComposer(
      controller: controller,
      onSubmit: (_) {},
      onAttachRequested: () {},
    ),
  );
}

/// K3 — a committed mention token styled inline.
@widgetbook.UseCase(name: 'Token inserted', type: RefractionComposer)
Widget tokenComposerUseCase(BuildContext context) {
  return _ControllerScope(
    create: () => RefractionComposerController(
      initialValue: '@Jordan Lee can you grab milk?',
      initialTokens: const [
        ComposerToken(
          type: 'mention',
          id: 'u_jordan',
          display: '@Jordan Lee',
          start: 0,
        ),
      ],
    ),
    builder: (controller) => RefractionComposer(
      controller: controller,
      onSubmit: (_) {},
      onAttachRequested: () {},
    ),
  );
}

/// K4 — suggestion overlay open above the pill.
@widgetbook.UseCase(name: 'Overlay open', type: RefractionComposer)
Widget overlayComposerUseCase(BuildContext context) {
  return _ControllerScope(
    create: () => RefractionComposerController(triggers: _demoTriggers()),
    arm: (controller) => controller.core.setValue(
      '@',
      selection: const ComposerSelection.collapsed(1),
    ),
    builder: (controller) => Container(
      height: 300,
      alignment: Alignment.bottomCenter,
      child: RefractionComposer(
        controller: controller,
        onSubmit: (_) {},
        onAttachRequested: () {},
      ),
    ),
  );
}

/// K5 — disabled with a distinct disabled placeholder.
@widgetbook.UseCase(name: 'Disabled', type: RefractionComposer)
Widget disabledComposerUseCase(BuildContext context) {
  return RefractionComposer(
    disabled: true,
    disabledPlaceholder: "You can't reply to this conversation",
    onSubmit: (_) {},
    onAttachRequested: () {},
  );
}

/// K6 — read-only (selectable, not editable).
@widgetbook.UseCase(name: 'Read only', type: RefractionComposer)
Widget readOnlyComposerUseCase(BuildContext context) {
  return _ControllerScope(
    create: () =>
        RefractionComposerController(initialValue: 'Frozen message text'),
    builder: (controller) => RefractionComposer(
      controller: controller,
      readOnly: true,
      onSubmit: (_) {},
    ),
  );
}

/// K7 — host error banner above the pill (draft preserved).
@widgetbook.UseCase(name: 'Error', type: RefractionComposer)
Widget errorComposerUseCase(BuildContext context) {
  return _ControllerScope(
    create: () {
      final controller = RefractionComposerController(
        initialValue: 'This failed to send',
      );
      controller.setError("Couldn't send — check your connection");
      return controller;
    },
    builder: (controller) => RefractionComposer(
      controller: controller,
      onSubmit: (_) {},
      onAttachRequested: () {},
    ),
  );
}

/// K8 — counter visible near the limit.
@widgetbook.UseCase(name: 'Counter near limit', type: RefractionComposer)
Widget counterComposerUseCase(BuildContext context) {
  final text = 'a' * 85;
  return _ControllerScope(
    create: () =>
        RefractionComposerController(initialValue: text, maxLength: 100),
    builder: (controller) =>
        RefractionComposer(controller: controller, onSubmit: (_) {}),
  );
}

/// K9 — RTL: structure mirrored, send glyph flipped, paperclip not.
@widgetbook.UseCase(name: 'RTL', type: RefractionComposer)
Widget rtlComposerUseCase(BuildContext context) {
  return Directionality(
    textDirection: TextDirection.rtl,
    child: _ControllerScope(
      create: () => RefractionComposerController(initialValue: 'مرحبا بكم'),
      builder: (controller) => RefractionComposer(
        controller: controller,
        onSubmit: (_) {},
        onAttachRequested: () {},
      ),
    ),
  );
}

/// K10 — attachment tray above the pill.
@widgetbook.UseCase(name: 'Attachments', type: RefractionComposer)
Widget attachmentsComposerUseCase(BuildContext context) {
  return _ControllerScope(
    create: () {
      final controller = RefractionComposerController();
      controller.addAttachment(
        const ComposerAttachment(
          kind: ComposerAttachmentKind.image,
          name: 'holiday-photo.png',
          status: ComposerAttachmentStatus.ready,
        ),
      );
      controller.addAttachment(
        const ComposerAttachment(
          kind: ComposerAttachmentKind.file,
          name: 'itinerary.pdf',
          status: ComposerAttachmentStatus.uploading,
          progress: 0.6,
        ),
      );
      return controller;
    },
    builder: (controller) => RefractionComposer(
      controller: controller,
      onSubmit: (_) {},
      onAttachRequested: () {},
    ),
  );
}

/// K11 — density variants stacked.
@widgetbook.UseCase(name: 'Densities', type: RefractionComposer)
Widget densitiesComposerUseCase(BuildContext context) {
  return Column(
    mainAxisSize: MainAxisSize.min,
    children: [
      for (final density in ComposerDensity.values)
        Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: RefractionComposer(
            density: density,
            placeholder: density.name,
            onSubmit: (_) {},
            onAttachRequested: () {},
          ),
        ),
    ],
  );
}

/// K12 — high contrast strengthens the pill hairline.
@widgetbook.UseCase(name: 'High contrast', type: RefractionComposer)
Widget highContrastComposerUseCase(BuildContext context) {
  return MediaQuery(
    data: MediaQuery.of(context).copyWith(highContrast: true),
    child: RefractionComposer(onSubmit: (_) {}, onAttachRequested: () {}),
  );
}

/// K13 — filled/soft surface (issue #432 Gap 1) with the built-in emoji
/// affordance: no loud focus ring, a muted fill distinct from the page.
@widgetbook.UseCase(name: 'Filled surface', type: RefractionComposer)
Widget filledSurfaceComposerUseCase(BuildContext context) {
  return _ControllerScope(
    create: () => RefractionComposerController(
      initialValue: 'Soft, filled surface — focus reads through the caret',
    ),
    builder: (controller) => RefractionComposer(
      controller: controller,
      surface: ComposerSurface.filled,
      showEmojiButton: true,
      onSubmit: (_) {},
      onAttachRequested: () {},
    ),
  );
}

/// K14 — the keyboard-replacement accessory panel (issue #432 Gap 3) open,
/// showing the built-in emoji picker below the still-visible pill.
@widgetbook.UseCase(name: 'Accessory panel', type: RefractionComposer)
Widget accessoryPanelComposerUseCase(BuildContext context) {
  return _ControllerScope(
    create: () => RefractionComposerController(),
    arm: (controller) => controller.openAccessoryPanel(),
    builder: (controller) => RefractionComposer(
      controller: controller,
      surface: ComposerSurface.filled,
      showEmojiButton: true,
      accessoryPanelHeight: 300,
      onSubmit: (_) {},
    ),
  );
}

/// Owns a [RefractionComposerController] for a stateless use-case entry,
/// optionally arming state (e.g. the suggestion overlay) after the first
/// frame.
class _ControllerScope extends StatefulWidget {
  final RefractionComposerController Function() create;
  final void Function(RefractionComposerController controller)? arm;
  final Widget Function(RefractionComposerController controller) builder;

  const _ControllerScope({
    required this.create,
    this.arm,
    required this.builder,
  });

  @override
  State<_ControllerScope> createState() => _ControllerScopeState();
}

class _ControllerScopeState extends State<_ControllerScope> {
  late final RefractionComposerController _controller = widget.create();
  bool _armed = false;

  @override
  void initState() {
    super.initState();
    if (widget.arm != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted || _armed) return;
        _armed = true;
        widget.arm!(_controller);
      });
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => widget.builder(_controller);
}
