import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/graph_view.dart';

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
    const GraphNode(id: '1', x: 100, y: 100, label: 'Node A', state: GraphNodeState.mastered),
    const GraphNode(id: '2', x: 300, y: 200, label: 'Node B', state: GraphNodeState.inProgress),
  ];

  final edges = [
    const GraphEdge(id: 'e1', source: '1', target: '2'),
  ];

  testWidgets('RefractionGraphView renders nodes and handles click', (
    WidgetTester tester,
  ) async {
    GraphNode? clickedNode;

    await tester.pumpWidget(
      buildTestApp(
        RefractionGraphView(
          nodes: nodes,
          edges: edges,
          onNodeClick: (node) => clickedNode = node,
        ),
      ),
    );

    // Verify node labels are rendered
    expect(find.text('Node A'), findsOneWidget);
    expect(find.text('Node B'), findsOneWidget);

    // Click Node B
    await tester.tap(find.text('Node B'));
    await tester.pump();

    // Verify click callback was triggered with correct node
    expect(clickedNode, isNotNull);
    expect(clickedNode!.id, equals('2'));
  });

  testWidgets('RefractionGraphView renders legend when showLegend is true', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        RefractionGraphView(
          nodes: nodes,
          edges: edges,
          showLegend: true,
        ),
      ),
    );

    // Verify legend states with counts are displayed
    expect(find.text('Mastered'), findsOneWidget);
    expect(find.text('In Progress'), findsOneWidget);

    // Count is shown in the legend chip
    expect(find.text('1'), findsNWidgets(2)); // One for Mastered (1), one for In Progress (1)
  });
}
