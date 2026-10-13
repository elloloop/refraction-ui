import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../theme/refraction_theme.dart';

/// A bounded, decorative scene chosen by the CLI. Message text remains the
/// accessible content; reduced motion gets the same settled illustration.
const refractionCelebrationStyles = [
  'confetti',
  'fireworks',
  'star-trail',
  'heart-bloom',
  'paper-plane',
  'rocket',
  'sunrise',
  'garden',
  'ribbons',
  'bubbles',
  'high-five',
  'sparkles',
  'comet',
  'lanterns',
  'waves',
  'pinwheel',
  'balloons',
  'music',
  'trophy',
  'orbit',
];

const _scenePaths = [
  "M35 35l30 10-20 20z M48 28l3-9 M65 31l8-5 M71 48l10 1",
  "M50 15v15 M50 70v15 M15 50h15 M70 50h15 M25 25l10 10 M65 65l10 10 M25 75l10-10 M65 35l10-10",
  "M50 18l10 21 23 3-17 17 4 24-20-12-20 12 4-24-17-17 23-3z",
  "M50 76C10 51 19 22 36 26q10 0 14 12q4-12 14-12c17-4 26 25-14 50z",
  "M18 43l66-24-24 65-11-26z M49 58l35-39",
  "M40 60q-6-30 26-43q6 34-13 48z M38 49l-11 5-4 19 18-9 M55 65l-4 15-17 4 5-20 M32 71l-9 10 M49 38a5 5 0 1 0 10 0a5 5 0 1 0-10 0",
  "M20 65h60 M30 64a20 20 0 0 1 40 0 M50 19v10 M20 37l8 8 M72 45l8-8",
  "M50 80V48 M50 58q-25 0-22-20q22 1 22 20 M50 68q25 0 22-20q-22 1-22 20 M50 46a13 13 0 1 0 0-26a13 13 0 1 0 0 26",
  "M30 25q40 0 40 25q-40 0-40 25 M35 25l-10 50 M65 25l10 50",
  "M37 52a15 15 0 1 0 0-30a15 15 0 1 0 0 30 M67 72a10 10 0 1 0 0-20a10 10 0 1 0 0 20",
  "M35 70V38q0-8 7-8v25-32q0-8 7-8v38-29q0-8 7-8v38-25q0-8 7-8v27l7-10q8-6 10 4L65 80H42z",
  "M50 20l8 23 22 7-22 8-8 22-8-22-22-8 22-7z",
  "M20 30l35 20 M20 48l28 15 M32 22l30 19 M68 72a18 18 0 1 0 0-36a18 18 0 1 0 0 36",
  "M35 25h30l5 35-20 17-20-17z M50 77v10 M38 20h24 M36 38h28",
  "M15 35q15-18 30 0t30 0 M15 52q15-18 30 0t30 0 M15 69q15-18 30 0t30 0",
  "M50 50l-30-25q35-10 30 25l30-25q10 35-30 25l30 25q-35 10-30-25l-30 25q-10-35 30-25 M50 50v35",
  "M50 58c-27-10-20-42 0-42s27 32 0 42 M50 58q-8 8 2 16t0 17",
  "M44 66V23l29-8v42 M44 66c0 10-22 12-22 3s22-13 22-3 M73 57c0 10-22 12-22 3s22-13 22-3",
  "M32 20h36v22q0 25-18 25T32 42z M32 25H20q0 25 16 25 M68 25h12q0 25-16 25 M50 67v15 M35 82h30",
  "M50 70a20 20 0 1 0 0-40a20 20 0 1 0 0 40 M20 60q20-50 60-20t-60 20",
];

class RefractionCelebrationScene extends StatefulWidget {
  const RefractionCelebrationScene({
    super.key,
    required this.style,
    this.animate = true,
  });
  final String style;
  final bool animate;

  @override
  State<RefractionCelebrationScene> createState() =>
      _RefractionCelebrationSceneState();
}

class _RefractionCelebrationSceneState extends State<RefractionCelebrationScene>
    with SingleTickerProviderStateMixin {
  late final _motion = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 2400),
  );
  bool? _reduced;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final reduced = MediaQuery.disableAnimationsOf(context) || !widget.animate;
    if (_reduced == reduced) return;
    _reduced = reduced;
    if (reduced) {
      _motion.stop();
      _motion.value = 1;
    } else {
      _motion.forward(from: 0);
    }
  }

  @override
  void didUpdateWidget(RefractionCelebrationScene oldWidget) {
    super.didUpdateWidget(oldWidget);
    final reduced = MediaQuery.disableAnimationsOf(context) || !widget.animate;
    if (reduced) {
      _reduced = true;
      _motion.stop();
      _motion.value = 1;
    } else if (oldWidget.style != widget.style || _reduced == true) {
      _reduced = false;
      _motion.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _motion.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final index = refractionCelebrationStyles.indexOf(widget.style);
    if (index < 0) return const SizedBox.shrink();
    final colors = context.refractionTheme.colors;
    return ExcludeSemantics(
      child: SizedBox(
        height: 132,
        child: AnimatedBuilder(
          animation: _motion,
          builder: (context, _) {
            final t = Curves.easeOutCubic.transform(_motion.value);
            final hop = math.sin(_motion.value * math.pi * 3) * (1 - t) * 22;
            return CustomPaint(
              painter: _ScenePainter(
                index,
                t,
                colors.primary,
                colors.foreground,
                colors.mutedForeground,
              ),
              child: Center(
                child: Transform.translate(
                  offset: Offset((1 - t) * (index.isEven ? -64 : 64), hop),
                  child: Transform.rotate(
                    angle: (1 - t) * (index % 3 - 1) * math.pi,
                    child: SvgPicture.string(
                      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
                      '<path d="${_scenePaths[index]}" fill="none" stroke="#${colors.primary.toARGB32().toRadixString(16).substring(2)}" '
                      'stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
                      width: 100,
                      height: 100,
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _ScenePainter extends CustomPainter {
  _ScenePainter(this.kind, this.t, this.accent, this.ink, this.muted);
  final int kind;
  final double t;
  final Color accent, ink, muted;

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = math.min(size.width * .35, 98.0);
    final paint = Paint()..strokeCap = StrokeCap.round;
    for (var i = 0; i < 14; i++) {
      final phase = i * math.pi * 2 / 14;
      final spread = .2 + t * .8;
      final arc = phase + (1 - t) * (kind % 4 + 1);
      var point =
          center +
          Offset(math.cos(arc) * radius * spread, math.sin(arc) * 43 * spread);
      paint
        ..style = PaintingStyle.fill
        ..color = [accent, ink, muted][i % 3].withValues(alpha: .72);
      switch (kind % 5) {
        case 0:
          canvas.save();
          canvas.translate(point.dx, point.dy);
          canvas.rotate(phase + (1 - t) * 3);
          canvas.drawRRect(
            RRect.fromRectAndRadius(
              const Rect.fromLTWH(-2, -5, 4, 10),
              const Radius.circular(1),
            ),
            paint,
          );
          canvas.restore();
        case 1:
          paint
            ..style = PaintingStyle.stroke
            ..strokeWidth = 1.5;
          canvas.drawLine(point, center + (point - center) * 1.12, paint);
        case 2:
          final star = Path();
          for (var n = 0; n < 10; n++) {
            final a = n * math.pi / 5 - math.pi / 2;
            final r = n.isEven ? 5.0 : 2.2;
            final p = point + Offset(math.cos(a) * r, math.sin(a) * r);
            if (n == 0) {
              star.moveTo(p.dx, p.dy);
            } else {
              star.lineTo(p.dx, p.dy);
            }
          }
          star.close();
          canvas.drawPath(star, paint);
        case 3:
          point += Offset(0, math.sin(phase + t * math.pi) * 8);
          canvas.drawOval(
            Rect.fromCenter(center: point, width: 6, height: 10),
            paint,
          );
        case 4:
          paint
            ..style = PaintingStyle.stroke
            ..strokeWidth = 1;
          canvas.drawCircle(point, 2.5 + i % 3, paint);
      }
    }
    paint
      ..color = muted.withValues(alpha: .25)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;
    canvas.drawOval(
      Rect.fromCenter(
        center: center + const Offset(0, 38),
        width: 72,
        height: 8,
      ),
      paint,
    );
  }

  @override
  bool shouldRepaint(_ScenePainter old) =>
      old.t != t ||
      old.kind != kind ||
      old.accent != accent ||
      old.ink != ink ||
      old.muted != muted;
}
