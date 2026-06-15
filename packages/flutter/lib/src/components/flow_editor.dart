import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import 'infinite_canvas.dart';

/// A node in the flow editor canvas.
class FlowNode {
  final String id;
  final double x;
  final double y;
  final double? width;
  final double? height;
  final String label;
  final bool selected;

  const FlowNode({
    required this.id,
    required this.x,
    required this.y,
    this.width,
    this.height,
    required this.label,
    this.selected = false,
  });

  FlowNode copyWith({
    String? id,
    double? x,
    double? y,
    double? width,
    double? height,
    String? label,
    bool? selected,
  }) {
    return FlowNode(
      id: id ?? this.id,
      x: x ?? this.x,
      y: y ?? this.y,
      width: width ?? this.width,
      height: height ?? this.height,
      label: label ?? this.label,
      selected: selected ?? this.selected,
    );
  }
}

/// A directed edge connecting two nodes.
class FlowEdge {
  final String id;
  final String source;
  final String target;
  final String? label;

  const FlowEdge({
    required this.id,
    required this.source,
    required this.target,
    this.label,
  });
}

/// FlowEditor — a node-and-edge diagram editor.
class RefractionFlowEditor extends StatelessWidget {
  /// The nodes to render on the canvas.
  final List<FlowNode> nodes;

  /// The directed edges connecting nodes.
  final List<FlowEdge> edges;

  /// Called when a node is clicked; receives the node's id.
  final ValueChanged<String>? onNodeClick;

  /// Called when a node has been dragged to a new position.
  final void Function(String id, double x, double y)? onNodeMove;

  /// Override the rendering of individual node boxes.
  final Widget Function(FlowNode node)? renderNode;

  /// Id of the currently selected node (controlled).
  final String? selectedId;

  /// Whether to show the pan/zoom grid.
  final bool showGrid;

  /// Whether to show zoom/pan controls.
  final bool showControls;

  const RefractionFlowEditor({
    super.key,
    required this.nodes,
    required this.edges,
    this.onNodeClick,
    this.onNodeMove,
    this.renderNode,
    this.selectedId,
    this.showGrid = true,
    this.showControls = true,
  });

  CanvasBounds _computeBounds() {
    if (nodes.isEmpty) {
      return const CanvasBounds(minX: 0, minY: 0, maxX: 0, maxY: 0);
    }
    double minX = double.infinity;
    double minY = double.infinity;
    double maxX = -double.infinity;
    double maxY = -double.infinity;
    for (final node in nodes) {
      final double w = node.width ?? 160.0;
      final double h = node.height ?? 48.0;
      if (node.x < minX) minX = node.x;
      if (node.y < minY) minY = node.y;
      if (node.x + w > maxX) maxX = node.x + w;
      if (node.y + h > maxY) maxY = node.y + h;
    }
    return CanvasBounds(minX: minX, minY: minY, maxX: maxX, maxY: maxY);
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    final bounds = _computeBounds();

    final double stackWidth = bounds.maxX > 0 ? bounds.maxX : 1.0;
    final double stackHeight = bounds.maxY > 0 ? bounds.maxY : 1.0;

    return RefractionInfiniteCanvas(
      showGrid: showGrid,
      showControls: showControls,
      contentBounds: bounds,
      child: SizedBox(
        width: stackWidth,
        height: stackHeight,
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            // Edge layer
            Positioned.fill(
              child: CustomPaint(
                painter: _FlowEdgePainter(
                  nodes: nodes,
                  edges: edges,
                  color: colors.mutedForeground,
                ),
              ),
            ),
            // Node layer
            for (final node in nodes)
              _FlowNodeWidget(
                node: node,
                theme: theme,
                colors: colors,
                isSelected: node.selected || node.id == selectedId,
                renderNode: renderNode,
                onNodeClick: onNodeClick,
                onNodeMove: onNodeMove,
              ),
          ],
        ),
      ),
    );
  }
}

class _FlowNodeWidget extends StatefulWidget {
  final FlowNode node;
  final dynamic theme;
  final dynamic colors;
  final bool isSelected;
  final Widget Function(FlowNode node)? renderNode;
  final ValueChanged<String>? onNodeClick;
  final void Function(String id, double x, double y)? onNodeMove;

  const _FlowNodeWidget({
    required this.node,
    required this.theme,
    required this.colors,
    required this.isSelected,
    this.renderNode,
    this.onNodeClick,
    this.onNodeMove,
  });

  @override
  State<_FlowNodeWidget> createState() => _FlowNodeWidgetState();
}

class _FlowNodeWidgetState extends State<_FlowNodeWidget> {
  double _startX = 0.0;
  double _startY = 0.0;

  @override
  Widget build(BuildContext context) {
    final double width = widget.node.width ?? 160.0;
    final double height = widget.node.height ?? 48.0;

    Widget child = Material(
      color: widget.colors.card,
      type: MaterialType.canvas,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(widget.theme.borderRadius),
        side: BorderSide(
          color: widget.isSelected ? widget.colors.primary : widget.colors.border,
          width: widget.isSelected ? 2.0 : 1.0,
        ),
      ),
      elevation: 1.0,
      child: InkWell(
        borderRadius: BorderRadius.circular(widget.theme.borderRadius),
        onTap: () => widget.onNodeClick?.call(widget.node.id),
        child: Container(
          width: width,
          height: height,
          alignment: Alignment.center,
          padding: const EdgeInsets.all(8),
          child: widget.renderNode != null
              ? widget.renderNode!(widget.node)
              : Text(
                  widget.node.label,
                  style: TextStyle(
                    color: widget.colors.foreground,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                ),
        ),
      ),
    );

    if (widget.onNodeMove != null) {
      child = GestureDetector(
        onPanStart: (details) {
          _startX = widget.node.x;
          _startY = widget.node.y;
        },
        onPanUpdate: (details) {
          _startX += details.delta.dx;
          _startY += details.delta.dy;
          widget.onNodeMove?.call(widget.node.id, _startX, _startY);
        },
        child: child,
      );
    }

    return Positioned(
      left: widget.node.x,
      top: widget.node.y,
      child: child,
    );
  }
}

class _FlowEdgePainter extends CustomPainter {
  final List<FlowNode> nodes;
  final List<FlowEdge> edges;
  final Color color;

  _FlowEdgePainter({
    required this.nodes,
    required this.edges,
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    for (final edge in edges) {
      final source = _findNode(edge.source);
      final target = _findNode(edge.target);
      if (source == null || target == null) continue;

      final sw = source.width ?? 160.0;
      final sh = source.height ?? 48.0;
      final th = target.height ?? 48.0;

      final x1 = source.x + sw;
      final y1 = source.y + sh / 2.0;
      final x2 = target.x;
      final y2 = target.y + th / 2.0;

      final dx = (x2 - x1).abs();
      final handleLen = dx * 0.5 > 40.0 ? dx * 0.5 : 40.0;

      final cx1 = x1 + handleLen;
      final cy1 = y1;
      final cx2 = x2 - handleLen;
      final cy2 = y2;

      final path = Path();
      path.moveTo(x1, y1);
      path.cubicTo(cx1, cy1, cx2, cy2, x2, y2);
      canvas.drawPath(path, paint);

      if (edge.label != null) {
        final double mx = (x1 + x2) / 2.0;
        final double my = (y1 + y2) / 2.0;

        final textPainter = TextPainter(
          text: TextSpan(
            text: edge.label,
            style: TextStyle(
              color: color,
              fontSize: 10,
              fontWeight: FontWeight.w500,
              backgroundColor: Colors.white.withOpacity(0.8),
            ),
          ),
          textDirection: TextDirection.ltr,
        );
        textPainter.layout();
        textPainter.paint(
          canvas,
          Offset(mx - textPainter.width / 2, my - textPainter.height / 2),
        );
      }
    }
  }

  FlowNode? _findNode(String id) {
    for (final node in nodes) {
      if (node.id == id) return node;
    }
    return null;
  }

  @override
  bool shouldRepaint(covariant _FlowEdgePainter oldDelegate) {
    return oldDelegate.nodes != nodes ||
        oldDelegate.edges != edges ||
        oldDelegate.color != color;
  }
}
