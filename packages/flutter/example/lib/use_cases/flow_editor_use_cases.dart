import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/flow_editor.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default', type: RefractionFlowEditor)
Widget flowEditorDefaultUseCase(BuildContext context) {
  return const _InteractiveFlowEditor();
}

class _InteractiveFlowEditor extends StatefulWidget {
  const _InteractiveFlowEditor();

  @override
  State<_InteractiveFlowEditor> createState() => _InteractiveFlowEditorState();
}

class _InteractiveFlowEditorState extends State<_InteractiveFlowEditor> {
  List<FlowNode> _nodes = const [
    FlowNode(id: '1', x: 100, y: 100, label: 'Source Node'),
    FlowNode(id: '2', x: 400, y: 80, label: 'Middle Node A'),
    FlowNode(id: '3', x: 400, y: 220, label: 'Middle Node B'),
    FlowNode(id: '4', x: 700, y: 150, label: 'Target Node'),
  ];

  final List<FlowEdge> _edges = const [
    FlowEdge(id: 'e1-2', source: '1', target: '2', label: 'Route A'),
    FlowEdge(id: 'e1-3', source: '1', target: '3', label: 'Route B'),
    FlowEdge(id: 'e2-4', source: '2', target: '4'),
    FlowEdge(id: 'e3-4', source: '3', target: '4'),
  ];

  String? _selectedId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: RefractionFlowEditor(
        nodes: _nodes,
        edges: _edges,
        selectedId: _selectedId,
        onNodeClick: (id) {
          setState(() {
            _selectedId = id;
          });
        },
        onNodeMove: (id, x, y) {
          setState(() {
            _nodes = _nodes.map((n) {
              if (n.id == id) {
                return n.copyWith(x: x, y: y);
              }
              return n;
            }).toList();
          });
        },
      ),
    );
  }
}
