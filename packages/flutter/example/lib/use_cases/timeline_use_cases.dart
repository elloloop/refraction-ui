import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

final List<RefractionTimelineItemData> _demoEvents = const [
  RefractionTimelineItemData(
    id: '1',
    title: 'Created proposal',
    time: '2 hours ago',
    description: 'Drafted and sent project proposal for review.',
    status: RefractionTimelineItemStatus.done,
  ),
  RefractionTimelineItemData(
    id: '2',
    title: 'Client feedback',
    time: '1 hour ago',
    description: 'Reviewed adjustments requested by client.',
    status: RefractionTimelineItemStatus.current,
  ),
  RefractionTimelineItemData(
    id: '3',
    title: 'Contract signing',
    time: 'Tomorrow',
    description: 'Final signing and kickoff.',
    status: RefractionTimelineItemStatus.upcoming,
  ),
];

@widgetbook.UseCase(name: 'Vertical', type: RefractionTimeline)
Widget verticalTimeline(BuildContext context) {
  return Padding(
    padding: const EdgeInsets.all(24.0),
    child: RefractionTimeline(
      items: _demoEvents,
      orientation: RefractionTimelineOrientation.vertical,
    ),
  );
}

@widgetbook.UseCase(name: 'Horizontal', type: RefractionTimeline)
Widget horizontalTimeline(BuildContext context) {
  return Padding(
    padding: const EdgeInsets.all(24.0),
    child: RefractionTimeline(
      items: _demoEvents,
      orientation: RefractionTimelineOrientation.horizontal,
    ),
  );
}
