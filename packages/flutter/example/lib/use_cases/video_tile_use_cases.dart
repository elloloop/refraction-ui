import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/video_tile.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default', type: RefractionVideoTile)
Widget videoTileDefaultUseCase(BuildContext context) {
  return const Center(
    child: SizedBox(
      width: 320,
      child: RefractionVideoTile(
        name: 'Sarah Connor',
      ),
    ),
  );
}

@widgetbook.UseCase(name: 'Speaking & Pinned', type: RefractionVideoTile)
Widget videoTileSpeakingPinnedUseCase(BuildContext context) {
  return const Center(
    child: SizedBox(
      width: 320,
      child: RefractionVideoTile(
        name: 'Sarah Connor',
        speaking: true,
        pinned: true,
        micState: RefractionVideoTileMicState.on,
      ),
    ),
  );
}

@widgetbook.UseCase(name: 'Muted with Reaction', type: RefractionVideoTile)
Widget videoTileMutedReactionUseCase(BuildContext context) {
  return const Center(
    child: SizedBox(
      width: 320,
      child: RefractionVideoTile(
        name: 'John Doe',
        micState: RefractionVideoTileMicState.muted,
        reaction: Text('👋'),
      ),
    ),
  );
}
