import 'package:flutter/widgets.dart';

import '../theme/refraction_colors.dart';

/// Package-private accessibility helpers shared by the work-tracking family
/// (status pill, task list, checklist, kanban, data table, collapsible,
/// sortable list). Not exported from the barrel.
///
/// These derive *legible variants of existing tokens* — they never introduce
/// a colour of their own — so every surface stays token-driven while meeting
/// WCAG 2.x AA whatever palette the host installs.
///
/// When the shared contrast/focus/motion tokens land in the theme layer this
/// file should shrink to delegating calls; keeping every call site behind
/// these four functions is what makes that a one-file change.
class RefractionA11y {
  const RefractionA11y._();

  /// WCAG AA minimum for body-size text (SC 1.4.3).
  static const double textContrast = 4.5;

  /// WCAG AA minimum for focus indicators and meaningful marks (SC 1.4.11).
  static const double nonTextContrast = 3.0;

  /// Near-black ink used when a filled surface is too light for white.
  static const Color darkInk = Color(0xFF0A0A0A);

  /// White ink used when a filled surface is dark enough.
  static const Color lightInk = Color(0xFFFFFFFF);

  /// Lightness step used while searching for a passing shade — 1% keeps the
  /// result as close to the requested hue as possible.
  static const double _lightnessStep = 0.01;

  /// Relative luminance at which white and black ink contrast equally.
  static const double _midLuminance = 0.18;

  /// WCAG contrast ratio of [foreground] over [background]; translucent
  /// colours are measured as painted (fg over bg, bg over white).
  static double ratio(Color foreground, Color background) {
    final bg = _opaque(background, lightInk);
    final fg = _opaque(foreground, bg);
    final a = fg.computeLuminance();
    final b = bg.computeLuminance();
    final hi = a > b ? a : b;
    final lo = a > b ? b : a;
    return (hi + 0.05) / (lo + 0.05);
  }

  /// Whichever of [lightInk] / [darkInk] reads better on [background].
  static Color onColor(Color background) =>
      ratio(lightInk, background) >= ratio(darkInk, background)
      ? lightInk
      : darkInk;

  /// [foreground] unchanged if it meets [minRatio] on [background];
  /// otherwise the nearest shade of the same hue (walking HSL lightness away
  /// from the background) that does. Falls back to [onColor].
  static Color ensure(
    Color foreground,
    Color background, {
    double minRatio = textContrast,
  }) {
    final bg = _opaque(background, lightInk);
    final fg = _opaque(foreground, bg);
    if (ratio(fg, bg) >= minRatio) return fg;
    final darken = bg.computeLuminance() > _midLuminance;
    final hsl = HSLColor.fromColor(fg);
    var lightness = hsl.lightness;
    while (darken ? lightness > 0 : lightness < 1) {
      lightness =
          (darken ? lightness - _lightnessStep : lightness + _lightnessStep)
              .clamp(0.0, 1.0);
      final candidate = hsl.withLightness(lightness).toColor();
      if (ratio(candidate, bg) >= minRatio) return candidate;
    }
    return onColor(bg);
  }

  /// The keyboard focus indicator colour: the palette's `ring` token, made
  /// visible (3:1) against [surface]. Several curated palettes ship a pale
  /// ring (e.g. `#D1D1D6` on white, 1.4:1) that fails SC 1.4.11 on its own.
  static Color focusColor(RefractionColors colors, {Color? surface}) => ensure(
    colors.ring,
    surface ?? colors.background,
    minRatio: nonTextContrast,
  );

  /// Muted meta text (dates, counts, captions) that still meets AA on
  /// [surface]. The minimal palettes' `mutedForeground` is 3.3:1 on white.
  static Color metaText(RefractionColors colors, {Color? surface}) =>
      ensure(colors.mutedForeground, surface ?? colors.background);

  /// [base], or [Duration.zero] when the platform asks for reduced motion
  /// (iOS Reduce Motion, Android Remove animations, prefers-reduced-motion).
  static Duration motion(BuildContext context, Duration base) =>
      (MediaQuery.maybeDisableAnimationsOf(context) ?? false)
      ? Duration.zero
      : base;

  /// Whether the platform asks for reduced motion at [context].
  static bool reducedMotion(BuildContext context) =>
      MediaQuery.maybeDisableAnimationsOf(context) ?? false;

  static Color _opaque(Color color, Color base) =>
      color.a >= 1.0 ? color : Color.alphaBlend(color, base);
}

/// Paints a keyboard focus ring around [child] while [visible], outside the
/// child's bounds so it never shifts layout.
class RefractionFocusOutline extends StatelessWidget {
  /// Whether the ring is painted.
  final bool visible;

  /// Corner radius of [child]; the ring follows it.
  final BorderRadius borderRadius;

  /// Ring colour; resolve through [RefractionA11y.focusColor].
  final Color color;

  /// The focused control.
  final Widget child;

  /// Paint the ring just inside the child's bounds instead of outside —
  /// for edge-to-edge rows whose neighbours would paint over an outer ring.
  final bool inside;

  /// Stroke width of the ring.
  static const double width = 2.0;

  /// Gap between the child and the ring.
  static const double gap = 2.0;

  const RefractionFocusOutline({
    super.key,
    required this.visible,
    required this.color,
    required this.child,
    this.borderRadius = BorderRadius.zero,
    this.inside = false,
  });

  @override
  Widget build(BuildContext context) {
    if (!visible) return child;
    return CustomPaint(
      foregroundPainter: _OutlinePainter(color, borderRadius, inside),
      child: child,
    );
  }
}

class _OutlinePainter extends CustomPainter {
  final Color color;
  final BorderRadius borderRadius;
  final bool inside;

  _OutlinePainter(this.color, this.borderRadius, this.inside);

  @override
  void paint(Canvas canvas, Size size) {
    final grow = inside
        ? -RefractionFocusOutline.width / 2
        : RefractionFocusOutline.gap + RefractionFocusOutline.width / 2;
    final rect = (Offset.zero & size).inflate(grow);
    final r = inside
        ? borderRadius
        : borderRadius + BorderRadius.circular(grow);
    canvas.drawRRect(
      r.toRRect(rect),
      Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = RefractionFocusOutline.width,
    );
  }

  @override
  bool shouldRepaint(_OutlinePainter old) =>
      old.color != color ||
      old.borderRadius != borderRadius ||
      old.inside != inside;
}
