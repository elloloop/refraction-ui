import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/live_transcript.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

final List<RefractionTranscriptEntry> _demoTranscript = [
  const RefractionTranscriptEntry(
    id: '1',
    speaker: 'Sarah Connor',
    text: 'Hello everyone, let\'s get started.',
    timestamp: '10:00 AM',
    speakerColor: Colors.blue,
  ),
  const RefractionTranscriptEntry(
    id: '2',
    speaker: 'Sarah Connor',
    text: 'Did we resolve the latency issue in the video grid component?',
    timestamp: '10:01 AM',
    speakerColor: Colors.blue,
  ),
  const RefractionTranscriptEntry(
    id: '3',
    speaker: 'John Doe',
    text: 'Yes, we optimized the sliver layout constraints.',
    timestamp: '10:02 AM',
    speakerColor: Colors.green,
  ),
];

@widgetbook.UseCase(name: 'Default', type: RefractionLiveTranscript)
Widget liveTranscriptDefaultUseCase(BuildContext context) {
  return RefractionLiveTranscript(
    entries: _demoTranscript,
  );
}

@widgetbook.UseCase(name: 'Compact', type: RefractionLiveTranscript)
Widget liveTranscriptCompactUseCase(BuildContext context) {
  return RefractionLiveTranscript(
    entries: _demoTranscript,
    compact: true,
  );
}
