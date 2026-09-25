import 'package:flutter/painting.dart';

/// WCAG 2.x contrast math used to derive accessible token defaults and to
/// verify palettes.
///
/// The extended [RefractionColors] roles that carry text or icons (the
/// status on-colors, the `*SoftForeground` roles, the mention/selection
/// foregrounds, the focus ring) derive their defaults through [ensure] and
/// [onColor], so a palette that only sets its base tokens still gets
/// foregrounds that meet WCAG AA against the surfaces they are painted on.
///
/// ```dart
/// final ratio = RefractionContrast.ratio(colors.mutedForeground, colors.card);
/// assert(ratio >= RefractionContrast.aaText);
/// ```
class RefractionContrast {
  const RefractionContrast._();

  /// WCAG AA minimum for normal-size text (1.4.3).
  static const double aaText = 4.5;

  /// WCAG AA minimum for large text — 18pt+ or 14pt+ bold (1.4.3).
  static const double aaLargeText = 3.0;

  /// WCAG AA minimum for UI component boundaries, focus indicators and
  /// meaningful graphics (1.4.11).
  static const double aaNonText = 3.0;

  /// The default dark ink [onColor] picks when a surface is too light for
  /// white — a near-black that reads as "black" without the harshness of
  /// pure `#000`.
  static const Color defaultDarkInk = Color(0xFF0A0A0A);

  /// The default light ink [onColor] picks when a surface is dark enough.
  static const Color defaultLightInk = Color(0xFFFFFFFF);

  /// The lightness step [ensure] walks by while searching for a passing
  /// shade. 1% keeps the result as close to the requested hue as possible.
  static const double _lightnessStep = 0.01;

  /// The WCAG relative luminance of [color] (0 = black, 1 = white). A
  /// translucent color is measured as painted over opaque white.
  static double luminance(Color color) =>
      _opaque(color, const Color(0xFFFFFFFF)).computeLuminance();

  /// The WCAG contrast ratio between [foreground] and [background], from
  /// `1.0` (identical) to `21.0` (black on white).
  ///
  /// A translucent [foreground] is composited over [background] first — the
  /// color a reader actually sees — so `primary.withValues(alpha: 0.8)` is
  /// measured as painted. A translucent [background] is composited over
  /// white.
  static double ratio(Color foreground, Color background) {
    final bg = _opaque(background, const Color(0xFFFFFFFF));
    final fg = _opaque(foreground, bg);
    final a = fg.computeLuminance();
    final b = bg.computeLuminance();
    final lighter = a > b ? a : b;
    final darker = a > b ? b : a;
    return (lighter + 0.05) / (darker + 0.05);
  }

  /// Whether [foreground] on [background] meets [minRatio].
  static bool meets(
    Color foreground,
    Color background, {
    double minRatio = aaText,
  }) => ratio(foreground, background) >= minRatio;

  /// The ink — [light] or [dark] — with the higher contrast on [background].
  ///
  /// Used for filled status surfaces (a green "Done" pill, an amber warning
  /// chip): white reads on saturated reds/blues but not on amber or bright
  /// green, and this picks per surface instead of hardcoding white.
  static Color onColor(
    Color background, {
    Color light = defaultLightInk,
    Color dark = defaultDarkInk,
  }) {
    return ratio(light, background) >= ratio(dark, background) ? light : dark;
  }

  /// Returns [foreground] unchanged when it already meets [minRatio] on
  /// [background]; otherwise the nearest shade of the same hue (walking HSL
  /// lightness away from the background) that does.
  ///
  /// This keeps a brand or status hue recognisable while making it legible
  /// — e.g. the amber `warning` token becomes a deep amber when used as text
  /// on a pale tint. If no shade of the hue can reach the target, the
  /// highest-contrast ink ([onColor]) is returned instead.
  static Color ensure(
    Color foreground,
    Color background, {
    double minRatio = aaText,
  }) {
    final bg = _opaque(background, const Color(0xFFFFFFFF));
    final fg = _opaque(foreground, bg);
    if (ratio(fg, bg) >= minRatio) return fg;

    // Go darker on light surfaces and lighter on dark ones: that is the only
    // direction that increases contrast for every hue.
    final darken = bg.computeLuminance() > 0.18;
    final hsl = HSLColor.fromColor(fg);
    var lightness = hsl.lightness;
    while (darken ? lightness > 0 : lightness < 1) {
      lightness = darken
          ? (lightness - _lightnessStep).clamp(0.0, 1.0)
          : (lightness + _lightnessStep).clamp(0.0, 1.0);
      final candidate = hsl.withLightness(lightness).toColor();
      if (ratio(candidate, bg) >= minRatio) return candidate;
    }
    return onColor(bg);
  }

  /// [color] composited over [base] when translucent.
  static Color _opaque(Color color, Color base) =>
      color.a >= 1.0 ? color : Color.alphaBlend(color, base);
}
