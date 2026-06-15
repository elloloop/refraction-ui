import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/live_captions.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

final List<RefractionCaptionCue> _demoCaptions = [
  const RefractionCaptionCue(id: '1', speaker: 'Sarah Connor', text: 'We need to deploy the fixes immediately.', isFinal: true),
  const RefractionCaptionCue(id: '2', speaker: 'John Doe', text: 'I am running the tests now', isFinal: false),
];

@widgetbook.UseCase(name: 'Default', type: RefractionLiveCaptions)
Widget liveCaptionsDefaultUseCase(BuildContext context) {
  return Center(
    child: RefractionLiveCaptions(
      cues: _demoCaptions,
    ),
  );
}

@widgetbook.UseCase(name: 'Absolute Positioned', type: RefractionLiveCaptions)
Widget liveCaptionsAbsoluteUseCase(BuildContext context) {
  return Stack(
    children: [
      Positioned.fill(
        child: Container(
          color: Colors.black12,
        ),
      ),
      RefractionLiveCaptions(
        cues: _demoCaptions,
        position: RefractionLiveCaptionsPosition.absolutePosition,
      ),
    ],
  );
}
