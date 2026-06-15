import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

// Exporting types directly needed for cases
import 'package:refraction_ui/src/components/editor_status_bar.dart';

@widgetbook.UseCase(name: 'Convenience Props', type: RefractionEditorStatusBar)
Widget conveniencePropsStatusBarUseCase(BuildContext context) {
  return const Scaffold(
    bottomNavigationBar: RefractionEditorStatusBar(
      line: 42,
      col: 8,
      indentation: 'Spaces: 2',
      language: 'Dart 3.2',
      encoding: 'UTF-8',
      eol: 'LF',
      status: 'Ready',
    ),
    body: Center(
      child: Text('Editor Status Bar with convenience props (see bottom)'),
    ),
  );
}

@widgetbook.UseCase(name: 'Custom Segments', type: RefractionEditorStatusBar)
Widget customSegmentsStatusBarUseCase(BuildContext context) {
  return const Scaffold(
    bottomNavigationBar: RefractionEditorStatusBar(
      segments: [
        StatusSegment(
          id: 'branch',
          label: '🌿 main',
          align: StatusSegmentAlign.left,
          tone: StatusSegmentTone.accent,
        ),
        StatusSegment(
          id: 'sync',
          label: 'Syncing...',
          align: StatusSegmentAlign.left,
          tone: StatusSegmentTone.muted,
        ),
        StatusSegment(
          id: 'errors',
          label: '⚠️ 2 warnings',
          align: StatusSegmentAlign.right,
          tone: StatusSegmentTone.defaultTone,
        ),
      ],
    ),
    body: Center(
      child: Text('Editor Status Bar with custom segments (see bottom)'),
    ),
  );
}
