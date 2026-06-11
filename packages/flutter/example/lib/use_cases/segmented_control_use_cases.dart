import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionSegmentedControl)
Widget defaultSegmentedControl(BuildContext context) {
  return const _SegmentedDemo();
}

@widgetbook.UseCase(name: 'Small with icons', type: RefractionSegmentedControl)
Widget smallSegmentedControl(BuildContext context) {
  return const _SegmentedDemo(
    size: RefractionSegmentedControlSize.sm,
    withIcons: true,
  );
}

class _SegmentedDemo extends StatefulWidget {
  final RefractionSegmentedControlSize size;
  final bool withIcons;
  const _SegmentedDemo({
    this.size = RefractionSegmentedControlSize.md,
    this.withIcons = false,
  });

  @override
  State<_SegmentedDemo> createState() => _SegmentedDemoState();
}

class _SegmentedDemoState extends State<_SegmentedDemo> {
  String _value = 'list';

  @override
  Widget build(BuildContext context) {
    return RefractionSegmentedControl<String>(
      value: _value,
      size: widget.size,
      onValueChange: (v) => setState(() => _value = v),
      items: [
        RefractionSegmentedControlItem(
          value: 'list',
          label: 'List',
          icon: widget.withIcons ? const Icon(Icons.view_list) : null,
        ),
        RefractionSegmentedControlItem(
          value: 'grid',
          label: 'Grid',
          icon: widget.withIcons ? const Icon(Icons.grid_view) : null,
        ),
        RefractionSegmentedControlItem(
          value: 'board',
          label: 'Board',
          icon: widget.withIcons ? const Icon(Icons.view_kanban) : null,
        ),
      ],
    );
  }
}
