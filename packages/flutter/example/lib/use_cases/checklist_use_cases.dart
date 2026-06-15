import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionChecklist)
Widget defaultChecklist(BuildContext context) {
  return const Padding(
    padding: EdgeInsets.all(16.0),
    child: _ChecklistDemo(),
  );
}

@widgetbook.UseCase(name: 'With Progress', type: RefractionChecklist)
Widget progressChecklist(BuildContext context) {
  return const Padding(
    padding: EdgeInsets.all(16.0),
    child: _ChecklistDemo(showProgress: true),
  );
}

class _ChecklistDemo extends StatefulWidget {
  final bool showProgress;

  const _ChecklistDemo({
    this.showProgress = false,
  });

  @override
  State<_ChecklistDemo> createState() => _ChecklistDemoState();
}

class _ChecklistDemoState extends State<_ChecklistDemo> {
  List<RefractionChecklistItemData> _items = const [
    RefractionChecklistItemData(
      id: '1',
      label: 'Setup development environment',
      description: 'Install IDE, flutter SDK and setup simulator.',
      checked: true,
    ),
    RefractionChecklistItemData(
      id: '2',
      label: 'Design UI layout',
      description: 'Create Figma wireframes and design system styles.',
    ),
    RefractionChecklistItemData(
      id: '3',
      label: 'Write unit tests',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return RefractionChecklist(
      items: _items,
      showProgress: widget.showProgress,
      onChange: (next) {
        setState(() {
          _items = next;
        });
      },
    );
  }
}
