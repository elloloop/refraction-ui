import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default AI', type: RefractionVoicePill)
Widget defaultVoicePill(BuildContext context) {
  return const RefractionVoicePill(
    label: 'Listening...',
    sub: 'AI Voice',
    intensity: 0.5,
    speaker: RefractionVoicePillSpeaker.ai,
    position: RefractionVoicePillPosition.inline,
  );
}

@widgetbook.UseCase(name: 'User Muted', type: RefractionVoicePill)
Widget userMutedVoicePill(BuildContext context) {
  return const RefractionVoicePill(
    label: 'Muted',
    speaker: RefractionVoicePillSpeaker.user,
    muted: true,
    position: RefractionVoicePillPosition.inline,
  );
}
