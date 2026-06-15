import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/flow_editor.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: child),
      ),
    );
  }

  final nodes = [
    const FlowNode(id: '1', x: 50, y: 50, label: 'Node A'),
    const FlowNode(id: '2', x: 250, y: 150, label: 'Node B'),
  ];

  final edges = [
    const FlowEdge(id: 'e1', source: '1', target: '2', label: 'Connection'),
  ];

  testWidgets('RefractionFlowEditor renders nodes and edges labels', (
    WidgetTester tester,
  ) async {
    String? clickedNodeId;

    await tester.pumpWidget(
      buildTestApp(
        RefractionFlowEditor(
          nodes: nodes,
          edges: edges,
          onNodeClick: (id) => clickedNodeId = id,
        ),
      ),
    );

    // Verify nodes are displayed
    expect(find.text('Node A'), findsOneWidget);
    expect(find.text('Node B'), findsOneWidget);

    // Click on Node A
    await tester.tap(find.text('Node A'));
    await tester.pump();

    // Verify click callback was triggered
    expect(clickedNodeId, equals('1'));
  });

  testWidgets('RefractionFlowEditor respects custom renderNode callback', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        RefractionFlowEditor(
          nodes: nodes,
          edges: edges,
          renderNode: (node) => Text('Custom ${node.label}'),
        ),
      ),
    );

    // Verify custom node rendering is active
    expect(find.text('Custom Node A'), findsOneWidget);
    expect(find.text('Custom Node B'), findsOneWidget);
    expect(find.text('Node A'), findsNothing);
  });
}
