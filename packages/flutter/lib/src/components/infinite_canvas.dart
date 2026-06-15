import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// Transform state for an infinite canvas viewport.
class CanvasTransform {
  final double zoom;
  final double x;
  final double y;

  const CanvasTransform({
    required this.zoom,
    required this.x,
    required this.y,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CanvasTransform &&
          runtimeType == other.runtimeType &&
          zoom == other.zoom &&
          x == other.x &&
          y == other.y;

  @override
  int get hashCode => Object.hash(zoom, x, y);

  @override
  String toString() => 'CanvasTransform(zoom: $zoom, x: $x, y: $y)';
}

/// Axis-aligned bounding box of canvas content.
class CanvasBounds {
  final double minX;
  final double minY;
  final double maxX;
  final double maxY;

  const CanvasBounds({
    required this.minX,
    required this.minY,
    required this.maxX,
    required this.maxY,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CanvasBounds &&
          runtimeType == other.runtimeType &&
          minX == other.minX &&
          minY == other.minY &&
          maxX == other.maxX &&
          maxY == other.maxY;

  @override
  int get hashCode => Object.hash(minX, minY, maxX, maxY);
}

/// InfiniteCanvas — a pan/zoom viewport foundation.
class RefractionInfiniteCanvas extends StatefulWidget {
  /// Controlled zoom level.
  final double? zoom;

  /// Controlled pan offset (x).
  final double? x;

  /// Controlled pan offset (y).
  final double? y;

  /// Whether pointer-drag-to-pan is enabled (uncontrolled mode).
  final bool pan;

  /// Minimum zoom level (default 0.25).
  final double minZoom;

  /// Maximum zoom level (default 4.0).
  final double maxZoom;

  /// Show a dot-grid background.
  final bool showGrid;

  /// Show the zoom-controls overlay (+, −, fit).
  final bool showControls;

  /// Called when the transform changes (wheel or drag in uncontrolled mode).
  final ValueChanged<CanvasTransform>? onTransformChange;

  /// Content bounds used by the fit/reset control.
  final CanvasBounds? contentBounds;

  /// Children rendered on the infinite canvas.
  final Widget? child;

  const RefractionInfiniteCanvas({
    super.key,
    this.zoom,
    this.x,
    this.y,
    this.pan = true,
    this.minZoom = 0.25,
    this.maxZoom = 4.0,
    this.showGrid = false,
    this.showControls = false,
    this.onTransformChange,
    this.contentBounds,
    this.child,
  });

  @override
  State<RefractionInfiniteCanvas> createState() => _RefractionInfiniteCanvasState();
}

class _RefractionInfiniteCanvasState extends State<RefractionInfiniteCanvas> {
  double _zoom = 1.0;
  double _x = 0.0;
  double _y = 0.0;

  double get zoom => widget.zoom ?? _zoom;
  double get x => widget.x ?? _x;
  double get y => widget.y ?? _y;

  double _startZoom = 1.0;
  Offset _startOffset = Offset.zero;
  Offset _startPan = Offset.zero;

  void _applyTransform(CanvasTransform next) {
    if (widget.zoom == null && widget.x == null && widget.y == null) {
      setState(() {
        _zoom = next.zoom;
        _x = next.x;
        _y = next.y;
      });
    }
    widget.onTransformChange?.call(next);
  }

  void _handleScaleStart(ScaleStartDetails details) {
    if (!widget.pan) return;
    _startZoom = zoom;
    _startPan = Offset(x, y);
    _startOffset = details.localFocalPoint;
  }

  void _handleScaleUpdate(ScaleUpdateDetails details) {
    if (!widget.pan) return;
    final double nextZoom = (_startZoom * details.scale).clamp(widget.minZoom, widget.maxZoom);
    final Offset delta = details.localFocalPoint - _startOffset;
    final double nextX = _startPan.dx + delta.dx;
    final double nextY = _startPan.dy + delta.dy;

    final next = CanvasTransform(zoom: nextZoom, x: nextX, y: nextY);
    _applyTransform(next);
  }

  void _handleZoomIn() {
    final nextZoom = (zoom * 1.25).clamp(widget.minZoom, widget.maxZoom);
    _applyTransform(CanvasTransform(zoom: nextZoom, x: x, y: y));
  }

  void _handleZoomOut() {
    final nextZoom = (zoom / 1.25).clamp(widget.minZoom, widget.maxZoom);
    _applyTransform(CanvasTransform(zoom: nextZoom, x: x, y: y));
  }

  void _handleFit(Size viewportSize) {
    final bounds = widget.contentBounds;
    if (bounds != null && viewportSize.width > 0 && viewportSize.height > 0) {
      const double padding = 32.0;
      final double contentW = bounds.maxX - bounds.minX;
      final double contentH = bounds.maxY - bounds.minY;

      if (contentW > 0 && contentH > 0) {
        final double availW = viewportSize.width - padding * 2;
        final double availH = viewportSize.height - padding * 2;
        final double rawZoom = (availW / contentW < availH / contentH) ? (availW / contentW) : (availH / contentH);
        final double nextZoom = rawZoom.clamp(widget.minZoom, widget.maxZoom);

        final double scaledW = contentW * nextZoom;
        final double scaledH = contentH * nextZoom;
        final double nextX = (viewportSize.width - scaledW) / 2 - bounds.minX * nextZoom;
        final double nextY = (viewportSize.height - scaledH) / 2 - bounds.minY * nextZoom;

        _applyTransform(CanvasTransform(zoom: nextZoom, x: nextX, y: nextY));
        return;
      }
    }
    _applyTransform(const CanvasTransform(zoom: 1.0, x: 0.0, y: 0.0));
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    return LayoutBuilder(
      builder: (context, constraints) {
        final Size viewportSize = Size(constraints.maxWidth, constraints.maxHeight);

        Widget content = Container(
          color: colors.background,
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              if (widget.showGrid)
                Positioned.fill(
                  child: CustomPaint(
                    painter: _InfiniteCanvasGridPainter(
                      color: colors.border,
                      zoom: zoom,
                      x: x,
                      y: y,
                    ),
                  ),
                ),
              Positioned(
                left: x,
                top: y,
                child: Transform.scale(
                  scale: zoom,
                  alignment: Alignment.topLeft,
                  child: widget.child,
                ),
              ),
            ],
          ),
        );

        if (widget.pan) {
          content = Listener(
            onPointerSignal: (pointerSignal) {
              if (pointerSignal is PointerScrollEvent) {
                final double delta = -pointerSignal.scrollDelta.dy * 0.001;
                final double nextZoom = (zoom + zoom * delta).clamp(widget.minZoom, widget.maxZoom);
                _applyTransform(CanvasTransform(zoom: nextZoom, x: x, y: y));
              }
            },
            child: GestureDetector(
              onScaleStart: _handleScaleStart,
              onScaleUpdate: _handleScaleUpdate,
              child: content,
            ),
          );
        }

        return Stack(
          children: [
            Positioned.fill(child: content),
            if (widget.showControls)
              Positioned(
                bottom: 16,
                right: 16,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _buildZoomButton(
                      label: '+',
                      tooltip: 'Zoom in',
                      onPressed: _handleZoomIn,
                      colors: colors,
                      theme: theme,
                    ),
                    const SizedBox(width: 4),
                    _buildZoomButton(
                      label: '−',
                      tooltip: 'Zoom out',
                      onPressed: _handleZoomOut,
                      colors: colors,
                      theme: theme,
                    ),
                    const SizedBox(width: 4),
                    _buildZoomButton(
                      label: '⊞',
                      tooltip: 'Fit to content',
                      onPressed: () => _handleFit(viewportSize),
                      colors: colors,
                      theme: theme,
                    ),
                  ],
                ),
              ),
          ],
        );
      },
    );
  }

  Widget _buildZoomButton({
    required String label,
    required String tooltip,
    required VoidCallback onPressed,
    required dynamic colors,
    required dynamic theme,
  }) {
    return Material(
      color: colors.card,
      type: MaterialType.canvas,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(theme.borderRadius),
        side: BorderSide(color: colors.border),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(theme.borderRadius),
        onTap: onPressed,
        child: Container(
          width: 32,
          height: 32,
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              color: colors.foreground,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }
}

class _InfiniteCanvasGridPainter extends CustomPainter {
  final Color color;
  final double zoom;
  final double x;
  final double y;

  _InfiniteCanvasGridPainter({
    required this.color,
    required this.zoom,
    required this.x,
    required this.y,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final double spacing = 24.0 * zoom;
    final double startX = x % spacing;
    final double startY = y % spacing;

    for (double px = startX - spacing; px < size.width + spacing; px += spacing) {
      for (double py = startY - spacing; py < size.height + spacing; py += spacing) {
        canvas.drawCircle(Offset(px, py), 1.0, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _InfiniteCanvasGridPainter oldDelegate) {
    return oldDelegate.color != color ||
        oldDelegate.zoom != zoom ||
        oldDelegate.x != x ||
        oldDelegate.y != y;
  }
}
