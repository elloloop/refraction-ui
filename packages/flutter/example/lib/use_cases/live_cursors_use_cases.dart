import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/live_cursors.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default', type: RefractionLiveCursors)
Widget liveCursorsDefaultUseCase(BuildContext context) {
  final cursors = [
    const CursorData(id: 'c1', name: 'Alice', x: 80, y: 120),
    const CursorData(id: 'c2', name: 'Bob', x: 250, y: 80),
    const CursorData(id: 'c3', name: 'Charlie', x: 180, y: 240),
    const CursorData(id: 'c4', name: 'Diana', x: 420, y: 190),
  ];

  return Scaffold(
    body: Container(
      color: Colors.grey[100],
      child: Stack(
        children: [
          const Center(
            child: Text(
              'Collaborators working on the canvas...',
              style: TextStyle(color: Colors.grey, fontSize: 16),
            ),
          ),
          RefractionLiveCursors(cursors: cursors),
        ],
      ),
    ),
  );
}
