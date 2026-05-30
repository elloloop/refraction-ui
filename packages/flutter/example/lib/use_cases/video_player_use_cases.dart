import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionVideoPlayer)
Widget defaultVideoPlayer(BuildContext context) {
  return RefractionVideoPlayer(
    controller: VideoPlayerController.networkUrl(
      Uri.parse('https://example.com/video.mp4'),
    ),
    showControls: false,
  );
}
