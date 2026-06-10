import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A single data point for Refraction charts.
class RefractionChartDataPoint {
  final double x;
  final double y;
  final Color? color;

  const RefractionChartDataPoint({
    required this.x,
    required this.y,
    this.color,
  });
}

/// A line chart component.
class RefractionLineChart extends StatelessWidget {
  final List<RefractionChartDataPoint> data;
  final double? minX;
  final double? maxX;
  final double? minY;
  final double? maxY;
  final Color? lineColor;
  final double lineWidth;
  final bool showGrid;
  final bool showDots;
  final bool fillArea;
  final EdgeInsetsGeometry padding;

  const RefractionLineChart({
    super.key,
    required this.data,
    this.minX,
    this.maxX,
    this.minY,
    this.maxY,
    this.lineColor,
    this.lineWidth = 2.0,
    this.showGrid = true,
    this.showDots = false,
    this.fillArea = false,
    this.padding = const EdgeInsets.all(16.0),
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final effectiveLineColor = lineColor ?? theme.colors.primary;

    return Padding(
      padding: padding,
      child: CustomPaint(
        size: Size.infinite,
        painter: _LineChartPainter(
          data: data,
          minX: minX,
          maxX: maxX,
          minY: minY,
          maxY: maxY,
          lineColor: effectiveLineColor,
          lineWidth: lineWidth,
          showGrid: showGrid,
          showDots: showDots,
          fillArea: fillArea,
          gridColor: theme.colors.border,
          backgroundColor: theme.colors.background,
        ),
      ),
    );
  }
}

class _LineChartPainter extends CustomPainter {
  final List<RefractionChartDataPoint> data;
  final double? minX;
  final double? maxX;
  final double? minY;
  final double? maxY;
  final Color lineColor;
  final double lineWidth;
  final bool showGrid;
  final bool showDots;
  final bool fillArea;
  final Color gridColor;
  final Color backgroundColor;

  _LineChartPainter({
    required this.data,
    required this.minX,
    required this.maxX,
    required this.minY,
    required this.maxY,
    required this.lineColor,
    required this.lineWidth,
    required this.showGrid,
    required this.showDots,
    required this.fillArea,
    required this.gridColor,
    required this.backgroundColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (data.isEmpty) return;
    if (size.width <= 0 || size.height <= 0) return;

    double actualMinX = minX ?? data.map((e) => e.x).reduce(math.min);
    double actualMaxX = maxX ?? data.map((e) => e.x).reduce(math.max);
    double actualMinY = minY ?? data.map((e) => e.y).reduce(math.min);
    double actualMaxY = maxY ?? data.map((e) => e.y).reduce(math.max);

    if (actualMinX == actualMaxX) {
      actualMinX -= 1;
      actualMaxX += 1;
    }
    if (actualMinY == actualMaxY) {
      actualMinY -= 1;
      actualMaxY += 1;
    }

    // Draw Grid
    if (showGrid) {
      final gridPaint = Paint()
        ..color = gridColor
        ..strokeWidth = 1.0
        ..style = PaintingStyle.stroke;

      const int gridLines = 5;
      for (int i = 0; i <= gridLines; i++) {
        double y = size.height - (i * size.height / gridLines);
        canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);

        double x = i * size.width / gridLines;
        canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
      }
    }

    final path = Path();
    bool first = true;

    final points = <Offset>[];

    for (var point in data) {
      double x =
          (point.x - actualMinX) / (actualMaxX - actualMinX) * size.width;
      double y =
          size.height -
          ((point.y - actualMinY) / (actualMaxY - actualMinY) * size.height);
      points.add(Offset(x, y));

      if (first) {
        path.moveTo(x, y);
        first = false;
      } else {
        path.lineTo(x, y);
      }
    }

    if (fillArea && points.isNotEmpty) {
      final fillPath = Path.from(path);
      fillPath.lineTo(points.last.dx, size.height);
      fillPath.lineTo(points.first.dx, size.height);
      fillPath.close();

      final fillPaint = Paint()
        ..color = lineColor.withValues(alpha: 0.2)
        ..style = PaintingStyle.fill;
      canvas.drawPath(fillPath, fillPaint);
    }

    final linePaint = Paint()
      ..color = lineColor
      ..strokeWidth = lineWidth
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    canvas.drawPath(path, linePaint);

    if (showDots) {
      final dotPaint = Paint()
        ..color = lineColor
        ..style = PaintingStyle.fill;
      final dotBorderPaint = Paint()
        ..color = backgroundColor
        ..style = PaintingStyle.fill;

      for (var point in points) {
        canvas.drawCircle(point, lineWidth * 2, dotBorderPaint);
        canvas.drawCircle(point, lineWidth * 1.5, dotPaint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _LineChartPainter oldDelegate) {
    return data != oldDelegate.data ||
        minX != oldDelegate.minX ||
        maxX != oldDelegate.maxX ||
        minY != oldDelegate.minY ||
        maxY != oldDelegate.maxY ||
        lineColor != oldDelegate.lineColor ||
        lineWidth != oldDelegate.lineWidth ||
        showGrid != oldDelegate.showGrid ||
        showDots != oldDelegate.showDots ||
        fillArea != oldDelegate.fillArea ||
        gridColor != oldDelegate.gridColor ||
        backgroundColor != oldDelegate.backgroundColor;
  }
}

/// A bar chart component.
class RefractionBarChart extends StatelessWidget {
  final List<RefractionChartDataPoint> data;
  final double? maxY;
  final Color? barColor;
  final double barSpacing;
  final bool showGrid;
  final BorderRadius? borderRadius;
  final EdgeInsetsGeometry padding;

  const RefractionBarChart({
    super.key,
    required this.data,
    this.maxY,
    this.barColor,
    this.barSpacing = 8.0,
    this.showGrid = true,
    this.borderRadius,
    this.padding = const EdgeInsets.all(16.0),
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final effectiveBarColor = barColor ?? theme.colors.primary;

    return Padding(
      padding: padding,
      child: CustomPaint(
        size: Size.infinite,
        painter: _BarChartPainter(
          data: data,
          maxY: maxY,
          barColor: effectiveBarColor,
          barSpacing: barSpacing,
          showGrid: showGrid,
          borderRadius: borderRadius ?? BorderRadius.circular(4.0),
          gridColor: theme.colors.border,
        ),
      ),
    );
  }
}

class _BarChartPainter extends CustomPainter {
  final List<RefractionChartDataPoint> data;
  final double? maxY;
  final Color barColor;
  final double barSpacing;
  final bool showGrid;
  final BorderRadius borderRadius;
  final Color gridColor;

  _BarChartPainter({
    required this.data,
    required this.maxY,
    required this.barColor,
    required this.barSpacing,
    required this.showGrid,
    required this.borderRadius,
    required this.gridColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (data.isEmpty) return;
    if (size.width <= 0 || size.height <= 0) return;

    double actualMaxY = maxY ?? data.map((e) => e.y).reduce(math.max);
    double actualMinY = 0; // Bar charts typically start from 0 for Y axis

    if (actualMaxY <= 0) {
      actualMaxY = 1;
    }

    if (showGrid) {
      final gridPaint = Paint()
        ..color = gridColor
        ..strokeWidth = 1.0
        ..style = PaintingStyle.stroke;

      const int gridLines = 5;
      for (int i = 0; i <= gridLines; i++) {
        double y = size.height - (i * size.height / gridLines);
        canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
      }
    }

    final barCount = data.length;
    final totalSpacing = barSpacing * (barCount - 1);
    final availableWidth = math.max(0.0, size.width - totalSpacing);
    final barWidth = barCount > 0 ? availableWidth / barCount : 0.0;

    for (int i = 0; i < data.length; i++) {
      final point = data[i];
      final x = i * (barWidth + barSpacing);

      double normalizedY = (point.y - actualMinY) / (actualMaxY - actualMinY);
      normalizedY = normalizedY.clamp(0.0, 1.0);
      final barHeight = normalizedY * size.height;
      final y = size.height - barHeight;

      final paint = Paint()
        ..color = point.color ?? barColor
        ..style = PaintingStyle.fill;

      final rect = Rect.fromLTWH(x, y, barWidth, barHeight);
      final rrect = RRect.fromRectAndCorners(
        rect,
        topLeft: borderRadius.topLeft,
        topRight: borderRadius.topRight,
        bottomLeft: borderRadius.bottomLeft,
        bottomRight: borderRadius.bottomRight,
      );

      canvas.drawRRect(rrect, paint);
    }
  }

  @override
  bool shouldRepaint(covariant _BarChartPainter oldDelegate) {
    return data != oldDelegate.data ||
        maxY != oldDelegate.maxY ||
        barColor != oldDelegate.barColor ||
        barSpacing != oldDelegate.barSpacing ||
        showGrid != oldDelegate.showGrid ||
        borderRadius != oldDelegate.borderRadius ||
        gridColor != oldDelegate.gridColor;
  }
}

/// A single data point for pie charts.
class RefractionPieChartDataPoint {
  final double value;
  final Color color;
  final String? label;

  const RefractionPieChartDataPoint({
    required this.value,
    required this.color,
    this.label,
  });
}

/// A pie/donut chart component.
class RefractionPieChart extends StatelessWidget {
  final List<RefractionPieChartDataPoint> data;
  final double holeRadius;
  final EdgeInsetsGeometry padding;

  const RefractionPieChart({
    super.key,
    required this.data,
    this.holeRadius = 0.0,
    this.padding = const EdgeInsets.all(16.0),
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: padding,
      child: CustomPaint(
        size: Size.infinite,
        painter: _PieChartPainter(data: data, holeRadius: holeRadius),
      ),
    );
  }
}

class _PieChartPainter extends CustomPainter {
  final List<RefractionPieChartDataPoint> data;
  final double holeRadius;

  _PieChartPainter({required this.data, required this.holeRadius});

  @override
  void paint(Canvas canvas, Size size) {
    if (data.isEmpty) return;
    if (size.width <= 0 || size.height <= 0) return;

    final totalValue = data.fold<double>(0.0, (sum, item) => sum + item.value);
    if (totalValue <= 0) return;

    final center = Offset(size.width / 2, size.height / 2);
    final maxRadius = math.min(size.width / 2, size.height / 2);

    if (holeRadius >= maxRadius) return;

    double currentAngle = -math.pi / 2;

    if (holeRadius > 0) {
      // Draw donut chart using strokes
      final strokeWidth = maxRadius - holeRadius;
      final radius = holeRadius + strokeWidth / 2;

      for (final point in data) {
        final sweepAngle = (point.value / totalValue) * 2 * math.pi;

        final paint = Paint()
          ..color = point.color
          ..style = PaintingStyle.stroke
          ..strokeWidth = strokeWidth;

        canvas.drawArc(
          Rect.fromCircle(center: center, radius: radius),
          currentAngle,
          sweepAngle,
          false,
          paint,
        );

        currentAngle += sweepAngle;
      }
    } else {
      // Draw pie chart
      for (final point in data) {
        final sweepAngle = (point.value / totalValue) * 2 * math.pi;

        final paint = Paint()
          ..color = point.color
          ..style = PaintingStyle.fill;

        canvas.drawArc(
          Rect.fromCircle(center: center, radius: maxRadius),
          currentAngle,
          sweepAngle,
          true,
          paint,
        );

        currentAngle += sweepAngle;
      }
    }
  }

  @override
  bool shouldRepaint(covariant _PieChartPainter oldDelegate) {
    return data != oldDelegate.data || holeRadius != oldDelegate.holeRadius;
  }
}
