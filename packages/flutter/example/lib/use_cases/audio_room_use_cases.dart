import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/audio_room.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

final List<RefractionAudioParticipant> _demoAudioParticipants = [
  const RefractionAudioParticipant(
    id: '1',
    name: 'Alice Cooper',
    speaking: true,
  ),
  const RefractionAudioParticipant(
    id: '2',
    name: 'Bob Marley',
    muted: true,
  ),
  const RefractionAudioParticipant(
    id: '3',
    name: 'Charlie Chaplin',
    handRaised: true,
  ),
  const RefractionAudioParticipant(
    id: '4',
    name: 'Diana Ross',
  ),
];

@widgetbook.UseCase(name: 'Default', type: RefractionAudioRoom)
Widget audioRoomDefaultUseCase(BuildContext context) {
  return RefractionAudioRoom(
    participants: _demoAudioParticipants,
  );
}

@widgetbook.UseCase(name: 'Solo Participant', type: RefractionAudioRoom)
Widget audioRoomSoloUseCase(BuildContext context) {
  return const RefractionAudioRoom(
    participants: [
      RefractionAudioParticipant(
        id: '1',
        name: 'Alice Cooper',
        speaking: true,
      ),
    ],
  );
}
