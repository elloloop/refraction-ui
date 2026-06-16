import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';

/// The mood of the mascot.
enum MascotMood {
  /// Happy/Smiling face.
  happy,

  /// Waving arm mood, using a smiling face.
  wave,

  /// Thinking face.
  think,
}

/// A highly customizable, headless Mascot widget displaying Tobi the tortoise.
///
/// Supports three moods ([MascotMood.happy], [MascotMood.wave], and [MascotMood.think])
/// and toggleable animations (breathing bobbing, blinking timers, sprout swaying).
///
/// Example usage:
/// ```dart
/// RefractionMascot(
///   size: 200,
///   mood: MascotMood.happy,
///   animate: true,
/// )
/// ```
class RefractionMascot extends StatefulWidget {
  /// The mood of the mascot. Defaults to [MascotMood.happy].
  final MascotMood mood;

  /// The size (both width and height constraints) of the widget.
  /// If specified, the mascot is drawn inside a box of this size,
  /// preserving its aspect ratio (360x300).
  final double size;

  /// Master switch for all animations (bobbing, swaying, blinking).
  /// If false, overrides all individual animation settings and disables them.
  final bool animate;

  /// Whether the breathing bobbing animation is enabled.
  /// Defaults to null, falling back to [animate].
  final bool? animateBobbing;

  /// Whether the blinking timer animation is enabled.
  /// Defaults to null, falling back to [animate].
  final bool? animateBlinking;

  /// Whether the sprout swaying animation is enabled.
  /// Defaults to null, falling back to [animate].
  final bool? animateSprout;

  const RefractionMascot({
    super.key,
    this.size = 200.0,
    this.mood = MascotMood.happy,
    this.animate = true,
    this.animateBobbing,
    this.animateBlinking,
    this.animateSprout,
  });

  @override
  State<RefractionMascot> createState() => _RefractionMascotState();
}

class _RefractionMascotState extends State<RefractionMascot>
    with TickerProviderStateMixin {
  late final AnimationController _bobbingController;
  late final Animation<double> _bobbingAnimation;

  late final AnimationController _swayController;
  late final Animation<double> _swayAnimation;

  Timer? _blinkTimer;
  bool _isBlinking = false;

  bool get _shouldBob => widget.animateBobbing ?? widget.animate;
  bool get _shouldSway => widget.animateSprout ?? widget.animate;
  bool get _shouldBlink => widget.animateBlinking ?? widget.animate;

  @override
  void initState() {
    super.initState();

    _bobbingController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 4600),
    );
    _bobbingAnimation = Tween<double>(begin: 0.0, end: -7.0).animate(
      CurvedAnimation(
        parent: _bobbingController,
        curve: Curves.easeInOut,
      ),
    );

    _swayController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 5200),
    );
    _swayAnimation = Tween<double>(
      begin: -5.0 * math.pi / 180.0,
      end: 5.0 * math.pi / 180.0,
    ).animate(
      CurvedAnimation(
        parent: _swayController,
        curve: Curves.easeInOut,
      ),
    );

    _startAnimations();
  }

  void _startAnimations() {
    if (_shouldBob) {
      _bobbingController.repeat(reverse: true);
    }
    if (_shouldSway) {
      _swayController.repeat(reverse: true);
    }
    if (_shouldBlink) {
      _startBlinkingTimer();
    }
  }

  void _stopAnimations() {
    _bobbingController.stop();
    _swayController.stop();
    _blinkTimer?.cancel();
    _isBlinking = false;
  }

  void _startBlinkingTimer() {
    _blinkTimer?.cancel();
    _blinkTimer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (!mounted) return;
      setState(() {
        _isBlinking = true;
      });
      Future.delayed(const Duration(milliseconds: 150), () {
        if (!mounted) return;
        setState(() {
          _isBlinking = false;
        });
      });
    });
  }

  @override
  void didUpdateWidget(covariant RefractionMascot oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (widget.animate != oldWidget.animate ||
        widget.animateBobbing != oldWidget.animateBobbing ||
        widget.animateSprout != oldWidget.animateSprout ||
        widget.animateBlinking != oldWidget.animateBlinking) {
      _stopAnimations();
      _startAnimations();
    }
  }

  @override
  void dispose() {
    _bobbingController.dispose();
    _swayController.dispose();
    _blinkTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: widget.size,
      height: widget.size,
      child: AnimatedBuilder(
        animation: Listenable.merge([_bobbingAnimation, _swayAnimation]),
        builder: (context, child) {
          return CustomPaint(
            painter: MascotPainter(
              mood: widget.mood,
              bobTranslationY: _shouldBob ? _bobbingAnimation.value : 0.0,
              sproutRotationAngle: _shouldSway ? _swayAnimation.value : 0.0,
              isBlinking: _isBlinking,
            ),
          );
        },
      ),
    );
  }
}

/// A CustomPainter that draws Tobi the tortoise using raw SVG paths and shapes.
class MascotPainter extends CustomPainter {
  final MascotMood mood;
  final double bobTranslationY;
  final double sproutRotationAngle;
  final bool isBlinking;

  MascotPainter({
    required this.mood,
    required this.bobTranslationY,
    required this.sproutRotationAngle,
    required this.isBlinking,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Base coordinate space is 360 wide by 300 high
    final double scaleX = size.width / 360.0;
    final double scaleY = size.height / 300.0;
    final double scale = math.min(scaleX, scaleY);

    // Center the mascot inside the viewport
    final double dx = (size.width - 360.0 * scale) / 2.0;
    final double dy = (size.height - 300.0 * scale) / 2.0;

    canvas.save();
    canvas.translate(dx, dy);
    canvas.scale(scale);

    // Paint configurations
    final linePaint = Paint()
      ..color = const Color(0xFF17532B)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.5
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final shadowPaint = Paint()
      ..color = const Color(0x14000000) // 8% opacity
      ..style = PaintingStyle.fill;

    final backFeetPaint = Paint()
      ..color = const Color(0xFF2EA356) // Dark skin
      ..style = PaintingStyle.fill;

    final skinPaint = Paint()
      ..color = const Color(0xFF69E292) // Skin & leaf
      ..style = PaintingStyle.fill;

    final shellRimPaint = Paint()
      ..color = const Color(0xFF268948) // Shell rim & stem
      ..style = PaintingStyle.fill;

    final shellPaint = Paint()
      ..color = const Color(0xFF37C769) // Primary shell
      ..style = PaintingStyle.fill;

    final bellyPaint = Paint()
      ..color = const Color(0xFFBBF3CE) // Belly
      ..style = PaintingStyle.fill;

    final scutePaint = Paint()
      ..color = const Color(0xFFFFAF3D) // Scute
      ..style = PaintingStyle.fill;

    final scuteStrokePaint = Paint()
      ..color = const Color(0xFF1F6E3A) // Scute stroke
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.5
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final scuteAltPaint = Paint()
      ..color = const Color(0xFF99ECB4) // Scute alt
      ..style = PaintingStyle.fill;

    final eyePaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    final pupilPaint = Paint()
      ..color = const Color(0xFF113D20) // Pupil
      ..style = PaintingStyle.fill;

    final cheekPaint = Paint()
      ..color = const Color(0x73FF9557) // Cheek (45% opacity)
      ..style = PaintingStyle.fill;

    // 1. Draw Shadow (ground level, does not bob)
    // Shadow: cx=166, cy=280, rx=116, ry=16
    canvas.drawOval(
      Rect.fromLTWH(166.0 - 116.0, 280.0 - 16.0, 116.0 * 2, 16.0 * 2),
      shadowPaint,
    );

    // 2. Apply bobbing to all the rest
    canvas.save();
    canvas.translate(0, bobTranslationY);

    // 3. Draw Back Feet
    // Back feet: cx=96, cy=222, rx=27, ry=32 and cx=214, cy=224, rx=27, ry=32
    final Rect leftBackFoot = Rect.fromLTWH(96.0 - 27.0, 222.0 - 32.0, 27.0 * 2, 32.0 * 2);
    canvas.drawOval(leftBackFoot, backFeetPaint);
    canvas.drawOval(leftBackFoot, linePaint);

    final Rect rightBackFoot = Rect.fromLTWH(214.0 - 27.0, 224.0 - 32.0, 27.0 * 2, 32.0 * 2);
    canvas.drawOval(rightBackFoot, backFeetPaint);
    canvas.drawOval(rightBackFoot, linePaint);

    // 4. Draw Tail
    // Tail: M58 176 C40 178 28 190 26 204 C44 206 60 196 66 182 Z
    final Path tailPath = Path()
      ..moveTo(58, 176)
      ..cubicTo(40, 178, 28, 190, 26, 204)
      ..cubicTo(44, 206, 60, 196, 66, 182)
      ..close();
    canvas.drawPath(tailPath, skinPaint);
    canvas.drawPath(tailPath, linePaint);

    // 5. Draw Shell Rim
    // Shell rim: M36 196 C30 86 92 70 162 70 C232 70 294 86 288 196 C288 210 252 220 162 220 C72 220 36 210 36 196 Z
    final Path shellRimPath = Path()
      ..moveTo(36, 196)
      ..cubicTo(30, 86, 92, 70, 162, 70)
      ..cubicTo(232, 70, 294, 86, 288, 196)
      ..cubicTo(288, 210, 252, 220, 162, 220)
      ..cubicTo(72, 220, 36, 210, 36, 196)
      ..close();
    canvas.drawPath(shellRimPath, shellRimPaint);
    canvas.drawPath(shellRimPath, linePaint);

    // 6. Draw Shell
    // Shell: M44 190 C40 92 96 78 162 78 C228 78 284 92 280 190 C280 200 246 206 162 206 C78 206 44 200 44 190 Z
    final Path shellPath = Path()
      ..moveTo(44, 190)
      ..cubicTo(40, 92, 96, 78, 162, 78)
      ..cubicTo(228, 78, 284, 92, 280, 190)
      ..cubicTo(280, 200, 246, 206, 162, 206)
      ..cubicTo(78, 206, 44, 200, 44, 190)
      ..close();
    canvas.drawPath(shellPath, shellPaint);
    canvas.drawPath(shellPath, linePaint);

    // 7. Draw Belly
    // Belly: M50 192 C92 206 232 206 274 192 C274 202 240 210 162 210 C84 210 50 202 50 192 Z
    final Path bellyPath = Path()
      ..moveTo(50, 192)
      ..cubicTo(92, 206, 232, 206, 274, 192)
      ..cubicTo(274, 202, 240, 210, 162, 210)
      ..cubicTo(84, 210, 50, 202, 50, 192)
      ..close();
    canvas.drawPath(bellyPath, bellyPaint);
    canvas.drawPath(bellyPath, linePaint);

    // 8. Draw Scutes (Polygons)
    void drawPoly(List<Offset> points, Paint fill, Paint stroke) {
      if (points.isEmpty) return;
      final path = Path()..moveTo(points[0].dx, points[0].dy);
      for (int i = 1; i < points.length; i++) {
        path.lineTo(points[i].dx, points[i].dy);
      }
      path.close();
      canvas.drawPath(path, fill);
      canvas.drawPath(path, stroke);
    }

    // Center-top
    drawPoly(
      const [
        Offset(162, 86),
        Offset(190, 102),
        Offset(190, 134),
        Offset(162, 150),
        Offset(134, 134),
        Offset(134, 102),
      ],
      scutePaint,
      scuteStrokePaint,
    );

    // Center-bottom (alt)
    drawPoly(
      const [
        Offset(162, 150),
        Offset(186, 162),
        Offset(186, 184),
        Offset(162, 196),
        Offset(138, 184),
        Offset(138, 162),
      ],
      scuteAltPaint,
      scuteStrokePaint,
    );

    // Left-middle (alt)
    drawPoly(
      const [
        Offset(104, 108),
        Offset(126, 120),
        Offset(126, 148),
        Offset(104, 160),
        Offset(82, 148),
        Offset(82, 120),
      ],
      scuteAltPaint,
      scuteStrokePaint,
    );

    // Right-middle (alt)
    drawPoly(
      const [
        Offset(220, 108),
        Offset(242, 120),
        Offset(242, 148),
        Offset(220, 160),
        Offset(198, 148),
        Offset(198, 120),
      ],
      scuteAltPaint,
      scuteStrokePaint,
    );

    // Left-bottom
    drawPoly(
      const [
        Offset(108, 162),
        Offset(126, 172),
        Offset(126, 190),
        Offset(108, 200),
        Offset(90, 190),
        Offset(90, 172),
      ],
      scutePaint,
      scuteStrokePaint,
    );

    // Right-bottom
    drawPoly(
      const [
        Offset(216, 162),
        Offset(234, 172),
        Offset(234, 190),
        Offset(216, 200),
        Offset(198, 190),
        Offset(198, 172),
      ],
      scutePaint,
      scuteStrokePaint,
    );

    // 9. Draw Front Feet & Waving Arm
    // Left front foot: cx=116, cy=232, rx=25, ry=31
    final Rect leftFrontFoot = Rect.fromLTWH(116.0 - 25.0, 232.0 - 31.0, 25.0 * 2, 31.0 * 2);
    canvas.drawOval(leftFrontFoot, skinPaint);
    canvas.drawOval(leftFrontFoot, linePaint);
    // Left foot lines: M104 250 H128
    canvas.drawLine(const Offset(104, 250), const Offset(128, 250), linePaint);

    if (mood == MascotMood.wave) {
      // Waving arm: cx=250, cy=120, rx=15, ry=22
      final Rect wavingArm = Rect.fromLTWH(250.0 - 15.0, 120.0 - 22.0, 15.0 * 2, 22.0 * 2);
      canvas.drawOval(wavingArm, skinPaint);
      canvas.drawOval(wavingArm, linePaint);
      // Waving arm line: M244 104 q6 -8 12 0 => quadraticBezierTo(250, 96, 256, 104)
      final Path waveLine = Path()
        ..moveTo(244, 104)
        ..quadraticBezierTo(250, 96, 256, 104);
      canvas.drawPath(waveLine, linePaint);
    } else {
      // Right front foot: cx=236, cy=234, rx=25, ry=31
      final Rect rightFrontFoot = Rect.fromLTWH(236.0 - 25.0, 234.0 - 31.0, 25.0 * 2, 31.0 * 2);
      canvas.drawOval(rightFrontFoot, skinPaint);
      canvas.drawOval(rightFrontFoot, linePaint);
      // Right foot lines: M224 252 H248
      canvas.drawLine(const Offset(224, 252), const Offset(248, 252), linePaint);
    }

    // 10. Draw Sprout (Swaying around 158, 64)
    canvas.save();
    canvas.translate(158, 64);
    canvas.rotate(sproutRotationAngle);
    canvas.translate(-158, -64);

    // Sprout stem: M158 92 C158 70 158 58 158 44
    final Path stemPath = Path()
      ..moveTo(158, 92)
      ..cubicTo(158, 70, 158, 58, 158, 44);
    final stemPaint = Paint()
      ..color = const Color(0xFF268948)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.5
      ..strokeCap = StrokeCap.round;
    canvas.drawPath(stemPath, stemPaint);

    // Sprout leaves (left leaf & right leaf)
    // Left leaf: M158 56 C140 50 126 58 128 74 C146 76 158 70 158 56 Z
    final Path leftLeaf = Path()
      ..moveTo(158, 56)
      ..cubicTo(140, 50, 126, 58, 128, 74)
      ..cubicTo(146, 76, 158, 70, 158, 56)
      ..close();
    canvas.drawPath(leftLeaf, skinPaint);
    canvas.drawPath(leftLeaf, linePaint);

    // Right leaf: M158 50 C176 42 192 50 190 66 C172 70 158 64 158 50 Z
    final Path rightLeaf = Path()
      ..moveTo(158, 50)
      ..cubicTo(176, 42, 192, 50, 190, 66)
      ..cubicTo(172, 70, 158, 64, 158, 50)
      ..close();
    canvas.drawPath(rightLeaf, skinPaint);
    canvas.drawPath(rightLeaf, linePaint);

    canvas.restore(); // restore sprout translation/rotation

    // 11. Draw Head
    // Head base: M262 150 C276 142 296 142 310 150 L312 176 C300 188 274 188 262 178 Z
    final Path headBase = Path()
      ..moveTo(262, 150)
      ..cubicTo(276, 142, 296, 142, 310, 150)
      ..lineTo(312, 176)
      ..cubicTo(300, 188, 274, 188, 262, 178)
      ..close();
    canvas.drawPath(headBase, skinPaint);
    canvas.drawPath(headBase, linePaint);

    // Head ellipse: cx=296, cy=156, rx=40, ry=36
    final Rect head = Rect.fromLTWH(296.0 - 40.0, 156.0 - 36.0, 40.0 * 2, 36.0 * 2);
    canvas.drawOval(head, skinPaint);
    canvas.drawOval(head, linePaint);

    // Cheek: cx=280, cy=174, rx=11, ry=8
    final Rect cheek = Rect.fromLTWH(280.0 - 11.0, 174.0 - 8.0, 11.0 * 2, 8.0 * 2);
    canvas.drawOval(cheek, cheekPaint);

    // 12. Draw Face
    if (isBlinking) {
      // Draw closed blinking eyes
      // Left eye closed line: M275 150 C280 155 292 155 297 150
      final Path leftClosed = Path()
        ..moveTo(275, 150)
        ..cubicTo(280, 155, 292, 155, 297, 150);
      canvas.drawPath(leftClosed, linePaint);

      // Right eye closed line: M304 152 C309 157 319 157 324 152
      final Path rightClosed = Path()
        ..moveTo(304, 152)
        ..cubicTo(309, 157, 319, 157, 324, 152);
      canvas.drawPath(rightClosed, linePaint);

      // Mouth
      if (mood == MascotMood.think) {
        // Think face mouth line: M280 174 q10 -5 18 1
        final Path thinkMouth = Path()
          ..moveTo(280, 174)
          ..quadraticBezierTo(290, 169, 298, 175);
        canvas.drawPath(thinkMouth, linePaint);
      } else {
        // Default face mouth line: M286 172 C294 180 306 180 314 171
        final Path defaultMouth = Path()
          ..moveTo(286, 172)
          ..cubicTo(294, 180, 306, 180, 314, 171);
        canvas.drawPath(defaultMouth, linePaint);
      }
    } else {
      if (mood == MascotMood.think) {
        // Think face:
        // Left eye: cx=286, cy=150, rx=11, ry=13
        final Rect leftEye = Rect.fromLTWH(286.0 - 11.0, 150.0 - 13.0, 11.0 * 2, 13.0 * 2);
        canvas.drawOval(leftEye, eyePaint);
        canvas.drawOval(leftEye, linePaint);

        // Right eye: cx=314, cy=152, rx=10, ry=12
        final Rect rightEye = Rect.fromLTWH(314.0 - 10.0, 152.0 - 12.0, 10.0 * 2, 12.0 * 2);
        canvas.drawOval(rightEye, eyePaint);
        canvas.drawOval(rightEye, linePaint);

        // Pupils:
        // Left pupil: cx=288, cy=146, r=5.5
        canvas.drawCircle(const Offset(288, 146), 5.5, pupilPaint);
        // Right pupil: cx=315, cy=148, r=5
        canvas.drawCircle(const Offset(315, 148), 5.0, pupilPaint);

        // Glints:
        // Left glint: cx=290, cy=143, r=1.9
        canvas.drawCircle(const Offset(290, 143), 1.9, eyePaint);
        // Right glint: cx=317, cy=145, r=1.7
        canvas.drawCircle(const Offset(317, 145), 1.7, eyePaint);

        // Mouth line: M280 174 q10 -5 18 1 => quadraticBezierTo(290, 169, 298, 175)
        final Path thinkMouth = Path()
          ..moveTo(280, 174)
          ..quadraticBezierTo(290, 169, 298, 175);
        canvas.drawPath(thinkMouth, linePaint);
      } else {
        // Default face (happy, wave):
        // Left eye: cx=286, cy=150, rx=11, ry=13
        final Rect leftEye = Rect.fromLTWH(286.0 - 11.0, 150.0 - 13.0, 11.0 * 2, 13.0 * 2);
        canvas.drawOval(leftEye, eyePaint);
        canvas.drawOval(leftEye, linePaint);

        // Right eye: cx=314, cy=152, rx=10, ry=12
        final Rect rightEye = Rect.fromLTWH(314.0 - 10.0, 152.0 - 12.0, 10.0 * 2, 12.0 * 2);
        canvas.drawOval(rightEye, eyePaint);
        canvas.drawOval(rightEye, linePaint);

        // Pupils:
        // Left pupil: cx=289, cy=152, r=5.5
        canvas.drawCircle(const Offset(289, 152), 5.5, pupilPaint);
        // Right pupil: cx=316, cy=154, r=5
        canvas.drawCircle(const Offset(316, 154), 5.0, pupilPaint);

        // Glints:
        // Left glint: cx=291, cy=149, r=1.9
        canvas.drawCircle(const Offset(291, 149), 1.9, eyePaint);
        // Right glint: cx=318, cy=151, r=1.7
        canvas.drawCircle(const Offset(318, 151), 1.7, eyePaint);

        // Mouth line: M286 172 C294 180 306 180 314 171
        final Path defaultMouth = Path()
          ..moveTo(286, 172)
          ..cubicTo(294, 180, 306, 180, 314, 171);
        canvas.drawPath(defaultMouth, linePaint);
      }
    }

    canvas.restore(); // restore bobbing translation
    canvas.restore(); // restore centering scale translation
  }

  @override
  bool shouldRepaint(covariant MascotPainter oldDelegate) {
    return oldDelegate.mood != mood ||
        oldDelegate.bobTranslationY != bobTranslationY ||
        oldDelegate.sproutRotationAngle != sproutRotationAngle ||
        oldDelegate.isBlinking != isBlinking;
  }
}
