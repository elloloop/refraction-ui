import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/pre_call_lobby.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default Lobby', type: RefractionPreCallLobby)
Widget preCallLobbyDefaultUseCase(BuildContext context) {
  return const Center(
    child: RefractionPreCallLobby(
      cameraOn: true,
      micOn: true,
      micLevel: 0.4,
      cameras: [
        RefractionMediaDeviceOption(id: 'cam-1', label: 'FaceTime HD Camera'),
        RefractionMediaDeviceOption(id: 'cam-2', label: 'OBS Virtual Camera'),
      ],
      microphones: [
        RefractionMediaDeviceOption(id: 'mic-1', label: 'MacBook Pro Microphone'),
        RefractionMediaDeviceOption(id: 'mic-2', label: 'Yeti Stereo Microphone'),
      ],
      speakers: [
        RefractionMediaDeviceOption(id: 'spk-1', label: 'MacBook Pro Speakers'),
        RefractionMediaDeviceOption(id: 'spk-2', label: 'External Headphones'),
      ],
      selectedCamera: 'cam-1',
      selectedMicrophone: 'mic-1',
      selectedSpeaker: 'spk-1',
      previewSlot: ColoredBox(
        color: Colors.blueGrey,
        child: Center(
          child: Text(
            'Camera Preview Active',
            style: TextStyle(color: Colors.white),
          ),
        ),
      ),
    ),
  );
}
