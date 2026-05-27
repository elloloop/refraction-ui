import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import '../theme/refraction_theme.dart';

/// The visual variant for [RefractionWaveform].
enum WaveformVariant {
  /// A series of vertical bars (the default).
  bars,

  /// A continuous connected line.
  line,

  /// Concentric pulsing rings.
  rings,
}

int _normalizeBarCount(int? value) {
  if (value == null) return 48;
  return value.clamp(1, 1024);
}

double _normalizeSmoothing(double? value) {
  if (value == null || value.isNaN) return 0.8;
  return value.clamp(0.0, 0.99);
}

double _normalizeIntensity(double? value) {
  if (value == null || value.isNaN) return 1.0;
  return value.clamp(0.0, 1.0);
}

double _normalizeAmplitude(double? value) {
  if (value == null || value.isNaN) return 1.0;
  return value.clamp(0.0, 1.0);
}


List<double> _createSilentSamples(int count) {
  return List<double>.filled(count, 0.0);
}

List<double> _createIntensitySamples(double intensity, int count, double phase) {
  final normalizedIntensity = _normalizeIntensity(intensity);
  final normalizedCount = _normalizeBarCount(count);
  final samples = List<double>.filled(normalizedCount, 0.0);

  if (normalizedIntensity == 0) return samples;

  final pulse = 0.72 + math.sin(phase * 1.8) * 0.18;

  for (int i = 0; i < normalizedCount; i++) {
    final progress = normalizedCount <= 1 ? 0.5 : i / (normalizedCount - 1);
    final envelope = 0.35 + math.sin(progress * math.pi) * 0.65;
    final carrier = math.sin(progress * math.pi * 6 + phase * 2.8);
    samples[i] = carrier * envelope * normalizedIntensity * pulse;
  }

  return samples;
}

List<double> _resampleWaveformSamples(List<double> samples, int targetCount) {
  final count = _normalizeBarCount(targetCount);
  final sourceLength = samples.length;

  if (sourceLength == 0) return _createSilentSamples(count);
  if (sourceLength == count) return List<double>.from(samples);

  final output = List<double>.filled(count, 0.0);

  for (int i = 0; i < count; i++) {
    final start = (i * sourceLength) / count;
    final end = ((i + 1) * sourceLength) / count;
    final firstIndex = start.floor();
    final lastIndex = math.max(firstIndex + 1, end.ceil());
    double total = 0.0;
    int values = 0;

    for (int j = firstIndex; j < lastIndex && j < sourceLength; j++) {
      total += samples[j];
      values += 1;
    }

    output[i] = values > 0
        ? total / values
        : samples[math.min(firstIndex, sourceLength - 1)];
  }

  return output;
}

List<double> _normalizeWaveformSamples(List<double>? input, int targetCount) {
  final sourceLength = input?.length ?? 0;

  if (sourceLength == 0) {
    return _createSilentSamples(targetCount);
  }

  final normalized = List<double>.filled(sourceLength, 0.0);
  double maxAbs = 0.0;

  for (int i = 0; i < sourceLength; i++) {
    final value = input![i];
    final sample = value.isFinite ? value : 0.0;
    normalized[i] = sample;
    if (sample.abs() > maxAbs) {
      maxAbs = sample.abs();
    }
  }

  final divisor = maxAbs > 1.0 ? maxAbs : 1.0;

  for (int i = 0; i < normalized.length; i++) {
    normalized[i] = (normalized[i] / divisor).clamp(-1.0, 1.0);
  }

  if (targetCount == normalized.length) {
    return normalized;
  }

  return _resampleWaveformSamples(normalized, targetCount);
}

List<double> _smoothWaveformSamples(
    List<double>? previous, List<double> next, double smoothing) {
  if (previous == null || previous.isEmpty) {
    return List<double>.from(next);
  }

  final amount = _normalizeSmoothing(smoothing);
  final output = List<double>.filled(next.length, 0.0);

  for (int i = 0; i < next.length; i++) {
    final previousValue = i < previous.length ? previous[i] : next[i];
    output[i] = previousValue * amount + next[i] * (1.0 - amount);
  }

  return output;
}

List<double> _scaleWaveformSamples(List<double> samples, double intensity) {
  final amount = _normalizeIntensity(intensity);
  final output = List<double>.filled(samples.length, 0.0);

  for (int i = 0; i < samples.length; i++) {
    output[i] = (samples[i] * amount).clamp(-1.0, 1.0);
  }

  return output;
}

double _getWaveformPeak(List<double> samples) {
  double peak = 0.0;
  for (int i = 0; i < samples.length; i++) {
    final absVal = samples[i].abs();
    if (absVal > peak) peak = absVal;
  }
  return math.min(1.0, peak);
}

class _WaveformPainter extends CustomPainter {
  final List<double> samples;
  final WaveformVariant variant;
  final Color color;
  final double intensity;
  final double amplitude;
  final int barCount;

  _WaveformPainter({
    required this.samples,
    required this.variant,
    required this.color,
    required this.intensity,
    required this.amplitude,
    required this.barCount,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    if (variant == WaveformVariant.line) {
      _drawLine(canvas, size, paint);
      return;
    }

    if (variant == WaveformVariant.rings) {
      _drawRings(canvas, size, paint);
      return;
    }

    _drawBars(canvas, size, paint);
  }

  void _drawBars(Canvas canvas, Size size, Paint paint) {
    final bars = _scaleWaveformSamples(
        _resampleWaveformSamples(samples, barCount), intensity);
    final slotWidth = size.width / bars.length;
    final barWidth = math.max(1.0, slotWidth * 0.64);
    final center = size.height / 2;

    for (int i = 0; i < bars.length; i++) {
      final value = bars[i].abs();
      final barHeight =
          math.max(value * size.height * amplitude, value > 0 ? 1.0 : 0.0);
      final x = i * slotWidth + (slotWidth - barWidth) / 2;
      final y = center - barHeight / 2;

      canvas.drawRect(Rect.fromLTWH(x, y, barWidth, barHeight), paint);
    }
  }

  void _drawLine(Canvas canvas, Size size, Paint paint) {
    final lineSamples = _scaleWaveformSamples(samples, intensity);
    final center = size.height / 2;
    final amp = size.height * 0.45 * amplitude;

    paint.style = PaintingStyle.stroke;
    paint.strokeWidth = math.max(1.5, math.min(size.width, size.height) * 0.025);
    paint.strokeCap = StrokeCap.round;
    paint.strokeJoin = StrokeJoin.round;

    final path = Path();

    for (int i = 0; i < lineSamples.length; i++) {
      final x = lineSamples.length <= 1
          ? size.width / 2
          : (i / (lineSamples.length - 1)) * size.width;
      final y = center - lineSamples[i] * amp;

      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }

    canvas.drawPath(path, paint);
  }

  void _drawRings(Canvas canvas, Size size, Paint paint) {
    final peak = _getWaveformPeak(_scaleWaveformSamples(samples, intensity)) *
        amplitude;
    final minDimension = math.min(size.width, size.height);
    final centerX = size.width / 2;
    final centerY = size.height / 2;
    const ringCount = 3;
    final baseRadius = minDimension * 0.16;
    final radiusStep = minDimension * 0.13;

    paint.style = PaintingStyle.stroke;
    paint.strokeWidth = math.max(1.5, minDimension * 0.018);

    for (int i = 0; i < ringCount; i++) {
      final progress = (i + 1) / ringCount;
      final pulse = peak * minDimension * 0.1 * progress;
      final radius = baseRadius + radiusStep * i + pulse;

      final alpha = (0.28 + progress * 0.34).clamp(0.0, 1.0);
      paint.color = color.withValues(alpha: alpha);

      canvas.drawCircle(Offset(centerX, centerY), radius, paint);
    }
  }

  @override
  bool shouldRepaint(covariant _WaveformPainter oldDelegate) {
    return oldDelegate.samples != samples ||
        oldDelegate.variant != variant ||
        oldDelegate.color != color ||
        oldDelegate.intensity != intensity ||
        oldDelegate.amplitude != amplitude ||
        oldDelegate.barCount != barCount;
  }
}

/// An animated audio waveform visualizer component.
///
/// If [samples] is not provided, the component generates an organic pulsing
/// intensity animation based on the current time. If [samples] is provided,
/// it smooths transitions between data updates.
class RefractionWaveform extends StatefulWidget {
  /// Audio amplitude data array (each value usually between -1.0 and 1.0).
  ///
  /// If null, an artificial pulsing pattern is generated.
  final List<double>? samples;

  /// The visual shape variant to render. Defaults to [WaveformVariant.bars].
  final WaveformVariant variant;

  /// Multiplier for the visual output intensity (0.0 to 1.0). Defaults to 1.0.
  final double intensity;

  /// Multiplier for the visual output amplitude (0.0 to 1.0). Defaults to 1.0.
  final double amplitude;

  /// Number of distinct frequency bars or data points. Defaults to 48.
  final int barCount;

  /// The degree of temporal smoothing (0.0 to 0.99). Defaults to 0.8.
  final double smoothing;

  /// The color of the waveform geometry. Defaults to `colors.accent2`.
  final Color? color;

  /// Whether the animation should pause. Defaults to false.
  final bool paused;

  /// Explicit width. If omitted, spans to fill available parent width.
  final double? width;

  /// Explicit height. Defaults to 80.0.
  final double height;

  const RefractionWaveform({
    super.key,
    this.samples,
    this.variant = WaveformVariant.bars,
    this.intensity = 1.0,
    this.amplitude = 1.0,
    this.barCount = 48,
    this.smoothing = 0.8,
    this.color,
    this.paused = false,
    this.width,
    this.height = 80.0,
  });

  @override
  State<RefractionWaveform> createState() => _RefractionWaveformState();
}

class _RefractionWaveformState extends State<RefractionWaveform>
    with SingleTickerProviderStateMixin {
  late Ticker _ticker;
  double _elapsedSeconds = 0.0;
  List<double>? _previousSamples;
  late List<double> _renderedSamples;

  @override
  void initState() {
    super.initState();
    _renderedSamples = _createSilentSamples(_normalizeBarCount(widget.barCount));
    _ticker = createTicker((elapsed) {
      if (!mounted) return;
      setState(() {
        _elapsedSeconds = elapsed.inMicroseconds / 1000000.0;
      });
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _updateTickerState();
  }

  @override
  void didUpdateWidget(RefractionWaveform oldWidget) {
    super.didUpdateWidget(oldWidget);
    _updateTickerState();
  }

  void _updateTickerState() {
    final disableAnimations = MediaQuery.of(context).disableAnimations;
    final isPaused = widget.paused || disableAnimations;

    if (!isPaused && !_ticker.isActive) {
      _ticker.start();
    } else if (isPaused && _ticker.isActive) {
      _ticker.stop();
    }
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final barCount = _normalizeBarCount(widget.barCount);
    List<double> nextSamples;

    if (widget.samples != null) {
      nextSamples = _normalizeWaveformSamples(widget.samples, barCount);
    } else {
      nextSamples =
          _createIntensitySamples(widget.intensity, barCount, _elapsedSeconds);
    }

    _renderedSamples = _smoothWaveformSamples(
      _previousSamples,
      nextSamples,
      widget.smoothing,
    );
    _previousSamples = _renderedSamples;

    final theme = RefractionTheme.of(context);
    final actualColor = widget.color ?? theme.colors.accent;

    return Semantics(
      label: 'Audio waveform',
      image: true,
      child: SizedBox(
        width: widget.width ?? double.infinity,
        height: widget.height,
        child: CustomPaint(
          painter: _WaveformPainter(
            samples: _renderedSamples,
            variant: widget.variant,
            color: actualColor,
            intensity: widget.intensity,
            amplitude: _normalizeAmplitude(widget.amplitude),
            barCount: barCount,
          ),
        ),
      ),
    );
  }
}
