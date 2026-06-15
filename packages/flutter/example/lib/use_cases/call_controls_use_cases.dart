import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/call_controls.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default', type: RefractionCallControls)
Widget callControlsDefaultUseCase(BuildContext context) {
  return Center(
    child: RefractionCallControls(
      children: [
        RefractionCallControlButton(
          label: 'Mute',
          icon: const Icon(Icons.mic),
          tone: RefractionCallControlTone.active,
          pressed: true,
          onPressed: () {},
        ),
        RefractionCallControlButton(
          label: 'Video',
          icon: const Icon(Icons.videocam),
          tone: RefractionCallControlTone.defaultTone,
          pressed: false,
          onPressed: () {},
        ),
        RefractionCallControlButton(
          label: 'Leave',
          icon: const Icon(Icons.call_end),
          tone: RefractionCallControlTone.destructive,
          onPressed: () {},
        ),
      ],
    ),
  );
}

@widgetbook.UseCase(name: 'Small Size', type: RefractionCallControls)
Widget callControlsSmallUseCase(BuildContext context) {
  return Center(
    child: RefractionCallControls(
      size: RefractionCallControlsSize.sm,
      children: [
        RefractionCallControlButton(
          size: RefractionCallControlsSize.sm,
          label: 'Mute',
          icon: const Icon(Icons.mic),
          tone: RefractionCallControlTone.active,
          pressed: true,
          onPressed: () {},
        ),
        RefractionCallControlButton(
          size: RefractionCallControlsSize.sm,
          label: 'Video',
          icon: const Icon(Icons.videocam),
          tone: RefractionCallControlTone.defaultTone,
          pressed: false,
          onPressed: () {},
        ),
        RefractionCallControlButton(
          size: RefractionCallControlsSize.sm,
          label: 'Leave',
          icon: const Icon(Icons.call_end),
          tone: RefractionCallControlTone.destructive,
          onPressed: () {},
        ),
      ],
    ),
  );
}
