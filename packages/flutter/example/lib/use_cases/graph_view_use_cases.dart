import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/graph_view.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default with Legend', type: RefractionGraphView)
Widget graphViewDefaultUseCase(BuildContext context) {
  final nodes = [
    const GraphNode(id: '1', x: 200, y: 100, label: 'HTML Basics', state: GraphNodeState.mastered),
    const GraphNode(id: '2', x: 400, y: 150, label: 'CSS Layouts', state: GraphNodeState.mastered),
    const GraphNode(id: '3', x: 200, y: 250, label: 'JavaScript Intro', state: GraphNodeState.inProgress),
    const GraphNode(id: '4', x: 400, y: 350, label: 'DOM Manipulation', state: GraphNodeState.inProgress),
    const GraphNode(id: '5', x: 600, y: 250, label: 'React Framework', state: GraphNodeState.notStarted),
    const GraphNode(id: '6', x: 600, y: 450, label: 'Next.js App Router', state: GraphNodeState.highlight),
  ];

  final edges = [
    const GraphEdge(id: 'e1', source: '1', target: '2'),
    const GraphEdge(id: 'e2', source: '1', target: '3'),
    const GraphEdge(id: 'e3', source: '3', target: '4'),
    const GraphEdge(id: 'e4', source: '2', target: '5'),
    const GraphEdge(id: 'e5', source: '4', target: '5'),
    const GraphEdge(id: 'e6', source: '5', target: '6'),
  ];

  return Scaffold(
    body: Padding(
      padding: const EdgeInsets.all(16.0),
      child: RefractionGraphView(
        nodes: nodes,
        edges: edges,
        showLegend: true,
        onNodeClick: (node) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Clicked: ${node.label} (${node.state})'),
              duration: const Duration(seconds: 1),
            ),
          );
        },
      ),
    ),
  );
}
