import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Online', type: RefractionPresenceIndicator)
Widget onlinePresence(BuildContext context) {
  return const RefractionPresenceIndicator(
    status: RefractionPresenceStatus.online,
  );
}

@widgetbook.UseCase(name: 'Away with Label', type: RefractionPresenceIndicator)
Widget awayPresence(BuildContext context) {
  return const RefractionPresenceIndicator(
    status: RefractionPresenceStatus.away,
    showLabel: true,
  );
}

@widgetbook.UseCase(name: 'Large Busy', type: RefractionPresenceIndicator)
Widget busyPresence(BuildContext context) {
  return const RefractionPresenceIndicator(
    status: RefractionPresenceStatus.busy,
    size: RefractionPresenceSize.lg,
  );
}
