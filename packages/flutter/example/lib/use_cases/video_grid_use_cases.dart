import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/video_grid.dart';
import 'package:refraction_ui/src/components/video_tile.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

final List<RefractionVideoTileData> _demoParticipants = [
  const RefractionVideoTileData(id: '1', name: 'Alice Smith', speaking: true),
  const RefractionVideoTileData(id: '2', name: 'Bob Johnson', micState: RefractionVideoTileMicState.muted),
  const RefractionVideoTileData(id: '3', name: 'Charlie Brown', pinned: true),
  const RefractionVideoTileData(id: '4', name: 'Diana Prince'),
];

@widgetbook.UseCase(name: 'Grid Layout', type: RefractionVideoGrid)
Widget videoGridDefaultUseCase(BuildContext context) {
  return Padding(
    padding: const EdgeInsets.all(16.0),
    child: RefractionVideoGrid(
      participants: _demoParticipants,
      layout: RefractionVideoGridLayout.grid,
    ),
  );
}

@widgetbook.UseCase(name: 'Speaker Layout', type: RefractionVideoGrid)
Widget videoGridSpeakerUseCase(BuildContext context) {
  return Padding(
    padding: const EdgeInsets.all(16.0),
    child: RefractionVideoGrid(
      participants: _demoParticipants,
      layout: RefractionVideoGridLayout.speaker,
      spotlightId: '3',
    ),
  );
}
