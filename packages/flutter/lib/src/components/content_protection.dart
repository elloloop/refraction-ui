import 'dart:ui';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A wrapper component that protects child content by obscuring it with a blur,
/// overlay, or watermark until unlocked, and intercepting certain interactions.
class RefractionContentProtection extends StatelessWidget {
  /// The child content to protect.
  final Widget child;

  /// Whether the content is currently locked and obscured.
  final bool isLocked;

  /// Optional widget to display over the locked content (e.g. a paywall prompt).
  final Widget? overlay;

  /// The amount of blur to apply when locked. Set to 0 to disable blurring.
  final double blurSigma;

  /// Whether to absorb all pointer events (taps, scrolls) when locked.
  final bool absorbPointersWhenLocked;

  /// Whether to try preventing selection (wraps in SelectionArea/IgnorePointer if needed,
  /// though Flutter handles this differently than web. This mostly acts as a semantic flag).
  final bool preventSelection;

  /// Optional watermark text to tile over the content.
  final String? watermarkText;

  /// Opacity of the watermark text.
  final double watermarkOpacity;

  /// Angle of the watermark text in degrees.
  final double watermarkAngle;

  const RefractionContentProtection({
    super.key,
    required this.child,
    this.isLocked = true,
    this.overlay,
    this.blurSigma = 4.0,
    this.absorbPointersWhenLocked = true,
    this.preventSelection = true,
    this.watermarkText,
    this.watermarkOpacity = 0.08,
    this.watermarkAngle = -45.0,
  });

  @override
  Widget build(BuildContext context) {
    // If not locked and no watermark, just return child.
    if (!isLocked && watermarkText == null) {
      return child;
    }

    Widget content = child;

    // Apply blur if locked
    if (isLocked && blurSigma > 0) {
      content = ImageFiltered(
        imageFilter: ImageFilter.blur(sigmaX: blurSigma, sigmaY: blurSigma),
        child: content,
      );
    }

    // Apply pointer absorption if locked
    if (isLocked && absorbPointersWhenLocked) {
      content = AbsorbPointer(child: content);
    } else if (preventSelection && isLocked) {
      // If we don't absorb all pointers but want to prevent selection,
      // we can disable text selection by intercepting events or using a basic IgnorePointer.
      // But since AbsorbPointer handles taps, this is a fallback if needed.
    }

    List<Widget> stackChildren = [
      // The main content is always the bottom layer
      Positioned.fill(child: content),
    ];

    // Add watermark if present
    if (watermarkText != null) {
      stackChildren.add(
        Positioned.fill(
          child: IgnorePointer(
            child: Opacity(
              opacity: watermarkOpacity,
              child: _WatermarkPainterWidget(
                text: watermarkText!,
                angle: watermarkAngle,
              ),
            ),
          ),
        ),
      );
    }

    // Add overlay if locked
    if (isLocked && overlay != null) {
      stackChildren.add(Positioned.fill(child: Center(child: overlay)));
    }

    // If context menu is to be disabled (part of protection), we can wrap the whole stack in a
    // widget that prevents right-click/long-press from propagating to default menus,
    // or just rely on AbsorbPointer which already blocks gesture propagation when locked.

    // We use a custom stack layout to ensure children stretch properly.
    return Stack(fit: StackFit.passthrough, children: stackChildren);
  }
}

class _WatermarkPainterWidget extends StatelessWidget {
  final String text;
  final double angle;

  const _WatermarkPainterWidget({required this.text, required this.angle});

  @override
  Widget build(BuildContext context) {
    final colors = context.refractionColors;
    return CustomPaint(
      painter: _WatermarkPainter(
        text: text,
        angle: angle,
        color: colors.foreground,
      ),
    );
  }
}

class _WatermarkPainter extends CustomPainter {
  final String text;
  final double angle;
  final Color color;

  _WatermarkPainter({
    required this.text,
    required this.angle,
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final textStyle = TextStyle(
      color: color,
      fontSize: 16,
      fontFamily: 'sans-serif',
      fontWeight: FontWeight.w600,
    );
    final textSpan = TextSpan(text: text, style: textStyle);
    final textPainter = TextPainter(
      text: textSpan,
      textDirection: TextDirection.ltr,
    );
    textPainter.layout();

    final radians = angle * math.pi / 180;

    // Pattern spacing
    final dx = 150.0;
    final dy = 100.0;

    canvas.clipRect(Offset.zero & size);

    // Move canvas to center to rotate around the center of the widget
    canvas.translate(size.width / 2, size.height / 2);
    canvas.rotate(radians);

    // Draw grid of text
    // Calculate the diagonal of the bounding box to ensure coverage
    final double maxDimension =
        math.sqrt(size.width * size.width + size.height * size.height) * 1.5;
    final int nx = (maxDimension / dx).ceil();
    final int ny = (maxDimension / dy).ceil();

    for (int i = -nx; i <= nx; i++) {
      for (int j = -ny; j <= ny; j++) {
        textPainter.paint(
          canvas,
          Offset(
            i * dx - textPainter.width / 2,
            j * dy - textPainter.height / 2,
          ),
        );
      }
    }
  }

  @override
  bool shouldRepaint(covariant _WatermarkPainter oldDelegate) {
    return text != oldDelegate.text ||
        angle != oldDelegate.angle ||
        color != oldDelegate.color;
  }
}
