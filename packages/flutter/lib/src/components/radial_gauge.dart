import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import '../theme/refraction_theme_data.dart';

/// Visual size of a [RefractionRadialGauge].
enum RefractionRadialGaugeSize {
  /// 80px diameter
  sm,

  /// 120px diameter
  md,

  /// 160px diameter
  lg,
}

/// Tone mapped to a zone range.
enum RefractionGaugeTone {
  /// Default color (foreground)
  defaultTone,

  /// Success color (emerald green)
  success,

  /// Warning color (amber orange)
  warning,

  /// Danger color (destructive red)
  danger,
}

/// A threshold zone that applies a semantic tone when the gauge value falls at or below [upTo].
class RefractionGaugeZone {
  /// Value up to (and including) which this zone applies.
  final double upTo;

  /// Semantic tone for the arc while the value is in this zone.
  final RefractionGaugeTone tone;

  /// Creates a [RefractionGaugeZone].
  const RefractionGaugeZone({
    required this.upTo,
    required this.tone,
  });
}

/// A circular progress / gauge component.
///
/// Mirrors the React/Astro `RadialGauge` component. Renders a background track ring
/// and a value arc whose length is proportional to the current value fraction.
/// Supports semantic zone coloring (success / warning / danger) so the arc color
/// communicates health at a glance.
///
/// ```dart
/// RefractionRadialGauge(
///   value: 75.0,
///   min: 0.0,
///   max: 100.0,
///   size: RefractionRadialGaugeSize.md,
///   zones: const [
///     RefractionGaugeZone(upTo: 30.0, tone: RefractionGaugeTone.danger),
///     RefractionGaugeZone(upTo: 70.0, tone: RefractionGaugeTone.warning),
///     RefractionGaugeZone(upTo: 100.0, tone: RefractionGaugeTone.success),
///   ],
/// )
/// ```
class RefractionRadialGauge extends StatelessWidget {
  /// Current value.
  final double value;

  /// Minimum value. Defaults to 0.0.
  final double min;

  /// Maximum value. Defaults to 100.0.
  final double max;

  /// Visual size of the gauge. Defaults to [RefractionRadialGaugeSize.md].
  final RefractionRadialGaugeSize size;

  /// Stroke thickness in logical pixels. Defaults to 8.0.
  final double thickness;

  /// Primary center label. When omitted and [showValue] is true, the numeric value is shown.
  final Widget? label;

  /// Secondary label shown below the primary label.
  final Widget? sublabel;

  /// Threshold zones that color the arc based on the current value.
  final List<RefractionGaugeZone>? zones;

  /// Show the numeric value in the center when no explicit label is given. Defaults to true.
  final bool showValue;

  /// Creates a [RefractionRadialGauge].
  const RefractionRadialGauge({
    super.key,
    required this.value,
    this.min = 0.0,
    this.max = 100.0,
    this.size = RefractionRadialGaugeSize.md,
    this.thickness = 8.0,
    this.label,
    this.sublabel,
    this.zones,
    this.showValue = true,
  });

  double _getDiameter() {
    switch (size) {
      case RefractionRadialGaugeSize.sm:
        return 80.0;
      case RefractionRadialGaugeSize.md:
        return 120.0;
      case RefractionRadialGaugeSize.lg:
        return 160.0;
    }
  }

  double _getLabelFontSize() {
    switch (size) {
      case RefractionRadialGaugeSize.sm:
        return 14.0;
      case RefractionRadialGaugeSize.md:
        return 20.0;
      case RefractionRadialGaugeSize.lg:
        return 26.0;
    }
  }

  double _getSublabelFontSize() {
    switch (size) {
      case RefractionRadialGaugeSize.sm:
        return 9.0;
      case RefractionRadialGaugeSize.md:
        return 11.0;
      case RefractionRadialGaugeSize.lg:
        return 13.0;
    }
  }

  Color _getColorForTone(RefractionGaugeTone tone, RefractionTheme theme) {
    switch (tone) {
      case RefractionGaugeTone.success:
        return const Color(0xFF10B981);
      case RefractionGaugeTone.warning:
        return const Color(0xFFF59E0B);
      case RefractionGaugeTone.danger:
        return theme.colors.destructive;
      case RefractionGaugeTone.defaultTone:
        return theme.colors.foreground;
    }
  }

  Color _resolveArcColor(double clamped, RefractionTheme theme) {
    if (zones == null || zones!.isEmpty) {
      return theme.colors.foreground;
    }
    final sorted = List<RefractionGaugeZone>.from(zones!)
      ..sort((a, b) => a.upTo.compareTo(b.upTo));
    for (final zone in sorted) {
      if (clamped <= zone.upTo) {
        return _getColorForTone(zone.tone, theme);
      }
    }
    return _getColorForTone(sorted.last.tone, theme);
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final diameter = _getDiameter();

    final clampedValue = value.clamp(min, max);
    final fraction = (max == min) ? 0.0 : ((clampedValue - min) / (max - min)).clamp(0.0, 1.0);

    final trackColor = theme.colors.mutedForeground.withValues(alpha: 0.2);
    final arcColor = _resolveArcColor(clampedValue, theme);

    final String valueText = clampedValue % 1 == 0 ? clampedValue.toInt().toString() : clampedValue.toStringAsFixed(1);
    final Widget centerLabel = label ??
        (showValue
            ? Text(
                valueText,
                style: theme.data.textStyle.copyWith(
                  fontSize: _getLabelFontSize(),
                  fontWeight: FontWeight.w600,
                  color: theme.colors.foreground,
                ),
              )
            : const SizedBox.shrink());

    final Widget? centerSublabel = sublabel != null
        ? DefaultTextStyle(
            style: theme.data.textStyle.copyWith(
              fontSize: _getSublabelFontSize(),
              color: theme.colors.mutedForeground,
            ),
            child: sublabel!,
          )
        : null;

    return Semantics(
      container: true,
      label: 'Radial Gauge',
      value: valueText,
      child: SizedBox(
        width: diameter,
        height: diameter,
        child: Stack(
          alignment: Alignment.center,
          children: [
            Positioned.fill(
              child: CustomPaint(
                painter: _RadialGaugePainter(
                  fraction: fraction,
                  thickness: thickness,
                  trackColor: trackColor,
                  arcColor: arcColor,
                ),
              ),
            ),
            Padding(
              padding: EdgeInsets.all(thickness + 4.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  centerLabel,
                  if (centerSublabel != null) ...[
                    const SizedBox(height: 2.0),
                    centerSublabel,
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RadialGaugePainter extends CustomPainter {
  final double fraction;
  final double thickness;
  final Color trackColor;
  final Color arcColor;

  _RadialGaugePainter({
    required this.fraction,
    required this.thickness,
    required this.trackColor,
    required this.arcColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width - thickness) / 2;

    // Draw background track
    final trackPaint = Paint()
      ..color = trackColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = thickness;
    canvas.drawCircle(center, radius, trackPaint);

    // Draw value arc (starts at 12 o'clock / -pi/2 radians)
    if (fraction > 0.0) {
      final arcPaint = Paint()
        ..color = arcColor
        ..style = PaintingStyle.stroke
        ..strokeWidth = thickness
        ..strokeCap = StrokeCap.round;

      final startAngle = -math.pi / 2;
      final sweepAngle = 2 * math.pi * fraction;

      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        sweepAngle,
        false,
        arcPaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _RadialGaugePainter oldDelegate) {
    return oldDelegate.fraction != fraction ||
        oldDelegate.thickness != thickness ||
        oldDelegate.trackColor != trackColor ||
        oldDelegate.arcColor != arcColor;
  }
}
