import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import 'infinite_canvas.dart';

/// Visual mastery state of a node in the knowledge graph.
enum GraphNodeState {
  mastered,
  inProgress,
  notStarted,
  highlight,
}

/// A concept node in the knowledge / dependency graph.
class GraphNode {
  final String id;
  final double x;
  final double y;
  final String label;
  final GraphNodeState state;

  const GraphNode({
    required this.id,
    required this.x,
    required this.y,
    required this.label,
    this.state = GraphNodeState.notStarted,
  });
}

/// A directed edge connecting two nodes.
class GraphEdge {
  final String id;
  final String source;
  final String target;

  const GraphEdge({
    required this.id,
    required this.source,
    required this.target,
  });
}

/// GraphView — a read-only knowledge / dependency graph.
class RefractionGraphView extends StatelessWidget {
  /// Nodes to render.
  final List<GraphNode> nodes;

  /// Directed edges connecting nodes.
  final List<GraphEdge> edges;

  /// Called when a node chip is clicked.
  final ValueChanged<GraphNode>? onNodeClick;

  /// Show a legend summarising mastery-state counts.
  final bool showLegend;

  const RefractionGraphView({
    super.key,
    required this.nodes,
    required this.edges,
    this.onNodeClick,
    this.showLegend = false,
  });

  Map<GraphNodeState, int> _summarizeStates() {
    final counts = <GraphNodeState, int>{
      GraphNodeState.mastered: 0,
      GraphNodeState.inProgress: 0,
      GraphNodeState.notStarted: 0,
      GraphNodeState.highlight: 0,
    };
    for (final node in nodes) {
      counts[node.state] = (counts[node.state] ?? 0) + 1;
    }
    return counts;
  }

  CanvasBounds _computeBounds() {
    if (nodes.isEmpty) {
      return const CanvasBounds(minX: 0, minY: 0, maxX: 0, maxY: 0);
    }
    double minX = double.infinity;
    double minY = double.infinity;
    double maxX = -double.infinity;
    double maxY = -double.infinity;
    for (final n in nodes) {
      if (n.x < minX) minX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.x > maxX) maxX = n.x;
      if (n.y > maxY) maxY = n.y;
    }
    // Give some padding
    return CanvasBounds(
      minX: minX - 80,
      minY: minY - 80,
      maxX: maxX + 80,
      maxY: maxY + 80,
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    final bounds = _computeBounds();

    final double stackWidth = bounds.maxX > 0 ? bounds.maxX : 1.0;
    final double stackHeight = bounds.maxY > 0 ? bounds.maxY : 1.0;

    final summary = _summarizeStates();
    final legendOrder = [
      GraphNodeState.mastered,
      GraphNodeState.inProgress,
      GraphNodeState.notStarted,
      GraphNodeState.highlight,
    ];

    return Container(
      decoration: BoxDecoration(
        color: colors.background,
        borderRadius: BorderRadius.circular(theme.borderRadius),
        border: Border.all(color: colors.border),
      ),
      child: Stack(
        children: [
          Positioned.fill(
            child: RefractionInfiniteCanvas(
              showGrid: true,
              showControls: true,
              contentBounds: bounds,
              child: SizedBox(
                width: stackWidth,
                height: stackHeight,
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    // Edges layer
                    Positioned.fill(
                      child: CustomPaint(
                        painter: _GraphEdgePainter(
                          nodes: nodes,
                          edges: edges,
                          color: colors.border,
                        ),
                      ),
                    ),
                    // Nodes layer
                    for (final node in nodes)
                      Positioned(
                        left: node.x,
                        top: node.y,
                        child: FractionalTranslation(
                          translation: const Offset(-0.5, -0.5),
                          child: _buildNodeChip(context, node, colors, theme),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
          if (showLegend)
            Positioned(
              bottom: 12,
              left: 12,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  for (final state in legendOrder)
                    if ((summary[state] ?? 0) > 0) ...[
                      _buildLegendChip(context, state, summary[state]!, colors, theme),
                      const SizedBox(width: 6),
                    ],
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildNodeChip(
    BuildContext context,
    GraphNode node,
    dynamic colors,
    dynamic theme,
  ) {
    final bool interactive = onNodeClick != null;

    Color bgColor;
    Color textColor;
    BorderSide border = BorderSide.none;
    List<BoxShadow>? shadows;

    switch (node.state) {
      case GraphNodeState.mastered:
        bgColor = colors.primary;
        textColor = colors.primaryForeground;
        break;
      case GraphNodeState.inProgress:
        bgColor = colors.accent;
        textColor = colors.accentForeground;
        border = BorderSide(color: colors.ring, width: 2.0);
        break;
      case GraphNodeState.notStarted:
        bgColor = colors.muted;
        textColor = colors.mutedForeground;
        break;
      case GraphNodeState.highlight:
        bgColor = colors.background;
        textColor = colors.foreground;
        border = BorderSide(color: colors.primary, width: 1.5);
        shadows = theme.softShadow;
        break;
    }

    return Material(
      color: bgColor,
      type: MaterialType.canvas,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(theme.borderRadius),
        side: border,
      ),
      elevation: shadows != null ? 1.0 : 0.0,
      child: InkWell(
        borderRadius: BorderRadius.circular(theme.borderRadius),
        onTap: interactive ? () => onNodeClick?.call(node) : null,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          child: Text(
            node.label,
            style: TextStyle(
              color: textColor,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLegendChip(
    BuildContext context,
    GraphNodeState state,
    int count,
    dynamic colors,
    dynamic theme,
  ) {
    Color bgColor;
    Color textColor;
    BorderSide border = BorderSide.none;

    String labelText = '';
    switch (state) {
      case GraphNodeState.mastered:
        labelText = 'Mastered';
        bgColor = colors.primary;
        textColor = colors.primaryForeground;
        break;
      case GraphNodeState.inProgress:
        labelText = 'In Progress';
        bgColor = colors.accent;
        textColor = colors.accentForeground;
        border = BorderSide(color: colors.ring, width: 1.0);
        break;
      case GraphNodeState.notStarted:
        labelText = 'Not Started';
        bgColor = colors.muted;
        textColor = colors.mutedForeground;
        break;
      case GraphNodeState.highlight:
        labelText = 'Highlight';
        bgColor = colors.background;
        textColor = colors.foreground;
        border = BorderSide(color: colors.primary, width: 1.0);
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(theme.borderRadius),
        border: border != BorderSide.none ? Border.fromBorderSide(border) : null,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            labelText,
            style: TextStyle(
              color: textColor,
              fontSize: 10,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(width: 4),
          Text(
            '$count',
            style: TextStyle(
              color: textColor.withOpacity(0.7),
              fontSize: 10,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class _GraphEdgePainter extends CustomPainter {
  final List<GraphNode> nodes;
  final List<GraphEdge> edges;
  final Color color;

  _GraphEdgePainter({
    required this.nodes,
    required this.edges,
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color.withOpacity(0.6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    for (final edge in edges) {
      final source = _findNode(edge.source);
      final target = _findNode(edge.target);
      if (source == null || target == null) continue;

      final sx = source.x;
      final sy = source.y;
      final tx = target.x;
      final ty = target.y;

      final dy = (ty - sy).abs();
      final offset = math.max(dy * 0.5, 40.0);

      final path = Path();
      path.moveTo(sx, sy);
      path.cubicTo(sx, sy + offset, tx, ty - offset, tx, ty);
      canvas.drawPath(path, paint);
    }
  }

  GraphNode? _findNode(String id) {
    for (final node in nodes) {
      if (node.id == id) return node;
    }
    return null;
  }

  @override
  bool shouldRepaint(covariant _GraphEdgePainter oldDelegate) {
    return oldDelegate.nodes != nodes ||
        oldDelegate.edges != edges ||
        oldDelegate.color != color;
  }
}
