import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A rectangle in 2-D space.
class MiniMapRect {
  final double x;
  final double y;
  final double width;
  final double height;

  const MiniMapRect({
    required this.x,
    required this.y,
    required this.width,
    required this.height,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is MiniMapRect &&
          runtimeType == other.runtimeType &&
          x == other.x &&
          y == other.y &&
          width == other.width &&
          height == other.height;

  @override
  int get hashCode => Object.hash(x, y, width, height);

  @override
  String toString() => 'MiniMapRect(x: $x, y: $y, width: $width, height: $height)';
}

/// A single item to be represented as a dot on the minimap.
class MiniMapItem {
  final String id;
  final double x;
  final double y;
  final double? width;
  final double? height;

  const MiniMapItem({
    required this.id,
    required this.x,
    required this.y,
    this.width,
    this.height,
  });
}

/// MiniMap — a canvas/editor overview map.
class RefractionMiniMap extends StatefulWidget {
  /// Items to render as dots on the minimap.
  final List<MiniMapItem> items;

  /// Current viewport in world coordinates. Renders a viewport indicator rect.
  final MiniMapRect? viewport;

  /// Width of the minimap box in px.
  final double width;

  /// Height of the minimap box in px.
  final double height;

  /// Padding inset in px (applied to all sides).
  final double padding;

  /// Called when the user clicks or drags in the minimap, with the new
  /// world-space viewport center `{ x, y }`.
  final ValueChanged<Offset>? onViewportChange;

  const RefractionMiniMap({
    super.key,
    required this.items,
    this.viewport,
    this.width = 200.0,
    this.height = 140.0,
    this.padding = 8.0,
    this.onViewportChange,
  });

  @override
  State<RefractionMiniMap> createState() => _RefractionMiniMapState();
}

class _RefractionMiniMapState extends State<RefractionMiniMap> {
  bool _isDragging = false;

  MiniMapRect _computeContentBounds() {
    if (widget.items.isEmpty) {
      return const MiniMapRect(x: 0, y: 0, width: 0, height: 0);
    }

    double minX = double.infinity;
    double minY = double.infinity;
    double maxX = -double.infinity;
    double maxY = -double.infinity;

    for (final item in widget.items) {
      final double right = item.x + (item.width ?? 0.0);
      final double bottom = item.y + (item.height ?? 0.0);
      if (item.x < minX) minX = item.x;
      if (item.y < minY) minY = item.y;
      if (right > maxX) maxX = right;
      if (bottom > maxY) maxY = bottom;
    }

    return MiniMapRect(x: minX, y: minY, width: maxX - minX, height: maxY - minY);
  }

  double _computeMiniScale(MiniMapRect bounds) {
    final double availW = widget.width - widget.padding * 2.0;
    final double availH = widget.height - widget.padding * 2.0;
    if (availW <= 0.0 || availH <= 0.0) return 1.0;
    if (bounds.width == 0.0 || bounds.height == 0.0) return 1.0;
    return (availW / bounds.width < availH / bounds.height)
        ? (availW / bounds.width)
        : (availH / bounds.height);
  }

  Offset _worldToMini(Offset point, MiniMapRect bounds, double scale) {
    return Offset(
      (point.dx - bounds.x) * scale + widget.padding,
      (point.dy - bounds.y) * scale + widget.padding,
    );
  }

  Offset _miniToWorld(Offset miniPoint, MiniMapRect bounds, double scale) {
    return Offset(
      (miniPoint.dx - widget.padding) / scale + bounds.x,
      (miniPoint.dy - widget.padding) / scale + bounds.y,
    );
  }

  void _handleGesture(Offset localPosition, MiniMapRect bounds, double scale) {
    if (widget.onViewportChange == null) return;
    final worldOffset = _miniToWorld(localPosition, bounds, scale);
    widget.onViewportChange?.call(worldOffset);
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    final bounds = _computeContentBounds();
    final scale = _computeMiniScale(bounds);

    Offset? viewportPos;
    double? viewportW;
    double? viewportH;

    if (widget.viewport != null) {
      final miniPoint = _worldToMini(
        Offset(widget.viewport!.x, widget.viewport!.y),
        bounds,
        scale,
      );
      viewportPos = miniPoint;
      viewportW = widget.viewport!.width * scale;
      viewportH = widget.viewport!.height * scale;
    }

    Widget content = Container(
      width: widget.width,
      height: widget.height,
      decoration: BoxDecoration(
        color: colors.card,
        borderRadius: BorderRadius.circular(theme.borderRadius),
        border: Border.all(color: colors.border),
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Dots represent items
          for (final item in widget.items) ...[
            () {
              final pos = _worldToMini(Offset(item.x, item.y), bounds, scale);
              final w = mathMax(4.0, (item.width ?? 8.0) * scale);
              final h = mathMax(4.0, (item.height ?? 8.0) * scale);
              return Positioned(
                left: pos.dx,
                top: pos.dy,
                width: w,
                height: h,
                child: Container(
                  decoration: BoxDecoration(
                    color: colors.muted,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              );
            }(),
          ],
          // Viewport indicator
          if (viewportPos != null && viewportW != null && viewportH != null)
            Positioned(
              left: viewportPos.dx,
              top: viewportPos.dy,
              width: viewportW,
              height: viewportH,
              child: Container(
                decoration: BoxDecoration(
                  color: colors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(2),
                  border: Border.all(color: colors.primary, width: 1.5),
                ),
              ),
            ),
        ],
      ),
    );

    if (widget.onViewportChange != null) {
      content = GestureDetector(
        onPanStart: (details) {
          setState(() {
            _isDragging = true;
          });
          _handleGesture(details.localPosition, bounds, scale);
        },
        onPanUpdate: (details) {
          if (_isDragging) {
            _handleGesture(details.localPosition, bounds, scale);
          }
        },
        onPanEnd: (details) {
          setState(() {
            _isDragging = false;
          });
        },
        onTapDown: (details) {
          _handleGesture(details.localPosition, bounds, scale);
        },
        child: MouseRegion(
          cursor: _isDragging ? SystemMouseCursors.grabbing : SystemMouseCursors.grab,
          child: content,
        ),
      );
    }

    return content;
  }

  double mathMax(double a, double b) => a > b ? a : b;
}
