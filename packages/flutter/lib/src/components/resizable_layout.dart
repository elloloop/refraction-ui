import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A split-view layout with draggable handles to resize the panels.
/// Supports both horizontal and vertical orientations.
class RefractionResizableLayout extends StatefulWidget {
  /// The widgets to display within the resizable panels.
  final List<Widget> children;

  /// The orientation of the layout (horizontal or vertical).
  final Axis direction;

  /// Initial sizes in percentages (0.0 to 100.0). Should sum to 100.
  final List<double>? defaultSizes;

  /// Minimum sizes in percentages (0.0 to 100.0) for each panel.
  final List<double>? minSizes;

  /// Maximum sizes in percentages (0.0 to 100.0) for each panel.
  final List<double>? maxSizes;

  /// Callback when a resize operation changes the sizes.
  final ValueChanged<List<double>>? onResize;

  const RefractionResizableLayout({
    super.key,
    required this.children,
    this.direction = Axis.horizontal,
    this.defaultSizes,
    this.minSizes,
    this.maxSizes,
    this.onResize,
  }) : assert(
         children.length >= 2,
         'RefractionResizableLayout requires at least 2 children.',
       );

  @override
  State<RefractionResizableLayout> createState() =>
      _RefractionResizableLayoutState();
}

class _RefractionResizableLayoutState extends State<RefractionResizableLayout> {
  late List<double> _sizes;
  int? _resizingIndex;
  int? _hoveredIndex;

  @override
  void initState() {
    super.initState();
    _initSizes();
  }

  @override
  void didUpdateWidget(covariant RefractionResizableLayout oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.defaultSizes != oldWidget.defaultSizes ||
        widget.children.length != oldWidget.children.length) {
      if (widget.children.length != _sizes.length) {
        _initSizes();
      }
    }
  }

  void _initSizes() {
    int length = widget.children.length;
    if (widget.defaultSizes != null && widget.defaultSizes!.length == length) {
      _sizes = List.from(widget.defaultSizes!);
    } else {
      double equalSize = 100.0 / length;
      _sizes = List.filled(length, equalSize);
    }
  }

  double _getMinSize(int index) {
    if (widget.minSizes != null && widget.minSizes!.length > index) {
      return widget.minSizes![index];
    }
    return 0.0;
  }

  double _getMaxSize(int index) {
    if (widget.maxSizes != null && widget.maxSizes!.length > index) {
      return widget.maxSizes![index];
    }
    return 100.0;
  }

  double _clamp(double value, double min, double max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
  }

  void _onPanStart(DragStartDetails details, int index) {
    setState(() {
      _resizingIndex = index;
    });
  }

  void _onPanUpdate(DragUpdateDetails details, int index, double totalSize) {
    if (_resizingIndex == null || totalSize <= 0) return;

    double delta = widget.direction == Axis.horizontal
        ? details.delta.dx
        : details.delta.dy;
    double deltaPercent = (delta / totalSize) * 100.0;

    int i = index;
    int j = index + 1;

    setState(() {
      double newSizeI = _sizes[i] + deltaPercent;
      newSizeI = _clamp(newSizeI, _getMinSize(i), _getMaxSize(i));

      double actualDelta = newSizeI - _sizes[i];

      double newSizeJ = _sizes[j] - actualDelta;
      newSizeJ = _clamp(newSizeJ, _getMinSize(j), _getMaxSize(j));

      actualDelta = _sizes[j] - newSizeJ;
      newSizeI = _sizes[i] + actualDelta;

      _sizes[i] = newSizeI;
      _sizes[j] = newSizeJ;

      if (widget.onResize != null) {
        widget.onResize!(_sizes);
      }
    });
  }

  void _onPanEnd() {
    setState(() {
      _resizingIndex = null;
    });
  }

  Widget _buildDivider(BuildContext context, int index, double totalSize) {
    final theme = RefractionTheme.of(context);
    final isHovered = _hoveredIndex == index;
    final isDragging = _resizingIndex == index;

    return MouseRegion(
      cursor: widget.direction == Axis.horizontal
          ? SystemMouseCursors.resizeLeftRight
          : SystemMouseCursors.resizeUpDown,
      onEnter: (_) => setState(() => _hoveredIndex = index),
      onExit: (_) => setState(() => _hoveredIndex = null),
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onPanStart: (details) => _onPanStart(details, index),
        onPanUpdate: (details) => _onPanUpdate(details, index, totalSize),
        onPanEnd: (_) => _onPanEnd(),
        onPanCancel: () => _onPanEnd(),
        child: Container(
          width: widget.direction == Axis.horizontal ? 8.0 : double.infinity,
          height: widget.direction == Axis.vertical ? 8.0 : double.infinity,
          alignment: Alignment.center,
          child: Container(
            width: widget.direction == Axis.horizontal ? 2.0 : double.infinity,
            height: widget.direction == Axis.vertical ? 2.0 : double.infinity,
            color: (isHovered || isDragging)
                ? theme.colors.primary
                : theme.colors.border,
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final double maxConstraint = widget.direction == Axis.horizontal
            ? constraints.maxWidth
            : constraints.maxHeight;

        final double dividerSize = 8.0;
        final int numDividers = widget.children.length - 1;
        final double totalSizeForChildren =
            maxConstraint - (numDividers * dividerSize);

        List<Widget> flexChildren = [];
        for (int i = 0; i < widget.children.length; i++) {
          flexChildren.add(
            Flexible(
              flex: (_sizes[i] * 1000).toInt().clamp(
                1,
                double.maxFinite.toInt(),
              ),
              child: SizedBox(
                width: widget.direction == Axis.horizontal
                    ? double.infinity
                    : null,
                height: widget.direction == Axis.vertical
                    ? double.infinity
                    : null,
                child: widget.children[i],
              ),
            ),
          );

          if (i < widget.children.length - 1) {
            flexChildren.add(_buildDivider(context, i, totalSizeForChildren));
          }
        }

        return Flex(
          direction: widget.direction,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: flexChildren,
        );
      },
    );
  }
}
