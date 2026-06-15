import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

// Exporting types directly needed for cases
import 'package:refraction_ui/src/components/editor_tabs.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionEditorTabs)
Widget defaultEditorTabsUseCase(BuildContext context) {
  return const _EditorTabsDemo();
}

class _EditorTabsDemo extends StatefulWidget {
  const _EditorTabsDemo();

  @override
  State<_EditorTabsDemo> createState() => _EditorTabsDemoState();
}

class _EditorTabsDemoState extends State<_EditorTabsDemo> {
  final List<EditorTabData> _allTabs = [
    const EditorTabData(
      id: 'main',
      label: 'main.dart',
      icon: Text('💙', style: TextStyle(fontSize: 12)),
    ),
    const EditorTabData(
      id: 'readme',
      label: 'README.md',
      icon: Text('📝', style: TextStyle(fontSize: 12)),
      dirty: true,
      closable: true,
    ),
    const EditorTabData(
      id: 'config',
      label: 'pubspec.yaml',
      icon: Text('⚙️', style: TextStyle(fontSize: 12)),
      closable: true,
    ),
  ];

  late List<EditorTabData> _tabs;
  late String _activeId;

  @override
  void initState() {
    super.initState();
    _tabs = List.from(_allTabs);
    _activeId = 'main';
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          RefractionEditorTabs(
            tabs: _tabs,
            activeId: _activeId,
            onSelect: (id) {
              setState(() {
                _activeId = id;
              });
            },
            onClose: (id) {
              setState(() {
                _tabs.removeWhere((t) => t.id == id);
                if (_activeId == id && _tabs.isNotEmpty) {
                  _activeId = _tabs.first.id;
                }
              });
            },
          ),
          const SizedBox(height: 24),
          Text(
            'Active tab content for: $_activeId',
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}
