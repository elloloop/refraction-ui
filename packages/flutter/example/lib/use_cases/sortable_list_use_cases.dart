import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default', type: RefractionSortableList)
Widget defaultSortableListUseCase(BuildContext context) {
  return const _SortableListDemo();
}

@widgetbook.UseCase(name: 'Disabled', type: RefractionSortableList)
Widget disabledSortableListUseCase(BuildContext context) {
  return const _SortableListDemo(disabled: true);
}

class _SortableListDemo extends StatefulWidget {
  final bool disabled;
  const _SortableListDemo({this.disabled = false});

  @override
  State<_SortableListDemo> createState() => _SortableListDemoState();
}

class _SortableListDemoState extends State<_SortableListDemo> {
  List<String> _items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: RefractionSortableList<String>(
        items: _items,
        disabled: widget.disabled,
        getKey: (item, index) => item,
        renderItem: (item, {required index, required dragHandle}) {
          return Text(
            item,
            style: const TextStyle(fontWeight: FontWeight.w500),
          );
        },
        onReorder: (newItems) {
          setState(() {
            _items = newItems;
          });
        },
      ),
    );
  }
}
